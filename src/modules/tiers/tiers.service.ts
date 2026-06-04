import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionService } from '../../common/services/permission.service';
import { httpResponse, httpResponsePaginated } from '../../common/helpers/http-response';
import { Prisma } from '../../../generated/prisma/client';
import { CreateTiersDto, UpdateTiersDto } from './tiers.dto';

@Injectable()
export class TiersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly permission: PermissionService
    ) { }


    async getAllTiers(entreprise_id: string, role_id: string, page: number, limit: number, search?: string, type?: string) {
        try {

            const canRead = await this.permission.hasPermission(role_id, 'TIERS', 'can_read');
            if (!canRead) return httpResponse(false, null, 'Access denied', 403);

            const skip = (page - 1) * limit;

            const where: Prisma.TiersWhereInput = {
                entreprise_id,
                deleted_at: null,
                ...(type && { type: type as Prisma.EnumTypeTiersFilter }),
                ...(search && {
                    OR: [
                        { raison_sociale: { contains: search, mode: 'insensitive' } },
                        { code: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                })
            };

            const [tiers, total] = await Promise.all([
                this.prisma.tiers.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }
                }),
                this.prisma.tiers.count({ where })
            ]);

            return httpResponsePaginated(true, tiers, 'Tiers retrieved successfully', 200, total, page, limit);

        } catch (error) {
            console.error('error fetching tiers', error);
            return httpResponse(false, null, 'An error occured while fetching tiers', 500);
        }
    }

    async getTiersById(tiers_id: string, entreprise_id: string, role_id: string) {
        try {

            const canRead = await this.permission.hasPermission(role_id, 'TIERS', 'can_read');
            if (!canRead) return httpResponse(false, null, 'Access denied', 403);

            const tiers = await this.prisma.tiers.findFirst({ where: { tiers_id, entreprise_id, deleted_at: null } });
            if (!tiers) return httpResponse(false, null, 'Tiers not found', 404);

            return httpResponse(true, tiers, 'Tiers retrieved successfully', 200);

        } catch (error) {
            console.error('Error fetching tiers', error);
            return httpResponse(false, null, 'An error occured while fetching tiers', 500);
        }
    }

    async createTiers(body: CreateTiersDto, entreprise_id: string, role_id: string, created_by: string) {
        try {

            const canWrite = await this.permission.hasPermission(role_id, 'TIERS', 'can_write');
            if (!canWrite) return httpResponse(false, null, 'Access denied', 403);

            const existing = await this.prisma.tiers.findFirst({
                where: {
                    entreprise_id,
                    deleted_at: null,
                    OR: [
                        { nif: body.nif },
                        { rccm: body.rccm },
                        { email: body.email }
                    ]
                },
            });
            if (existing) return httpResponse(false, null, 'NIF, RCCM or email already exists', 409);

            const code = await this.generateCode(entreprise_id);

            const tiers = await this.prisma.tiers.create({
                data: {
                    code,
                    raison_sociale: body.raison_sociale,
                    nif: body.nif,
                    rccm: body.rccm,
                    adresse: body.adresse,
                    telephone: body.telephone,
                    email: body.email,
                    type: body.type,
                    est_airsi: body.est_airsi,
                    entreprise_id,
                    created_by
                }
            });

            return httpResponse(true, tiers, 'Tiers created successfully', 201);

        } catch (error) {
            console.error('Error creating tiers', error);
            return httpResponse(false, null, 'An error occured while creating tiers', 500);
        }
    }

    async updateTiers(tiers_id: string, body: UpdateTiersDto, entreprise_id: string, role_id: string, updated_by: string) {
        try {

            const canUpdate = await this.permission.hasPermission(role_id, 'TIERS', 'can_update');
            if (!canUpdate) return httpResponse(false, null, 'Access denied', 403);

            const tiers = await this.prisma.tiers.findFirst({
                where: { tiers_id, entreprise_id, deleted_at: null }
            });
            if (!tiers) return httpResponse(false, null, 'Tiers not found', 404);

            if (body.nif || body.rccm || body.email) {

                const orConditions: Prisma.TiersWhereInput[] = [{ email: body.email }];
                if (body.nif) orConditions.push({ nif: body.nif });
                if (body.rccm) orConditions.push({ rccm: body.rccm });

                const existing = await this.prisma.tiers.findFirst({
                    where: {
                        entreprise_id,
                        deleted_at: null,
                        tiers_id: { not: tiers_id },
                        OR: orConditions
                    }
                });
                if (existing) return httpResponse(false, null, 'NIF, RCCM or email already exists', 409);
            }

            const updated = await this.prisma.tiers.update({
                where: { tiers_id },
                data: {
                    raison_sociale: body.raison_sociale,
                    nif: body.nif,
                    rccm: body.rccm,
                    adresse: body.adresse,
                    telephone: body.telephone,
                    email: body.email,
                    type: body.type,
                    est_airsi: body.est_airsi,
                    updated_by,
                    updated_at: new Date()
                }
            });

            return httpResponse(true, updated, 'Tiers updated successfully', 200);

        } catch (error) {
            console.error('Error updating tiers', error);
            return httpResponse(false, null, 'An error occured while updating tiers', 500)
        }
    }

    async deleteTiers(tiers_id: string, entreprise_id: string, role_id: string, deleted_by: string) {
        try {
            const canDelete = await this.permission.hasPermission(role_id, 'TIERS', 'can_delete');
            if (!canDelete) return httpResponse(false, null, 'Access denied', 403);

            const tiers = await this.prisma.tiers.findFirst({
                where: { tiers_id, entreprise_id, deleted_at: null }
            });
            if (!tiers) return httpResponse(false, null, 'Tiers not found', 404);

            await this.prisma.tiers.update({
                where: { tiers_id },
                data: { deleted_at: new Date(), deleted_by }
            });

            return httpResponse(true, null, 'Tiers deleted successfully', 200);

        } catch (error) {
            console.error('Error deleting tiers:', error);
            return httpResponse(false, null, 'An error occurred while deleting tiers', 500);
        }
    }

    private async generateCode(entreprise_id: string) {
        const count = await this.prisma.tiers.count({ where: { entreprise_id } });
        return `TRS-${String(count + 1).padStart(4, '0')}`
    };

}

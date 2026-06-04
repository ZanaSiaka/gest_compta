import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionService } from '../../common/services/permission.service';
import { httpResponse, httpResponsePaginated } from '../../common/helpers/http-response';
import { Prisma } from '../../../generated/prisma/client';
import { CreateExerciceDto, UpdateExerciceDto } from './exercice.dto';

@Injectable()
export class ExerciceService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly permission: PermissionService
    ) { }

    async getAllExercices(entreprise_id: string, role_id: string, page: number, limit: number, search?: string, dateDebut?: string) {
        try {

            const canRead = await this.permission.hasPermission(role_id, 'EXERCICES', 'can_read');
            if (!canRead) return httpResponse(false, null, 'Access denied', 403);

            const skip = (page - 1) * limit;

            const where: Prisma.ExerciceWhereInput = {
                entreprise_id,
                deleted_at: null,
                ...(search && {
                    OR: [
                        { libelle: { contains: search, mode: 'insensitive' } },
                        // { date_debut: { equals: new Date(search) } }
                    ]
                }),
                ...(dateDebut && {
                    date_debut: { gte: new Date(dateDebut) }
                })
            };

            const [exercices, total] = await Promise.all([
                this.prisma.exercice.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }
                }),
                this.prisma.exercice.count({ where })
            ]);

            return httpResponsePaginated(true, exercices, 'Exercices retrieved successfully', 200, total, page, limit);

        } catch (error) {
            console.error('Get all exercice error', error);
            return httpResponse(false, null, 'An error occured while fetching all exercice', 500);
        }
    }

    async getExerciceById(exercice_id: string, entreprise_id: string, role_id: string) {
        try {

            const canRead = await this.permission.hasPermission(role_id, 'EXERCICES', 'can_read');
            if (!canRead) return httpResponse(false, null, 'Access denied', 403);

            const exercice = await this.prisma.exercice.findFirst({
                where: { exercice_id, entreprise_id, deleted_at: null }
            });
            if (!exercice) return httpResponse(false, null, 'Exercice not found', 404);

            return httpResponse(true, exercice, 'Exercice retrieved successfully', 200);

        } catch (error) {
            console.error('Error fetching exercice')
            return httpResponse(false, null, 'An error occured while fetching exercice by ID', 500);
        }
    }

    async createExercice(body: CreateExerciceDto, entreprise_id: string, role_id: string, created_by: string) {

        try {

            const canWrite = await this.permission.hasPermission(role_id, 'EXERCICES', 'can_write');
            if (!canWrite) return httpResponse(false, null, 'Access denied', 403);

            const openExercice = await this.prisma.exercice.findFirst({
                where: { entreprise_id, est_cloture: false, deleted_at: null }
            });
            if (openExercice) return httpResponse(false, null, 'Cannot create a second exercise while have open exercice', 409);

            const dateDebut = new Date(body.date_debut);

            const dateFin = body.date_fin ? new Date(body.date_fin) : new Date(dateDebut.getFullYear(), 11, 31);

            if (dateFin <= dateDebut) return httpResponse(false, null, 'Cannot accept date', 400);

            const exercice = await this.prisma.exercice.create({
                data: {
                    libelle: body.libelle,
                    statut_exercice: 'OUVERT',
                    date_debut: dateDebut,
                    date_fin: dateFin,
                    entreprise_id,
                    created_by
                }
            });

            return httpResponse(true, exercice, 'Exercice created successfully', 201);

        } catch (error) {
            console.error('Error creating exercice', error);
            return httpResponse(false, null, 'An error occured while creating exercice', 500);
        }

    }

    async updateExercice(exercice_id: string, body: UpdateExerciceDto, entreprise_id: string, role_id: string, updated_by: string) {

        try {

            const canUpdate = await this.permission.hasPermission(role_id, 'EXERCICES', 'can_update');
            if (!canUpdate) return httpResponse(false, null, 'Access denied', 403);

            const exercice = await this.prisma.exercice.findFirst({
                where: { exercice_id, entreprise_id, deleted_at: null }
            });
            if (!exercice) return httpResponse(false, null, 'Exercice not found', 404);
            if (exercice.est_cloture) return httpResponse(false, null, 'Cannot modify exercice that already close', 403);

            if (body.date_fin) {
                const dateFin = new Date(body.date_fin);
                if (dateFin <= exercice.date_debut) return httpResponse(false, null, 'Date fin should be after date debut', 400);
            };

            const updated = await this.prisma.exercice.update({
                where: { exercice_id },
                data: {
                    libelle: body.libelle,
                    date_fin: body.date_fin && new Date(body.date_fin),
                    updated_at: new Date(),
                    updated_by
                }
            });

            return httpResponse(true, updated, 'Exercice updated successfully', 200);

        } catch (error) {
            console.error('Error updating exercice: ', error);
            return httpResponse(false, null, 'An error occured while updating exercice', 500);
        }

    }

    async cloturerExercice(exercice_id: string, entreprise_id: string, role_id: string, updated_by: string) {
        try {

            const canValidate = await this.permission.hasPermission(role_id, 'EXERCICES', 'can_validate');
            if (!canValidate) return httpResponse(false, null, 'Access denied', 403);

            const exercice = await this.prisma.exercice.findFirst({
                where: { exercice_id, entreprise_id, deleted_at: null }
            });
            if (!exercice) return httpResponse(false, null, 'Exercice not found', 404);
            if (exercice.est_cloture) return httpResponse(false, null, 'Exercice already close', 400);

            await this.prisma.exercice.update({
                where: { exercice_id },
                data: {
                    est_cloture: true,
                    statut_exercice: 'CLOTURE',
                    cloture_date: new Date(),
                    cloture_par: updated_by
                }
            });

            return httpResponse(true, null, 'Exercice close successfully', 200);

        } catch (error) {
            console.error('Error closing exercice: ', error);
            return httpResponse(false, null, 'An error occured while close exercice', 500);
        }
    }

}

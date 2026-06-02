import { Injectable } from '@nestjs/common';
import { CreateRoleDto, UpdatePermissionsDto, UpdateRoleDto } from './roles.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { httpResponse, httpResponsePaginated } from '../../common/helpers/http-response';
import { PermissionService } from '../../common/services/permission.service';

@Injectable()
export class RolesService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly permission: PermissionService
    ) { }

    async createRole(body: CreateRoleDto, entreprise_id: string, role_id: string, created_by: string) {

        try {

            const canWrite = await this.permission.hasPermission(role_id, 'ROLES', 'can_write');
            if (!canWrite) return httpResponse(false, null, "You don't have permission to create a role", 403);

            const existingRole = await this.prisma.role.findFirst({ where: { nom: body.nom, entreprise_id, deleted_at: null } });
            if (existingRole) return httpResponse(false, null, "A role with this name already exists", 409);

            const role = await this.prisma.role.create({
                data: {
                    nom: body.nom.toUpperCase(),
                    description: body.description,
                    entreprise_id,
                    created_by
                }
            });

            return httpResponse(true, role, "Role created successfully", 201);

        } catch (error) {
            console.error("An error occurred while creating a role:", error);
            return httpResponse(false, null, "An error occurred while creating the role", 500);
        }

    }

    async getAllRoles(entreprise_id: string, role_id: string, page: number, limit: number) {

        try {
            const canRead = await this.permission.hasPermission(role_id, 'ROLES', 'can_read');
            if (!canRead) return httpResponse(false, null, "You don't have permission to view roles", 403);

            const skip = (page - 1) * limit;

            const [roles, total] = await Promise.all([
                this.prisma.role.findMany({
                    where: { entreprise_id, deleted_at: null },
                    select: {
                        role_id: true,
                        nom: true,
                        description: true,
                        created_at: true,
                        _count: { select: { users: true, permissions: true } }
                    },
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }
                }),
                this.prisma.role.count({
                    where: { entreprise_id, deleted_at: null }
                })
            ]);

            return httpResponsePaginated(true, roles, "Roles retrieved successfully", 200, total, page, limit);
        } catch (error) {
            console.error("An error occurred while fetching roles:", error);
            return httpResponse(false, null, "An error occurred while fetching roles", 500);
        }
    }

    async getRoleById(role_id_param: string, entreprise_id: string, role_id: string) {
        try {
            const canRead = await this.permission.hasPermission(role_id, 'ROLES', 'can_read');
            if (!canRead) return httpResponse(false, null, "You don't have permission to view roles", 403);

            const role = await this.prisma.role.findFirst({
                where: { role_id: role_id_param, entreprise_id, deleted_at: null },
                include: { permissions: true, _count: { select: { users: true } } }
            });
            if (!role) return httpResponse(false, null, "Role not found", 404);

            return httpResponse(true, role, "Role retrieved successfully", 200);
        } catch (error) {
            console.error("An error occurred while retrieving the role:", error);
            return httpResponse(false, null, "An error occurred while retrieving the role", 500);
        }
    }

    async updateRole(role_id_param: string, body: UpdateRoleDto, entreprise_id: string, role_id: string, updated_by: string) {
        try {

            const canUpdate = await this.permission.hasPermission(role_id, 'ROLES', 'can_update');
            if (!canUpdate) return httpResponse(false, null, "You don't have permission to update roles", 403);

            const role = await this.prisma.role.findFirst({
                where: { role_id: role_id_param, entreprise_id, deleted_at: null }
            });

            if (!role) return httpResponse(false, null, "Role not found", 404);

            if (role.nom === 'ADMIN') return httpResponse(false, null, "The ADMIN role cannot be updated", 403);

            if (body.nom) {
                const existing = await this.prisma.role.findFirst({
                    where: { nom: body.nom, entreprise_id, deleted_at: null, role_id: { not: role_id_param } }
                });
                if (existing) return httpResponse(false, null, "A role with this name already exists", 409);
            };

            const updated = await this.prisma.role.update({
                where: { role_id: role_id_param },
                data: {
                    nom: body.nom ? body.nom.toUpperCase() : role.nom,
                    description: body.description || role.description,
                    updated_by,
                    updated_at: new Date()
                }
            });

            return httpResponse(true, updated, "Role updated successfully", 200);

        } catch (error) {
            console.error("An error occurred while updating the role:", error);
            return httpResponse(false, null, "An error occurred while updating the role", 500);
        }
    }

    async deleteRole(role_id_param: string, entreprise_id: string, role_id: string, deleted_by: string) {
        try {

            const canDelete = await this.permission.hasPermission(role_id, 'ROLES', 'can_delete');
            if (!canDelete) return httpResponse(false, null, "You don't have permission to delete roles", 403);

            const role = await this.prisma.role.findFirst({
                where: { role_id: role_id_param, entreprise_id, deleted_at: null },
                include: { _count: { select: { users: true } } }
            });

            if (!role) return httpResponse(false, null, "Role not found", 404);
            if (role.nom === 'ADMIN') return httpResponse(false, null, "The ADMIN role cannot be deleted", 403);
            if (role._count.users > 0) return httpResponse(false, null, "Cannot delete a role that has users assigned", 403);

            await this.prisma.role.update({
                where: { role_id: role_id_param },
                data: {
                    deleted_at: new Date(),
                    deleted_by
                }
            });

            return httpResponse(true, null, "Role deleted successfully", 200);

        } catch (error) {
            console.error("An error occurred while deleting the role:", error);
            return httpResponse(false, null, "An error occurred while deleting the role", 500);
        }
    }

    async updatePermissions(role_id_param: string, body: UpdatePermissionsDto, entreprise_id: string, role_id: string, updated_by: string
    ) {
        try {

            const canUpdate = await this.permission.hasPermission(role_id, 'ROLES', 'can_update');
            if (!canUpdate) return httpResponse(false, null, "You don't have permission to update roles", 403);

            const role = await this.prisma.role.findFirst({
                where: { role_id: role_id_param, entreprise_id, deleted_at: null }
            });

            if (!role) return httpResponse(false, null, "Role not found", 404);
            if (role.nom === 'ADMIN') return httpResponse(false, null, "The ADMIN role permissions cannot be updated", 403);

            await this.prisma.$transaction(
                body.permissions.map(p => this.prisma.permission.upsert({
                    where: { role_id_module: { role_id: role_id_param, module: p.module } },
                    create: {
                        module: p.module,
                        can_read: p.can_read,
                        can_write: p.can_write,
                        can_delete: p.can_delete,
                        can_update: p.can_update,
                        can_validate: p.can_validate,
                        can_export: p.can_export,
                        role_id: role_id_param,
                        created_by: updated_by
                    },
                    update: {
                        can_read: p.can_read,
                        can_write: p.can_write,
                        can_delete: p.can_delete,
                        can_update: p.can_update,
                        can_validate: p.can_validate,
                        can_export: p.can_export,
                        updated_by,
                        updated_at: new Date()
                    }
                }))
            );

            const updated = await this.prisma.role.findUnique({
                where: { role_id: role_id_param },
                include: { permissions: true, _count: { select: { users: true } } }
            });

            return httpResponse(true, updated, "Permissions updated successfully", 200);

        } catch (error) {
            console.error("An error occurred while updating permissions:", error);
            return httpResponse(false, null, "An error occurred while updating permissions", 500);
        }
    }

}

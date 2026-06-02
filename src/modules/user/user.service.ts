import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { httpResponse, httpResponsePaginated } from '../../common/helpers/http-response';
import { PermissionService } from '../../common/services/permission.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class UserService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailService,
        private readonly permission: PermissionService
    ) { }

    async getAllUsers(entreprise_id: string, role_id: string, page: number, limit: number) {

        try {

            const can_read = await this.permission.hasPermission(role_id, 'USERS', 'can_read');
            if (!can_read) return httpResponse(false, null, 'Access denied', 403);


            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: { entreprise_id, deleted_at: null },
                    select: {
                        user_id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        photo: true,
                        est_actif: true,
                        compte_bloque: true,
                        derniere_connexion: true,
                        created_at: true,
                        role: { select: { nom: true, role_id: true } }
                    },
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }
                }),
                this.prisma.user.count({ where: { entreprise_id, deleted_at: null } })
            ]);

            return httpResponsePaginated(true, users, 'Users fetched successfully', 200, total, page, limit);

        } catch (error) {
            console.error('Error fetching users:', error);
            return httpResponse(false, null, 'An error occurred while fetching users', 500);
        }

    }

    async createUser(body: CreateUserDto, entreprise_id: string, role_id: string, created_by: string) {
        try {

            const can_write = await this.permission.hasPermission(role_id, 'USERS', 'can_write');
            if (!can_write) return httpResponse(false, null, 'Access denied', 403);

            const existing = await this.prisma.user.findUnique({
                where: { email: body.email }
            });
            if (existing) return httpResponse(false, null, 'Email already in use', 409);

            const role = await this.prisma.role.findFirst({
                where: { role_id: body.role_id, entreprise_id, deleted_at: null },
            });
            if (!role) return httpResponse(false, null, 'Role not found', 404);

            if (role.nom === 'ADMIN') return httpResponse(false, null, 'Cannot assign ADMIN role', 403);

            const generatedPassword = this.generatePassword();
            const password = await bcrypt.hash(generatedPassword, 12);

            await this.mail.sendWelcomeEmail(body.email, body.nom, generatedPassword);

            const user = await this.prisma.user.create({
                data: {
                    nom: body.nom,
                    prenom: body.prenom,
                    email: body.email,
                    password,
                    role_id: body.role_id,
                    entreprise_id,
                    created_by
                },
                select: {
                    user_id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    photo: true,
                    est_actif: true,
                    compte_bloque: true,
                    role: { select: { nom: true, role_id: true } },
                }
            });


            return httpResponse(true, user, 'User created successfully', 201);

        } catch (error) {
            console.error('Error creating user:', error);
            return httpResponse(false, null, 'An error occurred while creating the user', 500);
        }
    }

    async getUserById(user_id: string, entreprise_id: string, role_id: string) {
        try {

            const canRead = await this.permission.hasPermission(role_id, 'USERS', 'can_read');
            if (!canRead) return httpResponse(false, null, 'Accès denied', 403);

            const user = await this.prisma.user.findFirst({
                where: { user_id, entreprise_id, deleted_at: null },
                select: {
                    user_id: true,
                    nom: true,
                    prenom: true,
                    photo: true,
                    email: true,
                    est_actif: true,
                    compte_bloque: true,
                    derniere_connexion: true,
                    created_at: true,
                    role: { select: { role_id: true, nom: true } }
                }
            });

            if (!user) return httpResponse(false, null, 'User not found', 404);

            return httpResponse(true, user, 'User retrieved successfully', 200)

        } catch (error) {
            console.error('An error occured', error);
            return httpResponse(false, null, 'An error occured during user fetching', 500);
        }
    }

    async updateUser(user_id: string, body: UpdateUserDto, entreprise_id: string, role_id: string, updated_by: string) {

        try {

            const canUpdate = await this.permission.hasPermission(role_id, 'USERS', 'can_update');
            if (!canUpdate) return httpResponse(false, null, 'Access Denied', 403);

            const user = await this.prisma.user.findFirst({
                where: { user_id, entreprise_id, deleted_at: null }
            });
            if (!user) return httpResponse(false, null, 'User not found', 404);

            if (body.role_id) {
                const role = await this.prisma.role.findFirst({
                    where: { role_id: body.role_id, entreprise_id, deleted_at: null }
                });
                if (!role) return httpResponse(false, null, 'Role not found', 404);
                if (role.nom === 'ADMIN') return httpResponse(false, null, 'Cannot assign ADMIN role', 403);
            }

            const updated = await this.prisma.user.update({
                where: { user_id },
                data: {
                    nom: body.nom,
                    prenom: body.prenom,
                    role_id: body.role_id,
                    est_actif: body.est_actif,
                    updated_by,
                    updated_at: new Date()
                },
                select: {
                    user_id: true,
                    nom: true,
                    prenom: true,
                    photo: true,
                    email: true,
                    est_actif: true,
                    compte_bloque: true,
                    role: { select: { role_id: true, nom: true } }
                }
            });

            return httpResponse(true, updated, 'User updated successfully', 200);

        } catch (error) {
            console.error('Error updating user: ', error);
            return httpResponse(false, null, 'An error occured while updating the user', 500);
        }

    }

    async unlockUser(user_id: string, entreprise_id: string, role_id: string, updated_by: string) {

        try {

            const canUpdate = await this.permission.hasPermission(role_id, 'USERS', 'can_update');
            if (!canUpdate) return httpResponse(false, null, 'Access denied', 403);

            const user = await this.prisma.user.findFirst({
                where: { user_id, entreprise_id, deleted_at: null },
                include: { role: true }
            });
            if (!user) return httpResponse(false, null, 'User not found', 404);

            if (user.role.nom === 'ADMIN') return httpResponse(false, null, 'Cannot unlock an admin with this route', 403);
            if (!user.compte_bloque) return httpResponse(false, null, 'This account isn\'t blocked', 400);

            await this.prisma.user.update({
                where: { user_id },
                data: {
                    compte_bloque: false,
                    tentatives_connexion: 0,
                    updated_by,
                    updated_at: new Date()
                }
            });

            return httpResponse(true, null, 'Account unlocking successfully', 200);

        } catch (error) {
            console.error('Error unlocking user: ', error);
            return httpResponse(false, null, 'An error occured while unlocking the user', 500);
        }
    }

    async deleteUser(user_id: string, entreprise_id: string, role_id: string, deleted_by: string) {
        try {

            const canDelete = await this.permission.hasPermission(role_id, 'USERS', 'can_delete');
            if (!canDelete) return httpResponse(false, null, 'Access denied', 403);

            const user = await this.prisma.user.findFirst({
                where: { user_id, entreprise_id, deleted_at: null },
                include: { role: true }
            });
            if (!user) return httpResponse(false, null, 'User not found', 404);

            if (user.role.nom === 'ADMIN') return httpResponse(false, null, 'Cannot delete user with this role', 403);

            await this.prisma.user.update({
                where: { user_id },
                data: {
                    deleted_at: new Date(),
                    deleted_by
                }
            });

            return httpResponse(true, null, 'User deleted successfully', 200);

        } catch (error) {
            console.error('Error deleting user: ', error);
            return httpResponse(false, null, 'An error occured while deleting user', 500);
        }
    }

    private generatePassword(): string {

        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const all = lower + upper + numbers;

        const password = [
            lower[Math.floor(Math.random() * lower.length)],
            upper[Math.floor(Math.random() * upper.length)],
            numbers[Math.floor(Math.random() * numbers.length)],
            ...Array.from({ length: 9 }, () => all[Math.floor(Math.random() * all.length)])
        ];

        return password.sort(() => Math.random() - 0.5).join('');

    }

}

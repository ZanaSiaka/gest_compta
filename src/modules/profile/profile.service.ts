import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { R2Service } from '../../r2/r2.service';
import { UpdatePasswordDto, UpdateProfileDto } from './profile.dto';
import { httpResponse } from '../../common/helpers/http-response';

type MulterFile = NonNullable<Request['file']>

@Injectable()
export class ProfileService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service
    ) { }

    async updateProfile(user_id: string, body: UpdateProfileDto) {

        try {

            const updated = await this.prisma.user.update({
                where: { user_id },
                data: {
                    nom: body.nom,
                    prenom: body.prenom,
                    updated_at: new Date(),
                    updated_by: user_id
                },
                select: {
                    user_id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    photo: true,
                    role: { select: { role_id: true, nom: true } }
                }
            });

            return httpResponse(true, updated, 'Profile updated successfuly', 200);

        } catch (error) {
            console.error('Error updating profile: ', error);
            return httpResponse(false, null, 'An error occured while profile updating', 500);
        }

    }

    async updatePassword(user_id: string, body: UpdatePasswordDto) {
        try {

            const user = await this.prisma.user.findUnique({ where: { user_id } });
            if (!user) return httpResponse(false, null, 'User not found', 404);

            const isValid = await bcrypt.compare(body.old_password, user.password);
            if (!isValid) return httpResponse(false, null, 'Wrong password', 401);

            const isSame = await bcrypt.compare(body.new_password, user.password);
            if (isSame) return httpResponse(false, null, 'New password cannot be same than old password', 400);

            const hashPassword = await bcrypt.hash(body.new_password, 12);

            await this.prisma.user.update({
                where: { user_id },
                data: {
                    password: hashPassword,
                    updated_at: new Date(),
                    updated_by: user_id
                }
            });

            await this.prisma.refreshToken.updateMany({
                where: { user_id, revoked: false },
                data: { revoked: true, revoked_at: new Date() }
            });

            return httpResponse(true, null, 'Password updated successfuly', 200);

        } catch (error) {
            console.error('Error updating password: ', error);
            return httpResponse(false, null, 'An error occured while updating password', 500);
        }
    }

    async updatePhoto(user_id: string, file: MulterFile) {

        try {

            const user = await this.prisma.user.findUnique({
                where: { user_id },
                select: { photo: true }
            });

            if (user?.photo) {
                await this.r2.deleteImage(user.photo);
            };

            const photoUrl = await this.r2.uploadImage(file, 'users/profile');

            const updated = await this.prisma.user.update({
                where: { user_id },
                data: {
                    photo: photoUrl,
                    updated_at: new Date(),
                    updated_by: user_id
                },
                select: {
                    user_id: true,
                    nom: true,
                    prenom: true,
                    photo: true,
                    email: true
                }
            });

            return httpResponse(true, updated, 'Photo updating successfuly', 200)

        } catch (error) {
            console.error('Error updating photo', error);
            return httpResponse(false, null, 'An error occured while updating the photo', 500);
        }

    }

    async getPermission(role_id: string, role_nom: string) {

        try {

            if (role_nom === 'ADMIN') return httpResponse(true, { is_admin: true, permissions: [] }, 'This is an admin of organization', 200);

            const permissions = await this.prisma.permission.findMany({
                where: { role_id },
                select: {
                    module: true,
                    can_delete: true,
                    can_export: true,
                    can_read: true,
                    can_update: true,
                    can_validate: true,
                    can_write: true
                }
            });

            return httpResponse(true, { is_admin: false, permissions }, 'Permissions retrieved successfully', 200);

        } catch (error) {
            console.error('Error fetching permissions', error);
            return httpResponse(false, null, 'An error occured while getting connected user permissions', 500);
        }

    }

}

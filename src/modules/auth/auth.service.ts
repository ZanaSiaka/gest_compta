import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from "crypto"
import { GenerateTokenDto, LoginDto, ResetPasswordDto } from './auth.dto';
import { StringValue } from 'ms'
import { httpResponse } from '../../common/helpers/http-response';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mail: MailService
    ) { }

    async validateUser(body: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: body.email },
            include: { role: true, entreprise: true }
        });

        if (!user) return httpResponse(false, null, 'Identifiants incorrects', 401);

        if (!user.entreprise.est_active) return httpResponse(false, null, 'Entreprise desactivée', 403);

        if (user.compte_bloque) {
            if (user.role.nom === 'ADMIN') {
                return httpResponse(false, null, 'Votre compte est bloqué, vérifiez votre mail pour le débloquer', 403);
            }
            return httpResponse(false, null, 'Votre compte a été bloqué, veuillez contacter votre admin', 403)
        }

        if (!user.est_actif) {
            return httpResponse(false, null, 'Compte desactivé, contactez votre administrateur', 403);
        }

        const isValidPassword: boolean = await bcrypt.compare(body.password, user.password);

        if (!isValidPassword) {
            const tentatives = user.tentatives_connexion + 1;
            const block = tentatives >= 5;

            await this.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    tentatives_connexion: tentatives,
                    compte_bloque: block
                }
            });

            if (block) {
                if (user.role.nom === 'ADMIN') {
                    return httpResponse(false, null, 'Compte bloqué après 5 tentatives, vérifiez votre boîte mail pour le débloquer', 403)
                }
                return httpResponse(false, null, 'Compte bloqué après 5 tentatives, contactez votre administrateur pour afin de débloquer', 403);
            }
            return httpResponse(false, null, `Identifiants incorrects (${tentatives}/5 tentatives)`, 401)
        }

        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                tentatives_connexion: 0,
                derniere_connexion: new Date()
            }
        })

        const { password, token_reset, token_reset_expiration, ...rest } = user;
        return httpResponse(true, rest, 'Validation réussie', 200);

    }

    async login(body: GenerateTokenDto) {
        const payload = {
            sub: body.user_id,
            email: body.email,
            entreprise_id: body.entreprise_id,
            nom: body.nom,
            prenom: body.prenom
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
            secret: process.env.JWT_SECRET as string
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
            secret: process.env.JWT_REFRESH_SECRET as string
        });

        await this.saveRefreshToken(body.user_id, refreshToken);
        return httpResponse(true, { accessToken, refreshToken }, 'Connexion réussie', 200);
    }

    async saveRefreshToken(userId: string, refreshToken: string) {
        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                token: hash,
                expires_at,
                user_id: userId
            }
        })
    }

    async refresh(refreshToken: string) {

        let payload: { sub: string, email: string, entreprise_id: string, nom: string, prenom: string };

        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET as string
            });
        } catch (error) {
            return httpResponse(false, null, 'Refresh token invalide', 401);
        }

        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const stored = await this.prisma.refreshToken.findUnique({ where: { token: hash } });

        if (!stored || stored.revoked || new Date(stored.expires_at) < new Date()) {
            return httpResponse(false, null, 'Refresh token revoqué ou expiré', 401);
        }

        await this.prisma.refreshToken.update({
            where: { token: hash },
            data: { revoked: true, revoked_at: new Date() }
        })

        const newPayload = { sub: payload.sub, email: payload.email, entreprise_id: payload.entreprise_id, nom: payload.nom, prenom: payload.prenom };
        const accessToken = this.jwtService.sign(newPayload, {
            expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
            secret: process.env.JWT_SECRET as string
        });

        const newRefreshToken = this.jwtService.sign(newPayload, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
            secret: process.env.JWT_REFRESH_SECRET as string
        });

        await this.saveRefreshToken(payload.sub, newRefreshToken);
        const data = {
            accessToken,
            refreshToken: newRefreshToken
        }

        return httpResponse(true, data, 'Token rafraîchi avec succès', 200);
    }

    async forgotPassword(email: string) {

        try {

            const user = await this.prisma.user.findUnique({ where: { email } });

            if (!user) return httpResponse(true, null, 'Un lien a été envoyé sur votre email', 200);

            if (user.compte_bloque || !user.est_actif) return httpResponse(false, null, 'Veuillez débloquer votre compte avant :)!', 401);

            const token = crypto.randomBytes(32).toString('hex');
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 1);

            await this.prisma.user.update({
                where: { user_id: user.user_id },
                data: { token_reset: token, token_reset_expiration: expiration }
            });

            await this.mail.resetPassword(user.email, user.nom, token);
            return httpResponse(true, null, 'Un lien a été envoyé sur votre email', 200);

        } catch (error) {
            console.error('An error occured', error);
            return httpResponse(false, null, 'An error occured during forget password', 500);
        }

    }

    async resetPassword(body: ResetPasswordDto) {
        try {
            const user = await this.prisma.user.findUnique({ where: { token_reset: body.token } });

            if (!user) return httpResponse(false, null, 'Token invalide', 400);

            if (!user.token_reset_expiration || user.token_reset_expiration < new Date()) return httpResponse(false, null, 'Token expiré, faites une nouvelle demande', 400);

            const hashedPassword = await bcrypt.hash(body.new_password, 12);

            await this.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    password: hashedPassword,
                    token_reset: null,
                    token_reset_expiration: null,
                    compte_bloque: false,
                    tentatives_connexion: 0
                }
            });

            await this.prisma.refreshToken.updateMany({
                where: { user_id: user.user_id, revoked: false },
                data: { revoked: true, revoked_at: new Date() }
            });

            return httpResponse(true, null, 'Mot de passe réinitialisé avec succès', 200);

        } catch (error) {
            console.error('An error occured', error);
            return httpResponse(false, null, 'An error occured during reset password', 500);
        }
    }

    async unlockDemande(email: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email }, include: { role: true } });

            if (!user) return httpResponse(true, null, 'Un lien pour debloquer votre profil vous a été envoyé pour debloquer votre profil', 200);

            if (!user.compte_bloque) return httpResponse(false, null, 'Votre compte n\'est pas bloqué', 400);

            if (user.role.nom !== 'ADMIN') return httpResponse(false, null, 'Veuillez contacter votre administrateur pour débloquer votre compte', 403);


            if (!user.est_actif) return httpResponse(false, null, 'votre compte n\'est pas actif', 401);
            const token = crypto.randomBytes(32).toString('hex');

            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 1);

            await this.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    token_reset: token,
                    token_reset_expiration: expiration
                }
            });

            await this.mail.unlockMail(user.email, user.nom, token);
            return httpResponse(true, null, 'Un lien pour debloquer votre profil vous a été envoyé pour debloquer votre profil', 200)

        } catch (error) {
            console.error('An errorr occured', error);
            return httpResponse(false, null, 'An error occured during unlock account demande', 500);
        }
    }

    async unlockConfirm(token: string) {

        try {

            const user = await this.prisma.user.findUnique({ where: { token_reset: token } });

            if (!user) return httpResponse(false, null, 'Token invalide', 400);
            if (!user.token_reset_expiration || user.token_reset_expiration < new Date()) return httpResponse(false, null, 'Token expiré, faites une nouvelle demande', 400);

            await this.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    token_reset: null,
                    token_reset_expiration: null,
                    compte_bloque: false,
                    tentatives_connexion: 0
                }
            });

            return httpResponse(true, null, 'Compte débloqué avec succès', 200);

        } catch (error) {
            console.error('An error occured', error);
            return httpResponse(false, null, 'An error occured during unlocking confirm', 500);
        }
    }

    async logout(refreshToken: string) {
        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const stored = await this.prisma.refreshToken.findUnique({ where: { token: hash } });

        if (!stored || stored.revoked) return httpResponse(false, null, 'Refresh token invalide', 400);

        await this.prisma.refreshToken.update({
            where: { token: hash },
            data: { revoked: true, revoked_at: new Date() }
        });

        return httpResponse(true, null, 'Déconnexion réussie', 200);
    }

    verifyToken(token: string): { sub: string, email: string, entreprise_id: string, nom: string, prenom: string } | null {
        try {
            return this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET as string
            }) as { sub: string, email: string, entreprise_id: string, nom: string, prenom: string };
        } catch (error) {
            return null;
        }
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GenerateTokenDto, LoginDto } from './auth.dto';
import { StringValue } from 'ms'
import { httpResponse } from '../../common/helpers/http-response';

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
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

        return httpResponse(true, { accessToken, refreshToken }, 'Connexion réussie', 200);
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

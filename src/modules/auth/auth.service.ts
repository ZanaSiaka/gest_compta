import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GenerateTokenDto, LoginDto } from './auth.dto';
import { httpResponse } from '../../common/helpers/http-response';

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(body: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: body.email } });
        if (!user) return httpResponse(false, null, 'Utilisateur non trouvé', 404);
        if (!user.est_actif) return httpResponse(false, null, 'Utilisateur inactif', 403);

        const isValidPassword: boolean = await bcrypt.compare(body.password, user.password);
        if (!isValidPassword) return httpResponse(false, null, 'Mot de passe incorrect', 401);

        const { password, token_reset, token_reset_expiration, ...rest } = user;
        return httpResponse(true, rest, 'Validation réussie', 200)
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
            expiresIn: process.env.JWT_EXPIRES_IN,
            secret: process.env.JWT_SECRET
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            secret: process.env.JWT_REFRESH_SECRET
        });

        await this.prisma.user.update({
            where: { user_id: body.user_id },
            data: { derniere_connexion: new Date() }
        });

        return httpResponse(true, { accessToken, refreshToken }, 'Connexion réussie', 200);

    }
}

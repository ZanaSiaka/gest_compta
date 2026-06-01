import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { httpResponse, httpResponsePaginated } from '../../common/helpers/http-response';

@Injectable()
export class UserService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service,
    ) { }

    async getAllUsers(entreprise_id: string, role: string, page: number, limit: number) {

        try {

            if (role !== 'ADMIN') {
                return httpResponse(false, null, 'Access denied', 403);
            }

            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: { entreprise_id },
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
                this.prisma.user.count({ where: { entreprise_id } })
            ]);

            return httpResponsePaginated(true, users, 'Users fetched successfully', total, page, limit);

        } catch (error) {
            console.error('Error fetching users:', error);
            return httpResponse(false, null, 'An error occurred while fetching users', 500);
        }

    }

}

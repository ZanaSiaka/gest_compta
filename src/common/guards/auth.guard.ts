import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);
    if (!token) {
      return false
    };

    const payload = this.authService.verifyToken(token);
    if (!payload || !payload.sub) {
      return false;
    }

    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.sub },
      select: {
        user_id: true,
        nom: true,
        prenom: true,
        email: true,
        est_actif: true,
        entreprise: true,
        // role: true
      }
    })

    if (!user) {
      return false
    }

    request['user'] = user;
    return true;
  }

  private extractToken(request: Request) {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;

    return auth.split(' ')[1]
  }
}

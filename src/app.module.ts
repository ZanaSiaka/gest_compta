import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './mail/mail.module';
import { R2Module } from './r2/r2.module';
import { RolesModule } from './modules/roles/roles.module';
import { ProfileModule } from './modules/profile/profile.module';
import { TiersModule } from './modules/tiers/tiers.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    MailModule,
    R2Module,
    RolesModule,
    ProfileModule,
    TiersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms'
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../../mail/mail.module';

@Module({

  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET as string,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN as StringValue },
      })
    }),
    PrismaModule,
    MailModule
  ],

  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule { }

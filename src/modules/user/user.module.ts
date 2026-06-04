import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [AuthModule, PrismaModule, MailModule, CommonModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }

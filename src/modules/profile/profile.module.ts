import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { R2Module } from '../../r2/r2.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule, R2Module],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule { }

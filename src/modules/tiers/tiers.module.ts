import { Module } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { TiersController } from './tiers.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [AuthModule, PrismaModule, CommonModule],
  controllers: [TiersController],
  providers: [TiersService],
})
export class TiersModule { }

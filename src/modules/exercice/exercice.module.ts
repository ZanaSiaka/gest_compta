import { Module } from '@nestjs/common';
import { ExerciceService } from './exercice.service';
import { ExerciceController } from './exercice.controller';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
// import { ExerciceCron } from './exercice.cron';

@Module({
  imports: [CommonModule, PrismaModule, AuthModule],
  controllers: [ExerciceController],
  providers: [ExerciceService], // Cron peut être ajouté, provider deja écrit
})
export class ExerciceModule { }

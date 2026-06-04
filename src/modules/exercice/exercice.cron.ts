import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ExerciceCron {

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cloturerExerciceExpires() {
        const exercices = await this.prisma.exercice.updateMany({
            where: {
                est_cloture: false,
                date_fin: { lt: new Date() }
            },
            data: {
                est_cloture: true,
                cloture_date: new Date(),
                statut_exercice: 'CLOTURE',
                cloture_par: 'SYSTEM'
            }
        });

        if (exercices.count > 0) {
            console.log(`✅ ${exercices.count} exercice(s) clôturé(s) automatiquement`);
        }
    }
}
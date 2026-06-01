import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {

    private resend = new Resend(process.env.RESEND_API_KEY);

    async resetPassword(to: string, nom: string, token: string) {

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        try {

            const result = await this.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'zanacoul210@gmail.com',
                subject: 'Demande de réinitialisation de mot de passe',
                html: `
                    <h2>Bonjour Mlle/Mme/M ${nom} ! </h2>
                    <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour confirmer :</p>
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 16px 0;"> Réinitialiser mon mot de passe</a>
                    <p>Ce lien expire dans 1 heure</p>
                    <p>Si vous n'avez pas fait de demande, ignorez cet email</p>
                `
            })

            if (result.error) throw new Error(result.error.message);

            console.log('Email envoyé avec succès');

        } catch (error) {
            console.error("Error when email sending");
            throw error;
        }

    }

    async unlockMail(to: string, nom: string, token: string) {

        const unlockUrl = `${process.env.FRONTEND_URL}/unlock-confirm?token=${token}`;

        try {
            const res = await this.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'zanacoul210@gmail.com',
                subject: 'Demande de déblocage de compte',
                html: `
                    <h2>Bonjour Mlle/Mme/M ${nom} ! </h2>
                    <p>Vous avez demandé le déblocage de votre compte. Cliquez sur le lien ci-dessous pour confirmer :</p>
                    <a href="${unlockUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 16px 0;"> Débloquer mon compte</a>
                    <p>Ce lien expire dans 1 heure</p>
                    <p>Si vous n'avez pas fait de demande, ignorez cet email</p>
                `
            });

            if (res.error) throw new Error(res.error.message);
            console.log('Email pour débloquage envoyé avec succès');
        } catch (error) {
            console.error("Error when email sending");
            throw error;
        }

    }

}

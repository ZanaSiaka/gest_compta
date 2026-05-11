import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import * as bcrypt from 'bcrypt';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {

    const entrepiseExists = await prisma.entreprise.findFirst();
    if (entrepiseExists) {
        console.log('✅ Une entreprise existe déjà');
        return;
    }

    const entreprise = await prisma.entreprise.create({
        data: {
            raison_sociale: 'Noushis Love Tech',
            nif: '123456789',
            rccm: 'RCC-2024-001',
            dfe: 'DFE-2024-001',
            forme_juridique: 'SARL',
            regime_fiscal: 'IS',
            secteur_activite: 'Technologie',
            adresse: '123 Rue de la Technologie, Abidjan',
            telephone: '+225 01 23 45 67 89',
            email: 'info@nlt.com',
            est_active: true,
            created_by: 'system',
        }
    });

    console.log('✅ Entreprise créée :', entreprise.raison_sociale);

    const role = await prisma.role.create({
        data: {
            nom: 'ADMIN',
            description: 'Rôle avec tous les droits',
            entreprise_id: entreprise.entreprise_id,
            created_by: 'system',
        }
    });

    console.log('✅ Rôle créé avec succès');

    const hashedPassword = await bcrypt.hash('Admin@1234', 12);
    const user = await prisma.user.create({
        data: {
            nom: 'Zana',
            prenom: 'Siaka',
            email: 'zana.siaka@nlt.com',
            password: hashedPassword,
            entreprise_id: entreprise.entreprise_id,
            role_id: role.role_id,
            est_actif: true,
            created_by: 'system',
        }
    });

    console.log(`✅ Utilisateur créé : ${user.prenom} ${user.nom} (${user.email})`);
    console.log(`🔑 Mot de passe : Admin@1234`);

}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
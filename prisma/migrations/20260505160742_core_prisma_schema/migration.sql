-- CreateEnum
CREATE TYPE "FormeJurique" AS ENUM ('SARL', 'SA', 'SAS', 'EURL', 'SNC', 'SCS', 'SCOP', 'SCIC', 'SCI', 'SASU');

-- CreateEnum
CREATE TYPE "RegimeFiscal" AS ENUM ('IS', 'IR', 'CFP', 'RSI');

-- CreateEnum
CREATE TYPE "StatutExercice" AS ENUM ('OUVERT', 'CLOTURE');

-- CreateTable
CREATE TABLE "Entreprise" (
    "entreprise_id" TEXT NOT NULL,
    "raison_sociale" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "rccm" TEXT NOT NULL,
    "dfe" TEXT NOT NULL,
    "forme_juridique" "FormeJurique" NOT NULL,
    "regime_fiscal" "RegimeFiscal" NOT NULL,
    "secteur_activite" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "site_web" TEXT,
    "logo" TEXT,
    "est_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("entreprise_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "entreprise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "permission_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "can_read" BOOLEAN NOT NULL DEFAULT false,
    "can_write" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_update" BOOLEAN NOT NULL DEFAULT false,
    "can_validate" BOOLEAN NOT NULL DEFAULT false,
    "can_export" BOOLEAN NOT NULL DEFAULT false,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "tentatives_connexion" INTEGER NOT NULL DEFAULT 0,
    "compte_bloque" BOOLEAN NOT NULL DEFAULT false,
    "derniere_connexion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "token_reset" TEXT,
    "token_reset_expiration" TIMESTAMP(3),
    "entreprise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Tiers" (
    "tiers_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "raison_sociale" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "rccm" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "est_airsi" BOOLEAN NOT NULL DEFAULT false,
    "entreprise_id" TEXT NOT NULL,

    CONSTRAINT "Tiers_pkey" PRIMARY KEY ("tiers_id")
);

-- CreateTable
CREATE TABLE "Exercice" (
    "exercice_id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "statut_exercice" "StatutExercice" NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "est_cloture" BOOLEAN NOT NULL DEFAULT false,
    "cloture_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "entreprise_id" TEXT NOT NULL,
    "cloture_par" TEXT,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("exercice_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_nif_key" ON "Entreprise"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_rccm_key" ON "Entreprise"("rccm");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_dfe_key" ON "Entreprise"("dfe");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_email_key" ON "Entreprise"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_site_web_key" ON "Entreprise"("site_web");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nom_key" ON "Role"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_reset_key" ON "User"("token_reset");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_code_key" ON "Tiers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_nif_key" ON "Tiers"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_rccm_key" ON "Tiers"("rccm");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_email_key" ON "Tiers"("email");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise"("entreprise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise"("entreprise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tiers" ADD CONSTRAINT "Tiers_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise"("entreprise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercice" ADD CONSTRAINT "Exercice_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise"("entreprise_id") ON DELETE CASCADE ON UPDATE CASCADE;

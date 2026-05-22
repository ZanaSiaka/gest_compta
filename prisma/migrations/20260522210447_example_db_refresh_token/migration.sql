/*
  Warnings:

  - The values [EURL,SCOP] on the enum `FormeJurique` will be removed. If these variants are still used in the database, this will fail.
  - The values [IS,IR,CFP] on the enum `RegimeFiscal` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `date_fin` on table `Exercice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormeJurique_new" AS ENUM ('SARL', 'SA', 'SAS', 'SNC', 'SCS', 'SCIC', 'SCI', 'SASU');
ALTER TABLE "Entreprise" ALTER COLUMN "forme_juridique" TYPE "FormeJurique_new" USING ("forme_juridique"::text::"FormeJurique_new");
ALTER TYPE "FormeJurique" RENAME TO "FormeJurique_old";
ALTER TYPE "FormeJurique_new" RENAME TO "FormeJurique";
DROP TYPE "public"."FormeJurique_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RegimeFiscal_new" AS ENUM ('TEE', 'RME', 'RNI', 'RSI');
ALTER TABLE "Entreprise" ALTER COLUMN "regime_fiscal" TYPE "RegimeFiscal_new" USING ("regime_fiscal"::text::"RegimeFiscal_new");
ALTER TYPE "RegimeFiscal" RENAME TO "RegimeFiscal_old";
ALTER TYPE "RegimeFiscal_new" RENAME TO "RegimeFiscal";
DROP TYPE "public"."RegimeFiscal_old";
COMMIT;

-- DropIndex
DROP INDEX "Entreprise_dfe_key";

-- DropIndex
DROP INDEX "Role_nom_key";

-- AlterTable
ALTER TABLE "Exercice" ALTER COLUMN "date_fin" SET NOT NULL,
ALTER COLUMN "cloture_date" DROP DEFAULT;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

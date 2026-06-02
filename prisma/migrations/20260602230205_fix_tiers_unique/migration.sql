/*
  Warnings:

  - A unique constraint covering the columns `[entreprise_id,code]` on the table `Tiers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[entreprise_id,nif]` on the table `Tiers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[entreprise_id,rccm]` on the table `Tiers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[entreprise_id,email]` on the table `Tiers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Tiers_code_key";

-- DropIndex
DROP INDEX "Tiers_nif_key";

-- DropIndex
DROP INDEX "Tiers_rccm_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_entreprise_id_code_key" ON "Tiers"("entreprise_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_entreprise_id_nif_key" ON "Tiers"("entreprise_id", "nif");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_entreprise_id_rccm_key" ON "Tiers"("entreprise_id", "rccm");

-- CreateIndex
CREATE UNIQUE INDEX "Tiers_entreprise_id_email_key" ON "Tiers"("entreprise_id", "email");

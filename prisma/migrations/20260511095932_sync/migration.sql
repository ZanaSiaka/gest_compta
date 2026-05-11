/*
  Warnings:

  - Added the required column `created_by` to the `Tiers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeTiers" AS ENUM ('CLIENT', 'PARTENAIRE', 'FOURNISSEUR');

-- AlterTable
ALTER TABLE "Tiers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "type" "TypeTiers" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" TEXT;

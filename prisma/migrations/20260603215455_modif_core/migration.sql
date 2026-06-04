/*
  Warnings:

  - Added the required column `created_by` to the `Exercice` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tiers_email_key";

-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "Tiers" ALTER COLUMN "nif" DROP NOT NULL,
ALTER COLUMN "rccm" DROP NOT NULL;

/*
  Warnings:

  - Changed the type of `module` on the `Permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Module" AS ENUM ('USERS', 'ROLES', 'TIERS', 'EXERCICES');

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "module",
ADD COLUMN     "module" "Module" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_role_id_module_key" ON "Permission"("role_id", "module");

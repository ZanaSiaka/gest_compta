/*
  Warnings:

  - A unique constraint covering the columns `[role_id,module]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_role_id_module_key" ON "Permission"("role_id", "module");

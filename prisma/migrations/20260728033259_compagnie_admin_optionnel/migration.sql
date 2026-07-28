-- AlterTable
ALTER TABLE "compagnies" ADD COLUMN     "admin_id" UUID;

-- CreateIndex
CREATE INDEX "compagnies_admin_id_idx" ON "compagnies"("admin_id");

-- AddForeignKey
ALTER TABLE "compagnies" ADD CONSTRAINT "compagnies_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "personnes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

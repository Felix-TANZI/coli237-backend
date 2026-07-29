-- AlterTable
ALTER TABLE "compagnies" ADD COLUMN     "agent_id" UUID;

-- CreateIndex
CREATE INDEX "compagnies_agent_id_idx" ON "compagnies"("agent_id");

-- AddForeignKey
ALTER TABLE "compagnies" ADD CONSTRAINT "compagnies_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

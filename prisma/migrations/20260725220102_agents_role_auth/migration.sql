/*
  Warnings:

  - Made the column `email` on table `agents` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "role_agent" AS ENUM ('AGENT', 'ADMIN');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "doit_changer_mot_de_passe" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "role_agent" NOT NULL DEFAULT 'AGENT',
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE INDEX "agents_role_idx" ON "agents"("role");

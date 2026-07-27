/*
  Warnings:

  - You are about to drop the column `coursier_id` on the `pieces_jointes` table. All the data in the column will be lost.
  - You are about to drop the column `partenaire_id` on the `pieces_jointes` table. All the data in the column will be lost.
  - You are about to drop the `coursiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partenaires` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `personne_id` to the `pieces_jointes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "role_personne" AS ENUM ('ADMIN_COMPAGNIE', 'MANAGER_AGENCE', 'LIVREUR_INDEPENDANT', 'LIVREUR_AGENCE');

-- DropForeignKey
ALTER TABLE "coursiers" DROP CONSTRAINT "coursiers_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "coursiers" DROP CONSTRAINT "coursiers_partenaire_id_fkey";

-- DropForeignKey
ALTER TABLE "partenaires" DROP CONSTRAINT "partenaires_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "pieces_jointes" DROP CONSTRAINT "pieces_jointes_coursier_id_fkey";

-- DropForeignKey
ALTER TABLE "pieces_jointes" DROP CONSTRAINT "pieces_jointes_partenaire_id_fkey";

-- DropIndex
DROP INDEX "pieces_jointes_coursier_id_idx";

-- DropIndex
DROP INDEX "pieces_jointes_partenaire_id_idx";

-- AlterTable
ALTER TABLE "pieces_jointes" DROP COLUMN "coursier_id",
DROP COLUMN "partenaire_id",
ADD COLUMN     "personne_id" UUID NOT NULL;

-- DropTable
DROP TABLE "coursiers";

-- DropTable
DROP TABLE "partenaires";

-- DropEnum
DROP TYPE "categorie_permis";

-- CreateTable
CREATE TABLE "compagnies" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(160) NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "supprime_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compagnies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agences" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(160) NOT NULL,
    "ville" VARCHAR(80),
    "compagnie_id" UUID NOT NULL,
    "supprime_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnes" (
    "id" UUID NOT NULL,
    "role" "role_personne" NOT NULL,
    "statut" "statut_validation" NOT NULL DEFAULT 'EN_ATTENTE',
    "prenom" VARCHAR(80) NOT NULL,
    "nom" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160),
    "telephone" VARCHAR(20) NOT NULL,
    "avatar_url" VARCHAR(500),
    "ville" VARCHAR(80),
    "quartier" VARCHAR(120),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "type_vehicule" "type_vehicule",
    "type_vehicule_autre" VARCHAR(80),
    "plaque" VARCHAR(20),
    "compagnie_id" UUID,
    "agence_id" UUID,
    "statut_chauffeur" VARCHAR(20),
    "mobile_money_numero" VARCHAR(20),
    "mobile_money_operateur" "operateur_mobile_money",
    "agent_id" UUID NOT NULL,
    "supprime_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compagnies_supprime_le_idx" ON "compagnies"("supprime_le");

-- CreateIndex
CREATE INDEX "agences_compagnie_id_idx" ON "agences"("compagnie_id");

-- CreateIndex
CREATE INDEX "agences_supprime_le_idx" ON "agences"("supprime_le");

-- CreateIndex
CREATE INDEX "personnes_role_idx" ON "personnes"("role");

-- CreateIndex
CREATE INDEX "personnes_statut_idx" ON "personnes"("statut");

-- CreateIndex
CREATE INDEX "personnes_agent_id_idx" ON "personnes"("agent_id");

-- CreateIndex
CREATE INDEX "personnes_compagnie_id_idx" ON "personnes"("compagnie_id");

-- CreateIndex
CREATE INDEX "personnes_ville_idx" ON "personnes"("ville");

-- CreateIndex
CREATE INDEX "personnes_supprime_le_idx" ON "personnes"("supprime_le");

-- CreateIndex
CREATE INDEX "pieces_jointes_personne_id_idx" ON "pieces_jointes"("personne_id");

-- AddForeignKey
ALTER TABLE "agences" ADD CONSTRAINT "agences_compagnie_id_fkey" FOREIGN KEY ("compagnie_id") REFERENCES "compagnies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnes" ADD CONSTRAINT "personnes_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnes" ADD CONSTRAINT "personnes_compagnie_id_fkey" FOREIGN KEY ("compagnie_id") REFERENCES "compagnies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnes" ADD CONSTRAINT "personnes_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_personne_id_fkey" FOREIGN KEY ("personne_id") REFERENCES "personnes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

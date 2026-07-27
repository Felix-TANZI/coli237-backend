/*
  Warnings:

  - You are about to drop the column `agence_id` on the `personnes` table. All the data in the column will be lost.
  - You are about to drop the `agences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "agences" DROP CONSTRAINT "agences_compagnie_id_fkey";

-- DropForeignKey
ALTER TABLE "personnes" DROP CONSTRAINT "personnes_agence_id_fkey";

-- AlterTable
ALTER TABLE "personnes" DROP COLUMN "agence_id";

-- DropTable
DROP TABLE "agences";

-- CreateEnum
CREATE TYPE "statut_compte" AS ENUM ('ACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "statut_validation" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETE');

-- CreateEnum
CREATE TYPE "type_vehicule" AS ENUM ('MOTO', 'TRICYCLE', 'VOITURE', 'CAMIONNETTE', 'A_PIED', 'AUTRE');

-- CreateEnum
CREATE TYPE "categorie_permis" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "operateur_mobile_money" AS ENUM ('MTN', 'ORANGE');

-- CreateEnum
CREATE TYPE "type_piece_jointe" AS ENUM ('PHOTO_IDENTITE', 'CNI', 'PERMIS', 'CARTE_GRISE', 'ASSURANCE', 'CARTE_SMT', 'REGISTRE_COMMERCE', 'AUTRE');

-- CreateTable
CREATE TABLE "agents" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(120) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(160),
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "statut" "statut_compte" NOT NULL DEFAULT 'ACTIF',
    "supprime_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partenaires" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(160) NOT NULL,
    "sigle" VARCHAR(60),
    "niu" VARCHAR(30),
    "registre_commerce" VARCHAR(60),
    "responsable_nom" VARCHAR(120) NOT NULL,
    "responsable_telephone" VARCHAR(20) NOT NULL,
    "responsable_email" VARCHAR(160),
    "ville" VARCHAR(80),
    "quartier" VARCHAR(120),
    "adresse" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mobile_money_numero" VARCHAR(20),
    "mobile_money_operateur" "operateur_mobile_money",
    "agent_id" UUID NOT NULL,
    "statut" "statut_validation" NOT NULL DEFAULT 'EN_ATTENTE',
    "supprime_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partenaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coursiers" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(120) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "cni" VARCHAR(30),
    "date_naissance" DATE,
    "ville" VARCHAR(80),
    "quartier" VARCHAR(120),
    "type_vehicule" "type_vehicule" NOT NULL,
    "plaque" VARCHAR(20),
    "marque_modele" VARCHAR(120),
    "a_permis" BOOLEAN NOT NULL DEFAULT false,
    "permis_categorie" "categorie_permis",
    "a_carte_grise" BOOLEAN NOT NULL DEFAULT false,
    "a_assurance" BOOLEAN NOT NULL DEFAULT false,
    "a_carte_smt" BOOLEAN NOT NULL DEFAULT false,
    "mobile_money_numero" VARCHAR(20),
    "mobile_money_operateur" "operateur_mobile_money",
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "adresse_gps" VARCHAR(255),
    "partenaire_id" UUID,
    "agent_id" UUID NOT NULL,
    "statut" "statut_validation" NOT NULL DEFAULT 'EN_ATTENTE',
    "supprime_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coursiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pieces_jointes" (
    "id" UUID NOT NULL,
    "type" "type_piece_jointe" NOT NULL,
    "chemin" VARCHAR(500) NOT NULL,
    "nom_original" VARCHAR(255),
    "coursier_id" UUID,
    "partenaire_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pieces_jointes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_telephone_key" ON "agents"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE INDEX "agents_statut_idx" ON "agents"("statut");

-- CreateIndex
CREATE INDEX "partenaires_statut_idx" ON "partenaires"("statut");

-- CreateIndex
CREATE INDEX "partenaires_agent_id_idx" ON "partenaires"("agent_id");

-- CreateIndex
CREATE INDEX "partenaires_ville_idx" ON "partenaires"("ville");

-- CreateIndex
CREATE INDEX "partenaires_supprime_le_idx" ON "partenaires"("supprime_le");

-- CreateIndex
CREATE INDEX "coursiers_statut_idx" ON "coursiers"("statut");

-- CreateIndex
CREATE INDEX "coursiers_agent_id_idx" ON "coursiers"("agent_id");

-- CreateIndex
CREATE INDEX "coursiers_partenaire_id_idx" ON "coursiers"("partenaire_id");

-- CreateIndex
CREATE INDEX "coursiers_ville_idx" ON "coursiers"("ville");

-- CreateIndex
CREATE INDEX "coursiers_supprime_le_idx" ON "coursiers"("supprime_le");

-- CreateIndex
CREATE INDEX "pieces_jointes_coursier_id_idx" ON "pieces_jointes"("coursier_id");

-- CreateIndex
CREATE INDEX "pieces_jointes_partenaire_id_idx" ON "pieces_jointes"("partenaire_id");

-- AddForeignKey
ALTER TABLE "partenaires" ADD CONSTRAINT "partenaires_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coursiers" ADD CONSTRAINT "coursiers_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "partenaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coursiers" ADD CONSTRAINT "coursiers_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_coursier_id_fkey" FOREIGN KEY ("coursier_id") REFERENCES "coursiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "partenaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

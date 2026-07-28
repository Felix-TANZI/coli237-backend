import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockageService } from '../../stockage/stockage.service';
import type { CreerPersonneDto, ModifierPersonneDto } from './personnes.dto';

// Filtres possibles sur la liste.
interface FiltresListe {
  role?: string;
  statut?: string;
  ville?: string;
  recherche?: string;
}

@Injectable()
export class PersonnesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockage: StockageService,
  ) {}

  // Recense une nouvelle personne. L'agent qui cree est enregistre.
  async creer(agentId: string, donnees: CreerPersonneDto) {
    // On nettoie l'email vide en null.
    const email = donnees.email && donnees.email.trim() ? donnees.email.trim() : null;

    return this.prisma.personne.create({
      data: {
        role: donnees.role,
        prenom: donnees.prenom,
        nom: donnees.nom,
        email,
        telephone: donnees.telephone,
        avatarUrl: donnees.avatarUrl,
        ville: donnees.ville,
        quartier: donnees.quartier,
        latitude: donnees.latitude,
        longitude: donnees.longitude,
        typeVehicule: donnees.typeVehicule,
        typeVehiculeAutre: donnees.typeVehiculeAutre,
        plaque: donnees.plaque,
        compagnieId: donnees.compagnieId,
        mobileMoneyNumero: donnees.mobileMoneyNumero,
        mobileMoneyOperateur: donnees.mobileMoneyOperateur,
        agentId,
      },
    });
  }

  // Liste avec filtres (role, statut, ville, recherche texte).
  async lister(filtres: FiltresListe) {
    return this.prisma.personne.findMany({
      where: {
        supprimeLe: null,
        role: filtres.role ? (filtres.role as never) : undefined,
        statut: filtres.statut ? (filtres.statut as never) : undefined,
        ville: filtres.ville ? { contains: filtres.ville, mode: 'insensitive' } : undefined,
        OR: filtres.recherche
          ? [
              { nom: { contains: filtres.recherche, mode: 'insensitive' } },
              { prenom: { contains: filtres.recherche, mode: 'insensitive' } },
              { telephone: { contains: filtres.recherche } },
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { id: true, nom: true } },
        compagnie: { select: { id: true, nom: true } },
      },
    });
  }

  async trouver(id: string) {
    const personne = await this.prisma.personne.findFirst({
      where: { id, supprimeLe: null },
      include: {
        agent: { select: { id: true, nom: true } },
        compagnie: { select: { id: true, nom: true } },
        documents: true,
      },
    });

    if (!personne) {
      throw new NotFoundException('Personne introuvable.');
    }

    return personne;
  }

  // Modifie une personne. Regles identiques a l'ancien systeme :
  //  - ADMIN peut tout modifier (sauf fiche validee)
  //  - AGENT ne modifie que ses propres fiches non validees
  async modifier(id: string, agent: { id: string; role: string }, donnees: ModifierPersonneDto) {
    const personne = await this.trouver(id);

    if (personne.statut === 'VALIDE') {
      throw new ForbiddenException('Cette fiche est validee et ne peut plus etre modifiee.');
    }

    if (agent.role !== 'ADMIN' && personne.agentId !== agent.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres recensements.');
    }

    const email = donnees.email && donnees.email.trim() ? donnees.email.trim() : undefined;

    return this.prisma.personne.update({
      where: { id },
      data: {
        ...donnees,
        email,
        // Une fiche rejetee puis corrigee repasse en attente.
        statut: personne.statut === 'REJETE' ? 'EN_ATTENTE' : undefined,
      },
    });
  }

  // Types de document a exemplaire unique.
  private readonly typesUniques = [
    'PHOTO_IDENTITE',
    'CNI',
    'PERMIS',
    'CARTE_GRISE',
    'ASSURANCE',
    'CARTE_SMT',
    'REGISTRE_COMMERCE',
  ];

  // Ajoute une piece jointe a une personne.
  async ajouterPiece(personneId: string, type: string, fichier: Express.Multer.File) {
    const personne = await this.trouver(personneId);

    if (personne.statut === 'VALIDE') {
      throw new ForbiddenException('Cette fiche est validee : impossible d ajouter un document.');
    }

    if (this.typesUniques.includes(type)) {
      const existant = await this.prisma.pieceJointe.findFirst({
        where: { personneId, type: type as never },
      });

      if (existant) {
        await this.stockage.supprimer(existant.chemin);
        await this.prisma.pieceJointe.delete({ where: { id: existant.id } });
      }
    }

    const chemin = await this.stockage.enregistrer(fichier, `personnes/${personneId}`);

    return this.prisma.pieceJointe.create({
      data: {
        type: type as never,
        chemin,
        nomOriginal: fichier.originalname,
        personneId,
      },
    });
  }

  // Valide une fiche : elle entre au registre officiel.
  async valider(id: string) {
    await this.trouver(id);
    return this.prisma.personne.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });
  }

  // Rejette une fiche : l'agent pourra corriger et resoumettre.
  async rejeter(id: string) {
    await this.trouver(id);
    return this.prisma.personne.update({
      where: { id },
      data: { statut: 'REJETE' },
    });
  }

  // Archive (suppression douce).
  async archiver(id: string) {
    await this.trouver(id);
    return this.prisma.personne.update({
      where: { id },
      data: { supprimeLe: new Date() },
    });
  }
}

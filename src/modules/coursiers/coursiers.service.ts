import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreerCoursierDto, ModifierCoursierDto } from './coursiers.dto';
import { StockageService } from '../../stockage/stockage.service';

@Injectable()
export class CoursiersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockage: StockageService,
  ) {}

  // Recense un nouveau coursier. L'agent qui cree est enregistre.
  async creer(agentId: string, donnees: CreerCoursierDto) {
    return this.prisma.coursier.create({
      data: {
        ...donnees,
        dateNaissance: donnees.dateNaissance ? new Date(donnees.dateNaissance) : null,
        agentId,
      },
    });
  }

  // Liste tous les coursiers non archives.
  async lister() {
    return this.prisma.coursier.findMany({
      where: { supprimeLe: null },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { id: true, nom: true } },
        partenaire: { select: { id: true, nom: true } },
      },
    });
  }

  // Consulte un coursier.
  async trouver(id: string) {
    const coursier = await this.prisma.coursier.findFirst({
      where: { id, supprimeLe: null },
      include: {
        agent: { select: { id: true, nom: true } },
        partenaire: { select: { id: true, nom: true } },
        documents: true,
      },
    });

    if (!coursier) {
      throw new NotFoundException('Coursier introuvable.');
    }

    return coursier;
  }

  // Modifie un coursier. Regles :
  //  - un ADMIN peut tout modifier (sauf fiche validee)
  //  - un AGENT ne modifie que ses propres fiches, et seulement si non validee
  async modifier(id: string, agent: { id: string; role: string }, donnees: ModifierCoursierDto) {
    const coursier = await this.trouver(id);

    if (coursier.statut === 'VALIDE') {
      throw new ForbiddenException('Cette fiche est validee et ne peut plus etre modifiee.');
    }

    if (agent.role !== 'ADMIN' && coursier.agentId !== agent.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres recensements.');
    }

    return this.prisma.coursier.update({
      where: { id },
      data: {
        ...donnees,
        dateNaissance: donnees.dateNaissance ? new Date(donnees.dateNaissance) : undefined,
        // Une fiche rejetee puis corrigee repasse en attente de validation.
        statut: coursier.statut === 'REJETE' ? 'EN_ATTENTE' : undefined,
      },
    });
  }

  // Types de document dont un coursier ne peut avoir qu'un seul exemplaire.
  private readonly typesUniques = [
    'PHOTO_IDENTITE',
    'CNI',
    'PERMIS',
    'CARTE_GRISE',
    'ASSURANCE',
    'CARTE_SMT',
  ];

  // Ajoute une piece jointe a un coursier.
  async ajouterPiece(coursierId: string, type: string, fichier: Express.Multer.File) {
    const coursier = await this.trouver(coursierId);

    if (coursier.statut === 'VALIDE') {
      throw new ForbiddenException('Cette fiche est validee : impossible d ajouter un document.');
    }

    // Pour un type unique, on remplace l'ancien fichier s'il existe.
    if (this.typesUniques.includes(type)) {
      const existant = await this.prisma.pieceJointe.findFirst({
        where: { coursierId, type: type as never },
      });

      if (existant) {
        await this.stockage.supprimer(existant.chemin);
        await this.prisma.pieceJointe.delete({ where: { id: existant.id } });
      }
    }

    const chemin = await this.stockage.enregistrer(fichier, `coursiers/${coursierId}`);

    return this.prisma.pieceJointe.create({
      data: {
        type: type as never,
        chemin,
        nomOriginal: fichier.originalname,
        coursierId,
      },
    });
  }
  // Met a jour uniquement la position GPS d'un coursier.
  async mettreAJourPosition(
    id: string,
    agent: { id: string; role: string },
    position: { latitude: number; longitude: number; adresseGps?: string },
  ) {
    const coursier = await this.trouver(id);

    if (coursier.statut === 'VALIDE') {
      throw new ForbiddenException('Cette fiche est validee et ne peut plus etre modifiee.');
    }

    if (agent.role !== 'ADMIN' && coursier.agentId !== agent.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres recensements.');
    }

    return this.prisma.coursier.update({
      where: { id },
      data: {
        latitude: position.latitude,
        longitude: position.longitude,
        adresseGps: position.adresseGps,
      },
    });
  }
  // Valide une fiche : elle entre au registre officiel et devient figee.
  async valider(id: string) {
    await this.trouver(id);

    return this.prisma.coursier.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });
  }

  // Rejette une fiche : l'agent pourra la corriger et la resoumettre.
  async rejeter(id: string) {
    await this.trouver(id);

    return this.prisma.coursier.update({
      where: { id },
      data: { statut: 'REJETE' },
    });
  }
}

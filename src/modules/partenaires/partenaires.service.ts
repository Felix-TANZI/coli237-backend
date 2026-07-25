import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreerPartenaireDto, ModifierPartenaireDto } from './partenaires.dto';

@Injectable()
export class PartenairesService {
  constructor(private readonly prisma: PrismaService) {}

  // Recense un nouveau partenaire.
  async creer(agentId: string, donnees: CreerPartenaireDto) {
    return this.prisma.partenaire.create({
      data: { ...donnees, agentId },
    });
  }

  // Liste tous les partenaires non archives.
  async lister() {
    return this.prisma.partenaire.findMany({
      where: { supprimeLe: null },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { id: true, nom: true } },
        _count: { select: { coursiers: true } },
      },
    });
  }

  // Consulte un partenaire avec ses coursiers.
  async trouver(id: string) {
    const partenaire = await this.prisma.partenaire.findFirst({
      where: { id, supprimeLe: null },
      include: {
        agent: { select: { id: true, nom: true } },
        documents: true,
        coursiers: {
          where: { supprimeLe: null },
          select: { id: true, nom: true, telephone: true, statut: true },
        },
      },
    });

    if (!partenaire) {
      throw new NotFoundException('Partenaire introuvable.');
    }

    return partenaire;
  }

  // Modifie un partenaire.
  async modifier(id: string, agent: { id: string; role: string }, donnees: ModifierPartenaireDto) {
    const partenaire = await this.trouver(id);

    if (partenaire.statut === 'VALIDE') {
      throw new ForbiddenException('Cette fiche est validee et ne peut plus etre modifiee.');
    }

    if (agent.role !== 'ADMIN' && partenaire.agentId !== agent.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres recensements.');
    }

    return this.prisma.partenaire.update({
      where: { id },
      data: {
        ...donnees,
        statut: partenaire.statut === 'REJETE' ? 'EN_ATTENTE' : undefined,
      },
    });
  }

  // Valide un partenaire (reserve admin).
  async valider(id: string) {
    await this.trouver(id);
    return this.prisma.partenaire.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });
  }

  // Rejette un partenaire (reserve admin).
  async rejeter(id: string) {
    await this.trouver(id);
    return this.prisma.partenaire.update({
      where: { id },
      data: { statut: 'REJETE' },
    });
  }

  // Archive un partenaire ET ses coursiers (suppression douce).
  // La trace reste en base pour l'audit.
  async archiver(id: string) {
    await this.trouver(id);
    const maintenant = new Date();

    // Les deux operations dans une transaction : tout ou rien.
    await this.prisma.$transaction([
      this.prisma.coursier.updateMany({
        where: { partenaireId: id, supprimeLe: null },
        data: { supprimeLe: maintenant },
      }),
      this.prisma.partenaire.update({
        where: { id },
        data: { supprimeLe: maintenant },
      }),
    ]);

    return { id, archive: true };
  }
}

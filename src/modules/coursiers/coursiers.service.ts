import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreerCoursierDto, ModifierCoursierDto } from './coursiers.dto';

@Injectable()
export class CoursiersService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });
  }
}

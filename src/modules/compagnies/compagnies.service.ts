import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreerCompagnieDto, ModifierCompagnieDto } from './compagnies.dto';

@Injectable()
export class CompagniesService {
  constructor(private readonly prisma: PrismaService) {}

  // On enregistre l'agent qui cree la compagnie (tracabilite).
  async creer(agentId: string, donnees: CreerCompagnieDto) {
    return this.prisma.compagnie.create({
      data: { ...donnees, agentId },
    });
  }

  async lister() {
    return this.prisma.compagnie.findMany({
      where: { supprimeLe: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { personnes: true } },
        admin: { select: { id: true, prenom: true, nom: true } },
        agent: { select: { id: true, nom: true } },
      },
    });
  }

  async trouver(id: string) {
    const compagnie = await this.prisma.compagnie.findFirst({
      where: { id, supprimeLe: null },
      include: {
        _count: { select: { personnes: true } },
        admin: { select: { id: true, prenom: true, nom: true } },
        agent: { select: { id: true, nom: true } },
      },
    });

    if (!compagnie) {
      throw new NotFoundException('Compagnie introuvable.');
    }

    return compagnie;
  }

  async modifier(id: string, donnees: ModifierCompagnieDto) {
    await this.trouver(id);
    return this.prisma.compagnie.update({ where: { id }, data: donnees });
  }

  async archiver(id: string) {
    await this.trouver(id);
    return this.prisma.compagnie.update({
      where: { id },
      data: { supprimeLe: new Date() },
    });
  }
}

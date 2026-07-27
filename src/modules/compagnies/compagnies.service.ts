import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreerCompagnieDto, ModifierCompagnieDto } from './compagnies.dto';

@Injectable()
export class CompagniesService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(donnees: CreerCompagnieDto) {
    return this.prisma.compagnie.create({ data: donnees });
  }

  // Liste les compagnies avec le nombre de personnes rattachees.
  async lister() {
    return this.prisma.compagnie.findMany({
      where: { supprimeLe: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { personnes: true } },
      },
    });
  }

  async trouver(id: string) {
    const compagnie = await this.prisma.compagnie.findFirst({
      where: { id, supprimeLe: null },
      include: {
        _count: { select: { personnes: true } },
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

  // Suppression douce.
  async archiver(id: string) {
    await this.trouver(id);
    return this.prisma.compagnie.update({
      where: { id },
      data: { supprimeLe: new Date() },
    });
  }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../securite/password.service';
import type { CreerAgentDto, ModifierAgentDto } from './agents.dto';

// Champs renvoyes au client : jamais le mot de passe.
const champsPublics = {
  id: true,
  nom: true,
  telephone: true,
  email: true,
  role: true,
  statut: true,
  doitChangerMotDePasse: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
  ) {}

  // Cree un agent et renvoie son mot de passe temporaire (une seule fois).
  async creer(donnees: CreerAgentDto) {
    const existant = await this.prisma.agent.findFirst({
      where: {
        supprimeLe: null,
        OR: [{ telephone: donnees.telephone }, { email: donnees.email }],
      },
    });

    if (existant) {
      throw new ConflictException('Un agent avec ce telephone ou cet email existe deja.');
    }

    const motDePasseTemporaire = donnees.motDePasse ?? this.password.genererTemporaire();
    const empreinte = await this.password.chiffrer(motDePasseTemporaire);

    const agent = await this.prisma.agent.create({
      data: {
        nom: donnees.nom,
        telephone: donnees.telephone,
        email: donnees.email,
        role: donnees.role,
        motDePasse: empreinte,
        doitChangerMotDePasse: true,
      },
    });

    return {
      id: agent.id,
      nom: agent.nom,
      telephone: agent.telephone,
      email: agent.email,
      role: agent.role,
      statut: agent.statut,
      motDePasseTemporaire,
      createdAt: agent.createdAt.toISOString(),
    };
  }

  // Liste tous les agents actifs (non archives).
  async lister() {
    return this.prisma.agent.findMany({
      where: { supprimeLe: null },
      select: champsPublics,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Recupere un agent par son identifiant.
  async trouver(id: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id, supprimeLe: null },
      select: champsPublics,
    });

    if (!agent) {
      throw new NotFoundException('Agent introuvable.');
    }

    return agent;
  }

  // Modifie un agent existant.
  async modifier(id: string, donnees: ModifierAgentDto) {
    await this.trouver(id); // verifie l'existence

    // Si telephone ou email change, verifie l'unicite.
    if (donnees.telephone || donnees.email) {
      const conflit = await this.prisma.agent.findFirst({
        where: {
          id: { not: id },
          supprimeLe: null,
          OR: [
            ...(donnees.telephone ? [{ telephone: donnees.telephone }] : []),
            ...(donnees.email ? [{ email: donnees.email }] : []),
          ],
        },
      });

      if (conflit) {
        throw new ConflictException('Un autre agent utilise deja ce telephone ou cet email.');
      }
    }

    return this.prisma.agent.update({
      where: { id },
      data: donnees,
      select: champsPublics,
    });
  }

  // Genere un nouveau mot de passe temporaire pour un agent.
  async reinitialiserMotDePasse(id: string) {
    await this.trouver(id);

    const motDePasseTemporaire = this.password.genererTemporaire();
    const empreinte = await this.password.chiffrer(motDePasseTemporaire);

    await this.prisma.agent.update({
      where: { id },
      data: { motDePasse: empreinte, doitChangerMotDePasse: true },
    });

    return { id, motDePasseTemporaire };
  }

  // Archive un agent (suppression douce : la trace reste en base).
  async archiver(id: string) {
    await this.trouver(id);

    await this.prisma.agent.update({
      where: { id },
      data: { supprimeLe: new Date() },
    });

    return { id, archive: true };
  }
}

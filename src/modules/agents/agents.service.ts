import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../securite/password.service';
import type { CreerAgentDto } from './agents.dto';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
  ) {}

  // Cree un agent. Si aucun mot de passe n'est fourni, en genere un.
  // Retourne le mot de passe temporaire en clair (une seule fois).
  async creer(donnees: CreerAgentDto) {
    // Verifie que telephone et email ne sont pas deja pris.
    const existant = await this.prisma.agent.findFirst({
      where: {
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

    // Le mot de passe temporaire n'est renvoye qu'ici, jamais stocke en clair.
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
}

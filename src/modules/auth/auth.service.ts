import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../securite/password.service';
import type { ChangerMotDePasseDto, ConnexionDto, InscriptionDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  // Connecte un agent par email ou telephone + mot de passe.
  async connexion(donnees: ConnexionDto) {
    // On reconnait email ou telephone : presence d'un @.
    const estEmail = donnees.identifiant.includes('@');

    const agent = await this.prisma.agent.findFirst({
      where: {
        supprimeLe: null,
        ...(estEmail ? { email: donnees.identifiant } : { telephone: donnees.identifiant }),
      },
    });

    // Message volontairement vague : ne pas reveler si le compte existe.
    if (!agent) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect.');
    }

    if (agent.statut === 'SUSPENDU') {
      throw new UnauthorizedException('Ce compte est suspendu.');
    }

    const motDePasseOk = await this.password.verifier(donnees.motDePasse, agent.motDePasse);

    if (!motDePasseOk) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect.');
    }

    const jeton = this.jwt.sign({
      sub: agent.id,
      role: agent.role,
    });

    return {
      jeton,
      agent: {
        id: agent.id,
        nom: agent.nom,
        email: agent.email,
        role: agent.role,
        doitChangerMotDePasse: agent.doitChangerMotDePasse,
      },
    };
  }

  // Inscription libre : cree un compte agent actif, deja connecte.
  async inscription(donnees: InscriptionDto) {
    // Verifie que l'email et le telephone ne sont pas deja pris.
    const existant = await this.prisma.agent.findFirst({
      where: {
        supprimeLe: null,
        OR: [{ email: donnees.email }, { telephone: donnees.telephone }],
      },
    });

    if (existant) {
      throw new UnauthorizedException('Un compte existe deja avec cet email ou ce telephone.');
    }

    const empreinte = await this.password.chiffrer(donnees.motDePasse);

    const agent = await this.prisma.agent.create({
      data: {
        nom: donnees.nom,
        email: donnees.email,
        telephone: donnees.telephone,
        motDePasse: empreinte,
        role: 'AGENT',
        doitChangerMotDePasse: false,
        statut: 'ACTIF',
      },
    });

    const jeton = this.jwt.sign({ sub: agent.id, role: agent.role });

    return {
      jeton,
      agent: {
        id: agent.id,
        nom: agent.nom,
        email: agent.email,
        role: agent.role,
        doitChangerMotDePasse: agent.doitChangerMotDePasse,
      },
    };
  }

  // Change le mot de passe de l'agent connecte.
  async changerMotDePasse(agentId: string, donnees: ChangerMotDePasseDto) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new UnauthorizedException('Agent introuvable.');
    }

    const ancienOk = await this.password.verifier(donnees.ancienMotDePasse, agent.motDePasse);

    if (!ancienOk) {
      throw new UnauthorizedException('Ancien mot de passe incorrect.');
    }

    const empreinte = await this.password.chiffrer(donnees.nouveauMotDePasse);

    await this.prisma.agent.update({
      where: { id: agentId },
      data: { motDePasse: empreinte, doitChangerMotDePasse: false },
    });

    return { succes: true };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// Contenu du jeton (ce qu'on y a mis a la connexion).
interface ContenuJeton {
  sub: string; // id de l'agent
  role: string;
}

// Ce qui sera attache a chaque requete authentifiee.
export interface AgentConnecte {
  id: string;
  role: string;
  doitChangerMotDePasse: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Appele automatiquement apres verification de la signature du jeton.
  // On revalide en base : un agent archive ou suspendu perd l'acces
  // immediatement, meme si son jeton n'a pas encore expire.
  async validate(contenu: ContenuJeton): Promise<AgentConnecte> {
    const agent = await this.prisma.agent.findFirst({
      where: { id: contenu.sub, supprimeLe: null, statut: 'ACTIF' },
    });

    if (!agent) {
      throw new UnauthorizedException('Session invalide.');
    }

    return {
      id: agent.id,
      role: agent.role,
      doitChangerMotDePasse: agent.doitChangerMotDePasse,
    };
  }
}

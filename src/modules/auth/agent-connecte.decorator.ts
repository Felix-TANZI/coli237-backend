import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AgentConnecte } from './jwt.strategy';

// Recupere l'agent connecte dans un controleur : @Connecte() agent: AgentConnecte
export const Connecte = createParamDecorator(
  (_donnees: unknown, ctx: ExecutionContext): AgentConnecte => {
    const requete = ctx.switchToHttp().getRequest<{ user: AgentConnecte }>();
    return requete.user;
  },
);

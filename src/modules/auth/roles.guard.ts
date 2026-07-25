import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLE_ROLES } from './roles.decorator';
import type { AgentConnecte } from './jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Roles exiges par la route, s'il y en a.
    const rolesRequis = this.reflector.getAllAndOverride<string[]>(CLE_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Aucune exigence de role : on laisse passer (le JwtGuard a deja verifie
    // que l'agent est connecte).
    if (!rolesRequis || rolesRequis.length === 0) {
      return true;
    }

    const requete = context.switchToHttp().getRequest<{ user: AgentConnecte }>();

    if (!rolesRequis.includes(requete.user.role)) {
      throw new ForbiddenException('Acces reserve aux administrateurs.');
    }

    return true;
  }
}

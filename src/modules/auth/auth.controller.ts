import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ChangerMotDePasseDto, ConnexionDto, InscriptionDto, SessionDto } from './auth.dto';
import { Connecte } from './agent-connecte.decorator';
import { JwtGuard } from './jwt.guard';
import type { AgentConnecte } from './jwt.strategy';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Connexion : 5 tentatives par minute par IP (contre la force brute).
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se connecter',
    description:
      'Connexion par email ou telephone. Renvoie un jeton a placer dans Authorization: Bearer.',
  })
  async connexion(@Body() donnees: ConnexionDto): Promise<SessionDto> {
    return this.auth.connexion(donnees);
  }

  // Inscription : 3 comptes par minute par IP (contre la creation massive).
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('inscription')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "S'inscrire",
    description: 'Creation libre d un compte agent. Renvoie un jeton, comme la connexion.',
  })
  async inscription(@Body() donnees: InscriptionDto) {
    return this.auth.inscription(donnees);
  }

  @Post('changer-mot-de-passe')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth('jetonVendeur')
  @ApiOperation({
    summary: 'Changer son mot de passe',
    description: 'Necessite d etre connecte. Obligatoire a la premiere connexion.',
  })
  async changerMotDePasse(@Connecte() agent: AgentConnecte, @Body() donnees: ChangerMotDePasseDto) {
    return this.auth.changerMotDePasse(agent.id, donnees);
  }
}

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangerMotDePasseDto, ConnexionDto, SessionDto } from './auth.dto';
import { Connecte } from './agent-connecte.decorator';
import { JwtGuard } from './jwt.guard';
import type { AgentConnecte } from './jwt.strategy';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

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

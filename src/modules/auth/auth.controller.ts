import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConnexionDto, SessionDto } from './auth.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se connecter',
    description:
      'Connexion par email ou telephone. Renvoie un jeton a placer dans l en-tete Authorization: Bearer.',
  })
  async connexion(@Body() donnees: ConnexionDto): Promise<SessionDto> {
    return this.auth.connexion(donnees);
  }
}

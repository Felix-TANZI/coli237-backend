import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SanteDto } from './health.dto';

@ApiTags('Systeme')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  @ApiOperation({
    summary: 'Etat du service',
    description:
      "Sonde utilisee par Docker, Railway et la supervision. Sans authentification, n'interroge aucune dependance externe.",
  })
  @ApiOkResponse({ type: SanteDto })
  verifier(): SanteDto {
    return {
      statut: 'ok',
      version: process.env.npm_package_version ?? '0.1.0',
      environnement: this.config.get<string>('NODE_ENV')!,
      horodatage: new Date().toISOString(),
      demarreDepuis: Math.round(process.uptime()),
    };
  }
}
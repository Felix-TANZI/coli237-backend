import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PartenairesService } from './partenaires.service';
import { CreerPartenaireDto, ModifierPartenaireDto } from './partenaires.dto';
import { Connecte } from '../auth/agent-connecte.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AgentConnecte } from '../auth/jwt.strategy';

@ApiTags('Partenaires')
@ApiBearerAuth('jetonVendeur')
@UseGuards(JwtGuard)
@Controller('partenaires')
export class PartenairesController {
  constructor(private readonly partenaires: PartenairesService) {}

  @Post()
  @ApiOperation({ summary: 'Recenser un partenaire' })
  async creer(@Connecte() agent: AgentConnecte, @Body() donnees: CreerPartenaireDto) {
    return this.partenaires.creer(agent.id, donnees);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les partenaires' })
  async lister() {
    return this.partenaires.lister();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un partenaire et ses coursiers' })
  async trouver(@Param('id', ParseUUIDPipe) id: string) {
    return this.partenaires.trouver(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un partenaire' })
  async modifier(
    @Param('id', ParseUUIDPipe) id: string,
    @Connecte() agent: AgentConnecte,
    @Body() donnees: ModifierPartenaireDto,
  ) {
    return this.partenaires.modifier(id, agent, donnees);
  }

  @Post(':id/valider')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Valider un partenaire (admin)' })
  async valider(@Param('id', ParseUUIDPipe) id: string) {
    return this.partenaires.valider(id);
  }

  @Post(':id/rejeter')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Rejeter un partenaire (admin)' })
  async rejeter(@Param('id', ParseUUIDPipe) id: string) {
    return this.partenaires.rejeter(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Archiver un partenaire (admin)',
    description: 'Archive le partenaire et ses coursiers. Trace conservee.',
  })
  async archiver(@Param('id', ParseUUIDPipe) id: string) {
    return this.partenaires.archiver(id);
  }
}

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
import { CompagniesService } from './compagnies.service';
import { CreerCompagnieDto, ModifierCompagnieDto } from './compagnies.dto';
import { Connecte } from '../auth/agent-connecte.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AgentConnecte } from '../auth/jwt.strategy';

@ApiTags('Compagnies')
@ApiBearerAuth('jetonVendeur')
@UseGuards(JwtGuard)
@Controller('compagnies')
export class CompagniesController {
  constructor(private readonly compagnies: CompagniesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les compagnies' })
  async lister() {
    return this.compagnies.lister();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une compagnie' })
  async trouver(@Param('id', ParseUUIDPipe) id: string) {
    return this.compagnies.trouver(id);
  }

  // Tout agent connecte peut creer une compagnie ; on enregistre qui la cree.
  @Post()
  @ApiOperation({ summary: 'Creer une compagnie' })
  async creer(@Connecte() agent: AgentConnecte, @Body() donnees: CreerCompagnieDto) {
    return this.compagnies.creer(agent.id, donnees);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modifier une compagnie (admin)' })
  async modifier(@Param('id', ParseUUIDPipe) id: string, @Body() donnees: ModifierCompagnieDto) {
    return this.compagnies.modifier(id, donnees);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Archiver une compagnie (admin)' })
  async archiver(@Param('id', ParseUUIDPipe) id: string) {
    return this.compagnies.archiver(id);
  }
}

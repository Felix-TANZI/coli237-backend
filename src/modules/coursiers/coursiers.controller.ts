import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoursiersService } from './coursiers.service';
import { CreerCoursierDto, ModifierCoursierDto } from './coursiers.dto';
import { Connecte } from '../auth/agent-connecte.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import type { AgentConnecte } from '../auth/jwt.strategy';

@ApiTags('Coursiers')
@ApiBearerAuth('jetonVendeur')
@UseGuards(JwtGuard)
@Controller('coursiers')
export class CoursiersController {
  constructor(private readonly coursiers: CoursiersService) {}

  @Post()
  @ApiOperation({ summary: 'Recenser un coursier' })
  async creer(@Connecte() agent: AgentConnecte, @Body() donnees: CreerCoursierDto) {
    return this.coursiers.creer(agent.id, donnees);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les coursiers' })
  async lister() {
    return this.coursiers.lister();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un coursier' })
  async trouver(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursiers.trouver(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un coursier',
    description: 'Possible tant que la fiche n est pas validee.',
  })
  async modifier(
    @Param('id', ParseUUIDPipe) id: string,
    @Connecte() agent: AgentConnecte,
    @Body() donnees: ModifierCoursierDto,
  ) {
    return this.coursiers.modifier(id, agent, donnees);
  }
}

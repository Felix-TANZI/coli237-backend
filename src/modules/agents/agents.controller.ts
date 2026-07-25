import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { AgentCreeDto, CreerAgentDto, ModifierAgentDto } from './agents.dto';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Creer un agent',
    description: 'Cree un compte agent. Le mot de passe temporaire est renvoye une seule fois.',
  })
  async creer(@Body() donnees: CreerAgentDto): Promise<AgentCreeDto> {
    return this.agents.creer(donnees);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les agents' })
  async lister() {
    return this.agents.lister();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un agent' })
  async trouver(@Param('id', ParseUUIDPipe) id: string) {
    return this.agents.trouver(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un agent' })
  async modifier(@Param('id', ParseUUIDPipe) id: string, @Body() donnees: ModifierAgentDto) {
    return this.agents.modifier(id, donnees);
  }

  @Post(':id/reinitialiser-mot-de-passe')
  @ApiOperation({
    summary: 'Reinitialiser le mot de passe',
    description: 'Genere un nouveau mot de passe temporaire, affiche une seule fois.',
  })
  async reinitialiser(@Param('id', ParseUUIDPipe) id: string) {
    return this.agents.reinitialiserMotDePasse(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Archiver un agent',
    description: 'Suppression douce : la trace reste en base pour audit.',
  })
  async archiver(@Param('id', ParseUUIDPipe) id: string) {
    return this.agents.archiver(id);
  }
}

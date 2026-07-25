import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { AgentCreeDto, CreerAgentDto } from './agents.dto';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Creer un agent',
    description:
      "Cree un compte agent. Le mot de passe temporaire est renvoye une seule fois. L'agent devra le changer a sa premiere connexion.",
  })
  async creer(@Body() donnees: CreerAgentDto): Promise<AgentCreeDto> {
    return this.agents.creer(donnees);
  }
}

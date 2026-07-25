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
import { CreerCoursierDto, ModifierCoursierDto, PositionDto } from './coursiers.dto';
import { Connecte } from '../auth/agent-connecte.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import type { AgentConnecte } from '../auth/jwt.strategy';
import { ParseFilePipeBuilder, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('fichier'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Ajouter une photo ou un document',
    description:
      'Types : PHOTO_IDENTITE, CNI, PERMIS, CARTE_GRISE, ASSURANCE, CARTE_SMT, AUTRE. Formats acceptes : jpg, png, pdf. Max 5 Mo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'CNI' },
        fichier: { type: 'string', format: 'binary' },
      },
    },
  })
  async ajouterDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('type') type: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|pdf)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build(),
    )
    fichier: Express.Multer.File,
  ) {
    return this.coursiers.ajouterPiece(id, type, fichier);
  }
  @Patch(':id/position')
  @ApiOperation({
    summary: 'Mettre a jour la position GPS',
    description: 'Ajuste uniquement les coordonnees, sans toucher au reste.',
  })
  async mettreAJourPosition(
    @Param('id', ParseUUIDPipe) id: string,
    @Connecte() agent: AgentConnecte,
    @Body() position: PositionDto,
  ) {
    return this.coursiers.mettreAJourPosition(id, agent, position);
  }
  @Post(':id/valider')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Valider un coursier',
    description: 'Reserve aux admins. La fiche entre au registre et devient figee.',
  })
  async valider(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursiers.valider(id);
  }

  @Post(':id/rejeter')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Rejeter un coursier',
    description: 'Reserve aux admins. L agent pourra corriger et resoumettre.',
  })
  async rejeter(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursiers.rejeter(id);
  }
}

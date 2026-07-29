import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PersonnesService } from './personnes.service';
import { CreerPersonneDto, ModifierPersonneDto } from './personnes.dto';
import { Connecte } from '../auth/agent-connecte.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AgentConnecte } from '../auth/jwt.strategy';

@ApiTags('Personnes')
@ApiBearerAuth('jetonVendeur')
@UseGuards(JwtGuard)
@Controller('personnes')
export class PersonnesController {
  constructor(private readonly personnes: PersonnesService) {}

  @Post()
  @ApiOperation({ summary: 'Recenser une personne (selon son role)' })
  async creer(@Connecte() agent: AgentConnecte, @Body() donnees: CreerPersonneDto) {
    return this.personnes.creer(agent.id, donnees);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les personnes (avec filtres)' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'statut', required: false })
  @ApiQuery({ name: 'ville', required: false })
  @ApiQuery({ name: 'recherche', required: false })
  async lister(
    @Query('role') role?: string,
    @Query('statut') statut?: string,
    @Query('ville') ville?: string,
    @Query('recherche') recherche?: string,
  ) {
    return this.personnes.lister({ role, statut, ville, recherche });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une personne' })
  async trouver(@Param('id', ParseUUIDPipe) id: string) {
    return this.personnes.trouver(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier une personne',
    description: 'Possible tant que la fiche n est pas validee.',
  })
  async modifier(
    @Param('id', ParseUUIDPipe) id: string,
    @Connecte() agent: AgentConnecte,
    @Body() donnees: ModifierPersonneDto,
  ) {
    return this.personnes.modifier(id, agent, donnees);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('fichier'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Ajouter une photo ou un document',
    description:
      'Types : PHOTO_IDENTITE, CNI, PERMIS, CARTE_GRISE, ASSURANCE, CARTE_SMT, REGISTRE_COMMERCE, AUTRE. Formats : jpg, png, pdf. Max 5 Mo.',
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
    return this.personnes.ajouterPiece(id, type, fichier);
  }

  @Get(':id/documents/:documentId/url')
  @ApiOperation({
    summary: 'Obtenir le lien de telechargement d un document',
    description: 'Renvoie une URL signee temporaire (valide 1 heure).',
  })
  async urlDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.personnes.urlDocument(id, documentId);
  }

  @Post(':id/valider')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Valider une personne (admin)',
    description: 'La fiche entre au registre et devient figee.',
  })
  async valider(@Param('id', ParseUUIDPipe) id: string) {
    return this.personnes.valider(id);
  }

  @Post(':id/rejeter')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Rejeter une personne (admin)',
    description: 'L agent pourra corriger et resoumettre.',
  })
  async rejeter(@Param('id', ParseUUIDPipe) id: string) {
    return this.personnes.rejeter(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Archiver une personne (admin)' })
  async archiver(@Param('id', ParseUUIDPipe) id: string) {
    return this.personnes.archiver(id);
  }
}

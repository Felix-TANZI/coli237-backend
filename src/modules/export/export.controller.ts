import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

// Export reserve aux admins : c'est le registre transmis a COLI.
@ApiTags('Export')
@ApiBearerAuth('jetonVendeur')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('coursiers.xlsx')
  @ApiOperation({ summary: 'Telecharger les coursiers en Excel (admin)' })
  async coursiersExcel(@Res() res: Response) {
    const fichier = await this.exportService.coursiersExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="coursiers.xlsx"',
    });
    res.send(fichier);
  }

  @Get('coursiers.pdf')
  @ApiOperation({ summary: 'Telecharger les coursiers en PDF (admin)' })
  async coursiersPdf(@Res() res: Response) {
    const fichier = await this.exportService.coursiersPdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="coursiers.pdf"',
    });
    res.send(fichier);
  }

  @Get('partenaires.xlsx')
  @ApiOperation({ summary: 'Telecharger les partenaires en Excel (admin)' })
  async partenairesExcel(@Res() res: Response) {
    const fichier = await this.exportService.partenairesExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="partenaires.xlsx"',
    });
    res.send(fichier);
  }

  @Get('partenaires.pdf')
  @ApiOperation({ summary: 'Telecharger les partenaires en PDF (admin)' })
  async partenairesPdf(@Res() res: Response) {
    const fichier = await this.exportService.partenairesPdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="partenaires.pdf"',
    });
    res.send(fichier);
  }
}

import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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

  @Get('personnes.xlsx')
  @ApiOperation({ summary: 'Telecharger les personnes en Excel (admin)' })
  @ApiQuery({ name: 'role', required: false })
  async personnesExcel(@Res() res: Response, @Query('role') role?: string) {
    const fichier = await this.exportService.personnesExcel(role);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="personnes.xlsx"',
    });
    res.send(fichier);
  }

  @Get('personnes.pdf')
  @ApiOperation({ summary: 'Telecharger les personnes en PDF (admin)' })
  @ApiQuery({ name: 'role', required: false })
  async personnesPdf(@Res() res: Response, @Query('role') role?: string) {
    const fichier = await this.exportService.personnesPdf(role);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="personnes.pdf"',
    });
    res.send(fichier);
  }
}

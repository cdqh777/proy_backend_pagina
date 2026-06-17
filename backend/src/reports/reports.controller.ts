import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, GuardiaRoles)
@Roles('administrador')
export class ReportesController {
  constructor(private readonly servicioReportes: ReportesService) {}

  @Get('sales/pdf')
  async descargarReporteVentasPdf(
    @Query('startDate') fechaInicio: string,
    @Query('endDate') fechaFin: string,
    @Res() respuesta: Response,
  ) {
    const buffer = await this.servicioReportes.generarReporteVentasPdf(fechaInicio, fechaFin);
    respuesta.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-ventas-${Date.now()}.pdf"`,
      'Content-Length': buffer.length,
    });
    respuesta.end(buffer);
  }

  @Get('inventory/stats')
  obtenerEstadisticasInventario() {
    return this.servicioReportes.obtenerEstadisticasInventario();
  }
}

export { ReportesController as ReportsController };

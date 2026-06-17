import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { VentasService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class VentasController {
  constructor(private readonly servicioVentas: VentasService) {}

  @Get()
  obtenerTodas(@Query('startDate') fechaInicio?: string, @Query('endDate') fechaFin?: string) {
    return this.servicioVentas.obtenerTodas(fechaInicio, fechaFin);
  }

  @Get('top-selling')
  obtenerMasVendidos(
    @Query('limit') limite?: number,
    @Query('startDate') fechaInicio?: string,
    @Query('endDate') fechaFin?: string,
  ) { return this.servicioVentas.obtenerMasVendidos(limite ? +limite : 10, fechaInicio, fechaFin); }

  @Get('by-period')
  obtenerPorPeriodo(@Query('startDate') fechaInicio?: string, @Query('endDate') fechaFin?: string) {
    return this.servicioVentas.obtenerVentasPorPeriodo(fechaInicio, fechaFin);
  }

  @Get('summary')
  obtenerResumen() { return this.servicioVentas.obtenerResumenVentas(); }

  @Post()
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  registrar(
    @Body('articleId', ParseIntPipe) idArticulo: number,
    @Body('quantity',  ParseIntPipe) cantidad:   number,
    @Request() solicitud,
  ) { return this.servicioVentas.registrar(idArticulo, cantidad, solicitud.user.idUsuario); }

  @Put(':id/anular')
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.servicioVentas.anular(id);
  }

  @Put(':id/devolucion')
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  registrarDevolucion(@Param('id', ParseIntPipe) id: number) {
    return this.servicioVentas.registrarDevolucion(id);
  }

  @Put(':id/reclamo')
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  registrarReclamo(@Param('id', ParseIntPipe) id: number, @Body('motivo') motivo: string) {
    return this.servicioVentas.registrarReclamo(id, motivo);
  }
}

export { VentasController as SalesController };

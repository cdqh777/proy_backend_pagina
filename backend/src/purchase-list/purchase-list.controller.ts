import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ListaComprasService } from './purchase-list.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('purchase-list')
@UseGuards(JwtAuthGuard, GuardiaRoles)
@Roles('administrador')
export class ListaComprasController {
  constructor(private readonly servicioListaCompras: ListaComprasService) {}

  @Get()
  obtenerTodos() {
    return this.servicioListaCompras.obtenerTodos();
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioListaCompras.obtenerUno(id);
  }

  @Post()
  crear(@Body() cuerpo: any) {
    return this.servicioListaCompras.crear(cuerpo);
  }

  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() cuerpo: any) {
    return this.servicioListaCompras.actualizar(id, cuerpo);
  }

  @Put(':id/purchased')
  marcarComoComprado(@Param('id', ParseIntPipe) id: number) {
    return this.servicioListaCompras.marcarComoComprado(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioListaCompras.eliminar(id);
  }
}

export { ListaComprasController as PurchaseListController };

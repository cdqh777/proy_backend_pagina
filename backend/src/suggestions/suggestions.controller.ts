import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { SugerenciasService } from './suggestions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SugerenciasController {
  constructor(private readonly servicioSugerencias: SugerenciasService) {}

  @Get()
  obtenerTodas() {
    return this.servicioSugerencias.obtenerTodas();
  }

  @Post()
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  crear(@Body() cuerpo: any, @Request() solicitud) {
    return this.servicioSugerencias.crear({ ...cuerpo, user_id: solicitud.user.idUsuario });
  }

  @Put(':id/status')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  actualizarEstado(@Param('id', ParseIntPipe) id: number, @Body('status') estado: string) {
    return this.servicioSugerencias.actualizarEstado(id, estado);
  }

  @Put(':id/increment')
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  incrementarContador(@Param('id', ParseIntPipe) id: number) {
    return this.servicioSugerencias.incrementarContador(id);
  }

  @Delete(':id')
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioSugerencias.eliminar(id);
  }
}

export { SugerenciasController as SuggestionsController };

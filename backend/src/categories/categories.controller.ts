import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoriasService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly serviciosCategorias: CategoriasService) {}

  @Get()
  obtenerTodos() {
    return this.serviciosCategorias.obtenerTodos();
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosCategorias.obtenerUno(id);
  }

  @Post()
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  crear(@Body() cuerpo: any) {
    return this.serviciosCategorias.crear(cuerpo);
  }

  @Put(':id')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() cuerpo: any) {
    return this.serviciosCategorias.actualizar(id, cuerpo);
  }

  @Delete(':id')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosCategorias.eliminar(id);
  }
}

export { CategoriasController as CategoriesController };

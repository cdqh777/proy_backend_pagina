import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseIntPipe, Request,
} from '@nestjs/common';
import { ArticulosService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticulosController {
  constructor(private readonly servicioArticulos: ArticulosService) {}

  @Get()
  obtenerTodos(
    @Query('name') nombre?: string,
    @Query('typeId') idTipo?: number,
    @Query('status') estado?: string,
  ) {
    return this.servicioArticulos.obtenerTodos({ nombre, idTipo: idTipo ? +idTipo : undefined, estado });
  }

  @Get('out-of-stock')
  obtenerAgotados() { return this.servicioArticulos.obtenerAgotados(); }

  @Get('low-stock')
  obtenerStockBajo() { return this.servicioArticulos.obtenerConStockBajo(); }

  @Get('stats')
  obtenerResumen() { return this.servicioArticulos.obtenerResumenEstadistico(); }

  @Get('search')
  buscar(@Query('q') termino: string) { return this.servicioArticulos.buscar(termino); }

  @Get('suggest-price')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  sugerirPrecio(@Query('cost') costo: number) { return this.servicioArticulos.sugerirPrecio(+costo); }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) { return this.servicioArticulos.obtenerUno(id); }

  @Post()
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  crear(@Body() dto: CreateArticleDto) { return this.servicioArticulos.crear(dto); }

  @Put(':id')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.servicioArticulos.actualizar(id, dto);
  }

  @Put(':id/stock')
  @UseGuards(GuardiaRoles)
  @Roles('vendedor', 'administrador')
  actualizarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) cantidad: number,
  ) { return this.servicioArticulos.actualizarStock(id, cantidad); }

  @Put(':id/restock')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  reabastecer(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) cantidad: number,
  ) { return this.servicioArticulos.reabastecer(id, cantidad); }

  @Delete(':id')
  @UseGuards(GuardiaRoles)
  @Roles('administrador')
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicioArticulos.eliminar(id); }
}

export { ArticulosController as ArticlesController };

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, GuardiaRoles)
export class UsuariosController {
  constructor(private readonly servicioUsuarios: UsuariosService) {}

  @Get()
  @Roles('administrador')
  obtenerTodos() {
    return this.servicioUsuarios.obtenerTodos();
  }

  @Get('roles')
  @Roles('administrador')
  obtenerRoles() {
    return this.servicioUsuarios.obtenerRoles();
  }

  @Get(':id')
  @Roles('administrador')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioUsuarios.obtenerUno(id);
  }

  @Post()
  @Roles('administrador')
  crear(@Body() dto: CreateUserDto) {
    return this.servicioUsuarios.crear(dto);
  }

  @Put(':id')
  @Roles('administrador')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.servicioUsuarios.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioUsuarios.eliminar(id);
  }
}

export { UsuariosController as UsersController };

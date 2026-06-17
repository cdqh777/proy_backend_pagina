import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RegistroAccesoService } from './access-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardiaRoles } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('access-logs')
@UseGuards(JwtAuthGuard, GuardiaRoles)
@Roles('administrador')
export class RegistroAccesoController {
  constructor(private readonly servicioRegistro: RegistroAccesoService) {}

  @Get()
  obtenerTodos(@Query('limit') limite?: number) {
    return this.servicioRegistro.obtenerTodos(limite ? +limite : 100);
  }
}

export { RegistroAccesoController as AccessLogController };

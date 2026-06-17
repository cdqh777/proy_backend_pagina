import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AgenteService } from './agente.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agente')
@UseGuards(JwtAuthGuard)
export class AgenteController {
  constructor(private readonly servicioAgente: AgenteService) {}

  @Post('consultar')
  consultar(@Body('pregunta') pregunta: string) {
    return this.servicioAgente.consultarAgente(pregunta);
  }

  @Get('contexto')
  obtenerContexto() {
    return this.servicioAgente.obtenerContextoTienda();
  }
}

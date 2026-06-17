import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private servicioAuth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async iniciarSesion(@Request() solicitud, @Body() _dto: LoginDto) {
    const ip = solicitud.ip || solicitud.connection?.remoteAddress || 'desconocida';
    const navegador = solicitud.headers['user-agent'] || 'desconocido';
    return this.servicioAuth.iniciarSesion(solicitud.user, ip, navegador);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async cerrarSesion(@Request() solicitud) {
    const ip = solicitud.ip || solicitud.connection?.remoteAddress || 'desconocida';
    const navegador = solicitud.headers['user-agent'] || 'desconocido';
    return this.servicioAuth.cerrarSesion(solicitud.user.idUsuario, ip, navegador);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  obtenerPerfil(@Request() solicitud) {
    return solicitud.user;
  }

  @Post('check-password')
  verificarContrasena(@Body('password') contrasena: string) {
    return { strength: this.servicioAuth.verificarFortalezaContrasena(contrasena) };
  }
}

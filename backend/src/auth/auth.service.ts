import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../users/users.service';
import { RegistroAcceso } from '../access-log/access-log.entity';

@Injectable()
export class AuthService {
  constructor(
    private servicioUsuarios: UsuariosService,
    private servicioJwt: JwtService,
    @InjectRepository(RegistroAcceso) private repoRegistroAcceso: Repository<RegistroAcceso>,
  ) {}

  async validarUsuario(correo: string, contrasena: string): Promise<any> {
    const usuario = await this.servicioUsuarios.buscarPorCorreo(correo);
    if (!usuario || !usuario.is_active) throw new UnauthorizedException('Credenciales inválidas');
    const esValida = await bcrypt.compare(contrasena, usuario.password);
    if (!esValida) throw new UnauthorizedException('Credenciales inválidas');
    const { password: _, ...resultado } = usuario;
    return resultado;
  }

  async iniciarSesion(usuario: any, ip: string, navegador: string) {
    const carga = { sub: usuario.id, email: usuario.email, role: usuario.role?.name };
    const registro = this.repoRegistroAcceso.create({ user_id: usuario.id, ip, event: 'login', browser: navegador });
    await this.repoRegistroAcceso.save(registro);
    return {
      access_token: this.servicioJwt.sign(carga),
      user: { id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role?.name },
    };
  }

  async cerrarSesion(idUsuario: number, ip: string, navegador: string) {
    const registro = this.repoRegistroAcceso.create({ user_id: idUsuario, ip, event: 'logout', browser: navegador });
    await this.repoRegistroAcceso.save(registro);
    return { message: 'Sesión cerrada' };
  }

  verificarFortalezaContrasena(contrasena: string): string {
    const tieneMayuscula  = /[A-Z]/.test(contrasena);
    const tieneMinuscula  = /[a-z]/.test(contrasena);
    const tieneNumero     = /[0-9]/.test(contrasena);
    const tieneEspecial   = /[^A-Za-z0-9]/.test(contrasena);
    const longitudSuficiente = contrasena.length >= 8;
    const puntaje = [tieneMayuscula, tieneMinuscula, tieneNumero, tieneEspecial, longitudSuficiente].filter(Boolean).length;
    if (puntaje <= 2) return 'débil';
    if (puntaje <= 4) return 'intermedia';
    return 'fuerte';
  }
}

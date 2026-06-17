import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class EstrategiaLocal extends PassportStrategy(Strategy) {
  constructor(private servicioAuth: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(correo: string, contrasena: string): Promise<any> {
    return this.servicioAuth.validarUsuario(correo, contrasena);
  }
}

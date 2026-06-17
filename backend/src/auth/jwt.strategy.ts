import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  constructor(servicioConfig: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: servicioConfig.get('JWT_SECRET', 'secreto'),
    });
  }

  async validate(carga: any) {
    return { idUsuario: carga.sub, correo: carga.email, role: carga.role };
  }
}

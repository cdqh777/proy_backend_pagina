import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLAVE_ROLES } from './roles.decorator';

@Injectable()
export class GuardiaRoles implements CanActivate {
  constructor(private reflector: Reflector) {}

  puedeActivar(contexto: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!rolesRequeridos) return true;
    const { user } = contexto.switchToHttp().getRequest();
    return rolesRequeridos.some((rol) => user?.role === rol);
  }

  canActivate(contexto: ExecutionContext): boolean {
    return this.puedeActivar(contexto);
  }
}

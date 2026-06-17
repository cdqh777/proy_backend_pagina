import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAcceso } from './access-log.entity';

@Injectable()
export class RegistroAccesoService {
  constructor(@InjectRepository(RegistroAcceso) private repoRegistro: Repository<RegistroAcceso>) {}

  async obtenerTodos(limite = 100): Promise<RegistroAcceso[]> {
    return this.repoRegistro.find({
      relations: ['user', 'user.role'],
      order: { created_at: 'DESC' },
      take: limite,
    });
  }
}

export { RegistroAccesoService as AccessLogService };

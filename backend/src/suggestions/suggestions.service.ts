import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sugerencia } from './suggestion.entity';
import { ListaComprasService } from '../purchase-list/purchase-list.service';

@Injectable()
export class SugerenciasService {
  constructor(
    @InjectRepository(Sugerencia) private repoSugerencia: Repository<Sugerencia>,
    @Inject(forwardRef(() => ListaComprasService)) private servicioListaCompras: ListaComprasService,
  ) {}

  obtenerTodas(): Promise<Sugerencia[]> {
    return this.repoSugerencia.find({
      where: { is_active: 1 },
      relations: ['user', 'articleType'],
      order: { request_count: 'DESC' },
    });
  }

  async obtenerUna(id: number): Promise<Sugerencia> {
    const sugerencia = await this.repoSugerencia.findOne({
      where: { id, is_active: 1 },
      relations: ['user', 'articleType'],
    });
    if (!sugerencia) throw new NotFoundException('Sugerencia no encontrada');
    return sugerencia;
  }

  async crear(datos: Partial<Sugerencia>): Promise<Sugerencia> {
    return this.repoSugerencia.save(this.repoSugerencia.create(datos));
  }

  async actualizarEstado(id: number, estado: string): Promise<Sugerencia> {
    const sugerencia = await this.obtenerUna(id);
    sugerencia.status = estado;
    const resultado = await this.repoSugerencia.save(sugerencia);
    if (estado === 'aprobado') {
      await this.agregarAListaSiAprobada(resultado);
    }
    return resultado;
  }

  private async agregarAListaSiAprobada(sugerencia: Sugerencia): Promise<void> {
    const existente = await this.servicioListaCompras.obtenerTodos();
    const yaExiste = existente.some((item) => item.suggestion_id === sugerencia.id && item.status === 'pendiente');
    if (yaExiste) return;
    await this.servicioListaCompras.crear({
      suggestion_id: sugerencia.id,
      quantity: 1,
      priority: 'media',
      notes: 'Sugerencia aprobada — generado automáticamente',
    });
  }

  async incrementarContador(id: number): Promise<Sugerencia> {
    const sugerencia = await this.obtenerUna(id);
    sugerencia.request_count += 1;
    return this.repoSugerencia.save(sugerencia);
  }

  async eliminar(id: number): Promise<void> {
    const sugerencia = await this.obtenerUna(id);
    sugerencia.is_active = 0;
    await this.repoSugerencia.save(sugerencia);
  }
}

export { SugerenciasService as SuggestionsService };

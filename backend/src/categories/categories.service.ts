import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoArticulo } from './article-type.entity';

@Injectable()
export class CategoriasService {
  constructor(@InjectRepository(TipoArticulo) private repoTipo: Repository<TipoArticulo>) {}

  obtenerTodos(): Promise<TipoArticulo[]> {
    return this.repoTipo.find({ order: { name: 'ASC' } });
  }

  async obtenerUno(id: number): Promise<TipoArticulo> {
    const tipo = await this.repoTipo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de artículo no encontrado');
    return tipo;
  }

  crear(datos: Partial<TipoArticulo>): Promise<TipoArticulo> {
    return this.repoTipo.save(this.repoTipo.create(datos));
  }

  async actualizar(id: number, datos: Partial<TipoArticulo>): Promise<TipoArticulo> {
    const tipo = await this.obtenerUno(id);
    Object.assign(tipo, datos);
    return this.repoTipo.save(tipo);
  }

  async eliminar(id: number): Promise<void> {
    const tipo = await this.obtenerUno(id);
    await this.repoTipo.remove(tipo);
  }
}

export { CategoriasService as CategoriesService };

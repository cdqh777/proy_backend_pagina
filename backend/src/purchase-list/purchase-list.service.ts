import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemListaCompras } from './purchase-list.entity';

@Injectable()
export class ListaComprasService {
  constructor(@InjectRepository(ItemListaCompras) private repoLista: Repository<ItemListaCompras>) {}

  obtenerTodos(): Promise<ItemListaCompras[]> {
    return this.repoLista.find({
      where: { is_active: 1 },
      relations: ['article', 'article.articleType', 'suggestion'],
      order: { priority: 'ASC', created_at: 'DESC' },
    });
  }

  async obtenerUno(id: number): Promise<ItemListaCompras> {
    const item = await this.repoLista.findOne({
      where: { id, is_active: 1 },
      relations: ['article', 'suggestion'],
    });
    if (!item) throw new NotFoundException('Item no encontrado');
    return item;
  }

  crear(datos: Partial<ItemListaCompras>): Promise<ItemListaCompras> {
    return this.repoLista.save(this.repoLista.create(datos));
  }

  async actualizar(id: number, datos: Partial<ItemListaCompras>): Promise<ItemListaCompras> {
    const item = await this.obtenerUno(id);
    Object.assign(item, datos);
    return this.repoLista.save(item);
  }

  async eliminar(id: number): Promise<void> {
    const item = await this.obtenerUno(id);
    item.is_active = 0;
    await this.repoLista.save(item);
  }

  async marcarComoComprado(id: number): Promise<ItemListaCompras> {
    return this.actualizar(id, { status: 'comprado' });
  }
}

export { ListaComprasService as PurchaseListService };

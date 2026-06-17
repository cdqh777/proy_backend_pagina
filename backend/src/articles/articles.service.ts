import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Articulo } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListaComprasService } from '../purchase-list/purchase-list.service';

@Injectable()
export class ArticulosService {
  constructor(
    @InjectRepository(Articulo) private repoArticulo: Repository<Articulo>,
    @Inject(forwardRef(() => ListaComprasService)) private servicioListaCompras: ListaComprasService,
  ) {}

  async obtenerTodos(filtros?: { nombre?: string; idTipo?: number; estado?: string }): Promise<Articulo[]> {
    const condicion: FindOptionsWhere<Articulo> = { is_active: 1 };
    if (filtros?.nombre) condicion.name = Like(`%${filtros.nombre}%`);
    if (filtros?.idTipo) condicion.article_type_id = filtros.idTipo;
    if (filtros?.estado) condicion.status = filtros.estado as any;
    return this.repoArticulo.find({ where: condicion, relations: ['articleType'], order: { name: 'ASC' } });
  }

  async obtenerUno(id: number): Promise<Articulo> {
    const articulo = await this.repoArticulo.findOne({ where: { id, is_active: 1 }, relations: ['articleType'] });
    if (!articulo) throw new NotFoundException('Artículo no encontrado');
    return articulo;
  }

  async crear(dto: CreateArticleDto): Promise<Articulo> {
    if (+dto.price < 0)  throw new BadRequestException('El precio no puede ser negativo');
    if (+dto.stock < 0)  throw new BadRequestException('El stock no puede ser negativo');
    const estadoInicial = +dto.stock > 0 ? 'nuevo' : 'agotado';
    const articulo = this.repoArticulo.create({ ...dto, status: estadoInicial, purchase_count: 0 });
    return this.repoArticulo.save(articulo);
  }

  async actualizar(id: number, dto: UpdateArticleDto): Promise<Articulo> {
    const articulo = await this.obtenerUno(id);
    if (dto.price !== undefined && +dto.price < 0) throw new BadRequestException('El precio no puede ser negativo');
    if (dto.stock !== undefined && +dto.stock < 0) throw new BadRequestException('El stock no puede ser negativo');
    Object.assign(articulo, dto);
    this.recalcularEstado(articulo);
    const resultado = await this.repoArticulo.save(articulo);
    await this.agregarAListaSiAgotado(resultado);
    return resultado;
  }

  async actualizarStock(id: number, cantidad: number): Promise<Articulo> {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a cero');
    const articulo = await this.obtenerUno(id);
    if (articulo.stock < cantidad) throw new BadRequestException(`Stock insuficiente. Disponible: ${articulo.stock}`);
    articulo.stock -= cantidad;
    articulo.purchase_count += cantidad;
    this.recalcularEstado(articulo);
    const resultado = await this.repoArticulo.save(articulo);
    await this.agregarAListaSiAgotado(resultado);
    return resultado;
  }

  async reabastecer(id: number, cantidad: number): Promise<Articulo> {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a cero');
    const articulo = await this.obtenerUno(id);
    articulo.stock += cantidad;
    this.recalcularEstado(articulo);
    return this.repoArticulo.save(articulo);
  }

  private recalcularEstado(articulo: Articulo): void {
    if (articulo.stock <= 0) {
      articulo.status = 'agotado';
    } else if (articulo.purchase_count < 3) {
      articulo.status = 'nuevo';
    } else {
      articulo.status = 'disponible';
    }
  }

  private async agregarAListaSiAgotado(articulo: Articulo): Promise<void> {
    if (articulo.status !== 'agotado') return;
    const existente = await this.servicioListaCompras.obtenerTodos();
    const yaExiste = existente.some((item) => item.article_id === articulo.id && item.status === 'pendiente');
    if (yaExiste) return;
    await this.servicioListaCompras.crear({
      article_id: articulo.id,
      quantity: articulo.min_stock || 5,
      priority: 'alta',
      notes: 'Agotado — generado automáticamente',
    });
  }

  async eliminar(id: number): Promise<void> {
    const articulo = await this.obtenerUno(id);
    articulo.is_active = 0;
    await this.repoArticulo.save(articulo);
  }

  async obtenerAgotados(): Promise<Articulo[]> {
    return this.repoArticulo.find({ where: { status: 'agotado', is_active: 1 }, relations: ['articleType'] });
  }

  async obtenerConStockBajo(): Promise<Articulo[]> {
    const todos = await this.repoArticulo.find({ where: { is_active: 1 }, relations: ['articleType'] });
    return todos.filter((a) => a.stock > 0 && a.stock <= a.min_stock);
  }

  async buscar(termino: string): Promise<{ encontrado: boolean; articulo?: Articulo; mensaje: string }> {
    if (!termino?.trim()) return { encontrado: false, mensaje: 'Ingresa un término de búsqueda' };
    const articulo = await this.repoArticulo.findOne({
      where: { name: Like(`%${termino}%`), is_active: 1 },
      relations: ['articleType'],
    });
    if (!articulo) return { encontrado: false, mensaje: `"${termino}" no existe en la base de datos` };
    if (articulo.status === 'agotado') return { encontrado: true, articulo, mensaje: `"${articulo.name}" existe pero está agotado` };
    return { encontrado: true, articulo, mensaje: `"${articulo.name}" está disponible — Stock: ${articulo.stock}` };
  }

  async sugerirPrecio(costo: number): Promise<{ sugerido: number; minimo: number; maximo: number; margen: string }> {
    if (costo <= 0) throw new BadRequestException('El costo debe ser mayor a cero');
    const margen = 0.35;
    const sugerido = +(costo * (1 + margen)).toFixed(2);
    return {
      sugerido,
      minimo: +(costo * 1.15).toFixed(2),
      maximo: +(costo * 1.60).toFixed(2),
      margen: '35%',
    };
  }

  async obtenerResumenEstadistico() {
    const todos = await this.repoArticulo.find({ where: { is_active: 1 }, relations: ['articleType'] });
    const porTipo: Record<string, number> = {};
    todos.forEach((a) => {
      const tipo = a.articleType?.name || 'Sin tipo';
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });
    return {
      total:      todos.length,
      nuevo:      todos.filter((a) => a.status === 'nuevo').length,
      disponible: todos.filter((a) => a.status === 'disponible').length,
      agotado:    todos.filter((a) => a.status === 'agotado').length,
      stockBajo:  todos.filter((a) => a.stock > 0 && a.stock <= a.min_stock).length,
      porTipo,
    };
  }
}

export { ArticulosService as ArticlesService };

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './sale.entity';
import { ArticulosService } from '../articles/articles.service';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta) private repoVenta: Repository<Venta>,
    private servicioArticulos: ArticulosService,
  ) {}

  async registrar(idArticulo: number, cantidad: number, idUsuario: number): Promise<Venta> {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a cero');
    const articulo = await this.servicioArticulos.obtenerUno(idArticulo);
    if (articulo.status === 'agotado' || articulo.stock < cantidad) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${articulo.stock}`);
    }
    const venta = this.repoVenta.create({
      article_id: idArticulo,
      user_id:    idUsuario,
      quantity:   cantidad,
      unit_price: articulo.price,
      total:      +(+articulo.price * cantidad).toFixed(2),
      status:     'activa',
    });
    await this.servicioArticulos.actualizarStock(idArticulo, cantidad);
    return this.repoVenta.save(venta);
  }

  async anular(idVenta: number): Promise<Venta> {
    const venta = await this.repoVenta.findOne({ where: { id: idVenta }, relations: ['article'] });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.status !== 'activa') throw new BadRequestException('Solo se pueden anular ventas activas');
    venta.status = 'anulada';
    await this.servicioArticulos.reabastecer(venta.article_id, venta.quantity);
    return this.repoVenta.save(venta);
  }

  async registrarDevolucion(idVenta: number): Promise<Venta> {
    const venta = await this.repoVenta.findOne({ where: { id: idVenta }, relations: ['article'] });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.status !== 'activa') throw new BadRequestException('Solo se pueden devolver ventas activas');
    venta.status = 'devuelta';
    await this.servicioArticulos.reabastecer(venta.article_id, venta.quantity);
    return this.repoVenta.save(venta);
  }

  async registrarReclamo(idVenta: number, motivo: string): Promise<Venta> {
    const venta = await this.repoVenta.findOne({ where: { id: idVenta } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (!motivo?.trim()) throw new BadRequestException('El motivo del reclamo es requerido');
    venta.motivo_reclamo = motivo;
    return this.repoVenta.save(venta);
  }

  async obtenerTodas(fechaInicio?: string, fechaFin?: string): Promise<Venta[]> {
    const qb = this.repoVenta.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.article',            'articulo')
      .leftJoinAndSelect('articulo.articleType',     'tipo')
      .leftJoinAndSelect('venta.user',               'usuario')
      .orderBy('venta.sale_date', 'DESC');
    if (fechaInicio) qb.andWhere('venta.sale_date >= :fechaInicio', { fechaInicio });
    if (fechaFin)    qb.andWhere('venta.sale_date <= :fechaFin',    { fechaFin: fechaFin + ' 23:59:59' });
    return qb.getMany();
  }

  async obtenerMasVendidos(limite = 10, fechaInicio?: string, fechaFin?: string) {
    const qb = this.repoVenta.createQueryBuilder('venta')
      .select('articulo.id',   'idArticulo')
      .addSelect('articulo.name',  'nombre')
      .addSelect('tipo.name',      'nombreTipo')
      .addSelect('SUM(venta.quantity)', 'cantidadTotal')
      .addSelect('SUM(venta.total)',    'ingresoTotal')
      .leftJoin('venta.article',        'articulo')
      .leftJoin('articulo.articleType', 'tipo')
      .where('venta.status = :estado', { estado: 'activa' })
      .groupBy('articulo.id')
      .orderBy('SUM(venta.quantity)', 'DESC')
      .limit(limite);
    if (fechaInicio) qb.andWhere('venta.sale_date >= :fechaInicio', { fechaInicio });
    if (fechaFin)    qb.andWhere('venta.sale_date <= :fechaFin',    { fechaFin: fechaFin + ' 23:59:59' });
    return qb.getRawMany();
  }

  async obtenerVentasPorPeriodo(fechaInicio?: string, fechaFin?: string) {
    const qb = this.repoVenta.createQueryBuilder('venta')
      .select('DATE(venta.sale_date)', 'fecha')
      .addSelect('SUM(venta.total)',   'total')
      .addSelect('COUNT(venta.id)',    'cantidad')
      .where('venta.status = :estado', { estado: 'activa' })
      .groupBy('DATE(venta.sale_date)')
      .orderBy('DATE(venta.sale_date)', 'ASC');
    if (fechaInicio) qb.andWhere('venta.sale_date >= :fechaInicio', { fechaInicio });
    if (fechaFin)    qb.andWhere('venta.sale_date <= :fechaFin',    { fechaFin: fechaFin + ' 23:59:59' });
    return qb.getRawMany();
  }

  async obtenerResumenVentas() {
    const resultado = await this.repoVenta.createQueryBuilder('venta')
      .select('COUNT(venta.id)',    'totalVentas')
      .addSelect('SUM(venta.total)', 'ingresoTotal')
      .addSelect('SUM(venta.quantity)', 'unidadesVendidas')
      .where('venta.status = :estado', { estado: 'activa' })
      .getRawOne();
    return {
      totalVentas:      +resultado.totalVentas || 0,
      ingresoTotal:     +resultado.ingresoTotal || 0,
      unidadesVendidas: +resultado.unidadesVendidas || 0,
    };
  }
}

export { VentasService as SalesService };

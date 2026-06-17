import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../sales/sale.entity';
import { Articulo } from '../articles/article.entity';

@Injectable()
export class ReportesService {
  async obtenerDatosVentas(fechaInicio?: string, fechaFin?: string) {
    const constructor = this.repoVenta.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.article', 'articulo')
      .leftJoinAndSelect('articulo.articleType', 'tipo')
      .leftJoinAndSelect('venta.user', 'usuario')
      .orderBy('venta.sale_date', 'DESC');
    if (fechaInicio) constructor.andWhere('venta.sale_date >= :fechaInicio', { fechaInicio });
    if (fechaFin)    constructor.andWhere('venta.sale_date <= :fechaFin', { fechaFin: fechaFin + ' 23:59:59' });
    return constructor.getMany();
  }

  constructor(
    @InjectRepository(Venta) private repoVenta: Repository<Venta>,
    @InjectRepository(Articulo) private repoArticulo: Repository<Articulo>,
  ) {}

  async generarReporteVentasPdf(fechaInicio?: string, fechaFin?: string): Promise<Buffer> {
    const ventas = await this.obtenerDatosVentas(fechaInicio, fechaFin);
    const ingresoTotal  = ventas.reduce((suma, v) => suma + +v.total, 0);
    const articulosTotal = ventas.reduce((suma, v) => suma + v.quantity, 0);

    const mapaTop: Record<string, { nombre: string; cantidad: number; ingreso: number }> = {};
    ventas.forEach((v) => {
      const clave = v.article?.id?.toString() || 'desconocido';
      if (!mapaTop[clave]) mapaTop[clave] = { nombre: v.article?.name || 'N/A', cantidad: 0, ingreso: 0 };
      mapaTop[clave].cantidad += v.quantity;
      mapaTop[clave].ingreso  += +v.total;
    });
    const top5 = Object.values(mapaTop).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    const etiquetaFecha = fechaInicio && fechaFin
      ? `Del ${fechaInicio} al ${fechaFin}`
      : fechaInicio ? `Desde ${fechaInicio}`
      : fechaFin   ? `Hasta ${fechaFin}`
      : 'Todos los registros';

    const definicionDoc: any = {
      defaultStyle: {
        font: 'Helvetica',
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 60, r: 4, color: '#4A413C' }] },
        { text: 'LIBRERÍA — REPORTE DE VENTAS', fontSize: 18, bold: true, color: '#FFFFFF', absolutePosition: { x: 55, y: 78 } },
        { text: etiquetaFecha, fontSize: 10, color: '#CCB499', absolutePosition: { x: 55, y: 102 } },
        { text: '', margin: [0, 50, 0, 0] },
        {
          columns: [
            this.cajaEstadistica('Ingresos Totales', `$${ingresoTotal.toFixed(2)}`),
            this.cajaEstadistica('Ventas Registradas', `${ventas.length}`),
            this.cajaEstadistica('Artículos Vendidos', `${articulosTotal}`),
          ],
          columnGap: 12,
          margin: [0, 10, 0, 20],
        },
        { text: 'Top 5 Artículos Más Vendidos', style: 'encabezadoSeccion' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 100],
            body: [
              [
                { text: 'Artículo', style: 'encabezadoTabla' },
                { text: 'Cantidad', style: 'encabezadoTabla' },
                { text: 'Ingresos', style: 'encabezadoTabla' },
              ],
              ...top5.map((item) => [
                item.nombre,
                { text: item.cantidad.toString(), alignment: 'center' },
                { text: `$${item.ingreso.toFixed(2)}`, alignment: 'right' },
              ]),
            ],
          },
          layout: {
            fillColor: (fila: number) => fila === 0 ? '#4A413C' : fila % 2 === 0 ? '#EBEFEE' : null,
            hLineColor: () => '#CCB499',
            vLineColor: () => '#CCB499',
          },
          margin: [0, 0, 0, 20],
        },
        { text: 'Detalle de Ventas', style: 'encabezadoSeccion' },
        {
          table: {
            headerRows: 1,
            widths: [70, '*', 60, 60, 70, 70],
            body: [
              [
                { text: 'Fecha',    style: 'encabezadoTabla' },
                { text: 'Artículo', style: 'encabezadoTabla' },
                { text: 'Tipo',     style: 'encabezadoTabla' },
                { text: 'Cant.',    style: 'encabezadoTabla' },
                { text: 'P. Unit.', style: 'encabezadoTabla' },
                { text: 'Total',    style: 'encabezadoTabla' },
              ],
              ...ventas.map((v) => [
                { text: new Date(v.sale_date).toLocaleDateString('es-ES'), fontSize: 8 },
                { text: v.article?.name || 'N/A', fontSize: 8 },
                { text: v.article?.articleType?.name || 'N/A', fontSize: 8 },
                { text: v.quantity.toString(), alignment: 'center', fontSize: 8 },
                { text: `$${(+v.unit_price).toFixed(2)}`, alignment: 'right', fontSize: 8 },
                { text: `$${(+v.total).toFixed(2)}`, alignment: 'right', fontSize: 8 },
              ]),
              [
                { text: 'TOTAL', bold: true, colSpan: 5, alignment: 'right' },
                {}, {}, {}, {},
                { text: `$${ingresoTotal.toFixed(2)}`, bold: true, alignment: 'right', fontSize: 9 },
              ],
            ],
          },
          layout: {
            fillColor: (fila: number) => fila === 0 ? '#4A413C' : fila % 2 === 0 ? '#EBEFEE' : null,
            hLineColor: () => '#CCB499',
            vLineColor: () => '#CCB499',
          },
        },
      ],
      styles: {
        encabezadoSeccion: {
          fontSize: 13, bold: true, color: '#4A413C',
          margin: [0, 0, 0, 8], decoration: 'underline', decorationColor: '#BB6C43',
        },
        encabezadoTabla: {
          bold: true, color: '#FFFFFF', fontSize: 9, fillColor: '#4A413C',
        },
      },
      footer: (paginaActual: number, totalPaginas: number) => ({
        text: `Página ${paginaActual} de ${totalPaginas}  —  Generado el ${new Date().toLocaleString('es-ES')}`,
        alignment: 'center', fontSize: 8, color: '#888', margin: [0, 10, 0, 0],
      }),
    };

    return new Promise((resolver, rechazar) => {
      try {
        const PdfPrinter = require('pdfmake');
        const fonts = {
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
          },
        };
        const impresora = new PdfPrinter(fonts);
        const documentoPdf = impresora.createPdfKitDocument(definicionDoc);
        const fragmentos: Buffer[] = [];
        documentoPdf.on('data', (fragmento: Buffer) => fragmentos.push(fragmento));
        documentoPdf.on('end', () => resolver(Buffer.concat(fragmentos)));
        documentoPdf.on('error', rechazar);
        documentoPdf.end();
      } catch (error) {
        rechazar(error);
      }
    });
  }

  private cajaEstadistica(etiqueta: string, valor: string) {
    return {
      stack: [
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 160, h: 55, r: 4, color: '#EBEFEE' }] },
        { text: valor, fontSize: 18, bold: true, color: '#BB6C43', margin: [8, 8, 0, 0] },
        { text: etiqueta, fontSize: 9, color: '#4A413C', margin: [8, 30, 0, 0] },
      ],
    };
  }

  async obtenerEstadisticasInventario() {
    const total      = await this.repoArticulo.count({ where: { is_active: 1 } });
    const nuevo      = await this.repoArticulo.count({ where: { status: 'nuevo', is_active: 1 } });
    const disponible = await this.repoArticulo.count({ where: { status: 'disponible', is_active: 1 } });
    const agotado    = await this.repoArticulo.count({ where: { status: 'agotado', is_active: 1 } });
    return { total, nuevo, disponible, agotado };
  }
}

export { ReportesService as ReportsService };

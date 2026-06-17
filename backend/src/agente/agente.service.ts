import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo } from '../articles/article.entity';
import { Venta } from '../sales/sale.entity';
import { Sugerencia } from '../suggestions/suggestion.entity';

@Injectable()
export class AgenteService {
  constructor(
    @InjectRepository(Articulo)   private repoArticulo: Repository<Articulo>,
    @InjectRepository(Venta)      private repoVenta: Repository<Venta>,
    @InjectRepository(Sugerencia) private repoSugerencia: Repository<Sugerencia>,
  ) {}

  async obtenerContextoTienda() {
    const articulos  = await this.repoArticulo.find({ where: { is_active: 1 }, relations: ['articleType'] });
    const agotados   = articulos.filter((a) => a.status === 'agotado');
    const bajoStock  = articulos.filter((a) => a.stock > 0 && a.stock <= a.min_stock);
    const sugerencias = await this.repoSugerencia.find({ where: { is_active: 1, status: 'pendiente' } });

    const topVentas = await this.repoVenta
      .createQueryBuilder('v')
      .select('art.name', 'nombre')
      .addSelect('SUM(v.quantity)', 'totalVendido')
      .addSelect('SUM(v.total)', 'totalIngreso')
      .leftJoin('v.article', 'art')
      .groupBy('art.id')
      .orderBy('SUM(v.quantity)', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      resumenInventario: {
        totalArticulos: articulos.length,
        agotados: agotados.length,
        bajoStock: bajoStock.length,
        articulosAgotados: agotados.map((a) => a.name),
        articulosBajoStock: bajoStock.map((a) => `${a.name} (stock: ${a.stock}, mín: ${a.min_stock})`),
      },
      topVentas: topVentas.map((v) => ({ nombre: v.nombre, vendidos: +v.totalVendido, ingresos: +v.totalIngreso })),
      sugerenciasPendientes: sugerencias.length,
    };
  }

  async consultarAgente(pregunta: string): Promise<{ respuesta: string; tipo: string }> {
    const preguntaMin = pregunta.toLowerCase().trim();
    const contexto = await this.obtenerContextoTienda();

    if (preguntaMin.includes('agotado') || preguntaMin.includes('sin stock')) {
      if (contexto.resumenInventario.agotados === 0) {
        return { respuesta: '✅ ¡Excelente! No hay artículos agotados en este momento. Todo el inventario tiene stock disponible.', tipo: 'exito' };
      }
      const lista = contexto.resumenInventario.articulosAgotados.slice(0, 8).join(', ');
      return { respuesta: `⚠️ Hay ${contexto.resumenInventario.agotados} artículo(s) agotado(s): ${lista}. Te recomiendo agregarlos a la lista de compras con prioridad alta.`, tipo: 'alerta' };
    }

    if (preguntaMin.includes('más vendido') || preguntaMin.includes('mejor vendido') || preguntaMin.includes('top')) {
      if (contexto.topVentas.length === 0) return { respuesta: '📊 Aún no hay suficientes datos de ventas para calcular los más vendidos.', tipo: 'info' };
      const top = contexto.topVentas.map((v, i) => `${i + 1}. ${v.nombre} (${v.vendidos} unidades — $${v.ingresos.toFixed(2)})`).join('\n');
      return { respuesta: `📊 Los artículos más vendidos son:\n${top}`, tipo: 'info' };
    }

    if (preguntaMin.includes('stock bajo') || preguntaMin.includes('poco stock') || preguntaMin.includes('rebastecer') || preguntaMin.includes('reabastecer')) {
      if (contexto.resumenInventario.bajoStock === 0) return { respuesta: '✅ Todos los artículos están por encima de su stock mínimo. No necesitas reabastecer nada por ahora.', tipo: 'exito' };
      const lista = contexto.resumenInventario.articulosBajoStock.slice(0, 6).join('\n• ');
      return { respuesta: `⚡ ${contexto.resumenInventario.bajoStock} artículo(s) están bajo su stock mínimo:\n• ${lista}\n\nSugerencia: agrégalos a la lista de compras antes de que se agoten.`, tipo: 'advertencia' };
    }

    if (preguntaMin.includes('sugerencia') || preguntaMin.includes('cliente')) {
      if (contexto.sugerenciasPendientes === 0) return { respuesta: '📋 No hay sugerencias pendientes de clientes en este momento.', tipo: 'info' };
      return { respuesta: `💡 Hay ${contexto.sugerenciasPendientes} sugerencia(s) de clientes pendientes de revisión. Te recomiendo revisarlas en la sección de Sugerencias para evaluar cuáles agregar al inventario según la demanda.`, tipo: 'info' };
    }

    if (preguntaMin.includes('resumen') || preguntaMin.includes('estado') || preguntaMin.includes('inventario') || preguntaMin.includes('cómo está')) {
      const { totalArticulos, agotados, bajoStock } = contexto.resumenInventario;
      let valoracion = agotados > 5 ? '⚠️ Estado crítico' : agotados > 0 ? '🟡 Estado regular' : '✅ Estado saludable';
      return {
        respuesta: `${valoracion}\n\n📦 Total artículos: ${totalArticulos}\n❌ Agotados: ${agotados}\n⚡ Bajo stock mínimo: ${bajoStock}\n📋 Sugerencias pendientes: ${contexto.sugerenciasPendientes}${agotados > 0 ? '\n\n🔔 Recomendación: revisa la lista de artículos agotados y programa una compra.': ''}`,
        tipo: agotados > 5 ? 'alerta' : agotados > 0 ? 'advertencia' : 'exito',
      };
    }

    if (preguntaMin.includes('precio') || preguntaMin.includes('rentable') || preguntaMin.includes('margen')) {
      return { respuesta: '💰 Para calcular un precio rentable, usa el botón "Sugerir precio" al crear o editar un artículo. El sistema aplica un margen del 35% sobre el costo, con un rango de 15% a 60% según el mercado.', tipo: 'info' };
    }

    if (preguntaMin.includes('comprar') || preguntaMin.includes('lista de compras') || preguntaMin.includes('pedir')) {
      const urgentes = contexto.resumenInventario.agotados + contexto.resumenInventario.bajoStock;
      return { respuesta: `🛒 Actualmente tienes ${urgentes} artículo(s) que necesitan reabastecerse (${contexto.resumenInventario.agotados} agotados + ${contexto.resumenInventario.bajoStock} bajo stock mínimo). Puedes agregarlos directamente desde la sección "Lista de compras" con prioridad alta para los agotados y media para los de stock bajo.`, tipo: 'info' };
    }

    return {
      respuesta: `🤖 Soy el asistente de inventario. Puedo ayudarte con:\n\n• "¿Qué artículos están agotados?"\n• "¿Cuáles son los más vendidos?"\n• "¿Hay artículos con stock bajo?"\n• "¿Cómo está el inventario?"\n• "¿Qué sugerencias hay de clientes?"\n• "¿Qué debo comprar?"\n• "¿Cómo fijar un precio rentable?"`,
      tipo: 'info',
    };
  }
}

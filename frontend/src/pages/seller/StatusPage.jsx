import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaginaEstadoInventario() {
  const [articulos, setArticulos]       = useState([]);
  const [masVendidos, setMasVendidos]   = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [fechaInicio, setFechaInicio]   = useState('');
  const [fechaFin, setFechaFin]         = useState('');

  const COLORES = ['#BB6C43','#C8906D','#CCB499','#4A413C','#27ae60','#1565c0','#c62828','#e67e22','#8e44ad','#16a085'];

  const cargar = async () => {
    setCargando(true);
    try {
      const parametros = new URLSearchParams();
      if (fechaInicio) parametros.append('startDate', fechaInicio);
      if (fechaFin)    parametros.append('endDate', fechaFin);
      const [resArticulos, resMasVendidos] = await Promise.all([
        api.get('/articles'),
        api.get('/sales/top-selling?limit=10&' + parametros),
      ]);
      setArticulos(resArticulos.data);
      setMasVendidos(resMasVendidos.data.map((d) => ({
        nombre:   d.nombre?.substring(0, 20) || d.name?.substring(0, 20) || 'N/A',
        cantidad: +d.cantidadTotal || +d.totalQuantity || 0,
        ingreso:  +d.ingresoTotal  || +d.totalRevenue  || 0,
      })));
    } catch { toast.error('Error al cargar datos'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [fechaInicio, fechaFin]);

  const agotados  = articulos.filter((a) => a.status === 'agotado');
  const nuevos    = articulos.filter((a) => a.status === 'nuevo');
  const bajoStock = articulos.filter((a) => a.stock > 0 && a.stock <= a.min_stock);

  return (
    <div>
      <h1 className="page-title">Estado del inventario</h1>
      <p className="page-subtitle">Monitoreo de artículos agotados, nuevos y tendencias</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <span className="stat-label">Agotados</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{agotados.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span className="stat-label">Bajo stock</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{bajoStock.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={16} color="#27ae60" />
            <span className="stat-label">Nuevos</span>
          </div>
          <div className="stat-value" style={{ color: '#27ae60' }}>{nuevos.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckCircle size={16} color="var(--brown)" />
            <span className="stat-label">Total artículos</span>
          </div>
          <div className="stat-value">{articulos.length}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>
            <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Top artículos más vendidos
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
              style={{ padding: '6px 10px', border: '1.5px solid var(--sand)', borderRadius: 'var(--radius-sm)', fontSize: 13 }} />
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
              style={{ padding: '6px 10px', border: '1.5px solid var(--sand)', borderRadius: 'var(--radius-sm)', fontSize: 13 }} />
          </div>
        </div>
        {cargando ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
        ) : masVendidos.length === 0 ? (
          <div className="empty-state"><p>Sin datos de ventas</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={masVendidos} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'cantidad' ? `${v} unid.` : `$${v.toFixed(2)}`, n === 'cantidad' ? 'Vendidos' : 'Ingresos']} />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                {masVendidos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {agotados.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>⚠ Artículos agotados</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Artículo</th><th>Tipo</th><th>Stock mínimo</th><th>Estado</th></tr></thead>
              <tbody>
                {agotados.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>{a.articleType?.name}</td>
                    <td>{a.min_stock}</td>
                    <td><span className="badge badge-agotado">Agotado</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bajoStock.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--warning)', marginBottom: 12 }}>⚡ Stock bajo (por debajo del mínimo)</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Artículo</th><th>Tipo</th><th>Stock actual</th><th>Stock mínimo</th></tr></thead>
              <tbody>
                {bajoStock.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>{a.articleType?.name}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 700 }}>{a.stock}</td>
                    <td>{a.min_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {nuevos.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#27ae60', marginBottom: 12 }}>✨ Artículos nuevos</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Artículo</th><th>Tipo</th><th>Precio</th><th>Stock</th></tr></thead>
              <tbody>
                {nuevos.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>{a.articleType?.name}</td>
                    <td>${(+a.price).toFixed(2)}</td>
                    <td>{a.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

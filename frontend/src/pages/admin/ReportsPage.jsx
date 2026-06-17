import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import { FileDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaginaReportes() {
  const [masVendidos, setMasVendidos]   = useState([]);
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [descargando, setDescargando]   = useState(false);
  const [fechaInicio, setFechaInicio]   = useState('');
  const [fechaFin, setFechaFin]         = useState('');

  const COLORES = ['#BB6C43','#C8906D','#CCB499','#4A413C','#27ae60','#1565c0','#c62828','#e67e22','#8e44ad','#16a085'];

  const cargar = async () => {
    setCargando(true);
    try {
      const parametros = new URLSearchParams();
      if (fechaInicio) parametros.append('startDate', fechaInicio);
      if (fechaFin)    parametros.append('endDate', fechaFin);
      const [resMasVendidos, resPeriodo] = await Promise.all([
        api.get('/sales/top-selling?limit=10&' + parametros),
        api.get('/sales/by-period?' + parametros),
      ]);
      setMasVendidos(resMasVendidos.data.map((d) => ({
        nombre:   d.nombre?.substring(0, 18) || d.name?.substring(0, 18) || 'N/A',
        cantidad: +d.cantidadTotal || +d.totalQuantity || 0,
        ingreso:  +d.ingresoTotal  || +d.totalRevenue  || 0,
      })));
      setVentasPeriodo(resPeriodo.data.map((d) => ({
        fecha:    new Date(d.fecha || d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        total:    +d.total,
        cantidad: +d.cantidad || +d.count || 0,
      })));
    } catch { toast.error('Error al cargar reportes'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [fechaInicio, fechaFin]);

  const descargarPdf = async () => {
    setDescargando(true);
    try {
      const parametros = new URLSearchParams();
      if (fechaInicio) parametros.append('startDate', fechaInicio);
      if (fechaFin)    parametros.append('endDate', fechaFin);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`/api/reports/sales/pdf?${parametros}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!respuesta.ok) throw new Error('Error al generar PDF');
      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `reporte-ventas-${Date.now()}.pdf`;
      enlace.click();
      URL.revokeObjectURL(url);
      toast.success('Reporte descargado');
    } catch { toast.error('Error al descargar el reporte'); }
    finally { setDescargando(false); }
  };

  const ingresoTotal   = ventasPeriodo.reduce((s, d) => s + d.total, 0);
  const ventasTotal    = ventasPeriodo.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Análisis de ventas y tendencias</p>
        </div>
        <button className="btn btn-primary" onClick={descargarPdf} disabled={descargando}>
          <FileDown size={16} /> {descargando ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Desde</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid var(--sand)', borderRadius: 'var(--radius-sm)', fontSize: 14 }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Hasta</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid var(--sand)', borderRadius: 'var(--radius-sm)', fontSize: 14 }} />
        </div>
        <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-end' }} onClick={cargar}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <div className="stat-label">Ingresos totales</div>
          <div className="stat-value" style={{ color: '#27ae60', fontSize: 22 }}>${ingresoTotal.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ventas registradas</div>
          <div className="stat-value">{ventasTotal}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--brown)' }}>
          <div className="stat-label">Artículos distintos</div>
          <div className="stat-value" style={{ color: 'var(--brown)' }}>{masVendidos.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Top 10 más vendidos (unidades)</h3>
          {cargando ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
          ) : masVendidos.length === 0 ? (
            <div className="empty-state"><p>Sin datos</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masVendidos} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`${v} unid.`, 'Vendidos']} />
                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                  {masVendidos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Top 10 más vendidos (ingresos)</h3>
          {cargando ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
          ) : masVendidos.length === 0 ? (
            <div className="empty-state"><p>Sin datos</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masVendidos} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`$${(+v).toFixed(2)}`, 'Ingresos']} />
                <Bar dataKey="ingreso" radius={[0, 4, 4, 0]}>
                  {masVendidos.map((_, i) => <Cell key={i} fill={COLORES[(i + 3) % COLORES.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Tendencia de ingresos diarios</h3>
        {cargando ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
        ) : ventasPeriodo.length === 0 ? (
          <div className="empty-state"><p>Sin datos en el período</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ventasPeriodo} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe6" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v, n) => [n === 'total' ? `$${(+v).toFixed(2)}` : v, n === 'total' ? 'Ingresos' : 'Ventas']} />
              <Line type="monotone" dataKey="total"    stroke="#BB6C43" strokeWidth={2.5} dot={{ r: 4, fill: '#BB6C43' }} />
              <Line type="monotone" dataKey="cantidad" stroke="#CCB499" strokeWidth={2}   dot={{ r: 3, fill: '#CCB499' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

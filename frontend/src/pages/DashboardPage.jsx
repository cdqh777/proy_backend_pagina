import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import AsistenteIA from '../components/AsistenteIA';

const COLORES = ['#27ae60','#1565c0','#c62828','#BB6C43'];

export default function PaginaDashboard() {
  const { usuario, esAdmin } = useAuth();
  const [estadisticas, setEstadisticas]   = useState({ total:0, nuevo:0, disponible:0, agotado:0, stockBajo:0 });
  const [masVendidos, setMasVendidos]     = useState([]);
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [resumenVentas, setResumenVentas] = useState({ totalVentas:0, ingresoTotal:0, unidadesVendidas:0 });
  const [cargando, setCargando]           = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/articles/stats'),
      api.get('/sales/top-selling?limit=6'),
      api.get('/sales/by-period'),
      api.get('/sales/summary'),
    ]).then(([resStats, resTop, resPeriodo, resResumen]) => {
      setEstadisticas(resStats.data);
      setMasVendidos(resTop.data.map((d) => ({
        nombre:   (d.nombre || d.name || 'N/A').substring(0, 16),
        cantidad: +d.cantidadTotal || +d.totalQuantity || 0,
      })));
      setVentasPeriodo(resPeriodo.data.map((d) => ({
        fecha: new Date(d.fecha || d.date).toLocaleDateString('es-ES', { day:'2-digit', month:'short' }),
        total: +d.total,
      })));
      setResumenVentas(resResumen.data);
    }).catch(() => {}).finally(() => setCargando(false));
  }, []);

  const datosTorta = [
    { name:'Nuevos',      value: estadisticas.nuevo },
    { name:'Disponibles', value: estadisticas.disponible },
    { name:'Agotados',    value: estadisticas.agotado },
  ];

  if (cargando) return <div style={estilosCargando}>Cargando dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Bienvenido, <strong>{usuario?.name}</strong> · Rol: {usuario?.role}</p>

      {estadisticas.agotado > 0 && (
        <div style={alertaBanner}>
          <AlertTriangle size={18} />
          <span>Hay <strong>{estadisticas.agotado}</strong> artículo(s) agotado(s) y <strong>{estadisticas.stockBajo}</strong> con stock bajo. Revisa la lista de compras.</span>
        </div>
      )}

      <div style={cuadricula3}>
        <TarjetaStat icono={<DollarSign size={20}/>}  etiqueta="Ingresos totales"    valor={`$${(+resumenVentas.ingresoTotal).toFixed(2)}`}   color="#27ae60" />
        <TarjetaStat icono={<ShoppingCart size={20}/>} etiqueta="Ventas registradas" valor={resumenVentas.totalVentas}   color="#1565c0" />
        <TarjetaStat icono={<Activity size={20}/>}     etiqueta="Unidades vendidas"  valor={resumenVentas.unidadesVendidas} color="#BB6C43" />
      </div>

      <div style={cuadricula4}>
        <TarjetaStat icono={<Package size={18}/>}       etiqueta="Total artículos" valor={estadisticas.total}      color="#4A413C" pequeña />
        <TarjetaStat icono={<TrendingUp size={18}/>}    etiqueta="Nuevos"          valor={estadisticas.nuevo}      color="#27ae60" pequeña />
        <TarjetaStat icono={<ShoppingCart size={18}/>}  etiqueta="Disponibles"     valor={estadisticas.disponible} color="#1565c0" pequeña />
        <TarjetaStat icono={<AlertTriangle size={18}/>} etiqueta="Agotados"        valor={estadisticas.agotado}    color="#c62828" pequeña />
      </div>

      <div style={cuadricula2}>
        <div className="card">
          <h3 style={tituloGrafico}>Top artículos más vendidos</h3>
          {masVendidos.length === 0 ? <EstadoVacio texto="Sin ventas registradas" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={masVendidos} margin={{ top:5, right:10, left:-10, bottom:50 }}>
                <XAxis dataKey="nombre" tick={{ fontSize:10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize:11 }} />
                <Tooltip formatter={(v) => [`${v} unid.`, 'Vendidos']} />
                <Bar dataKey="cantidad" fill="#BB6C43" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 style={tituloGrafico}>Estado del inventario</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={datosTorta} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false} fontSize={12}>
                {datosTorta.map((_, i) => <Cell key={i} fill={COLORES[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop:20, marginBottom:20 }}>
        <h3 style={tituloGrafico}>Tendencia de ingresos diarios</h3>
        {ventasPeriodo.length === 0 ? <EstadoVacio texto="Sin datos de ventas" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ventasPeriodo} margin={{ top:5, right:20, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe6" />
              <XAxis dataKey="fecha" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${(+v).toFixed(2)}`, 'Ingresos']} />
              <Line type="monotone" dataKey="total" stroke="#BB6C43" strokeWidth={2.5} dot={{ r:3, fill:'#BB6C43' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <AsistenteIA />
    </div>
  );
}

function TarjetaStat({ icono, etiqueta, valor, color, pequeña }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <span style={{ color }}>{icono}</span>
        <span className="stat-label" style={{ fontSize: pequeña ? 12 : 13 }}>{etiqueta}</span>
      </div>
      <div className="stat-value" style={{ color, fontSize: pequeña ? 22 : 28 }}>{valor}</div>
    </div>
  );
}

function EstadoVacio({ texto }) {
  return <div className="empty-state" style={{ padding:20 }}><p>{texto}</p></div>;
}

const estilosCargando = { padding:40, textAlign:'center', color:'var(--tan)', fontSize:15 };
const alertaBanner = { background:'#fce4ec', border:'1px solid #f48fb1', borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'#c62828', fontSize:14 };
const cuadricula3  = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:16 };
const cuadricula4  = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 };
const cuadricula2  = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 };
const tituloGrafico = { fontSize:15, fontWeight:600, color:'var(--espresso)', marginBottom:12 };

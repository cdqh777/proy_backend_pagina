import { useEffect, useState } from 'react';
import api from '../../services/api';
import { LogIn, LogOut, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaginaRegistroAccesos() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando]   = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const respuesta = await api.get('/access-logs?limit=200');
      setRegistros(respuesta.data);
    } catch { toast.error('Error al cargar registros'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const cantidadIngresos  = registros.filter((r) => r.event === 'login').length;
  const cantidadSalidas   = registros.filter((r) => r.event === 'logout').length;
  const usuariosUnicos    = new Set(registros.map((r) => r.user_id)).size;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Registro de accesos</h1>
          <p className="page-subtitle">Historial de entradas y salidas al sistema</p>
        </div>
        <button className="btn btn-outline" onClick={cargar}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <div className="stat-label">Ingresos</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>{cantidadIngresos}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--tan)' }}>
          <div className="stat-label">Salidas</div>
          <div className="stat-value" style={{ color: 'var(--tan)' }}>{cantidadSalidas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Usuarios distintos</div>
          <div className="stat-value">{usuariosUnicos}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--sand)' }}>
          <div className="stat-label">Total eventos</div>
          <div className="stat-value" style={{ color: 'var(--sand)' }}>{registros.length}</div>
        </div>
      </div>

      <div className="card table-wrapper">
        {cargando ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
        ) : registros.length === 0 ? (
          <div className="empty-state"><p>No hay registros de acceso</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Evento</th><th>Usuario</th><th>Rol</th>
                <th>IP</th><th>Navegador</th><th>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: registro.event === 'login' ? '#e8f5e9' : '#fce4ec', color: registro.event === 'login' ? '#2e7d32' : '#c62828' }}>
                      {registro.event === 'login' ? <LogIn size={12} /> : <LogOut size={12} />}
                      {registro.event === 'login' ? 'Ingreso' : 'Salida'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{registro.user?.name || '—'}</td>
                  <td style={{ fontSize: 13 }}>{registro.user?.role?.name || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--tan)' }}>{registro.ip || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--tan)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {registro.browser ? registro.browser.substring(0, 60) : '—'}
                  </td>
                  <td style={{ fontSize: 13, whiteSpace: 'nowrap', color: 'var(--tan)' }}>
                    {new Date(registro.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

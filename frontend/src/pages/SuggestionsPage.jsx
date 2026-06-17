import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, X, Check, ThumbsDown, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaginaSugerencias() {
  const { esAdmin } = useAuth();
  const [sugerencias, setSugerencias]   = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario]     = useState({ nombreArticulo: '', idTipo: '', descripcion: '' });
  const [erroresForm, setErroresForm]   = useState({});

  const cargar = async () => {
    setCargando(true);
    try {
      const [resSugerencias, resCategorias] = await Promise.all([
        api.get('/suggestions'),
        api.get('/categories'),
      ]);
      setSugerencias(resSugerencias.data);
      setCategorias(resCategorias.data);
    } catch { toast.error('Error al cargar sugerencias'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const validar = () => {
    const e = {};
    if (!formulario.nombreArticulo?.trim()) e.nombreArticulo = 'El nombre del artículo es requerido';
    return e;
  };

  const enviarSugerencia = async () => {
    const errores = validar();
    if (Object.keys(errores).length) { setErroresForm(errores); return; }
    try {
      await api.post('/suggestions', {
        article_name: formulario.nombreArticulo,
        article_type_id: formulario.idTipo ? +formulario.idTipo : null,
        description: formulario.descripcion,
      });
      toast.success('Sugerencia enviada');
      setModalAbierto(false);
      setFormulario({ nombreArticulo: '', idTipo: '', descripcion: '' });
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al enviar'); }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(`/suggestions/${id}/status`, { status: estado });
      toast.success(`Sugerencia ${estado}`);
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const incrementarSolicitud = async (id) => {
    try {
      await api.put(`/suggestions/${id}/increment`);
      toast.success('Solicitud registrada');
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const eliminarSugerencia = async (id) => {
    try {
      await api.delete(`/suggestions/${id}`);
      toast.success('Sugerencia eliminada');
      cargar();
    } catch { toast.error('Error al eliminar'); }
  };

  const actualizarCampo = (campo) => (e) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: e.target.value }));
    setErroresForm((anterior) => ({ ...anterior, [campo]: undefined }));
  };

  const pendientes  = sugerencias.filter((s) => s.status === 'pendiente');
  const resueltas   = sugerencias.filter((s) => s.status !== 'pendiente');

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Sugerencias de productos</h1>
          <p className="page-subtitle">Artículos solicitados por clientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setModalAbierto(true);
          setFormulario({ nombreArticulo: '', idTipo: '', descripcion: '' });
          setErroresForm({});
        }}>
          <Plus size={16} /> Nueva sugerencia
        </button>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--espresso)', marginBottom: 12 }}>
        Pendientes ({pendientes.length})
      </h3>
      <div className="card table-wrapper" style={{ marginBottom: 24 }}>
        {cargando ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
        ) : pendientes.length === 0 ? (
          <div className="empty-state"><p>No hay sugerencias pendientes</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Artículo</th><th>Tipo</th><th>Descripción</th>
                <th>Solicitudes</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((sugerencia) => (
                <tr key={sugerencia.id}>
                  <td style={{ fontWeight: 600 }}>{sugerencia.article_name}</td>
                  <td>{sugerencia.articleType?.name || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--tan)', maxWidth: 200 }}>{sugerencia.description || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: sugerencia.request_count >= 8 ? 'var(--danger)' : sugerencia.request_count >= 4 ? 'var(--warning)' : 'inherit' }}>
                        {sugerencia.request_count}
                      </span>
                      {sugerencia.request_count >= 8 && <TrendingUp size={14} color="var(--danger)" />}
                    </div>
                  </td>
                  <td><span className={`badge badge-${sugerencia.status}`}>{sugerencia.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => incrementarSolicitud(sugerencia.id)} title="Registrar otra solicitud">+1</button>
                      {esAdmin && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => cambiarEstado(sugerencia.id, 'aprobado')} title="Aprobar"><Check size={13} /></button>
                          <button className="btn btn-sm btn-danger"  onClick={() => cambiarEstado(sugerencia.id, 'rechazado')} title="Rechazar"><ThumbsDown size={13} /></button>
                        </>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => eliminarSugerencia(sugerencia.id)} title="Eliminar">
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {resueltas.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--espresso)', marginBottom: 12 }}>
            Resueltas ({resueltas.length})
          </h3>
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Artículo</th><th>Tipo</th><th>Solicitudes</th>
                  <th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resueltas.map((sugerencia) => (
                  <tr key={sugerencia.id}>
                    <td>{sugerencia.article_name}</td>
                    <td>{sugerencia.articleType?.name || '—'}</td>
                    <td>{sugerencia.request_count}</td>
                    <td><span className={`badge badge-${sugerencia.status}`}>{sugerencia.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminarSugerencia(sugerencia.id)}>
                        <X size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalAbierto && (
        <div className="modal-backdrop" onClick={() => setModalAbierto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nueva sugerencia</h2>
              <button className="modal-close" onClick={() => setModalAbierto(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Nombre del artículo *</label>
              <input value={formulario.nombreArticulo} onChange={actualizarCampo('nombreArticulo')} placeholder="Ej: Post-it de colores" />
              {erroresForm.nombreArticulo && <span className="error">{erroresForm.nombreArticulo}</span>}
            </div>
            <div className="form-group">
              <label>Tipo de artículo</label>
              <select value={formulario.idTipo} onChange={actualizarCampo('idTipo')}>
                <option value="">Sin especificar</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción / Motivo</label>
              <textarea rows={3} value={formulario.descripcion} onChange={actualizarCampo('descripcion')} placeholder="¿Por qué se necesita este artículo?" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={enviarSugerencia}>Enviar sugerencia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

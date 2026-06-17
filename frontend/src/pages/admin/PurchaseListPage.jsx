import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, X, Check, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaginaListaCompras() {
  const [items, setItems]               = useState([]);
  const [articulos, setArticulos]       = useState([]);
  const [sugerencias, setSugerencias]   = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario]     = useState({ idArticulo: '', idSugerencia: '', cantidad: 1, precioEstimado: '', prioridad: 'media', notas: '' });
  const [erroresForm, setErroresForm]   = useState({});

  const cargar = async () => {
    setCargando(true);
    try {
      const [resLista, resArticulos, resSugerencias] = await Promise.all([
        api.get('/purchase-list'),
        api.get('/articles'),
        api.get('/suggestions'),
      ]);
      setItems(resLista.data);
      setArticulos(resArticulos.data);
      setSugerencias(resSugerencias.data.filter((s) => s.status === 'pendiente'));
    } catch { toast.error('Error al cargar lista'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const validar = () => {
    const e = {};
    if (!formulario.idArticulo && !formulario.idSugerencia) e.idArticulo = 'Selecciona un artículo o sugerencia';
    if (!formulario.cantidad || +formulario.cantidad < 1)   e.cantidad   = 'La cantidad debe ser al menos 1';
    return e;
  };

  const agregarItem = async () => {
    const errores = validar();
    if (Object.keys(errores).length) { setErroresForm(errores); return; }
    try {
      await api.post('/purchase-list', {
        article_id:    formulario.idArticulo    ? +formulario.idArticulo    : null,
        suggestion_id: formulario.idSugerencia  ? +formulario.idSugerencia  : null,
        quantity:       +formulario.cantidad,
        estimated_price: formulario.precioEstimado ? +formulario.precioEstimado : null,
        priority: formulario.prioridad,
        notes:    formulario.notas,
      });
      toast.success('Artículo agregado a la lista');
      setModalAbierto(false); cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al agregar'); }
  };

  const marcarComprado = async (id) => {
    try { await api.put(`/purchase-list/${id}/purchased`); toast.success('Marcado como comprado'); cargar(); }
    catch { toast.error('Error al actualizar'); }
  };

  const eliminarItem = async (id) => {
    try { await api.delete(`/purchase-list/${id}`); toast.success('Eliminado de la lista'); cargar(); }
    catch { toast.error('Error al eliminar'); }
  };

  const actualizarCampo = (campo) => (e) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: e.target.value }));
    setErroresForm((anterior) => ({ ...anterior, [campo]: undefined }));
  };

  const pendientes  = items.filter((i) => i.status === 'pendiente');
  const comprados   = items.filter((i) => i.status === 'comprado');
  const ordenPrioridad = { alta: 0, media: 1, baja: 2 };
  const pendientesOrdenados = [...pendientes].sort((a, b) => ordenPrioridad[a.priority] - ordenPrioridad[b.priority]);
  const costoTotalEstimado  = pendientes.reduce((s, i) => s + (i.estimated_price ? +i.estimated_price * i.quantity : 0), 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Lista de compras</h1>
          <p className="page-subtitle">Artículos para reabastecer la tienda</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setModalAbierto(true);
          setFormulario({ idArticulo: '', idSugerencia: '', cantidad: 1, precioEstimado: '', prioridad: 'media', notas: '' });
          setErroresForm({});
        }}>
          <Plus size={16} /> Agregar artículo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Pendientes de compra</div>
          <div className="stat-value">{pendientes.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <div className="stat-label">Costo estimado</div>
          <div className="stat-value" style={{ color: '#27ae60', fontSize: 20 }}>${costoTotalEstimado.toFixed(2)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--sand)' }}>
          <div className="stat-label">Ya comprados</div>
          <div className="stat-value" style={{ color: 'var(--tan)' }}>{comprados.length}</div>
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Pendientes de compra</h3>
      <div className="card table-wrapper" style={{ marginBottom: 24 }}>
        {cargando ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
        ) : pendientesOrdenados.length === 0 ? (
          <div className="empty-state"><ShoppingBag size={36} /><p>La lista de compras está vacía</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Artículo / Sugerencia</th><th>Cantidad</th><th>P. Est. Unit.</th>
                <th>Total Est.</th><th>Prioridad</th><th>Notas</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendientesOrdenados.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    {item.article?.name || item.suggestion?.article_name || '—'}
                    {item.suggestion && <span style={{ fontSize: 11, color: 'var(--tan)', display: 'block' }}>Sugerencia</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td>{item.estimated_price ? `$${(+item.estimated_price).toFixed(2)}` : '—'}</td>
                  <td style={{ fontWeight: 600 }}>{item.estimated_price ? `$${(+item.estimated_price * item.quantity).toFixed(2)}` : '—'}</td>
                  <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--tan)', maxWidth: 150 }}>{item.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-success" onClick={() => marcarComprado(item.id)} title="Marcar como comprado"><Check size={13} /></button>
                      <button className="btn btn-sm btn-danger"  onClick={() => eliminarItem(item.id)}   title="Eliminar"><X size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {comprados.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--tan)' }}>Ya comprados</h3>
          <div className="card table-wrapper">
            <table>
              <thead><tr><th>Artículo</th><th>Cantidad</th><th>Prioridad</th><th>Acciones</th></tr></thead>
              <tbody>
                {comprados.map((item) => (
                  <tr key={item.id} style={{ opacity: 0.65 }}>
                    <td>{item.article?.name || item.suggestion?.article_name || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => eliminarItem(item.id)}><X size={13} /></button></td>
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
              <h2 className="modal-title">Agregar a lista de compras</h2>
              <button className="modal-close" onClick={() => setModalAbierto(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Artículo existente</label>
              <select value={formulario.idArticulo} onChange={(e) => { actualizarCampo('idArticulo')(e); setFormulario((a) => ({ ...a, idSugerencia: '' })); }}>
                <option value="">Seleccionar artículo...</option>
                {articulos.map((a) => <option key={a.id} value={a.id}>{a.name} — Stock: {a.stock}</option>)}
              </select>
            </div>
            <div style={{ textAlign: 'center', margin: '4px 0 12px', color: 'var(--tan)', fontSize: 13 }}>— o sugerencia de cliente —</div>
            <div className="form-group">
              <label>Sugerencia de cliente</label>
              <select value={formulario.idSugerencia} onChange={(e) => { actualizarCampo('idSugerencia')(e); setFormulario((a) => ({ ...a, idArticulo: '' })); }}>
                <option value="">Seleccionar sugerencia...</option>
                {sugerencias.map((s) => <option key={s.id} value={s.id}>{s.article_name} ({s.request_count} solicitudes)</option>)}
              </select>
              {erroresForm.idArticulo && <span className="error">{erroresForm.idArticulo}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Cantidad *</label>
                <input type="number" min="1" value={formulario.cantidad} onChange={actualizarCampo('cantidad')} />
                {erroresForm.cantidad && <span className="error">{erroresForm.cantidad}</span>}
              </div>
              <div className="form-group">
                <label>Precio estimado unit.</label>
                <input type="number" min="0" step="0.01" value={formulario.precioEstimado} onChange={actualizarCampo('precioEstimado')} placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <select value={formulario.prioridad} onChange={actualizarCampo('prioridad')}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea rows={2} value={formulario.notas} onChange={actualizarCampo('notas')} placeholder="Observaciones opcionales..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={agregarItem}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

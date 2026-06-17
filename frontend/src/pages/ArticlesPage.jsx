import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Sparkles, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ESTADO_VACIO_FORM = { name:'', article_type_id:'', description:'', price:'', stock:'', min_stock:5 };

export default function PaginaArticulos() {
  const { esAdmin } = useAuth();
  const [articulos, setArticulos]       = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroTipo, setFiltroTipo]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal]               = useState(null);
  const [formulario, setFormulario]     = useState(ESTADO_VACIO_FORM);
  const [erroresForm, setErroresForm]   = useState({});
  const [sugerenciaPrecio, setSugerenciaPrecio] = useState(null);
  const [eliminando, setEliminando]     = useState(null);
  const [reabasteciendo, setReabasteciendo] = useState(null);
  const [cantidadReabastece, setCantidadReabastece] = useState(1);
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
  const [buscandoRapido, setBuscandoRapido] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const parametros = new URLSearchParams();
      if (busqueda)     parametros.append('name', busqueda);
      if (filtroTipo)   parametros.append('typeId', filtroTipo);
      if (filtroEstado) parametros.append('status', filtroEstado);
      const [resArt, resCat] = await Promise.all([
        api.get('/articles?' + parametros),
        api.get('/categories'),
      ]);
      setArticulos(resArt.data);
      setCategorias(resCat.data);
    } catch { toast.error('Error al cargar artículos'); }
    finally { setCargando(false); }
  }, [busqueda, filtroTipo, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const buscarRapido = async (termino) => {
    if (!termino.trim()) { setResultadoBusqueda(null); return; }
    setBuscandoRapido(true);
    try {
      const respuesta = await api.get(`/articles/search?q=${encodeURIComponent(termino)}`);
      setResultadoBusqueda(respuesta.data);
    } catch { setResultadoBusqueda(null); }
    finally { setBuscandoRapido(false); }
  };

  const validarFormulario = () => {
    const e = {};
    if (!formulario.name?.trim())     e.name     = 'El nombre es requerido';
    if (!formulario.article_type_id)  e.tipo     = 'El tipo es requerido';
    if (formulario.price === '' || formulario.price === undefined) e.price = 'El precio es requerido';
    else if (+formulario.price < 0)   e.price    = 'El precio no puede ser negativo';
    if (formulario.stock === '' || formulario.stock === undefined) e.stock = 'El stock es requerido';
    else if (+formulario.stock < 0)   e.stock    = 'El stock no puede ser negativo';
    if (+formulario.min_stock < 0)    e.min_stock = 'El mínimo no puede ser negativo';
    return e;
  };

  const guardar = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length) { setErroresForm(errores); return; }
    try {
      const carga = {
        name: formulario.name.trim(), article_type_id: +formulario.article_type_id,
        description: formulario.description?.trim() || '', price: +formulario.price,
        stock: +formulario.stock, min_stock: +(formulario.min_stock || 5),
      };
      if (modal === 'crear') await api.post('/articles', carga);
      else await api.put(`/articles/${formulario.id}`, carga);
      toast.success(modal === 'crear' ? '✅ Artículo creado exitosamente' : '✅ Artículo actualizado');
      setModal(null); cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Artículo eliminado (registro conservado)');
      setEliminando(null); cargar();
    } catch { toast.error('Error al eliminar'); }
  };

  const reabastecer = async () => {
    if (+cantidadReabastece <= 0) { toast.error('La cantidad debe ser mayor a 0'); return; }
    try {
      await api.put(`/articles/${reabasteciendo.id}/restock`, { quantity: +cantidadReabastece });
      toast.success(`✅ Stock actualizado: +${cantidadReabastece} unidades`);
      setReabasteciendo(null); setCantidadReabastece(1); cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al reabastecer'); }
  };

  const obtenerSugerenciaPrecio = async () => {
    if (!formulario.price || +formulario.price <= 0) { toast.error('Ingresa primero el costo del artículo'); return; }
    try {
      const respuesta = await api.get(`/articles/suggest-price?cost=${formulario.price}`);
      setSugerenciaPrecio(respuesta.data);
    } catch { toast.error('Error al obtener sugerencia'); }
  };

  const actualizarCampo = (campo) => (e) => {
    setFormulario((ant) => ({ ...ant, [campo]: e.target.value }));
    setErroresForm((ant) => ({ ...ant, [campo]: undefined }));
    if (campo === 'price') setSugerenciaPrecio(null);
  };

  const abrirCrear = () => { setFormulario(ESTADO_VACIO_FORM); setSugerenciaPrecio(null); setErroresForm({}); setModal('crear'); };
  const abrirEditar = (a) => { setFormulario({ ...a, min_stock: a.min_stock || 5 }); setSugerenciaPrecio(null); setErroresForm({}); setModal('editar'); };

  const colorEstado = (art) => art.stock === 0 ? 'var(--danger)' : art.stock <= art.min_stock ? 'var(--warning)' : 'inherit';

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Artículos</h1>
          <p className="page-subtitle">Gestión del catálogo de productos · {articulos.length} artículos</p>
        </div>
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirCrear}>
            <Plus size={16} /> Nuevo artículo
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom:16, padding:'16px 20px' }}>
        <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:8, color:'var(--espresso)' }}>
          🔍 Búsqueda rápida de disponibilidad
        </label>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={15} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--tan)' }} />
            <input
              placeholder="¿Tienes bolígrafos azules? Escribe el nombre..."
              style={{ width:'100%', padding:'9px 12px 9px 32px', border:'1.5px solid var(--sand)', borderRadius:'var(--radius-sm)', fontSize:14 }}
              onChange={(e) => buscarRapido(e.target.value)}
            />
          </div>
          {buscandoRapido && <span style={{ alignSelf:'center', fontSize:13, color:'var(--tan)' }}>Buscando...</span>}
        </div>
        {resultadoBusqueda && (
          <div style={{ marginTop:10, padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600,
            background: resultadoBusqueda.encontrado && resultadoBusqueda.articulo?.status !== 'agotado' ? '#e8f5e9' : resultadoBusqueda.encontrado ? '#fff8e1' : '#fce4ec',
            color: resultadoBusqueda.encontrado && resultadoBusqueda.articulo?.status !== 'agotado' ? '#2e7d32' : resultadoBusqueda.encontrado ? '#e65100' : '#c62828',
          }}>
            {resultadoBusqueda.encontrado && resultadoBusqueda.articulo?.status !== 'agotado' ? '✅' : resultadoBusqueda.encontrado ? '⚠️' : '❌'} {resultadoBusqueda.mensaje}
            {resultadoBusqueda.articulo && <span style={{ fontWeight:400, color:'var(--tan)', marginLeft:8 }}> — ${(+resultadoBusqueda.articulo.price).toFixed(2)}</span>}
          </div>
        )}
      </div>

      <div className="search-bar">
        <div style={{ position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--tan)' }} />
          <input placeholder="Filtrar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ paddingLeft:32 }} />
        </div>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="nuevo">Nuevo</option>
          <option value="disponible">Disponible</option>
          <option value="agotado">Agotado</option>
        </select>
        {(busqueda || filtroTipo || filtroEstado) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setBusqueda(''); setFiltroTipo(''); setFiltroEstado(''); }}>
            <X size={14} /> Limpiar
          </button>
        )}
        <button className="btn btn-outline btn-sm" onClick={cargar} title="Refrescar">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="card table-wrapper">
        {cargando ? (
          <div style={{ padding:32, textAlign:'center', color:'var(--tan)' }}>Cargando artículos...</div>
        ) : articulos.length === 0 ? (
          <div className="empty-state"><Package size={36} /><p>No se encontraron artículos con los filtros aplicados</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Artículo</th><th>Tipo</th><th>Precio</th>
                <th>Stock</th><th>Mín.</th><th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((a) => (
                <tr key={a.id} style={{ opacity: a.status === 'agotado' ? 0.8 : 1 }}>
                  <td>
                    <div style={{ fontWeight:600 }}>{a.name}</div>
                    {a.description && <div style={{ fontSize:11, color:'var(--tan)', marginTop:2 }}>{a.description.substring(0,55)}{a.description.length > 55 ? '…' : ''}</div>}
                  </td>
                  <td style={{ fontSize:13 }}>{a.articleType?.name}</td>
                  <td style={{ fontWeight:700, color:'var(--brown)' }}>${(+a.price).toFixed(2)}</td>
                  <td>
                    <span style={{ fontWeight:700, color: colorEstado(a) }}>{a.stock}</span>
                  </td>
                  <td style={{ fontSize:12, color:'var(--tan)' }}>{a.min_stock}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {esAdmin && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => abrirEditar(a)} title="Editar"><Edit2 size={13} /></button>
                          <button className="btn btn-sm" style={{ background:'#e3f2fd', color:'#1565c0', padding:'6px 10px', borderRadius:'var(--radius-sm)', fontSize:13, border:'none' }}
                            onClick={() => { setReabasteciendo(a); setCantidadReabastece(a.min_stock || 10); }} title="Reabastecer">+</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setEliminando(a)} title="Eliminar"><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'crear' ? 'Nuevo artículo' : 'Editar artículo'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input value={formulario.name || ''} onChange={actualizarCampo('name')} placeholder="Ej: Bolígrafo azul BIC" maxLength={150} />
              {erroresForm.name && <span className="error">{erroresForm.name}</span>}
            </div>
            <div className="form-group">
              <label>Tipo de artículo *</label>
              <select value={formulario.article_type_id || ''} onChange={actualizarCampo('article_type_id')}>
                <option value="">— Seleccionar tipo —</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {erroresForm.tipo && <span className="error">{erroresForm.tipo}</span>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div className="form-group">
                <label>Precio *</label>
                <input type="number" min="0" step="0.01" value={formulario.price ?? ''} onChange={actualizarCampo('price')} placeholder="0.00" />
                {erroresForm.price && <span className="error">{erroresForm.price}</span>}
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input type="number" min="0" value={formulario.stock ?? ''} onChange={actualizarCampo('stock')} placeholder="0" />
                {erroresForm.stock && <span className="error">{erroresForm.stock}</span>}
              </div>
              <div className="form-group">
                <label>Stock mínimo</label>
                <input type="number" min="0" value={formulario.min_stock ?? 5} onChange={actualizarCampo('min_stock')} />
                {erroresForm.min_stock && <span className="error">{erroresForm.min_stock}</span>}
              </div>
            </div>
            {esAdmin && (
              <div style={{ marginBottom:14 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={obtenerSugerenciaPrecio}>
                  <Sparkles size={14} /> Sugerir precio de venta
                </button>
                {sugerenciaPrecio && (
                  <div style={{ marginTop:8, padding:'10px 14px', background:'var(--cream)', borderRadius:'var(--radius-sm)', fontSize:13, lineHeight:1.6 }}>
                    💡 <strong>Sugerido:</strong> ${sugerenciaPrecio.sugerido} &nbsp;|&nbsp;
                    Mínimo: ${sugerenciaPrecio.minimo} &nbsp;|&nbsp; Máximo: ${sugerenciaPrecio.maximo}
                    <span style={{ display:'block', color:'var(--tan)', fontSize:12, marginTop:2 }}>Margen aplicado: {sugerenciaPrecio.margen}</span>
                  </div>
                )}
              </div>
            )}
            <div className="form-group">
              <label>Descripción</label>
              <textarea rows={2} value={formulario.description || ''} onChange={actualizarCampo('description')} placeholder="Descripción breve del artículo..." maxLength={500} />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar artículo</button>
            </div>
          </div>
        </div>
      )}

      {reabasteciendo && (
        <div className="modal-backdrop" onClick={() => setReabasteciendo(null)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reabastecer artículo</h2>
              <button className="modal-close" onClick={() => setReabasteciendo(null)}><X size={20} /></button>
            </div>
            <p style={{ fontSize:14, marginBottom:16 }}>
              <strong>{reabasteciendo.name}</strong><br />
              Stock actual: <strong style={{ color: reabasteciendo.stock === 0 ? 'var(--danger)' : 'inherit' }}>{reabasteciendo.stock}</strong>
            </p>
            <div className="form-group">
              <label>Cantidad a agregar *</label>
              <input type="number" min="1" value={cantidadReabastece} onChange={(e) => setCantidadReabastece(e.target.value)} />
            </div>
            <p style={{ fontSize:12, color:'var(--tan)', marginBottom:16 }}>
              Stock resultante: <strong>{reabasteciendo.stock + +cantidadReabastece}</strong>
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setReabasteciendo(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={reabastecer}>Confirmar reabastecimiento</button>
            </div>
          </div>
        </div>
      )}

      {eliminando && (
        <div className="modal-backdrop" onClick={() => setEliminando(null)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ marginBottom:12 }}>¿Eliminar artículo?</h2>
            <p style={{ fontSize:14, color:'var(--tan)', marginBottom:20 }}>
              Se eliminará lógicamente <strong>"{eliminando.name}"</strong>. El historial de ventas se conserva intacto.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setEliminando(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => eliminar(eliminando.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

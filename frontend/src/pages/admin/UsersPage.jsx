import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function calcularFortalezaContrasena(contrasena) {
  if (!contrasena) return null;
  const tieneMayuscula    = /[A-Z]/.test(contrasena);
  const tieneMinuscula    = /[a-z]/.test(contrasena);
  const tieneNumero       = /[0-9]/.test(contrasena);
  const tieneEspecial     = /[^A-Za-z0-9]/.test(contrasena);
  const longitudSuficiente = contrasena.length >= 8;
  const puntaje = [tieneMayuscula, tieneMinuscula, tieneNumero, tieneEspecial, longitudSuficiente].filter(Boolean).length;
  if (puntaje <= 2) return 'débil';
  if (puntaje <= 4) return 'intermedia';
  return 'fuerte';
}

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios]           = useState([]);
  const [roles, setRoles]                 = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [modal, setModal]                 = useState(null);
  const [formulario, setFormulario]       = useState({ nombre: '', correo: '', contrasena: '', idRol: '' });
  const [erroresForm, setErroresForm]     = useState({});
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [eliminando, setEliminando]       = useState(null);

  const fortaleza = calcularFortalezaContrasena(formulario.contrasena);

  const cargar = async () => {
    setCargando(true);
    try {
      const [resUsuarios, resRoles] = await Promise.all([api.get('/users'), api.get('/users/roles')]);
      setUsuarios(resUsuarios.data);
      setRoles(resRoles.data);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const validar = (esEdicion = false) => {
    const e = {};
    if (!formulario.nombre?.trim()) e.nombre = 'El nombre es requerido';
    if (!formulario.correo?.trim()) e.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formulario.correo)) e.correo = 'Correo inválido';
    if (!esEdicion && !formulario.contrasena) e.contrasena = 'La contraseña es requerida';
    if (formulario.contrasena && formulario.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres';
    if (!formulario.idRol) e.idRol = 'El rol es requerido';
    return e;
  };

  const guardar = async () => {
    const errores = validar(modal === 'editar');
    if (Object.keys(errores).length) { setErroresForm(errores); return; }
    try {
      const carga = { name: formulario.nombre, email: formulario.correo, role_id: +formulario.idRol };
      if (formulario.contrasena) carga.password = formulario.contrasena;
      if (modal === 'crear') await api.post('/users', carga);
      else                   await api.put(`/users/${formulario.id}`, carga);
      toast.success(modal === 'crear' ? 'Usuario creado' : 'Usuario actualizado');
      setModal(null); cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuario desactivado');
      setEliminando(null); cargar();
    } catch { toast.error('Error al eliminar'); }
  };

  const abrirCrear = () => {
    setFormulario({ nombre: '', correo: '', contrasena: '', idRol: '' });
    setErroresForm({}); setMostrarContrasena(false); setModal('crear');
  };

  const abrirEditar = (u) => {
    setFormulario({ id: u.id, nombre: u.name, correo: u.email, contrasena: '', idRol: u.role_id });
    setErroresForm({}); setMostrarContrasena(false); setModal('editar');
  };

  const actualizarCampo = (campo) => (e) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: e.target.value }));
    setErroresForm((anterior) => ({ ...anterior, [campo]: undefined }));
  };

  const anchoBarraFortaleza = fortaleza === 'fuerte' ? '100%' : fortaleza === 'intermedia' ? '60%' : '25%';
  const colorBarraFortaleza = fortaleza === 'fuerte' ? '#27ae60' : fortaleza === 'intermedia' ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de cuentas y permisos</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}><Plus size={16} /> Nuevo usuario</button>
      </div>

      <div className="card table-wrapper">
        {cargando ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--tan)' }}>Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state"><p>No hay usuarios registrados</p></div>
        ) : (
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Registrado</th><th>Acciones</th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--espresso)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--tan)' }}>{u.email}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.role?.name === 'administrador' ? '#fce4ec' : '#e3f2fd', color: u.role?.name === 'administrador' ? '#c62828' : '#1565c0' }}>
                      {u.role?.name}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--tan)' }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => abrirEditar(u)}><Edit2 size={13} /></button>
                      <button className="btn btn-sm btn-danger"    onClick={() => setEliminando(u)}><Trash2 size={13} /></button>
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
              <h2 className="modal-title">{modal === 'crear' ? 'Nuevo usuario' : 'Editar usuario'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Nombre completo *</label>
              <input value={formulario.nombre} onChange={actualizarCampo('nombre')} placeholder="Nombre del usuario" />
              {erroresForm.nombre && <span className="error">{erroresForm.nombre}</span>}
            </div>
            <div className="form-group">
              <label>Correo electrónico *</label>
              <input type="email" value={formulario.correo} onChange={actualizarCampo('correo')} placeholder="correo@ejemplo.com" />
              {erroresForm.correo && <span className="error">{erroresForm.correo}</span>}
            </div>
            <div className="form-group">
              <label>{modal === 'editar' ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
              <div style={{ position: 'relative' }}>
                <input type={mostrarContrasena ? 'text' : 'password'} value={formulario.contrasena} onChange={actualizarCampo('contrasena')} placeholder="••••••••" style={{ width: '100%', paddingRight: 36 }} />
                <button type="button" onClick={() => setMostrarContrasena((a) => !a)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tan)', padding: 4 }}>
                  {mostrarContrasena ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formulario.contrasena && (
                <div style={{ marginTop: 4 }}>
                  Fortaleza: <span className={`strength-${fortaleza}`}>{fortaleza}</span>
                  <div style={{ height: 4, borderRadius: 2, background: '#eee', marginTop: 4 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: anchoBarraFortaleza, background: colorBarraFortaleza, transition: 'all 0.3s' }} />
                  </div>
                </div>
              )}
              {erroresForm.contrasena && <span className="error">{erroresForm.contrasena}</span>}
            </div>
            <div className="form-group">
              <label>Rol *</label>
              <select value={formulario.idRol} onChange={actualizarCampo('idRol')}>
                <option value="">Seleccionar rol</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {erroresForm.idRol && <span className="error">{erroresForm.idRol}</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {eliminando && (
        <div className="modal-backdrop" onClick={() => setEliminando(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ marginBottom: 12 }}>¿Desactivar usuario?</h2>
            <p style={{ fontSize: 14, color: 'var(--tan)', marginBottom: 20 }}>
              El usuario <strong>{eliminando.name}</strong> ya no podrá ingresar al sistema.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setEliminando(null)}>Cancelar</button>
              <button className="btn btn-danger"  onClick={() => eliminar(eliminando.id)}>Desactivar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

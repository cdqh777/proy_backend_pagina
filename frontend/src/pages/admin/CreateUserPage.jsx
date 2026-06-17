import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Eye, EyeOff, UserPlus, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function clasificarFortaleza(contrasena) {
  if (!contrasena) return null;
  const tieneMayuscula    = /[A-Z]/.test(contrasena);
  const tieneMinuscula    = /[a-z]/.test(contrasena);
  const tieneNumero       = /[0-9]/.test(contrasena);
  const tieneEspecial     = /[^A-Za-z0-9]/.test(contrasena);
  const longitudSuficiente = contrasena.length >= 8;
  const puntaje = [tieneMayuscula, tieneMinuscula, tieneNumero, tieneEspecial, longitudSuficiente].filter(Boolean).length;
  if (puntaje <= 2) return { nivel: 'débil', icono: ShieldAlert, color: '#e74c3c', ancho: '25%' };
  if (puntaje <= 4) return { nivel: 'intermedia', icono: Shield, color: '#f39c12', ancho: '60%' };
  return { nivel: 'fuerte', icono: ShieldCheck, color: '#27ae60', ancho: '100%' };
}

export default function PaginaCrearUsuario() {
  const [roles, setRoles]                 = useState([]);
  const [cargando, setCargando]           = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [formulario, setFormulario]       = useState({ nombre: '', correo: '', contrasena: '', confirmarContrasena: '', idRol: '' });
  const [erroresForm, setErroresForm]     = useState({});
  const [enviado, setEnviado]             = useState(false);

  const fortaleza = clasificarFortaleza(formulario.contrasena);
  const IconoFortaleza = fortaleza?.icono;

  useEffect(() => {
    api.get('/users/roles').then((r) => setRoles(r.data)).catch(() => toast.error('Error al cargar roles'));
  }, []);

  const actualizarCampo = (campo) => (e) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: e.target.value }));
    setErroresForm((anterior) => ({ ...anterior, [campo]: undefined }));
  };

  const validar = () => {
    const e = {};
    if (!formulario.nombre?.trim()) e.nombre = 'El nombre es requerido';
    if (!formulario.correo?.trim()) e.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formulario.correo)) e.correo = 'Correo inválido';
    if (!formulario.contrasena) e.contrasena = 'La contraseña es requerida';
    else if (formulario.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres';
    if (formulario.contrasena !== formulario.confirmarContrasena) e.confirmarContrasena = 'Las contraseñas no coinciden';
    if (!formulario.idRol) e.idRol = 'El rol es requerido';
    return e;
  };

  const guardar = async () => {
    const errores = validar();
    if (Object.keys(errores).length) { setErroresForm(errores); return; }
    setCargando(true);
    try {
      await api.post('/users', {
        name: formulario.nombre,
        email: formulario.correo,
        password: formulario.contrasena,
        role_id: +formulario.idRol,
      });
      toast.success('Usuario creado exitosamente');
      setFormulario({ nombre: '', correo: '', contrasena: '', confirmarContrasena: '', idRol: '' });
      setMostrarContrasena(false);
      setEnviado(true);
      setTimeout(() => setEnviado(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Crear usuario</h1>
          <p className="page-subtitle">Registrar una nueva cuenta en el sistema</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        {enviado && (
          <div style={{ padding: '12px 16px', background: '#e8f5e9', borderRadius: 8, marginBottom: 20, color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>
            Usuario registrado correctamente. Puedes crear otro a continuación.
          </div>
        )}

        <div className="form-group">
          <label>Nombre completo *</label>
          <input value={formulario.nombre} onChange={actualizarCampo('nombre')} placeholder="Nombre del usuario" />
          {erroresForm.nombre && <span className="error">{erroresForm.nombre}</span>}
        </div>

        <div className="form-group">
          <label>Correo electrónico *</label>
          <input type="email" value={formulario.correo} onChange={actualizarCampo('correo')} placeholder="usuario@gmail.com" />
          {erroresForm.correo && <span className="error">{erroresForm.correo}</span>}
        </div>

        <div className="form-group">
          <label>Contraseña *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              value={formulario.contrasena}
              onChange={actualizarCampo('contrasena')}
              placeholder="Mínimo 6 caracteres"
              style={{ width: '100%', paddingRight: 36 }}
            />
            <button
              type="button"
              onClick={() => setMostrarContrasena((a) => !a)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tan)', padding: 4, cursor: 'pointer' }}
            >
              {mostrarContrasena ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {formulario.contrasena && fortaleza && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <IconoFortaleza size={16} color={fortaleza.color} />
                <span style={{ fontWeight: 600, fontSize: 13, color: fortaleza.color, textTransform: 'uppercase' }}>
                  {fortaleza.nivel}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: '#eee' }}>
                <div style={{ height: '100%', borderRadius: 3, width: fortaleza.ancho, background: fortaleza.color, transition: 'all 0.3s' }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--tan)' }}>
                {fortaleza.nivel === 'débil' && 'Usa mayúsculas, minúsculas, números y caracteres especiales'}
                {fortaleza.nivel === 'intermedia' && 'Agrega más variedad de caracteres para mayor seguridad'}
                {fortaleza.nivel === 'fuerte' && 'Excelente, la contraseña es segura'}
              </div>
            </div>
          )}
          {erroresForm.contrasena && <span className="error">{erroresForm.contrasena}</span>}
        </div>

        <div className="form-group">
          <label>Confirmar contraseña *</label>
          <input
            type={mostrarContrasena ? 'text' : 'password'}
            value={formulario.confirmarContrasena}
            onChange={actualizarCampo('confirmarContrasena')}
            placeholder="Repite la contraseña"
          />
          {erroresForm.confirmarContrasena && <span className="error">{erroresForm.confirmarContrasena}</span>}
        </div>

        <div className="form-group">
          <label>Rol *</label>
          <select value={formulario.idRol} onChange={actualizarCampo('idRol')}>
            <option value="">Seleccionar rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.description}
              </option>
            ))}
          </select>
          {erroresForm.idRol && <span className="error">{erroresForm.idRol}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary" onClick={guardar} disabled={cargando}>
            <UserPlus size={16} />
            {cargando ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, BookOpen, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function generarCaptcha() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join('');
}

export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const [correo, setCorreo]               = useState('');
  const [contrasena, setContrasena]       = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [captcha, setCaptcha]             = useState(generarCaptcha);
  const [entradaCaptcha, setEntradaCaptcha] = useState('');
  const [cargando, setCargando]           = useState(false);
  const [errores, setErrores]             = useState({});

  const validar = () => {
    const e = {};
    if (!correo) e.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(correo)) e.correo = 'Correo inválido';
    if (!contrasena) e.contrasena = 'La contraseña es requerida';
    if (!entradaCaptcha) e.captcha = 'Ingresa el CAPTCHA';
    else if (entradaCaptcha.toUpperCase() !== captcha) e.captcha = 'CAPTCHA incorrecto';
    return e;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const erroresValidacion = validar();
    if (Object.keys(erroresValidacion).length) { setErrores(erroresValidacion); return; }
    setCargando(true);
    try {
      const usuarioIngresado = await iniciarSesion(correo, contrasena);
      toast.success(`Bienvenido, ${usuarioIngresado.name}`);
      navegar('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas');
      setCaptcha(generarCaptcha());
      setEntradaCaptcha('');
    } finally {
      setCargando(false);
    }
  };

  const refrescarCaptcha = () => {
    setCaptcha(generarCaptcha());
    setEntradaCaptcha('');
    setErrores((anterior) => ({ ...anterior, captcha: undefined }));
  };

  const actualizarCampo = (setter, campoError) => (e) => {
    setter(e.target.value);
    setErrores((anterior) => ({ ...anterior, [campoError]: undefined }));
  };

  return (
    <div style={estilos.pagina}>
      <div style={estilos.tarjeta}>
        <div style={estilos.marca}>
          <div style={estilos.iconoMarca}><BookOpen size={28} color="#FFFFFF" /></div>
          <h1 style={estilos.tituloMarca}>Librería</h1>
          <p style={estilos.subMarca}>Sistema de Gestión de Inventario</p>
        </div>

        <form onSubmit={manejarEnvio} noValidate>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={actualizarCampo(setCorreo, 'correo')}
            />
            {errores.correo && <span className="error">{errores.correo}</span>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                placeholder="••••••••"
                value={contrasena}
                onChange={actualizarCampo(setContrasena, 'contrasena')}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena((anterior) => !anterior)}
                style={estilos.botonOjo}
              >
                {mostrarContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errores.contrasena && <span className="error">{errores.contrasena}</span>}
          </div>

          <div className="form-group">
            <label>Verificación CAPTCHA</label>
            <div style={estilos.filaCaptcha}>
              <div style={estilos.cajaCaptcha}>
                {captcha.split('').map((caracter, indice) => (
                  <span key={indice} style={{
                    ...estilos.caracterCaptcha,
                    transform: `rotate(${(Math.random() - 0.5) * 18}deg)`,
                    color: indice % 2 === 0 ? '#BB6C43' : '#4A413C',
                  }}>{caracter}</span>
                ))}
              </div>
              <button type="button" onClick={refrescarCaptcha} style={estilos.botonRefrescar} title="Nuevo CAPTCHA">
                <RefreshCw size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Escribe el código"
              value={entradaCaptcha}
              onChange={actualizarCampo(setEntradaCaptcha, 'captcha')}
              maxLength={5}
              style={{ marginTop: '8px', textTransform: 'uppercase', letterSpacing: '4px' }}
            />
            {errores.captcha && <span className="error">{errores.captcha}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Ingresar al sistema'}
          </button>
        </form>

        <p style={estilos.pista}>
          <strong>Demo:</strong><br />
          Admin: admin.libreria@gmail.com / Admin2026!<br />
          Vendedor: vendedor1.libreria@gmail.com / Vend1Libreria
        </p>
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: '100vh', background: 'var(--espresso)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  tarjeta: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    padding: '36px 32px', width: '100%', maxWidth: '420px',
    boxShadow: 'var(--shadow-lg)',
  },
  marca:     { textAlign: 'center', marginBottom: '28px' },
  iconoMarca: {
    width: '56px', height: '56px', borderRadius: '14px',
    background: 'var(--espresso)', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
  },
  tituloMarca: { fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--espresso)' },
  subMarca:    { fontSize: '13px', color: 'var(--tan)', marginTop: '4px' },
  botonOjo: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--tan)', padding: '4px',
  },
  filaCaptcha: { display: 'flex', alignItems: 'center', gap: '10px' },
  cajaCaptcha: {
    flex: 1, background: 'var(--cream)', borderRadius: 'var(--radius-sm)',
    padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center',
    border: '1.5px solid var(--sand)', userSelect: 'none',
    fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '4px',
  },
  caracterCaptcha: { display: 'inline-block', fontWeight: 700 },
  botonRefrescar: {
    background: 'none', border: '1.5px solid var(--sand)',
    borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--tan)', flexShrink: 0,
  },
  pista: { marginTop: '16px', fontSize: '12px', color: 'var(--tan)', textAlign: 'center', lineHeight: '1.5' },
};

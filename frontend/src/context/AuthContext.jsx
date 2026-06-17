import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const ContextoAuth = createContext(null);

export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; }
  });

  const iniciarSesion = useCallback(async (correo, contrasena) => {
    const respuesta = await api.post('/auth/login', { email: correo, password: contrasena });
    localStorage.setItem('token', respuesta.data.access_token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.data.user));
    setUsuario(respuesta.data.user);
    return respuesta.data.user;
  }, []);

  const cerrarSesion = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  const esAdmin   = usuario?.role === 'administrador';
  const esVendedor = usuario?.role === 'vendedor';

  return (
    <ContextoAuth.Provider value={{ usuario, iniciarSesion, cerrarSesion, esAdmin, esVendedor }}>
      {children}
    </ContextoAuth.Provider>
  );
}

export const useAuth = () => useContext(ContextoAuth);

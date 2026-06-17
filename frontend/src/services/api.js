import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((configuracion) => {
  const token = localStorage.getItem('token');
  if (token) configuracion.headers.Authorization = `Bearer ${token}`;
  return configuracion;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

// Interceptor para manejo unificado de errores HTTP
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje = error.response?.data?.mensaje || error.response?.data?.message || 'Error de conexión con el servidor.';
    return Promise.reject(new Error(mensaje));
  }
);

export default api;
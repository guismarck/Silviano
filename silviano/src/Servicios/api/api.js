import axios from 'axios';

// URL base orientada al puerto 8080 de Spring Boot en GitHub Codespaces o Localhost
const BASE_URL = process.env.REACT_APP_API_URL ;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para inyección de token Bearer (si la seguridad está activa)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sige_token');
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para normalización de errores del servidor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensajeServidor =
      error.response?.data?.message ||
      error.response?.data?.mensaje;

    if (error.response) {
      error.message = mensajeServidor
        ? `Error HTTP ${error.response.status}: ${mensajeServidor}`
        : `Error HTTP ${error.response.status} al comunicarse con el servidor SIGE.`;
    } else if (error.request) {
      error.message =
        'No se recibió respuesta del servidor. Verifique la URL de la API y que CORS permita el origen del frontend.';
    } else if (!error.message) {
      error.message = 'Ocurrió un error al preparar la solicitud al servidor SIGE.';
    }

    return Promise.reject(error);
  }
);

export default api;
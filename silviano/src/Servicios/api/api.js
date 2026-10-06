import axios from 'axios';

// URL base orientada al puerto 8080 de Spring Boot en GitHub Codespaces o Localhost
const BASE_URL = process.env.REACT_APP_API_URL || 'https://legendary-cod-pw6grw7p7rgcr654-8080.app.github.dev';

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
    if (token) {
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
    const mensaje =
      error.response?.data?.message ||
      error.response?.data?.mensaje ||
      'Ocurrió un error en la comunicación con el servidor SIGE.';
    return Promise.reject(new Error(mensaje));
  }
);

export default api;
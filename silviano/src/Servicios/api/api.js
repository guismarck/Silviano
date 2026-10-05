import axios from 'axios';

// Detecta la URL base según el entorno o usa localhost:8080 por defecto
const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adjuntar Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[HTTP REQUEST] ${config.method.toUpperCase()} -> ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[HTTP REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[HTTP ERROR ${error.response.status}]`, error.response.data);
    } else if (error.request) {
      console.error('[HTTP NO RESPONSE] El backend no respondió. Verifique si el servidor Spring Boot está corriendo en', API_URL);
    } else {
      console.error('[HTTP SETUP ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
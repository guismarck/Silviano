import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username: credentials.username,
      password: credentials.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || error.response.data?.error || 'Credenciales inválidas');
    } else if (error.request) {
      throw new Error('No se pudo establecer conexión con el servidor backend');
    } else {
      throw new Error('Error al procesar la solicitud de inicio de sesión');
    }
  }
};

export const authService = {
  login
};

export default authService;
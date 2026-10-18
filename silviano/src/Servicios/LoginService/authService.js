import api from '../../Servicios/api/api';

const authService = {
  // Login directo que valida credenciales y retorna el perfil con roles
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; // Retorna { id, username, nombreCompleto, roles }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Credenciales inválidas o falla en el servidor escolar.';
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('sige_user');
  },
};

export default authService;
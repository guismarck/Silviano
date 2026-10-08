import api from '../api/api';

const estudiantesService = {
  // Busca estudiantes que coincidan con la consulta (nombre o código)
  buscarEstudiantes: async (consulta) => {
    try {
      const response = await api.get('/estudiantes/buscar', {
        params: {
          consulta,
        },
      });
      return response.data;
    } catch (error) {
      // Manejar error de búsqueda (ej. registrar error, mostrar mensaje al usuario)
      console.error('Error al buscar estudiantes:', error);
      throw error;
    }
  },

  // Obtiene los detalles de un estudiante por su ID
  obtenerEstudiantePorId: async (idEstudiante) => {
    try {
      const response = await api.get(`/estudiantes/${idEstudiante}`);
      return response.data;
    } catch (error) {
      // Manejar error al obtener detalles (ej. registrar error, mostrar mensaje al usuario)
      console.error('Error al obtener detalles del estudiante:', error);
      throw error;
    }
  },
};

export default estudiantesService;
import api from '../api/api';

const estudiantesService = {
  // Busca por código de estudiante, nombre o apellido.
  buscarEstudiantes: async (consulta) => {
    try {
      const response = await api.get('/estudiante-app/estudiantes/buscar', {
        params: {
          search: consulta,
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
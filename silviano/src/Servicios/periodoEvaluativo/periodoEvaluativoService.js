import api from '../api/api';

export const periodoEvaluativoService = {
  /**
   * Obtiene la lista completa de períodos evaluativos (trimestrales/bloques)
   * @param {number} anioEscolar - Opcional para filtrar por año académico
   */
  obtenerPeriodos: async (anioEscolar = null) => {
    try {
      const response = await api.get('/periodo-evaluativo', {
        params: anioEscolar ? { anioEscolar } : {},
      });

      const listaRaw = Array.isArray(response.data)
        ? response.data
        : response.data?.item || [];

      return listaRaw.map((p) => ({
        idperiodo_evaluativo: p.idPeriodoEvaluativo || p.id,
        nombre_periodo: p.nombrePeriodo || p.nombre_periodo || '',
        numero_periodo: Number(p.numeroPeriodo ?? p.numero_periodo) || 1,
        anio_escolar: Number(p.anioEscolar ?? p.anio_escolar) || new Date().getFullYear(),
        fecha_inicio: p.fechaInicio || p.fecha_inicio || '',
        fecha_fin: p.fechaFin || p.fecha_fin || '',
        fecha_cierre_docente: p.fechaCierreDocente || p.fecha_cierre_docente || '',
        estado: p.estado === 1 || p.estado === true || p.estado === '1' || p.estado === 'true',
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener los períodos evaluativos.');
    }
  },

  /**
   * Guarda un nuevo período evaluativo en la base de datos
   */
  crearPeriodo: async (periodoData) => {
    try {
      const response = await api.post('/periodo-evaluativo', periodoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al registrar el período evaluativo.');
    }
  },

  /**
   * Actualiza un período evaluativo existente
   */
  actualizarPeriodo: async (id, periodoData) => {
    try {
      const response = await api.put(`/periodo-evaluativo/${id}`, periodoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el período evaluativo.');
    }
  },

  /**
   * Cambia el estado (Activo/Inactivo) o elimina un período evaluativo
   */
  eliminarPeriodo: async (id) => {
    try {
      const response = await api.delete(`/periodo-evaluativo/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el período evaluativo.');
    }
  },
};
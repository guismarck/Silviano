import api from '../api/api';

/**
 * Servicio encargado de la comunicación con el módulo de Calificaciones (SIGE).
 * Mapea las respuestas de DTO Java (ComboItemDTO) hacia el formato PrimeReact { label, value }.
 */
export const calificacionesService = {

  /**
   * Obtiene la lista de grados académicos mapeando ComboItemDTO (id, descripcion).
   * Endpoint: GET /calificaciones/grados
   */
  getGradosCombo: async () => {
    try {
      const { data } = await api.get('/estudiante-app/grados');
      const rawData = Array.isArray(data) ? data : [];

      return rawData.map((item) => ({
        label: item.descripcion || 'Sin descripción',
        value: item.id,
      }));
    } catch (error) {
      console.error('Error al consultar grados para calificaciones:', error);
      throw error; // Re-lanzamos para permitir el control de estados y alertas en UI
    }
  },

  /**
   * Obtiene las asignaturas filtradas por grado según ComboItemDTO.
   * Endpoint: GET /calificaciones/asignaturas?idGrado={idGrado}
   * @param {number|string} idGrado 
   */
  getAsignaturasCombo: async (idGrado) => {
    if (!idGrado) return [];
    try {
      const { data } = await api.get('/estudiante-app/asignaturas', {
        params: { idGrado: Number(idGrado) },
      });
      const rawData = Array.isArray(data) ? data : [];

      return rawData.map((item) => ({
        label: item.descripcion || 'Sin asignatura',
        value: item.id,
      }));
    } catch (error) {
      console.error(`Error al cargar asignaturas para el grado ${idGrado}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene los periodos evaluativos activos.
   * Endpoint: GET /calificaciones/periodos?anioLectivo={anioLectivo}
   * @param {number|string} anioLectivo 
   */
  getPeriodosCombo: async (anioLectivo = 2026) => {
    try {
      const { data } = await api.get('/estudiante-app/periodos', {
        params: { anioLectivo: Number(anioLectivo) },
      });
      const rawData = Array.isArray(data) ? data : [];

      return rawData.map((item) => ({
        label: item.descripcion || `Periodo ${item.id}`,
        value: item.id,
      }));
    } catch (error) {
      console.error('Error al cargar periodos evaluativos:', error);
      throw error;
    }
  },

  /**
   * Obtiene la nómina de estudiantes activa para el ingreso de notas.
   * Endpoint: GET /calificaciones/nomina
   */
  getNominaEstudiantes: async (iddetallePlanDeEstudio, idPeriodoEvaluativo) => {
    if (!iddetallePlanDeEstudio || !idPeriodoEvaluativo) return [];
    try {
      const { data } = await api.get('/estudiante-app/nomina', {
        params: {
          iddetallePlanDeEstudio: Number(iddetallePlanDeEstudio),
          idPeriodoEvaluativo: Number(idPeriodoEvaluativo),
        },
      });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener nómina de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Envía las calificaciones procesadas en bloque.
   * Endpoint: POST /calificaciones/batch
   */
  guardarCalificacionesBatch: async (payload) => {
    try {
      const { data } = await api.post('/estudiante-app/batch', payload);
      return data;
    } catch (error) {
      console.error('Error al guardar calificaciones en bloque:', error);
      throw error;
    }
  },

  /**
   * Genera y descarga el Acta Oficial de Calificaciones en PDF desde Jaspersoft Server.
   * Endpoint: GET /calificaciones/reportes/acta-pdf
   */
  descargarActaCalificacionesPDF: async (iddetallePlanDeEstudio, idPeriodoEvaluativo) => {
    try {
      const response = await api.get('/estudiante-app/reportes/acta-pdf', {
        params: {
          iddetallePlanDeEstudio: Number(iddetallePlanDeEstudio),
          idPeriodoEvaluativo: Number(idPeriodoEvaluativo),
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute(
        'download',
        `Acta_Calificaciones_${iddetallePlanDeEstudio}_P${idPeriodoEvaluativo}.pdf`
      );

      document.body.appendChild(link);
      link.click();

      // Limpieza de memoria
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al descargar acta en PDF:', error);
      throw error;
    }
  },
};
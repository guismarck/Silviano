import api from '../api/api';

export const calificacionesService = {
  getNivelesCombo: async () => {
    const { data } = await api.get('/estudiante-app/niveles');
    return data;
  },

  getGradosCombo: async (idNivel) => {
    const { data } = await api.get('/estudiante-app/calificaciones/grados', {
      params: { idNivel }
    });
    return data;
  },

  getSalonesCombo: async (idGrado, anioLectivo = new Date().getFullYear()) => {
    const { data } = await api.get('/estudiante-app/salones', {
      params: { idGrado, anioLectivo }
    });
    return data;
  },

  getAsignaturasSeccionesCombo: async (idGrado, idDocente, idSalon) => {
    const { data } = await api.get('/estudiante-app/asignaturas', {
      params: { idGrado, idDocente, idSalon }
    });
    return data;
  },

  getPeriodosEvaluativosCombo: async (anioLectivo = new Date().getFullYear()) => {
    const { data } = await api.get('/estudiante-app/periodos', {
      params: { anioLectivo }
    });
    return data;
  },

  /**
   * Obtiene la nómina de estudiantes con sus notas actuales
   */
  getEstudiantesTabla: async (iddetallePlanDeEstudio, idPeriodoEvaluativo, idDocente, idSalon) => {
    const { data } = await api.get('/estudiante-app/nomina', {
      params: { iddetallePlanDeEstudio, idPeriodoEvaluativo, idDocente, idSalon }
    });
    return data;
  },

  /**
   * Guarda de forma masiva (batch) la nómina de calificaciones
   */
  guardarCalificacionesBatch: async (payload) => {
    const { data } = await api.post('/estudiante-app/batch', payload);
    return data;
  },

  /**
   * Descarga el acta oficial en PDF generada en Jaspersoft REST API v2
   */
  descargarActaCalificacionesPDF: async (iddetallePlanDeEstudio, idPeriodoEvaluativo) => {
    const response = await api.get('/estudiante-app/reportes/acta-pdf', {
      params: { iddetallePlanDeEstudio, idPeriodoEvaluativo },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `Acta_Calificaciones_Plan_${iddetallePlanDeEstudio}_P${idPeriodoEvaluativo}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Limpieza de memoria
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
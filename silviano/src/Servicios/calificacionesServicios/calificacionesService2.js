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
   * Genera el acta oficial en PDF desde la plantilla de Jaspersoft.
   */
  descargarActaCalificacionesPDF: async (iddetallePlanDeEstudio, idPeriodoEvaluativo) => {
    const reportWindow = window.open('', '_blank');
    if (reportWindow) reportWindow.opener = null;

    try {
      const response = await api.post(
        '/reportes/descargar',
        {
          nombrePlantilla: 'Acta_estudiante_asignatura',
          formato: 'PDF',
          parametros: {
            P_ID_DETALLE_PLAN: Number(iddetallePlanDeEstudio),
            P_ID_PERIODO: Number(idPeriodoEvaluativo)
          }
        },
        {
          baseURL: process.env.NODE_ENV === 'development' ? '' : undefined,
          responseType: 'blob'
        }
      );

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      if (reportWindow) {
        reportWindow.location.href = pdfUrl;
      } else {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'Acta_estudiante_asignatura.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      reportWindow?.close();
      throw error;
    }
  }
};
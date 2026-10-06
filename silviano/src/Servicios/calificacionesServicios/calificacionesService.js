import api from '../api/api';
import nominaCalificacionesMock from '../data/nominaCalificacionesMock.json';

export const calificacionesService = {
  /**
   * Carga la nómina de estudiantes calculando dinámicamente la nota final.
   */
  getEstudiantesTabla: async (iddetalle_plan_de_estudio, idperiodo_evaluativo) => {
    try {
      /* Producción Axios:
      const { data } = await api.get('/calificaciones/nomina', { 
        params: { iddetalle_plan_de_estudio, idperiodo_evaluativo } 
      });
      return data.map(est => ({
        ...est,
        notaFinal: (Number(est.acumulado) || 0) + (Number(est.examen) || 0),
        dirty: false
      }));
      */

      return new Promise((resolve) => {
        setTimeout(() => {
          // Clonación inmutable + cálculo derivado de Nota Final
          const dataClonada = JSON.parse(JSON.stringify(nominaCalificacionesMock)).map((est) => {
            const acum = Number(est.acumulado) || 0;
            const exa = Number(est.examen) || 0;
            return {
              ...est,
              acumulado: acum,
              examen: exa,
              notaFinal: acum + exa,
              dirty: false
            };
          });
          resolve(dataClonada);
        }, 500);
      });
    } catch (error) {
      throw new Error('No se pudo cargar la nómina de estudiantes.');
    }
  },

  /**
   * Guardado masivo (Bulk Upsert) enviando acumulado, examen y total.
   */
  guardarCalificacionesBatch: async (payload) => {
    try {
      /* Producción Axios:
      const { data } = await api.post('/calificaciones/batch', payload);
      return data;
      */
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Calificaciones registradas correctamente en el SIGE.' });
        }, 800);
      });
    } catch (error) {
      throw new Error('Error al registrar las calificaciones en el servidor.');
    }
  },

  /**
   * Descarga de Acta PDF desde Jaspersoft REST API v2
   */
  descargarActaCalificacionesPDF: async (iddetalle_plan_de_estudio, idperiodo_evaluativo) => {
    try {
      /* Producción Axios (Binary Blob):
      const response = await api.get('/reportes/acta-calificaciones', {
        params: { id_detalle_plan: iddetalle_plan_de_estudio, id_periodo: idperiodo_evaluativo, format: 'pdf' },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      */

      const blobSimulado = new Blob(['%PDF-1.4 ... Contenido del Acta de Calificaciones MINED SIGE'], {
        type: 'application/pdf'
      });
      const url = window.URL.createObjectURL(blobSimulado);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Acta_Calificaciones_Plan_${iddetalle_plan_de_estudio}_P${idperiodo_evaluativo}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('No se pudo generar el acta desde Jaspersoft Reports.');
    }
  }
};
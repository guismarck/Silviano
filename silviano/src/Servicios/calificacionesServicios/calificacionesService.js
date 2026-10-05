import api from '../api/api';
import nominaCalificacionesMock from '../data/nominaCalificacionesMock.json';
export const calificacionesService = {
  /**
   * Carga los estudiantes inscritos con sus notas registradas.
   */
  getEstudiantesTabla: async (iddetalle_plan_de_estudio, idperiodo_evaluativo) => {
    try {
      // En producción:
      // const { data } = await api.get('/calificaciones/nomina', { params: { iddetalle_plan_de_estudio, idperiodo_evaluativo } });
      // return data;

      return new Promise((resolve) => {
        setTimeout(() => {
          // Clonación inmutable para no contaminar el archivo JSON en memoria
          const dataClonada = nominaCalificacionesMock.map((estudiante) => ({
            ...estudiante,
            dirty: false
          }));
          resolve(dataClonada);
        }, 600);
      });
    } catch (error) {
      throw new Error('No se pudo cargar la nómina de estudiantes.');
    }
  },

  /**
   * Guarda o actualiza calificaciones en lote (Bulk Upsert).
   */
  guardarCalificacionesBatch: async (payload) => {
    // En producción:
    // const { data } = await api.post('/calificaciones/batch', payload);
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Calificaciones registradas correctamente.' });
      }, 800);
    });
  },

  /**
   * Descarga el Acta Oficial de Calificaciones mediante Jaspersoft REST API v2 (Binary Blob).
   */
  descargarActaCalificacionesPDF: async (iddetalle_plan_de_estudio, idperiodo_evaluativo) => {
    try {
      /* Código de producción con Axios:
      const response = await api.get('/reportes/acta-calificaciones', {
        params: { id_detalle_plan: iddetalle_plan_de_estudio, id_periodo: idperiodo_evaluativo, format: 'pdf' },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      */

      // Simulación de descarga de Blob PDF
      const blobSimulado = new Blob(['%PDF-1.4 ... Contenido de Acta de Calificaciones MINED SIGE'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blobSimulado);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Acta_Calificaciones_Plan_${iddetalle_plan_de_estudio}_P${idperiodo_evaluativo}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Limpieza inmediata de memoria
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('No se pudo generar el acta desde Jaspersoft Reports.');
    }
  }
};
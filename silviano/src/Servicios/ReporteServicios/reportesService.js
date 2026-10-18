import api from '../../Servicios/api/api';

export const reportesService = {
  /**
   * Descarga de reportes académicos (Boletines, Listas, Expedientes)
   * @param {string} codigoMined - Identificador del alumno o docente
   * @param {string} periodoLectivo - Año académico (ej. 2026)
   * @param {string} formato - Formato de salida ('pdf', 'xlsx')
   */
  descargarBoletin: async (codigoMined, periodoLectivo, formato = 'pdf') => {
    try {
      const response = await api.get('/reportes/boletin', {
        params: { codigoMined, periodoLectivo, formato },
        responseType: 'blob', // Imprescindible para manejar binarios desde Jaspersoft
      });

      // Creación del Blob y enlace temporal de descarga
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/pdf',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Boletin_${codigoMined}_${periodoLectivo}.${formato}`);
      
      document.body.appendChild(link);
      link.click();

      // Limpieza inmediata de recursos de memoria
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw new Error('No se pudo generar el reporte desde el servidor de Jaspersoft.');
    }
  },
};
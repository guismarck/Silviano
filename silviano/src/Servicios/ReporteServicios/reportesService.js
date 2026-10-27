import api from '../../Servicios/api/api';


/**
 * Busca estudiantes por código, nombre o apellido.
 * @param {string} search - Término de búsqueda.
 * @returns {Promise<Array>}
 */
export const buscarEstudiantesMatricula = async (search) => {
  if (!search || !search.trim()) return [];
  const { data } = await api.get('/estudiante-app/estudiantes/buscar', {
    params: { search: search.trim() },
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Solicita la generación y descarga del boletín académico en PDF
 * POST /reportes/descargar (Proxy a Jaspersoft API v2)
 * 
 * @param {Object} payload 
 * @param {number|string} payload.anioLectivo - Año lectivo (panio_lectivo)
 * @param {number|string} payload.idPersona - ID de la persona (pidpersona)
 * @param {string} payload.codigoMined - Código MINED (pcodigo_mined)
 * @returns {Promise<Blob>}
 */
export const descargarBoletin = async ({ anioLectivo, idPersona, codigoMined }) => {
  try {
    const response = await api.post(
      '/reportes/descargar',
      {
        nombrePlantilla: 'Boletin_Silviano_final',
        formato: 'PDF',
        parametros: {
          panio_lectivo: anioLectivo ? Number(anioLectivo) : null,
          pidpersona: idPersona ? Number(idPersona) : null,
          pcodigo_mined: codigoMined ? codigoMined.trim() : '',
        },
      },
      {
        responseType: 'blob',
      }
    );

    // Creación dinámica y descarga limpia del archivo PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const identificador = codigoMined || idPersona || 'estudiante';
    link.setAttribute('download', `Boletin_Silviano_${identificador}_${anioLectivo}.pdf`);

    document.body.appendChild(link);
    link.click();

    // Limpieza de memoria en el DOM
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    const responseData = error.response?.data;
    let mensajeBackend;

    if (responseData instanceof Blob) {
      const responseText = await responseData.text();
      try {
        const errorData = JSON.parse(responseText);
        mensajeBackend = errorData.message || errorData.mensaje;
      } catch {
        mensajeBackend = responseText;
      }
    } else if (typeof responseData === 'string') {
      mensajeBackend = responseData;
    } else {
      mensajeBackend = responseData?.message || responseData?.mensaje;
    }

    throw new Error(mensajeBackend || error.message || 'No se pudo generar el PDF del boletín.');
  }
};
/*
export const reportesService = {

  descargarBoletin: async (codigoMined, periodoLectivo, formato = 'pdf') => {
    try {
      const response = await api.get('/reportes/descargar', {
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
};*/
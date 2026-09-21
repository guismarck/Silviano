import api from '../Servicios/api/api';

/**
 * Obtiene la información académica y personal del estudiante por su ID.
 */
export const getEstudianteById = async (idPersona) => {
  const response = await api.get(`/estudiante-app/estudiantes/${idPersona}`);
  return response.data;
};

/**
 * Actualiza el expediente del estudiante en la base de datos centralizada.
 */
export const updateEstudianteService = async (idPersona, payload) => {
  const response = await api.put(`/estudiante-app/estudiantes/${idPersona}`, payload);
  return response.data;
};

/**
 * Obtiene el listado completo de estudiantes registrados en el sistema.
 */
export const getEstudiantes = async () => {
  const response = await api.get('/estudiante-app/estudiantes');
  return response.data;
};

/**
 * Realiza la búsqueda filtrada de estudiantes por término.
 * @param {string} query - Término de búsqueda.
 */
export const searchEstudiantes = async (query) => {
  const response = await api.get('/estudiante-app/estudiantes', {
    params: { search: query }
  });
  return response.data;
};

/**
 * Elimina un registro de estudiante por su ID.
 */
export const deleteEstudiante = async (idPersona) => {
  const response = await api.delete(`/estudiante-app/estudiantes/${idPersona}`);
  return response.data;
};

/**
 * Genera y descarga el reporte en PDF de la Nómina de Estudiantes.
 */
export const exportarNominaEstudiantesPDF = async () => {
  const response = await api.get('/estudiante-app/reportes/nomina-pdf', {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `Nomina_Estudiantes_${new Date().toISOString().slice(0, 10)}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};


/**
 * Genera y descarga el expediente escolar individual (Ficha del Estudiante) en PDF.
 * @param {number|string} idPersona - ID del estudiante.
 */
export const exportarExpedienteEstudiantePDF = async (idPersona) => {
  const response = await api.get(`/estudiante-app/reportes/expediente-pdf/${idPersona}`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `Ficha_Estudiante_${idPersona}_${new Date().toISOString().slice(0, 10)}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
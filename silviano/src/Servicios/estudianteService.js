import api from '../Servicios/api/api';
import { ValidarEstudiante } from '../Util/validaciones/validacionEstudiante.js';



export const ServicioValidado = async (estudianteData) => {
    const validacion = ValidarEstudiante(estudianteData);

    if (!validacion.esValido) {
        throw new Error(validacion.error);
    }

    const payload = validacion.payloadFormateado;

    console.log(
        'Datos originales del estudiante:',
        estudianteData
    );

    console.log(
        'JSON validado que se enviará al backend:',
        JSON.stringify(payload, null, 2)
    );

    try {
        const respuesta = await api.post(
            '/estudiante-app/estudiantes/create',
            payload
        );

        console.log(
            'Respuesta del registro de estudiante:',
            respuesta.data
        );

        return respuesta.data;

    } catch (error) {
        console.error(
            'Error HTTP al registrar estudiante:',
            error.response?.status
        );

        console.error(
            'Respuesta del backend:',
            error.response?.data
        );

        throw error;
    }
};



export const registrarEstudianteConTutor = async (payload) => {
    try {
        // Comprobar que el JSON tenga la estructura esperada.
        if (!payload?.estudiante || !Array.isArray(payload?.tutores)) {
            throw new Error(
                'El registro debe contener estudiante y una lista de tutores.'
            );
        }

        console.log(
            'JSON completo enviado al backend:',
            JSON.stringify(payload, null, 2)
        );

        const respuesta = await api.post(
            '/estudiante-app/estudiantes/create',
            payload
        );

        console.log(
            'Respuesta del registro completo:',
            respuesta.data
        );

        return respuesta.data;

    } catch (error) {
        console.error(
            'Estado HTTP:',
            error.response?.status
        );

        console.error(
            'Respuesta del backend:',
            error.response?.data
        );

        console.error(
            'Mensaje:',
            error.message
        );

        throw error;
    }
};


/**
 * Valida los datos e invoca el endpoint POST para registrar un nuevo estudiante.
 * @param {Object} estudianteData - Datos capturados en el formulario.
 * @returns {Promise<Object>} Respuesta del servidor.
 */

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
  const response = await api.get('/estudiante-app/estudiantes/buscar', {
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
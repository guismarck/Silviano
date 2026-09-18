import api from '../Servicios/api/api';

/**
 * Carga todos los catálogos requeridos para el formulario de matrícula en paralelo.
 */
export const getCatalogosNuevaMatricula = async () => {
  const [estudiantesRes, gradosRes, planesRes, pagosRes] = await Promise.all([
    api.get('/estudiante-app/estudiantes'),
    api.get('/estudiante-app/grados'),
    api.get('/estudiante-app/plandeEstudio'),
    api.get('/estudiante-app/pago')
  ]);

  return {
    estudiantes: estudiantesRes.data || [],
    grados: gradosRes.data || [],
    planes: planesRes.data || [],
    pagos: pagosRes.data || []
  };
};

/**
 * Registra una nueva matrícula en la base de datos.
 * @param {Object} payload - Datos formateados de la matrícula.
 */
export const crearMatricula = async (payload) => {
  const response = await api.post('/estudiante-app/matriculas/create', payload);
  return response.data;
};

/**
 * Obtiene el listado completo de matrículas registradas.
 */
export const getMatriculas = async () => {
  const response = await api.get('/estudiante-app/matriculas');
  return response.data;
};

/**
 * Elimina el registro de una matrícula por su ID.
 * @param {number|string} idMatricula - ID de la matrícula a eliminar.
 */
export const eliminarMatricula = async (idMatricula) => {
  const response = await api.delete(`/estudiante-app/matriculas/${idMatricula}`);
  return response.data;
};

/**
 * Obtiene el detalle de una matrícula por su ID.
 * @param {number|string} idMatricula - ID de la matrícula.
 */
export const getMatriculaById = async (idMatricula) => {
  const response = await api.get(`/estudiante-app/matriculas/${idMatricula}`);
  return response.data;
};
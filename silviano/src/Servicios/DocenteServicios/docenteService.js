
import api from '../../Servicios/api/api.js';

import { ValidarDocente } from '../../Util/validaciones/validacionDocente.js';
/**
 * Obtiene el listado completo de docentes registrados en el sistema.
 */
export const getDocentes = async () => {
  const response = await api.get('/estudiante-app/docentes');
  return response.data;
};
/**
 * Obtiene la información académica y personal del docente por su ID.
 */
 export const getDocenteById = async (idPersona) => {
   const response = await api.get(`/estudiante-app/docentes/${idPersona}`);
   return response.data;
 };
 
 /**
  * Actualiza el expediente del estudiante en la base de datos centralizada.
  */
 export const updateDocenteService = async (idPersona, payload) => {
   const response = await api.put(`/estudiante-app/docentes/${idPersona}`, payload);
   return response.data;
 };



export const ServicioValidado = async (docenteData) => {
     //Invoca el helper independiente de validación async (docenteData)
    const validacion = ValidarDocente(docenteData);

    if (!validacion.esValido) {
        // Lanza un error estructurado si no pasa las validaciones de cliente
        throw new Error(validacion.error);
    }

    // Envía el payload previamente sanitizado a la API REST de Spring Boot , validacion.payLoadFormateado
    console.log('Payload formateado para envío:', validacion.payLoadFormateado);
    const respuesta = await api.post('/estudiante-app/docentes/create', validacion.payload);
    return respuesta.data;
};




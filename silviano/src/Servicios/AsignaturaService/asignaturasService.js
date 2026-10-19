import api from '../api/api';
import asignaturasMockData from '../data/asignaturasDocenteMock.json';
import { ValidarAsignatura } from '../../Util/validaciones/validacionAsignatura.js';


export const asignaturasService = {
  /**
   * Obtiene las asignaturas del docente. Permite simular la respuesta del backend
   * filtrada por idDocente (vía JWT) mediante JSON local.
   */
  getAsignaturasDocente: async () => {
    try {
      // En producción:
      // const { data } = await api.get('/planes-estudio/mis-asignaturas');
      // return data;

      // Simulación de respuesta diferida con JSON local
      return new Promise((resolve) => {
        setTimeout(() => {
          const asignaturasFormateadas = asignaturasMockData.map((item) => ({
            label: `${item.asignatura_nombre} - ${item.grado_nombre} "${item.seccion_nombre}" (${item.nivel_academico})`,
            value: item.iddetalle_plan_de_estudio,
            idPlan_de_estudio: item.idPlan_de_estudio,
            idAsignatura: item.idAsignatura
          }));
          resolve(asignaturasFormateadas);
        }, 500);
      });
    } catch (error) {
      throw new Error('Error al cargar la carga académica del docente.');
    }
  }
};


/**
 * Obtiene el listado completo de docentes registrados en el sistema.
 */
export const getAsignaturas = async () => {
  const response = await api.get('/estudiante-app/asignatura');
  return response.data;
};

export const ServicioValidado = async (asignaturaData) => {
     //Invoca el helper independiente de validación async (docenteData)
    const validacion = ValidarAsignatura(asignaturaData);

    if (!validacion.esValido) {
        // Lanza un error estructurado si no pasa las validaciones de cliente
        throw new Error(validacion.error);
    }
  
    // Envía el payload previamente sanitizado a la API REST de Spring Boot , validacion.payLoadFormateado
    //console.log('Payload formateado para envío:', validacion.payloadFormateado);
    const respuesta = await api.post('/estudiante-app/asignatura/create',  validacion.payloadFormateado);
    return respuesta.data;
};


/**
 * Obtiene la información académica y de la signatur por su ID.
 */
 export const getAsignaturaById = async (idAsignatura) => {
   const response = await api.get(`/estudiante-app/asignatura/${idAsignatura}`);
   return response.data;
 };
 
 /**
  * Actualiza el expediente de la asignatura en la base de datos centralizada.
  */
 export const updateAsignaturaService = async (idAsignatura, payload) => {
   const response = await api.put(`/estudiante-app/asignatura/${idAsignatura}`, payload);
   return response.data;
 };



 /**
 * Elimina un registro de la signatura por su ID.
 */
export const deleteAsignatura = async (idAsignatura) => {
  const response = await api.delete(`/estudiante-app/asignatura/${idAsignatura}`);
  return response.data;
};





import api from '../../Servicios/api/api.js';


/**
 * Obtiene el listado completo de grados registrados en el sistema.
*/
export const getGrados = async () => {
  const response = await api.get('/estudiante-app/grados');
  return response.data;
}; 

export const getNivelEducativo = async () => {
  const response = await api.get('/estudiante-app/nivel-educativo');
  return response.data;
}; 

export const ServicioValidado = async (gradoInfo) => {
     //Invoca el helper independiente de validación async (gradoData)
   // const validacion = ValidarGrado(gradoData);

   /* if (!validacion.esValido) {
        // Lanza un error estructurado si no pasa las validaciones de cliente
        throw new Error(validacion.error);
    }*/

    // Envía el payload previamente sanitizado a la API REST de Spring Boot , validacion.payLoadFormateado
    console.log('Payload formateado para envío:' + gradoInfo);
    const respuesta = await api.post('estudiante-app/grados/create', gradoInfo);//, validacion.payload
    return respuesta.data;
};



/**
 * Consulta Grados Académicos filtrados por Nivel Educativo.
 */
export const obtenerGradosPorNivel = async (idNivel) => {
  if (!idNivel) return [];
  try {
    const response = await api.get(`/estudiante-app/nivel/${idNivel}`);
    const rawData = Array.isArray(response.data) ? response.data : [];

    return rawData.map((g) => ({
      label: g.nombre || g.nombreGrado,
      value: g.idGrado || g.id,
    }));
  } catch (error) {
    console.error(`Error al obtener grados para el nivel ${idNivel}:`, error);
    return [];
  }
};
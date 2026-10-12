
import api from '../../Servicios/api/api.js';
import { validarGrado, validarGradoDuplicado} from '../../Util/validaciones/ValidacionGenericas.js';

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
    /*const validacion = validarGrado(gradoInfo);

    if (!validacion.valido) {
        // Lanza un error estructurado si no pasa las validaciones de cliente
         throw new Error(
            Object.values(validacion.errores).join(' ')
        );
    }

    // Envía el payload previamente sanitizado a la API REST de Spring Boot , validacion.payLoadFormateado
    console.log('Payload formateado para envío:' + gradoInfo);
    const respuesta = await api.post('estudiante-app/grados/create', gradoInfo);//, validacion.payload
    return respuesta.data;*/

    // 1. Validar los campos del formulario.
  const validacion = validarGrado(gradoInfo);

  if (!validacion.valido) {
    const mensaje = Object.values(validacion.errores).join(' ');
    throw new Error(mensaje || 'Los datos del grado no son válidos.');
  }

  // 2. Verificar si el nombre ya existe.
  const existe = await validarGradoDuplicado(gradoInfo.nombre);

  if (existe) {
    throw new Error(
      `Ya existe un grado registrado con el nombre "${gradoInfo.nombre.trim()}".`
    );
  }

  // 3. Registrar el grado si no existe.
  try {
    const respuesta = await api.post(
      '/estudiante-app/grados/create',
      gradoInfo
    );

    return respuesta.data;
  } catch (error) {
    console.error(
      'Error al registrar el grado:',
      error.response?.data || error.message
    );

    throw error;
  }
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
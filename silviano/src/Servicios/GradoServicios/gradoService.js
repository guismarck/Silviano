
import api from '../../Servicios/api/api.js';
import {
  validarGrado, validarGradoDuplicado,
  validarIdGrado, validardatosGrados

} from '../../Util/validaciones/ValidacionGenericas.js';

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

/**
 * Actualiza únicamente el nombre y el nivel educativo de un grado.
 */
export const ServicioValidado = async (gradoInfo) => {
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
 * Actualiza el nombre y el nivel educativo de un grado.
 *
 * @param {number|string} id ID del grado que se actualizará.
 * @param {object} gradoInfo Datos nuevos del grado.
 * @returns {Promise<object>} Grado actualizado por el backend.
 */
export const actualizarGrado = async (id, gradoInfo) => {
  // 1. Validar el identificador.
  const errorId = validarIdGrado(id);

  if (errorId !== true) {
    throw new Error(errorId);
  }

  // 2. Validar el nombre y el nivel educativo.
  const validacion = validardatosGrados(gradoInfo);

  if (!validacion.valido) {
    throw new Error(
      Object.values(validacion.errores).join(' ')
    );
  }

  // 3. Preparar exclusivamente los campos permitidos.
  const payload = {
    nombre: gradoInfo.nombre.trim(),
    nivelEducativo: {
      idnivel: Number(gradoInfo.nivelEducativo.idnivel)
    }
  };

  try {
    // 4. Comprobar si el nombre está duplicado.
    const responseGrados = await api.get('/estudiante-app/grados');

    const grados = Array.isArray(responseGrados.data)
      ? responseGrados.data
      : [];

    const normalizar = (nombre) =>
      String(nombre ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const nombreBuscado = normalizar(payload.nombre);

    const duplicado = grados.some((grado) => {
      const idRegistrado = grado.idGrado ?? grado.id;
      const nombreRegistrado = grado.nombre ?? grado.nombreGrado;

      // No comparar el grado consigo mismo.
      if (String(idRegistrado) === String(id)) {
        return false;
      }

      return normalizar(nombreRegistrado) === nombreBuscado;
    });

    if (duplicado) {
      throw new Error(
        `Ya existe un grado con el nombre "${payload.nombre}".`
      );
    }

    // 5. Ejecutar la actualización.
    const response = await api.put(
      `/estudiante-app/grados/${id}`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error al actualizar el grado:',
      error.response?.data || error.message
    );

    if (error instanceof Error && !error.response) {
      throw error;
    }

    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      'No se pudo actualizar el grado.';

    throw new Error(mensaje);
  }
};
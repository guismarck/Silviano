
import api from '../../Servicios/api/api.js';

import {
    validarGrado,
    validarGradoDuplicado,
    validarIdGrado,
    validardatosGrados
} from '../../Util/validaciones/ValidacionGenericas.js';

/**
 * Normaliza los nombres para comparar grados sin distinguir
 * mayúsculas, minúsculas ni tildes.
 */
const normalizarNombre = (nombre) =>
    String(nombre ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

/**
 * Obtiene todos los grados registrados.
 */
export const getGrados = async () => {
    const response = await api.get('/estudiante-app/grados');

    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene los niveles educativos.
 */
export const getNivelEducativo = async () => {
    const response = await api.get('/estudiante-app/nivel-educativo');

    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene los grados asociados a un nivel educativo.
 */
export const obtenerGradosPorNivel = async (idNivel) => {
    if (idNivel === null || idNivel === undefined || idNivel === '') {
        return [];
    }

    try {
        const response = await api.get(
            `/estudiante-app/nivel/${idNivel}`
        );

        const datos = Array.isArray(response.data)
            ? response.data
            : [];

        return datos.map((grado) => ({
            label: grado.nombre ?? grado.nombreGrado ?? '',
            value: grado.idGrado ?? grado.id
        }));
    } catch (error) {
        console.error(
            'Error al obtener grados por nivel:',
            error.response?.data || error.message
        );

        throw error;
    }
};

/**
 * Registra un grado nuevo.
 */
export const ServicioValidado = async (gradoInfo) => {
    const validacion = validarGrado(gradoInfo);

    if (!validacion.valido) {
        throw new Error(
            Object.values(validacion.errores).join(' ') ||
            'Los datos del grado no son válidos.'
        );
    }

    const existe = await validarGradoDuplicado(
        gradoInfo.nombre.trim()
    );

    throw new Error("Error al validar");
  }

/**
 * Elimina un grado académico por su identificador.
 *
 * @param {number|string} idGrado ID del grado que se eliminará.
 * @returns {Promise<boolean>} true si la petición fue exitosa.
 */
export const eliminarGradoPorId = async (idGrado) => {
  if (
    idGrado === null ||
    idGrado === undefined ||
    idGrado === '' ||
    !Number.isInteger(Number(idGrado)) ||
    Number(idGrado) <= 0
  ) {
    throw new Error('El identificador del grado no es válido.');
  }

  try {
    await api.delete(`/estudiante-app/grados/${idGrado}`);

    // El controlador devuelve void; una respuesta HTTP exitosa
    // indica que la petición de eliminación se completó.
    return true;
  } catch (error) {
    console.error(
      'Error al eliminar el grado:',
      error.response?.data || error.message
    );

    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      'No se pudo eliminar el grado.';

    throw new Error(mensaje);
  }
};

// Normaliza el nombre para que la búsqueda ignore mayúsculas,
// espacios al inicio/final y tildes.

const normalizarTexto = (texto) =>
  String(texto ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();


// Consulta los grados por nombre y/o nivel educativo.
export const buscarGrados = async ({
  nombre = '',
  idNivel = ''
} = {}) => {
  let grados = [];

  if (idNivel !== '' && idNivel !== null) {
    // Consulta los grados de un nivel específico.
    const response = await api.get(
      `/estudiante-app/nivel/${idNivel}`
    );

    grados = Array.isArray(response.data)
      ? response.data
      : [];
  } else {
    // Consulta todos los grados.
    const response = await api.get('/estudiante-app/grados');

    grados = Array.isArray(response.data)
      ? response.data
      : [];
  }

  // Aplica el filtro por nombre.
  const nombreBuscado = normalizarTexto(nombre);

  if (nombreBuscado) {
    grados = grados.filter((grado) => {
      const nombreGrado =
        grado.nombre ?? grado.nombreGrado ?? '';

      return normalizarTexto(nombreGrado)
        .includes(nombreBuscado);
    });
  }

  return grados;
};

export const actualizarGrado = async (id, gradoInfo) => {
    // 1. Validar el identificador.
    const errorId = validarIdGrado(id);

    if (errorId !== true) {
        throw new Error(
            typeof errorId === 'string'
                ? errorId
                : 'El identificador del grado no es válido.'
        );
    }

    // 2. Validar los campos del formulario.
    const validacion = validardatosGrados(gradoInfo);

    if (!validacion.valido) {
        throw new Error(
            Object.values(validacion.errores).join(' ') ||
            'Los datos del grado no son válidos.'
        );
    }

    // 3. Preparar el JSON que espera el backend.
    const idNivel = Number(gradoInfo.nivelEducativo?.idnivel);

    if (!Number.isInteger(idNivel) || idNivel <= 0) {
        throw new Error('Debes seleccionar un nivel educativo válido.');
    }

    const payload = {
        nombre: gradoInfo.nombre.trim(),
        nivelEducativo: {
            idnivel: idNivel
        }
    };

    try {
        // 4. Consultar los grados para detectar duplicados.
        const grados = await getGrados();

        const nombreBuscado = normalizarNombre(payload.nombre);

        const duplicado = grados.some((grado) => {
            const idRegistrado = grado.idGrado ?? grado.id;
            const nombreRegistrado =
                grado.nombre ?? grado.nombreGrado;

            // Excluir el mismo grado que estamos editando.
            if (String(idRegistrado) === String(id)) {
                return false;
            }

            return (
                normalizarNombre(nombreRegistrado) === nombreBuscado
            );
        });

        if (duplicado) {
            throw new Error(
                `Ya existe otro grado con el nombre "${payload.nombre}".`
            );
        }

        // 5. Actualizar el registro existente.
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

        // Conservar los mensajes de validación y duplicados.
        if (!error.response) {
            throw error;
        }

        throw new Error(
            error.response.data?.mensaje ||
            error.response.data?.message ||
            'No se pudo actualizar el grado.'
        );
    }
};


// Consulta los niveles para llenar el Dropdown.
export const obtenerNivelesParaBusqueda = async () => {
  const response = await api.get('/nivel-educativo');

  return Array.isArray(response.data)
    ? response.data
    : [];
};


import api from '../../Servicios/api/api.js';



// Regex para cédula nicaragüense con o sin guiones: 401-010497-0002C o 4010104970002C
const REGEX_CEDULA_NICARAGUA = /^(\d{3})-?(\d{2})(\d{2})(\d{2})-?(\d{4})([A-Za-zA-Z])$/;
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s]+$/;

/**
 * Normaliza y valida una cédula nicaragüense, extrayendo la fecha de nacimiento.
 * @param {string} cedula - String de la cédula (ej: "401-010497-0002C")
 * @returns {Object} { esValida: boolean, fechaNacimiento: Date|null, fechaString: string|null, error: string|null }
 */


export  const extraerFechaNacimientoCedula = (cedula) => {
    if (!cedula || typeof cedula !== 'string') {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: "La cédula proporcionada está vacía o es inválida." };
    }

    const cedulaLimpia = cedula.trim();
    const match = cedulaLimpia.match(REGEX_CEDULA_NICARAGUA);

    if (!match) {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: "El formato de la cédula es incorrecto. Ejemplo válido: 401-010497-0002C" };
    }

    // Extracción de componentes desde la expresión regular
    const dia = parseInt(match[2], 10);
    const mes = parseInt(match[3], 10);
    const anioDosDigitos = parseInt(match[4], 10);

    // Validar Mes (1 - 12)
    if (mes < 1 || mes > 12) {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: `El mes '${match[3]}' extraído de la cédula es inválido.` };
    }

    // Cálculo del Año de 4 dígitos con regla de pivote
    const anioActual = new Date().getFullYear(); // 2026
    const dosDigitosAnioActual = anioActual % 100; // 26
    const sigloActual = Math.floor(anioActual / 100) * 100; // 2000

    // Si el año de la cédula es mayor al año actual de 2 dígitos, pertenece al siglo anterior (1900s)
    let anioCompleto = (anioDosDigitos > dosDigitosAnioActual) 
        ? (sigloActual - 100) + anioDosDigitos  // ej: 97 > 26 -> 1900 + 97 = 1997
        : sigloActual + anioDosDigitos;        // ej: 15 <= 26 -> 2000 + 15 = 2015

    // Validar número de días según el mes y año bisiesto
    const diasEnMes = new Date(anioCompleto, mes, 0).getDate();
    if (dia < 1 || dia > diasEnMes) {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: `El día '${match[2]}' no es válido para el mes ${mes} del año ${anioCompleto}.` };
    }

    // Construcción del objeto Date y formato ISO YYYY-MM-DD
    const fechaObjeto = new Date(anioCompleto, mes - 1, dia);
    
    // Formatear día y mes con cero a la izquierda
    const mmStr = String(mes).padStart(2, '0');
    const ddStr = String(dia).padStart(2, '0');
    const fechaString = `${anioCompleto}-${mmStr}-${ddStr}`;

    return {
        esValida: true,
        fechaNacimiento: fechaObjeto,
        fechaString: fechaString,
        error: null
    };
};



/**
 * Validaciones del módulo de grados académicos.
 * Compatible con react-hook-form.
 */

/**
 * Valida el nombre del grado.
 * @param {string} nombre
 * @returns {true|string}
 */
export const validarNombreGrado = (nombre) => {
    if (typeof nombre !== 'string' || !nombre.trim()) {
        return 'El nombre del grado es obligatorio.';
    }

    const nombreLimpio = nombre.trim();

    if (nombreLimpio.length < 2) {
        return 'El nombre debe tener al menos 2 caracteres.';
    }

    if (nombreLimpio.length > 50) {
        return 'El nombre no puede superar los 50 caracteres.';
    }

    return true;
};

/**
 * Valida que se seleccione un nivel educativo.
 * @param {string|number|null} idnivel
 * @returns {true|string}
 */
export const validarNivelEducativo = (idnivel) => {
    if (
        idnivel === '' ||
        idnivel === null ||
        idnivel === undefined
    ) {
        return 'Debe seleccionar un nivel educativo.';
    }

    return true;
};

/**
 * Valida el formulario completo de grado.
 * @param {object} datos
 * @returns {{valido: boolean, errores: object}}
 */
export const validarGrado = (datos) => {
    const errores = {};

    const resultadoNombre = validarNombreGrado(datos?.nombre);

    const resultadoNivel = validarNivelEducativo(
        datos?.nivelEducativo?.idnivel
    );

    if (resultadoNombre !== true) {
        errores.nombre = resultadoNombre;
    }

    if (resultadoNivel !== true) {
        errores.nivelEducativo = resultadoNivel;
    }

    return {
        valido: Object.keys(errores).length === 0,
        errores
    };
};


//javascript
/**
 * Normaliza el nombre para comparar grados.
 * Ignora mayúsculas, minúsculas, tildes y espacios externos.
 */
const normalizarNombre = (nombre) => {
  return String(nombre ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

/**
 * Verifica si ya existe un grado con el mismo nombre.
 *
 * @param {string} nombre - Nombre del grado que se desea registrar.
 * @returns {Promise<boolean>} true si existe, false si no existe.
 */
export const validarGradoDuplicado = async (nombre) => {
  if (!nombre || !nombre.trim()) {
    return false;
  }

  try {
    const response = await api.get('/estudiante-app/grados');

    const grados = Array.isArray(response.data)
      ? response.data
      : [];

    const nombreBuscado = normalizarNombre(nombre);

    return grados.some((grado) => {
      const nombreRegistrado = grado.nombre ?? grado.nombreGrado;

      return normalizarNombre(nombreRegistrado) === nombreBuscado;
    });
  } catch (error) {
    console.error(
      'Error al verificar si el grado ya existe:',
      error.response?.data || error.message
    );

    // No permitir continuar si no se pudo comprobar.
    throw new Error(
      'No se pudo verificar si el grado ya existe. Intente nuevamente.'
    );
  }
};

/**
 * Validaciones independientes para actualizar un grado académico.
 */

/**
 * Valida el nombre del grado.
 */
export const validarNombreActualizacion = (nombre) => {
  if (typeof nombre !== 'string' || !nombre.trim()) {
    return 'El nombre del grado es obligatorio.';
  }

  const nombreLimpio = nombre.trim();

  if (nombreLimpio.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }

  if (nombreLimpio.length > 50) {
    return 'El nombre no puede superar los 50 caracteres.';
  }

  return true;
};

/**
 * Valida que se seleccione un nivel educativo.
 */
export const validarNivelActualizacion = (idnivel) => {
  if (
    idnivel === '' ||
    idnivel === null ||
    idnivel === undefined ||
    !Number.isInteger(Number(idnivel)) ||
    Number(idnivel) <= 0
  ) {
    return 'Debe seleccionar un nivel educativo válido.';
  }

  return true;
};

/**
 * Valida el identificador del grado.
 */
export const validarIdGrado = (id) => {
  if (
    id === '' ||
    id === null ||
    id === undefined ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    return 'El identificador del grado no es válido.';
  }

  return true;
};

/**
 * Valida todos los datos antes de actualizar.
 *
 * Estructura esperada:
 * {
 *   nombre: "Primer Grado",
 *   nivelEducativo: { idnivel: 1 }
 * }
 */
export const validardatosGrados = (datos) => {
  const errores = {};

  const resultadoNombre = validarNombreActualizacion(
    datos?.nombre
  );

  const resultadoNivel = validarNivelActualizacion(
    datos?.nivelEducativo?.idnivel
  );

  if (resultadoNombre !== true) {
    errores.nombre = resultadoNombre;
  }

  if (resultadoNivel !== true) {
    errores.nivelEducativo = resultadoNivel;
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
};

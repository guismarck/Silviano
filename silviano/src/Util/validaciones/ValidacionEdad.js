/**
 * Módulo independiente: validación de edad mínima en el registro.
 * Ubicación: src/Util/validaciones/validacionEdad.js
 *
 * Reglas (años CUMPLIDOS):
 *  - Estudiante: al menos 5 años.
 *  - Tutor:      al menos 18 años.
 *
 * Para cambiar una regla basta con editar las constantes de abajo.
 */

export const EDAD_MINIMA_ESTUDIANTE = 5;
export const EDAD_MINIMA_TUTOR = 18;

/**
 * Años cumplidos a la fecha de hoy.
 * @param {Date} fechaNacimiento
 * @param {Date} [hoy] - Solo se cambia en pruebas.
 * @returns {number|null} null si la fecha no es válida.
 */
export const calcularEdad = (fechaNacimiento, hoy = new Date()) => {
    if (!(fechaNacimiento instanceof Date) || isNaN(fechaNacimiento)) {
        return null;
    }

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

    const diferenciaMes = hoy.getMonth() - fechaNacimiento.getMonth();

    // Todavía no cumple años este año.
    if (
        diferenciaMes < 0 ||
        (diferenciaMes === 0 && hoy.getDate() < fechaNacimiento.getDate())
    ) {
        edad -= 1;
    }

    return edad;
};

/**
 * Valida una edad mínima.
 * @param {Date|null} fechaNacimiento
 * @param {number} edadMinima
 * @param {string} persona - 'estudiante' o 'tutor' (para el mensaje).
 * @param {Date} [hoy]
 * @returns {string|null} Mensaje de error o null si es válida.
 */
export const validarEdadMinima = (fechaNacimiento, edadMinima, persona, hoy = new Date()) => {
    if (!fechaNacimiento) {
        return `La fecha de nacimiento del ${persona} es obligatoria para verificar su edad.`;
    }

    const edad = calcularEdad(fechaNacimiento, hoy);

    if (edad === null) {
        return `La fecha de nacimiento del ${persona} no es válida.`;
    }

    if (edad < 0) {
        return `La fecha de nacimiento del ${persona} no puede ser futura.`;
    }

    if (edad < edadMinima) {
        return `El ${persona} debe tener al menos ${edadMinima} años cumplidos (edad actual: ${edad}).`;
    }

    return null;
};

export const validarEdadEstudiante = (fechaNacimiento, hoy = new Date()) =>
    validarEdadMinima(fechaNacimiento, EDAD_MINIMA_ESTUDIANTE, 'estudiante', hoy);

export const validarEdadTutor = (fechaNacimiento, hoy = new Date()) =>
    validarEdadMinima(fechaNacimiento, EDAD_MINIMA_TUTOR, 'tutor', hoy);
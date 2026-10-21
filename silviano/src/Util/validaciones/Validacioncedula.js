/**
 * Utilidades para la cédula nicaragüense y la fecha de nacimiento.
 * Ubicación sugerida: src/Util/validaciones/validacionCedula.js
 *
 * Formato de cédula: 000-DDMMAA-0000X
 *   - 3 dígitos: código del municipio
 *   - 6 dígitos: fecha de nacimiento (día, mes, año de 2 dígitos)
 *   - 4 dígitos + 1 letra: consecutivo y letra de control
 */
 
const REGEX_CEDULA = /^(\d{3})-(\d{2})(\d{2})(\d{2})-(\d{4})([A-Z])$/;
 
/** Da formato 000-000000-0000X mientras el usuario escribe. */
export const formatearCedula = (valor = '') => {
    const limpio = valor
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, '')
        .slice(0, 14);
 
    let resultado = limpio.slice(0, 3);
 
    if (limpio.length > 3) resultado += '-' + limpio.slice(3, 9);
    if (limpio.length > 9) resultado += '-' + limpio.slice(9, 14);
 
    return resultado;
};
 
/**
 * Extrae la fecha de nacimiento (DDMMAA) de una cédula completa.
 * Devuelve un Date, o null si el formato o la fecha no son válidos.
 */
export const extraerFechaDeCedula = (cedula = '') => {
    const m = REGEX_CEDULA.exec(cedula);
    if (!m) return null;
 
    const dia = Number(m[2]);
    const mes = Number(m[3]);
    const yy = Number(m[4]);
 
    // El año trae solo 2 dígitos: se asume 20AA y, si esa fecha
    // queda en el futuro, se toma 19AA.
    let anio = 2000 + yy;
    let fecha = new Date(anio, mes - 1, dia);
 
    if (fecha > new Date()) {
        anio = 1900 + yy;
        fecha = new Date(anio, mes - 1, dia);
    }
 
    // Descarta fechas inexistentes (mes 21, día 32, 30 de febrero...).
    if (
        fecha.getFullYear() !== anio ||
        fecha.getMonth() !== mes - 1 ||
        fecha.getDate() !== dia
    ) {
        return null;
    }
 
    return fecha;
};
 
const mismaFecha = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
 
/**
 * Validación de fecha de nacimiento reutilizable (estudiante y tutor).
 * @param {Date|null} fecha
 * @param {string} etiqueta - Ej.: 'del estudiante', 'del tutor'
 * @returns {string|null} Mensaje de error o null si es válida / está vacía.
 */
export const validarFechaNacimiento = (fecha, etiqueta) => {
    if (!fecha) return null;
 
    if (!(fecha instanceof Date) || isNaN(fecha)) {
        return `La fecha de nacimiento ${etiqueta} no es válida.`;
    }
 
    if (fecha > new Date()) {
        return `La fecha de nacimiento ${etiqueta} no puede ser futura.`;
    }
 
    return null;
};
 
/**
 * La cédula es opcional. Si se escribe, debe tener el formato correcto,
 * una fecha real y coincidir con la fecha de nacimiento seleccionada.
 * @returns {string|null} Mensaje de error o null si es válida / está vacía.
 */
export const validarCedula = (cedula, fecha, etiqueta) => {
    if (!cedula) return null;
 
    if (!REGEX_CEDULA.test(cedula)) {
        return `La cédula ${etiqueta} debe tener el formato 000-000000-0000X.`;
    }
 
    const fechaCedula = extraerFechaDeCedula(cedula);
 
    if (!fechaCedula) {
        return `La cédula ${etiqueta} contiene una fecha de nacimiento inválida.`;
    }
 
    if (fecha && !mismaFecha(fecha, fechaCedula)) {
        return `La fecha de nacimiento ${etiqueta} no coincide con la de la cédula.`;
    }
 
    return null;
};

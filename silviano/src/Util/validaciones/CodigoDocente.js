/**
 * Generador del código de docente.
 * Ubicación sugerida: src/Util/validaciones/CodigoDocente.js
 *
 * Formato: INICIALES-DDMMAA  (sin consecutivo)
 * La fecha es la de nacimiento, que en el formulario se llena sola
 * a partir de la cédula.
 *
 * Ejemplo: Guismarck Josue Nuñez Gonzalez, 01/04/1997 -> GJNG-010497
 */

// Palabras que no aportan inicial: "María de los Ángeles" -> M, A
const PARTICULAS = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y'];

const iniciales = (texto = '') =>
    texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita tildes: Ñ -> N, Á -> A
        .toUpperCase()
        .split(/\s+/)
        .filter(palabra => palabra && !PARTICULAS.includes(palabra))
        .map(palabra => palabra[0])
        .join('')
        //.replace(/[^A-Z]/g, ''); // solo letras

/**
 * @param {string} nombres
 * @param {string} apellidos
 * @param {Date|null} fecha - Fecha de nacimiento (la que sale de la cédula)
 * @returns {string} Código generado, o '' si faltan nombres, apellidos o fecha.
 */
export const generarCodigoDocente = (nombres, apellidos, fecha) => {
    const inicialesNombres = iniciales(nombres);
    const inicialesApellidos = iniciales(apellidos);

    if (
        !inicialesNombres ||
        !inicialesApellidos ||
        !(fecha instanceof Date) ||
        isNaN(fecha)
    ) {
        return '';
    }

    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const aa = String(fecha.getFullYear()).slice(-2);

    return `${inicialesNombres}${inicialesApellidos}-${dd}${mm}${aa}`;
};
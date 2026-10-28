/**
 * Generador del código de estudiante.
 * Ubicación sugerida: src/Util/validaciones/CodigoEstudiante.js
 *
 * Formato: INICIALES-DDMMAA  (sin consecutivo)
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
        .join('');

/**
 * @param {string} nombres
 * @param {string} apellidos
 * @param {Date|null} fecha - Fecha de nacimiento
 * @returns {string} Código generado, o '' si faltan datos.
 *
 * Nota: ya no se usa la lista de códigos existentes (antes servía para el
 * consecutivo 0001, 0002...). Los llamados que todavía pasen un cuarto
 * argumento siguen funcionando: simplemente se ignora.
 */
export const generarCodigoEstudiante = (nombres, apellidos, fecha) => {
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
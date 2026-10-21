/**
 * Generador del código de estudiante.
 * Ubicación sugerida: src/Util/validaciones/codigoEstudiante.js
 *
 * Formato: INICIALES-DDMMAA-0001
 * Ejemplo: Guismarck Josue Nuñez Gonzalez, 01/04/1997 -> GJNG-010497-0001
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
 * @param {string[]} codigosExistentes - Códigos ya registrados, para el consecutivo
 * @returns {string} Código generado, o '' si faltan datos.
 */
export const generarCodigoEstudiante = (
    nombres,
    apellidos,
    fecha,
    codigosExistentes = []
) => {
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
 
    const prefijo = `${inicialesNombres}${inicialesApellidos}-${dd}${mm}${aa}-`;
 
    // Busca el consecutivo más alto con el mismo prefijo y suma 1.
    const mayor = codigosExistentes
        .filter(codigo => typeof codigo === 'string' && codigo.startsWith(prefijo))
        .map(codigo => parseInt(codigo.slice(prefijo.length), 10))
        .filter(numero => !isNaN(numero))
        .reduce((max, numero) => Math.max(max, numero), 0);
 
    return `${prefijo}${String(mayor + 1).padStart(4, '0')}`;
};

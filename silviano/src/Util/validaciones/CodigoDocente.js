/**
 * Generador del código de docente.
 * Ubicación sugerida: src/Util/validaciones/codigoDocente.js
 *
 * Formato: INICIALES + consecutivo de 3 dígitos
 * Ejemplo: Guismarck Josue Nuñez Gonzalez -> GJNG001
 *
 * El consecutivo es por grupo de iniciales: el segundo docente con
 * iniciales GJNG recibe GJNG002, y así sucesivamente.
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
        .replace(/[^A-Z]/g, ''); // solo letras: el prefijo queda seguro para la expresión regular

/**
 * @param {string} nombres
 * @param {string} apellidos
 * @param {string[]} codigosExistentes - Códigos de docentes ya registrados
 * @returns {string} Código generado, o '' si faltan nombres o apellidos.
 */
export const generarCodigoDocente = (
    nombres,
    apellidos,
    codigosExistentes = []
) => {
    const inicialesNombres = iniciales(nombres);
    const inicialesApellidos = iniciales(apellidos);

    if (!inicialesNombres || !inicialesApellidos) return '';

    const prefijo = `${inicialesNombres}${inicialesApellidos}`;

    // Solo cuentan los códigos exactos PREFIJO + dígitos. Así "ABC001"
    // no se confunde con el prefijo "AB".
    const patron = new RegExp(`^${prefijo}(\\d+)$`);

    const mayor = codigosExistentes
        .map(codigo =>
            typeof codigo === 'string'
                ? patron.exec(codigo.trim().toUpperCase())
                : null
        )
        .filter(Boolean)
        .map(coincidencia => parseInt(coincidencia[1], 10))
        .reduce((max, numero) => Math.max(max, numero), 0);

    return `${prefijo}${String(mayor + 1).padStart(3, '0')}`;
};
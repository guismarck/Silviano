/**
 * Módulo independiente: validación de duplicados y sugerencia de códigos
 * para asignaturas.
 *
 * Ubicación sugerida: src/Util/validaciones/validacionDuplicadosAsignatura.js
 *
 * No llama al backend: recibe la lista de asignaturas ya cargada
 * y devuelve resultados, así que se puede reutilizar al agregar y al editar.
 */

// Sufijos de nivel usados al sugerir códigos (ej. LYL-PRIM-01, LYL-SEC-01).
export const NIVELES_CODIGO = [
    { etiqueta: 'Primaria', sufijo: 'PRIM' },
    { etiqueta: 'Secundaria', sufijo: 'SEC' }
];

/**
 * Normaliza un nombre para compararlo sin distinguir mayúsculas,
 * tildes ni espacios sobrantes. "Lengua  y Literatura " == "lengua y literatura"
 */
export const normalizarTexto = (texto) =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

/**
 * Normaliza un código: sin espacios y en mayúsculas.
 */
export const normalizarCodigo = (codigo) =>
    String(codigo ?? '')
        .replace(/\s+/g, '')
        .toUpperCase();

const idDe = (asignatura) => asignatura?.idAsignatura ?? asignatura?.idasignatura ?? null;

const esOtraAsignatura = (asignatura, idExcluir) =>
    idExcluir === null ||
    idExcluir === undefined ||
    String(idDe(asignatura)) !== String(idExcluir);

/**
 * Busca una asignatura con el mismo nombre.
 * @param {string} nombre
 * @param {Array} asignaturas - Lista registrada.
 * @param {number|string|null} idExcluir - ID a ignorar (útil al editar).
 * @returns {Object|undefined} La asignatura repetida, si existe.
 */
export const buscarNombreDuplicado = (nombre, asignaturas, idExcluir = null) => {
    const buscado = normalizarTexto(nombre);
    if (!buscado) return undefined;

    return (Array.isArray(asignaturas) ? asignaturas : []).find(
        (a) => esOtraAsignatura(a, idExcluir) && normalizarTexto(a.nombre) === buscado
    );
};

/**
 * Busca una asignatura con el mismo código.
 */
export const buscarCodigoDuplicado = (codigo, asignaturas, idExcluir = null) => {
    const buscado = normalizarCodigo(codigo);
    if (!buscado) return undefined;

    return (Array.isArray(asignaturas) ? asignaturas : []).find(
        (a) => esOtraAsignatura(a, idExcluir) && normalizarCodigo(a.codigo) === buscado
    );
};

/**
 * Genera el prefijo del código a partir del nombre.
 *  - Varias palabras: iniciales de cada palabra  -> "Lengua y Literatura" = "LYL"
 *  - Una palabra:     sus tres primeras letras   -> "Matemáticas" = "MAT"
 *  - Si quedan menos de 3 letras, usa las tres primeras del nombre.
 */
export const generarPrefijo = (nombre) => {
    const limpio = String(nombre ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();

    const palabras = limpio.split(/[^A-Z]+/).filter(Boolean);

    if (palabras.length === 0) return '';

    let prefijo =
        palabras.length === 1
            ? palabras[0].slice(0, 3)
            : palabras.map((p) => p[0]).join('').slice(0, 5);

    if (prefijo.length < 3) {
        prefijo = palabras.join('').slice(0, 3);
    }

    return prefijo;
};

/**
 * Sugiere códigos libres (uno por nivel) para un nombre de asignatura.
 * NO crea nada: solo devuelve opciones para que el usuario elija.
 *
 * @param {string} nombre
 * @param {Array<string>} codigosExistentes
 * @returns {Array<{etiqueta: string, codigo: string}>}
 *   Ej. [{ etiqueta: 'Primaria', codigo: 'LYL-PRIM-01' }, { etiqueta: 'Secundaria', codigo: 'LYL-SEC-01' }]
 */
export const sugerirCodigos = (nombre, codigosExistentes = []) => {
    const prefijo = generarPrefijo(nombre);
    if (!prefijo) return [];

    const ocupados = new Set(codigosExistentes.map(normalizarCodigo));

    return NIVELES_CODIGO.map(({ etiqueta, sufijo }) => {
        let numero = 1;
        let codigo = '';

        // Busca el primer correlativo libre: -01, -02, -03...
        do {
            codigo = `${prefijo}-${sufijo}-${String(numero).padStart(2, '0')}`;
            numero += 1;
        } while (ocupados.has(codigo));

        return { etiqueta, codigo };
    });
};

/**
 * Valida que el nombre y el código no estén repetidos.
 * Si el nombre o el código están vacíos no marca error aquí:
 * eso lo valida ValidarAsignatura.
 *
 * @returns {{
 *   esValido: boolean,
 *   error: string|null,
 *   errores: { nombre: string|null, codigo: string|null },
 *   sugerencias: Array<{etiqueta: string, codigo: string}>
 * }}
 */
export const validarDuplicadosAsignatura = (asignaturaInfo, asignaturas, idExcluir = null) => {
    const nombre = asignaturaInfo?.nombre ?? '';
    const codigo = asignaturaInfo?.codigo ?? '';

    const errores = { nombre: null, codigo: null };

    const nombreRepetido = buscarNombreDuplicado(nombre, asignaturas, idExcluir);
    if (nombreRepetido) {
        errores.nombre = `Ya existe una asignatura llamada "${String(nombreRepetido.nombre).trim()}".`;
    }

    const codigoRepetido = buscarCodigoDuplicado(codigo, asignaturas, idExcluir);
    const sugerencias = sugerirCodigos(
        nombre,
        (Array.isArray(asignaturas) ? asignaturas : []).map((a) => a.codigo)
    );

    if (codigoRepetido) {
        const opciones = sugerencias.map((s) => s.codigo).join(' o ');
        errores.codigo =
            `El código "${normalizarCodigo(codigo)}" ya está registrado en "${String(codigoRepetido.nombre).trim()}".` +
            (opciones ? ` Te sugiero: ${opciones}.` : '');
    }

    const mensajes = [errores.nombre, errores.codigo].filter(Boolean);

    return {
        esValido: mensajes.length === 0,
        error: mensajes.length ? mensajes.join(' ') : null,
        errores,
        sugerencias
    };
};
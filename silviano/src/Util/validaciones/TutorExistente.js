/**
 * Utilidades para reutilizar tutores ya registrados.
 * Ubicación: src/Util/validaciones/tutorExistente.js
 *
 * - aTutorExistente: convierte lo que devuelve GET /estudiante-app/tutores
 *   en un objeto con la misma forma que usa el formulario (tutorInfo).
 *   Si tu backend devuelve algún campo con otro nombre, es el ÚNICO lugar
 *   que hay que ajustar (ver la función "tomar" y las claves de abajo).
 * - buscarCoincidencias: detecta tutores que podrían ser el mismo que se
 *   está escribiendo (cédula igual = bloquea; nombre o teléfono = solo avisa).
 */

export const normalizarTexto = (texto = '') =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const normalizarCedula = (cedula = '') =>
    String(cedula ?? '')
        .replace(/[^0-9A-Za-z]/g, '')
        .toUpperCase();

const soloDigitos = (valor = '') => String(valor ?? '').replace(/\D/g, '');

const aTexto = (valor) =>
    valor === null || valor === undefined ? '' : String(valor).trim();

/** Primer valor no vacío entre varias claves posibles (también dentro de "persona"). */
const tomar = (objeto, ...claves) => {
    for (const clave of claves) {
        const valor = objeto?.[clave] ?? objeto?.persona?.[clave];
        if (valor !== undefined && valor !== null && valor !== '') return valor;
    }
    return '';
};

/** "1985-04-10" -> Date local (evita el desfase de un día por zona horaria). */
export const parsearFecha = (valor) => {
    if (!valor) return null;
    if (valor instanceof Date) return isNaN(valor) ? null : valor;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
    if (!m) return null;

    const fecha = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(fecha) ? null : fecha;
};

/**
 * Convierte un tutor del backend al formato del formulario.
 * Devuelve null si no trae un idpersona válido (no se podría reutilizar).
 */
export const aTutorExistente = (crudo) => {
    if (!crudo) return null;

    // Por si el backend devuelve { ..., tutor: {...} }
    const t =
        crudo.tutor && typeof crudo.tutor === 'object'
            ? { ...crudo, ...crudo.tutor }
            : crudo;

    const idpersona = Number(tomar(t, 'idpersona', 'idPersona', 'id'));
    if (!Number.isInteger(idpersona) || idpersona <= 0) return null;

    const sexoCrudo = aTexto(tomar(t, 'sexo')).toUpperCase();
    const partidaCruda = aTexto(tomar(t, 'partida_nacimiento', 'partidaNacimiento')).toLowerCase();

    const tutor = {
        idpersona,
        nombre_completo: aTexto(tomar(t, 'nombre_completo', 'nombreCompleto', 'nombres')),
        apellido_completo: aTexto(tomar(t, 'apellido_completo', 'apellidoCompleto', 'apellidos')),
        sexo: sexoCrudo.startsWith('F') ? 'F' : sexoCrudo.startsWith('M') ? 'M' : '',
        direccion: aTexto(tomar(t, 'direccion')),
        partida_nacimiento: partidaCruda === 'si' || partidaCruda === 'no' ? partidaCruda : 'no',
        fecha_nacimiento: parsearFecha(tomar(t, 'fecha_nacimiento', 'fechaNacimiento')),
        cedula: aTexto(tomar(t, 'cedula')),
        ocupacion: aTexto(tomar(t, 'ocupacion')),
        telefonoPrincipal: aTexto(tomar(t, 'telefonoPrincipal', 'telefono_principal')),
        telefonoSecundario: aTexto(tomar(t, 'telefonoSecundario', 'telefono_secundario'))
    };

    const nombres = tutor.nombre_completo;
    const apellidos = tutor.apellido_completo;

    tutor.etiqueta = `${nombres} ${apellidos}`.trim() || `Tutor ${idpersona}`;

    // Texto sobre el que filtra el Dropdown: nombre y apellido en ambos órdenes,
    // cédula (con y sin guiones) y teléfonos. Va en minúsculas y también sin tildes.
    const base = [
        `${nombres} ${apellidos}`,
        `${apellidos} ${nombres}`,
        tutor.cedula,
        normalizarCedula(tutor.cedula),
        tutor.telefonoPrincipal,
        tutor.telefonoSecundario,
        tutor.ocupacion
    ]
        .filter(Boolean)
        .join(' | ');

    tutor.textoBusqueda = `${base.toLowerCase()} | ${normalizarTexto(base)}`;

    return tutor;
};

/**
 * Busca tutores ya registrados que podrían ser el que se está escribiendo.
 *  - porCedula: coincidencia exacta de cédula (identificador fuerte -> se bloquea).
 *  - posibles:  mismo nombre y apellido, o mismo teléfono (solo se avisa).
 */
export const buscarCoincidencias = (tutorInfo, tutores = []) => {
    const cedula = normalizarCedula(tutorInfo?.cedula);

    const nombres = normalizarTexto(tutorInfo?.nombre_completo);
    const apellidos = normalizarTexto(tutorInfo?.apellido_completo);
    const nombreCompleto = nombres && apellidos ? `${nombres} ${apellidos}` : '';

    const telefonos = [tutorInfo?.telefonoPrincipal, tutorInfo?.telefonoSecundario]
        .map(soloDigitos)
        .filter((tel) => tel.length === 8);

    const porCedula = cedula
        ? tutores.find((t) => normalizarCedula(t.cedula) === cedula) ?? null
        : null;

    const posibles = tutores
        .filter((t) => t !== porCedula)
        .filter((t) => {
            const mismoNombre =
                nombreCompleto !== '' &&
                normalizarTexto(`${t.nombre_completo} ${t.apellido_completo}`) === nombreCompleto;

            const telefonosTutor = [t.telefonoPrincipal, t.telefonoSecundario].map(soloDigitos);
            const mismoTelefono = telefonos.some((tel) => telefonosTutor.includes(tel));

            return mismoNombre || mismoTelefono;
        })
        .slice(0, 3);

    return { porCedula, posibles };
};
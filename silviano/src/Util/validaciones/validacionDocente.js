/**
 * Módulo independiente para validación y saneamiento de datos de Docente.
 */

import { validarEdadMinima } from './ValidacionEdad.js';

// El docente debe tener al menos 18 años cumplidos.
export const EDAD_MINIMA_DOCENTE = 18;

const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s]+$/;

// Exactamente 8 dígitos (teléfonos de Nicaragua).
const TELEFONO_REGEX = /^[0-9]{8}$/;

// texto@dominio.ext  (sin espacios, un solo @, y un punto después del @).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un campo de texto asegurando que no contenga números ni caracteres especiales.
 * @param {string} valor - Texto a evaluar.
 * @param {string} nombreCampo - Nombre descriptivo para el mensaje de error.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarSoloTexto = (valor, nombreCampo) => {
    if (!valor || !valor.trim()) {
        return `El campo '${nombreCampo}' es obligatorio.`;
    }
    if (!SOLO_LETRAS_REGEX.test(valor.trim())) {
        return `El campo '${nombreCampo}' no debe contener números ni caracteres especiales.`;
    }
    return null;
};

/**
 * Valida el teléfono: obligatorio y de exactamente 8 dígitos.
 * @param {string|number} valor
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarTelefono = (valor) => {
    const telefono = String(valor ?? '').trim();

    if (!telefono) {
        return "El campo 'Teléfono' es obligatorio.";
    }
    if (!TELEFONO_REGEX.test(telefono)) {
        return "El campo 'Teléfono' debe contener exactamente 8 dígitos numéricos.";
    }
    return null;
};

/**
 * Valida el correo: obligatorio y con formato válido (usuario@dominio.com).
 * @param {string} valor
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarEmail = (valor) => {
    const email = String(valor ?? '').trim();

    if (!email) {
        return "El campo 'Correo electrónico' es obligatorio.";
    }
    if (!EMAIL_REGEX.test(email)) {
        return "El 'Correo electrónico' no tiene un formato válido (ejemplo: nombre@correo.com).";
    }
    return null;
};

/**
 * Valida el objeto completo de información del docente.
 * @param {Object} docenteInfo - Estado con los datos del docente.
 * @returns {Object} Objeto con 'esValido' (boolean), 'error' (string|null)
 *                   y el payload saneado en 'payload' (también en 'payloadFormateado').
 */
export const ValidarDocente = (docenteInfo) => {
    if (!docenteInfo) {
        return { esValido: false, error: "No se han proporcionado datos para validar." };
    }

    const {
        nombre_completo,
        apellido_completo,
        direccion,
        fecha_nacimiento,
        sexo,
        cedula,
        codDocente,
        especialidad,
        telefono,
        email,
        estado,
    } = docenteInfo;

    // 1. Validar Nombres (Solo letras, no vacío)
    const errorNombre = validarSoloTexto(nombre_completo, "Nombres");
    if (errorNombre) return { esValido: false, error: errorNombre };

    // 2. Validar Apellidos (Solo letras, no vacío)
    const errorApellido = validarSoloTexto(apellido_completo, "Apellidos");
    if (errorApellido) return { esValido: false, error: errorApellido };

    // 3. Validar Especialidad (Solo letras, no vacío)
    const errorEspecialidad = validarSoloTexto(especialidad, "Especialidad");
    if (errorEspecialidad) return { esValido: false, error: errorEspecialidad };

    // 4. Validar Código de Docente
    if (!codDocente || !codDocente.trim()) {
        return { esValido: false, error: "El campo 'Código Docente' es obligatorio." };
    }

    // 5. Validar Sexo
    const valorSexo = typeof sexo === 'object' ? sexo?.value : sexo;
    if (!valorSexo || (valorSexo !== 'M' && valorSexo !== 'F')) {
        return { esValido: false, error: "Debe seleccionar un sexo válido ('Masculino' o 'Femenino')." };
    }

    // 6. Validar Fecha de Nacimiento
    if (!fecha_nacimiento) {
        return { esValido: false, error: "La 'Fecha de Nacimiento' es obligatoria." };
    }

    // 6.1 NUEVO: Validar edad mínima (18 años cumplidos)
    const errorEdad = validarEdadMinima(
        fecha_nacimiento,
        EDAD_MINIMA_DOCENTE,
        'docente'
    );
    if (errorEdad) return { esValido: false, error: errorEdad };

    // 7. NUEVO: Validar Teléfono (obligatorio, 8 dígitos)
    const errorTelefono = validarTelefono(telefono);
    if (errorTelefono) return { esValido: false, error: errorTelefono };

    // 8. NUEVO: Validar Correo (obligatorio, con formato válido)
    const errorEmail = validarEmail(email);
    if (errorEmail) return { esValido: false, error: errorEmail };

    // Formatear Fecha a YYYY-MM-DD
    let fechaFormateada = fecha_nacimiento;
    if (fecha_nacimiento instanceof Date) {
        fechaFormateada = fecha_nacimiento.toISOString().split('T')[0];
    }

    // 9. Retornar Payload Sanitizado listo para Spring Boot
    const payloadFormateado = {
        nombre_completo: nombre_completo.trim(),
        apellido_completo: apellido_completo.trim(),
        especialidad: especialidad.trim(),
        codDocente: codDocente.trim(),
        sexo: valorSexo,
        fecha_nacimiento: fechaFormateada,
        direccion: direccion ? direccion.trim() : '',
        cedula: cedula ? cedula.trim() : null,
        telefono: String(telefono).trim(),
        email: String(email).trim().toLowerCase(),
        estado: estado !== undefined ? Boolean(estado) : true
    };

    return {
        esValido: true,
        error: null,
        payload: payloadFormateado,
        payloadFormateado
    };
};
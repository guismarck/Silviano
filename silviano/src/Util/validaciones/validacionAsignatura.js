/**
 * Módulo independiente para validación y saneamiento de datos de Estudiante.
 */

// Expresión regular: Permite únicamente letras (incluyendo acentos, diéresis y Ñ) y espacios
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s]+$/;

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
 * Valida el objeto completo de información del estudiante.
 * @param {Object} asignaturaInfo - Estado con los datos del estudiante.
 * @returns {Object} Objeto con propiedad 'esValido' (boolean), 'error' (string|null) y 'payloadFormateado' (Object).
 */
export const ValidarAsignatura = (asignaturaInfo) => {
    if (!asignaturaInfo) {
        return { esValido: false, error: "No se han proporcionado datos para validar." };
    }

    const {

        nombre,
        codigo,

    } = asignaturaInfo;

    // 1. Validar Nombres (Solo letras, no vacío)
    const errorNombre = validarSoloTexto(nombre, "Nombre");
    if (errorNombre) return { esValido: false, error: errorNombre };


    //* 3. Validar Nombre del Tutor (Solo letras, no vacío, sin números)
    /*const errorTutor = validarSoloTexto(nombre_tutor, "Nombre del Tutor");
    if (errorTutor) return { esValido: false, error: errorTutor }; */

    // 4. Validar Código de Estudiante
    if (!nombre || !nombre.trim()) {
        return { esValido: false, error: "El campo 'Nombre' es obligatorio." };
    }


    if (!codigo || !codigo.trim()) {
        return { esValido: false, error: "El campo 'Codigo' es obligatorio." };
    }


    // 7. Retornar Payload Sanitizado listo para Spring Boot
    const payloadFormateado = {
        nombre: nombre.trim(),
        codigo: codigo.trim()
    };


    return {
        esValido: true,
        error: null,
        payloadFormateado

    }; 

    

};
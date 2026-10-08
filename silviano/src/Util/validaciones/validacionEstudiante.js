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
 * @param {Object} estudianteInfo - Estado con los datos del estudiante.
 * @returns {Object} Objeto con propiedad 'esValido' (boolean), 'error' (string|null) y 'payloadFormateado' (Object).
 */
export const ValidarEstudiante= (estudianteInfo) => {
    if (!estudianteInfo) {
        return { esValido: false, error: "No se han proporcionado datos para validar." };
    }

    const {
        
        nombre_completo,
        apellido_completo,
        direccion,
        fecha_nacimiento,
        cedula,
        partida_nacimiento,
        codEstudiante,
        codigoMined,
        nombre_tutor,
        estado,
        sexo


    } = estudianteInfo;

    // 1. Validar Nombres (Solo letras, no vacío)
    const errorNombre = validarSoloTexto(nombre_completo, "Nombres");
    if (errorNombre) return { esValido: false, error: errorNombre };

    // 2. Validar Apellidos (Solo letras, no vacío)
    const errorApellido = validarSoloTexto(apellido_completo, "Apellidos");
    if (errorApellido) return { esValido: false, error: errorApellido };

    // 3. Validar Nombre del Tutor (Solo letras, no vacío, sin números)
    const errorTutor = validarSoloTexto(nombre_tutor, "Nombre del Tutor");
    if (errorTutor) return { esValido: false, error: errorTutor };

    // 4. Validar Código de Estudiante
    if (!codEstudiante || !codEstudiante.trim()) {
        return { esValido: false, error: "El campo 'Código Estudiante' es obligatorio." };
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

    // Formatear Fecha a YYYY-MM-DD
    let fechaFormateada = fecha_nacimiento;
    if (fecha_nacimiento instanceof Date) {
        fechaFormateada = fecha_nacimiento.toISOString().split('T')[0];
    }

    // 7. Retornar Payload Sanitizado listo para Spring Boot
    const payloadFormateado = {
        nombre_completo: nombre_completo.trim(),
        apellido_completo: apellido_completo.trim(),
        nombre_tutor: nombre_tutor.trim(),
        codEstudiante: codEstudiante.trim(),
        sexo: valorSexo,
        fecha_nacimiento: fechaFormateada,
        partida_nacimiento: typeof partida_nacimiento === 'object' ? partida_nacimiento?.value : (partida_nacimiento || 'si'),
        direccion: direccion ? direccion.trim() : '',
        cedula: cedula ? cedula.trim() : null,
        codigoMined: codigoMined ? codigoMined.trim() : null,
        estado: estado !== undefined ? Boolean(estado) : true
    };

    return { esValido: true, error: null, payloadFormateado };
};
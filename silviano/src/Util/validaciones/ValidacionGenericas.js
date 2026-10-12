

/**
 * Utilidad para validación de Cédula Nicaragüense y extracción automática de fecha de nacimiento.
 * Ruta: src/Util/validaciones/validacionEstudiante.js
 */

// Regex para cédula nicaragüense con o sin guiones: 401-010497-0002C o 4010104970002C
const REGEX_CEDULA_NICARAGUA = /^(\d{3})-?(\d{2})(\d{2})(\d{2})-?(\d{4})([A-Za-zA-Z])$/;
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s]+$/;

/**
 * Normaliza y valida una cédula nicaragüense, extrayendo la fecha de nacimiento.
 * @param {string} cedula - String de la cédula (ej: "401-010497-0002C")
 * @returns {Object} { esValida: boolean, fechaNacimiento: Date|null, fechaString: string|null, error: string|null }
 */


export  const extraerFechaNacimientoCedula = (cedula) => {
    if (!cedula || typeof cedula !== 'string') {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: "La cédula proporcionada está vacía o es inválida." };
    }

    const cedulaLimpia = cedula.trim();
    const match = cedulaLimpia.match(REGEX_CEDULA_NICARAGUA);

    if (!match) {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: "El formato de la cédula es incorrecto. Ejemplo válido: 401-010497-0002C" };
    }

    // Extracción de componentes desde la expresión regular
    const dia = parseInt(match[2], 10);
    const mes = parseInt(match[3], 10);
    const anioDosDigitos = parseInt(match[4], 10);

    // Validar Mes (1 - 12)
    if (mes < 1 || mes > 12) {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: `El mes '${match[3]}' extraído de la cédula es inválido.` };
    }

    // Cálculo del Año de 4 dígitos con regla de pivote
    const anioActual = new Date().getFullYear(); // 2026
    const dosDigitosAnioActual = anioActual % 100; // 26
    const sigloActual = Math.floor(anioActual / 100) * 100; // 2000

    // Si el año de la cédula es mayor al año actual de 2 dígitos, pertenece al siglo anterior (1900s)
    let anioCompleto = (anioDosDigitos > dosDigitosAnioActual) 
        ? (sigloActual - 100) + anioDosDigitos  // ej: 97 > 26 -> 1900 + 97 = 1997
        : sigloActual + anioDosDigitos;        // ej: 15 <= 26 -> 2000 + 15 = 2015

    // Validar número de días según el mes y año bisiesto
    const diasEnMes = new Date(anioCompleto, mes, 0).getDate();
    if (dia < 1 || dia > diasEnMes) {
        return { esValida: false, fechaNacimiento: null, fechaString: null, error: `El día '${match[2]}' no es válido para el mes ${mes} del año ${anioCompleto}.` };
    }

    // Construcción del objeto Date y formato ISO YYYY-MM-DD
    const fechaObjeto = new Date(anioCompleto, mes - 1, dia);
    
    // Formatear día y mes con cero a la izquierda
    const mmStr = String(mes).padStart(2, '0');
    const ddStr = String(dia).padStart(2, '0');
    const fechaString = `${anioCompleto}-${mmStr}-${ddStr}`;

    return {
        esValida: true,
        fechaNacimiento: fechaObjeto,
        fechaString: fechaString,
        error: null
    };
};


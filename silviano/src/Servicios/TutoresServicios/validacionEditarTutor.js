
const TELEFONO_REGEX = /^\d{8}$/;

export const ValidarEditarTutor = (datos, cedulaValida) => {
    const errores = {};

    const camposObligatorios = [
        ['nombre_completo', 'Los nombres son obligatorios.'],
        ['apellido_completo', 'Los apellidos son obligatorios.'],
        ['sexo', 'Debe seleccionar el sexo.'],
        ['direccion', 'La dirección es obligatoria.'],
        ['ocupacion', 'La ocupación es obligatoria.'],
        ['telefonoPrincipal', 'El teléfono principal es obligatorio.'],
    ];

    // Comprobar que los campos requeridos no estén vacíos.
    camposObligatorios.forEach(([campo, mensaje]) => {
        if (
            datos[campo] === null ||
            datos[campo] === undefined ||
            String(datos[campo]).trim() === ''
        ) {
            errores[campo] = mensaje;
        }
    });

    // La cédula es obligatoria y su formato lo valida CedulaInput.
    if (!String(datos.cedula || '').trim()) {
        errores.cedula = 'La cédula es obligatoria.';
    } else if (!cedulaValida) {
        errores.cedula = 'Verifique el formato de la cédula.';
    }

    // Fecha de nacimiento obligatoria y válida.
    if (
        !datos.fecha_nacimiento ||
        !(datos.fecha_nacimiento instanceof Date) ||
        Number.isNaN(datos.fecha_nacimiento.getTime())
    ) {
        errores.fecha_nacimiento = 'Seleccione una fecha de nacimiento válida.';
    } else {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fecha = new Date(datos.fecha_nacimiento);
        fecha.setHours(0, 0, 0, 0);

        if (fecha > hoy) {
            errores.fecha_nacimiento = 'La fecha no puede ser futura.';
        }
    }

    // Teléfono principal: exactamente 8 dígitos.
    const telefonoPrincipal = String(datos.telefonoPrincipal || '').trim();

    if (
        telefonoPrincipal &&
        !TELEFONO_REGEX.test(telefonoPrincipal)
    ) {
        errores.telefonoPrincipal =
            'Ingrese un teléfono principal de 8 dígitos.';
    }

    // El teléfono secundario es opcional, pero si se escribe,
    // también debe tener 8 dígitos.
    const telefonoSecundario = String(datos.telefonoSecundario || '').trim();

    if (
        telefonoSecundario &&
        !TELEFONO_REGEX.test(telefonoSecundario)
    ) {
        errores.telefonoSecundario =
            'El teléfono secundario debe tener 8 dígitos.';
    }

    return {
        esValido: Object.keys(errores).length === 0,
        errores
    };
};

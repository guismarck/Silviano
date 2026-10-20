
import api from '../Servicios/api/api';

/**
 * Normaliza valores de texto:
 * - Quita espacios al inicio y al final.
 * - Convierte los valores vacíos en null para campos opcionales.
 */
const textoOpcional = (valor) => {
    const texto = valor?.trim();
    return texto || null;
};

/**
 * Verifica los campos obligatorios antes de enviar el registro.
 */
const validarTutor = (tutorInfo) => {
    if (!tutorInfo) {
        throw new Error('No se proporcionaron los datos del tutor.');
    }

    const requeridos = [
        ['nombre_completo', 'Nombres del tutor'],
        ['apellido_completo', 'Apellidos del tutor'],
        ['ocupacion', 'Ocupación'],
        ['telefonoPrincipal', 'Teléfono principal']
    ];

    for (const [campo, etiqueta] of requeridos) {
        const valor = tutorInfo[campo];

        if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ''
        ) {
            throw new Error(
                `El campo '${etiqueta}' es obligatorio.`
            );
        }
    }

    const telefonoPrincipal =
        tutorInfo.telefonoPrincipal.trim();

    if (!/^\d{8}$/.test(telefonoPrincipal)) {
        throw new Error(
            'El teléfono principal debe contener exactamente 8 dígitos.'
        );
    }

    const telefonoSecundario =
        tutorInfo.telefonoSecundario?.trim() || '';

    if (
        telefonoSecundario &&
        !/^\d{8}$/.test(telefonoSecundario)
    ) {
        throw new Error(
            'El teléfono secundario debe contener exactamente 8 dígitos.'
        );
    }
};

/**
 * Registra un tutor.
 *
 * El ID de Persona que devuelva el backend será necesario
 * para crear posteriormente la relación estudiante-tutor.
 */
export const registrarTutor = async (tutorInfo) => {
    validarTutor(tutorInfo);

    const payload = {
        nombre_completo:
            tutorInfo.nombre_completo.trim(),

        apellido_completo:
            tutorInfo.apellido_completo.trim(),

        cedula:
            textoOpcional(tutorInfo.cedula),

        sexo:
            textoOpcional(tutorInfo.sexo),

        fecha_nacimiento:
            tutorInfo.fecha_nacimiento || null,

        direccion:
            textoOpcional(tutorInfo.direccion),

        ocupacion:
            tutorInfo.ocupacion.trim(),

        telefonoPrincipal:
            tutorInfo.telefonoPrincipal.trim(),

        // El teléfono secundario es opcional.
        telefonoSecundario:
            textoOpcional(tutorInfo.telefonoSecundario)
    };

    console.log('Payload enviado para registrar tutor:', payload);

    const respuesta = await api.post(
        '/estudiante-app/tutores/create',
        payload
    );

    return respuesta.data;
};

/**
 * Obtiene el identificador de Persona del tutor.
 *
 * Según la entidad Tutor compartida, Tutor hereda
 * su identificador de Persona: idpersona.
 *
 * Ajustar si el controlador devuelve un DTO con
 * una estructura diferente.
 */
export const obtenerIdPersonaTutor = (respuesta) => {
    const datos = respuesta?.data ?? respuesta;

    const id =
        datos?.idpersona ??
        datos?.idPersona ??
        datos?.tutor?.idpersona ??
        datos?.tutor?.idPersona;

    if (
        id === null ||
        id === undefined ||
        !Number.isInteger(Number(id)) ||
        Number(id) <= 0
    ) {
        throw new Error(
            'La respuesta del backend no contiene un idpersona válido para el tutor.'
        );
    }

    return Number(id);
};

/**
 * Registra la relación entre estudiante y tutor.
 *
 * idEstudiante: idpersona del estudiante.
 * idTutor: idpersona del tutor, según la entidad compartida.
 */
export const registrarEstudianteTutor = async ({
    idEstudiante,
    idTutor,
    parentesco,
    esRepresentanteLegal
}) => {
    const estudianteId = Number(idEstudiante);
    const tutorId = Number(idTutor);

    if (
        !Number.isInteger(estudianteId) ||
        estudianteId <= 0 ||
        !Number.isInteger(tutorId) ||
        tutorId <= 0
    ) {
        throw new Error(
            'Los identificadores del estudiante y del tutor deben ser válidos.'
        );
    }

    if (!parentesco?.trim()) {
        throw new Error(
            'Debe especificar el parentesco del tutor.'
        );
    }

    const payload = {
        id: {
            idpersonaEstudiante: estudianteId,
            idtutor: tutorId
        },

        persona: {
            idpersona: estudianteId
        },

        tutor: {
            idpersona: tutorId
        },

        parentesco: parentesco.trim(),

        // En la entidad, "estado" representa
        // es_representante_legal.
        estado: Boolean(esRepresentanteLegal)
    };

    console.log(
        'Payload enviado para registrar relación estudiante-tutor:',
        payload
    );

    const respuesta = await api.post(
        '/estudiante-app/estudianteTutores/create',
        payload
    );

    return respuesta.data;
};


export const getTutores = async () => {
  const response = await api.get('/estudiante-app/tutores');
  return response.data;
};

 /**
 * Elimina un registrodel tutor por su ID.
 */
export const deleteTutor = async (idPersona) => {
  const response = await api.delete(`/estudiante-app/tutores/${idPersona}`);
  return response.data;
};

/**
 * Obtiene la información académica y personal del tutor  por su ID.
 */
 export const getTutorById = async (idPersona) => {
   const response = await api.get(`/estudiante-app/tutores/${idPersona}`);
   return response.data;
 };


/**
  * Actualiza el expediente del tutor en la base de datos centralizada.
  */
 export const updateTutorService = async (idPersona, payload) => {
   const response = await api.put(`/estudiante-app/tutores/${idPersona}`, payload);
   return response.data;
 };

/**
 * Realiza la búsqueda filtrada de estudiantes por término.
 * @param {string} query - Término de búsqueda.
 */

 export const searchTutores = async (query) => {
   const response = await api.get('/estudiante-app/tutores', {
     params: { search: query }
   });
   return response.data;
 };
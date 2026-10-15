import api from '../Servicios/api/api';

/**
 * Registra un tutor y devuelve la respuesta del backend.
 */
export const registrarTutor = async (tutorInfo) => {
    const payload = {
        nombre_completo: tutorInfo.nombre_completo.trim(),
        apellido_completo: tutorInfo.apellido_completo.trim(),
        cedula: tutorInfo.cedula?.trim() || null,
        sexo: tutorInfo.sexo || null,
        fecha_nacimiento: tutorInfo.fecha_nacimiento || null,
        ocupacion: tutorInfo.ocupacion.trim(),
        telefonoPrincipal: tutorInfo.telefonoPrincipal.trim(),
        telefonoSecundario: tutorInfo.telefonoSecundario.trim(),
        direccion: tutorInfo.direccion?.trim() || null
    };

    const respuesta = await api.post(
        '/estudiante-app/tutores/create',
        payload
    );

    return respuesta.data;
};

/**
 * Registra la relación entre el estudiante y el tutor.
 */
export const registrarEstudianteTutor = async ({
    idEstudiante,
    idTutor,
    parentesco,
    esRepresentanteLegal
}) => {
    if (!idEstudiante || !idTutor) {
        throw new Error(
            'Se necesitan los IDs del estudiante y del tutor para crear la relación.'
        );
    }

    const payload = {
        id: {
            idpersonaEstudiante: Number(idEstudiante),
            idtutor: Number(idTutor)
        },
        persona: {
            idpersona: Number(idEstudiante)
        },
        tutor: {
            idpersona: Number(idTutor)
        },
        parentesco: parentesco,
        estado: Boolean(esRepresentanteLegal)
    };

    const respuesta = await api.post(
        '/estudiante-app/estudianteTutores/create',
        payload
    );

    return respuesta.data;
};
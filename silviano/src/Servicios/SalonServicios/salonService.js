
import api from '../../Servicios/api/api';


export const ServicioValidado = async () => {
    // Invoca el helper independiente de validación salonInfo
    /*const validacion = ValidarEstudiante(salonInfo);

    if (!validacion.esValido) {
        // Lanza un error estructurado si no pasa las validaciones de cliente
        throw new Error(validacion.error);
    }

    // Envía el payload previamente sanitizado a la API REST de Spring Boot , validacion.payloadFormateado*/
    const respuesta = await api.post('/estudiante-app/salones/create');
    return respuesta.data;
};


export const getSalones = async () => {
  const response = await api.get('/estudiante-app/salones');
  return response.data;
};

export const getGrados = async () => {
  const response = await api.get('/estudiante-app/grados');
  return response.data;
};

export const getCattalogoSalon = async () => {
  const response = await api.get('/estudiante-app/grados');
  return response.data;
};



/**
 * Elimina un registro de estudiante por su ID.
 */
export const deleteSalon = async (idSalon) => {
  const response = await api.delete(`/estudiante-app/salones/${idSalon}`);
  return response.data;
};
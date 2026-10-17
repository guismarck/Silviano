
import api from '../../Servicios/api/api';


// Obtener los grados existentes
export const getGrados = async () => {
  const response = await api.get('/estudiante-app/grados');
  return response.data;
};

// Obtener los salones del catálogo
export const getCatalogoSalon = async () => {
  const response = await api.get('/estudiante-app/catalogo/salon');
  return response.data;
};

// Obtener los salones registrados
export const getSalones = async () => {
  const response = await api.get('/estudiante-app/salones');
  return response.data;
};

// Insertar un salón enviando los datos al backend
export const ServicioValidado = async (salonInfo) => {
  const response = await api.post(
    '/estudiante-app/salones/create',
    salonInfo
  );

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
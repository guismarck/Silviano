import api from '../api/api' // Ajustar ruta según la estructura del proyecto

const ENDPOINT = '/catalogo/salon';

/**
 * Obtiene la lista completa de salones del catálogo.
 * @returns {Promise<Array>} Lista de CatalogoSalonDTO
 */
export const obtenerTodosCatalogoSalones = async () => {
    const respuesta = await api.get(ENDPOINT);
    return respuesta.data;
};

/**
 * Obtiene la información detallada de un catálogo de salón por su ID.
 * @param {number|string} id 
 * @returns {Promise<Object>} CatalogoSalonDTO
 */
export const obtenerCatalogoSalonPorId = async (id) => {
    const respuesta = await api.get(`${ENDPOINT}/${id}`);
    return respuesta.data;
};

/**
 * Elimina un registro del catálogo de salón por su ID.
 * @param {number|string} id 
 * @returns {Promise<void>}
 */
export const eliminarCatalogoSalon = async (id) => {
    const respuesta = await api.delete(`${ENDPOINT}/${id}`);
    return respuesta.data;
};
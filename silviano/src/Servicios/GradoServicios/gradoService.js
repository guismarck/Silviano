
import api from '../../Servicios/api/api.js';


/**
 * Obtiene el listado completo de grados registrados en el sistema.
*/
export const getGrados = async () => {
  const response = await api.get('/estudiante-app/grados');
  return response.data;
}; 

export const getNivelEducativo = async () => {
  const response = await api.get('nivel-educativo');
  return response.data;
}; 

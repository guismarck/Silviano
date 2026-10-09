import api from '../api/api';
export const tarifaService = {
  /**
   * Obtiene la lista completa de tarifas desde la base de datos Spring Boot
   * Endpoint: GET /estudiante-app/catalogo/tarifa?anioLectivo=2026
   */
  listarTarifas: async (anioLectivo) => {
    const response = await api.get('/estudiante-app/catalogo/tarifa', {
      params: anioLectivo ? { anioLectivo } : {}
    });
    return response.data;
  },

  /**
   * Consulta arancel por grado, año y concepto específico
   * Endpoint: GET /estudiante-app/buscar?idGrado=...
   */
  obtenerTarifaPorGradoYConcepto: async (idGrado, anioLectivo, concepto) => {
    const response = await api.get('/estudiante-app/buscar', {
      params: { idGrado, anioLectivo, concepto }
    });
    return response.data;
  }
};

export default tarifaService;
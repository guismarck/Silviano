import api from '../api/api';
export const tarifaService = {
  /**
   * Obtiene la lista completa de tarifas desde la base de datos Spring Boot
   * Endpoint: GET /estudiante-app/catalogo/tarifa?anioLectivo=2026
   */
  listarTarifas: async (anioLectivo) => {
    const response = await api.get('/estudiante-app/catalogo/tarifa', {
      params: anioLectivo ? { anioLectivo } : {},
      headers: {
        Accept: 'application/json'
      },
      skipAuth: true
    });

    if (!Array.isArray(response.data)) {
      throw new Error(
        'El catálogo de tarifas no devolvió una lista JSON. Verifique la respuesta del endpoint en Network.'
      );
    }

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
  },

  /**
   * Consulta el saldo pendiente de una persona para una tarifa específica.
   * Endpoint: GET /pago/saldo?idPersona=...&idTarifa=...
   */
  buscarSaldoPorPersonaYTarifa: async (idPersona, idTarifa) => {
    const response = await api.get('estudiante-app/pago/saldo', {
      params: { idPersona, idTarifa }
    });
    return response.data;
  }
};

export default tarifaService;
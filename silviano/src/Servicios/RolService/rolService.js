import api from '../api/api';

const rolService = {
  /**
   * Obtiene la lista completa de roles.
   * Endpoint: GET /roles
   * @returns {Promise<Array<Object>>} Lista de RolResponseDTO
   */
  obtenerRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al obtener los roles del sistema.'
      );
    }
  },

  /**
   * Obtiene los datos de un rol por su ID.
   * Endpoint: GET /roles/{id}
   * @param {number|string} id - ID del rol.
   * @returns {Promise<Object>} RolResponseDTO
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al obtener la información del rol.'
      );
    }
  },

  /**
   * Crea un nuevo rol en la base de datos.
   * Endpoint: POST /roles
   * @param {Object} rolDto - Payload RolRequestDTO
   * @returns {Promise<Object>} RolResponseDTO (HTTP 201 Created)
   */
  crearRol: async (rolDto) => {
    try {
      const response = await api.post('/roles', rolDto);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al registrar el nuevo rol.'
      );
    }
  },

  /**
   * Actualiza un rol existente.
   * Endpoint: PUT /roles/{id}
   * @param {number|string} id - ID del rol a modificar.
   * @param {Object} rolDto - Payload RolRequestDTO
   * @returns {Promise<Object>} RolResponseDTO
   */
  actualizarRol: async (id, rolDto) => {
    try {
      const response = await api.put(`/roles/${id}`, rolDto);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al actualizar la información del rol.'
      );
    }
  },

  /**
   * Elimina un rol del sistema.
   * Endpoint: DELETE /roles/{id}
   * @param {number|string} id - ID del rol a eliminar.
   * @returns {Promise<void>} HTTP 204 No Content
   */
  eliminarRol: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al intentar eliminar el rol.'
      );
    }
  },
};

export default rolService;
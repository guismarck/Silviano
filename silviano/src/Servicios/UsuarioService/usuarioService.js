import api from '../api/api';

const usuarioService = {
  /**
   * Obtiene la lista completa de usuarios.
   * Endpoint: GET /api/v1/usuarios
   * @returns {Promise<Array<Object>>} Lista de UsuarioResponseDTO
   */
  obtenerUsuarios: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al obtener la lista de usuarios.'
      );
    }
  },

  /**
   * Obtiene la información detallada de un usuario por su ID.
   * Endpoint: GET /api/v1/usuarios/{id}
   * @param {number|string} id - ID del usuario.
   * @returns {Promise<Object>} UsuarioResponseDTO
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al obtener los datos del usuario.'
      );
    }
  },

  /**
   * Crea un nuevo usuario en el sistema.
   * Endpoint: POST /api/v1/usuarios
   * @param {Object} usuarioDto - Payload UsuarioCrearRequestDTO
   * @returns {Promise<Object>} UsuarioResponseDTO (HTTP 201 Created)
   */
  crearUsuario: async (usuarioDto) => {
    try {
      const response = await api.post('/usuarios', usuarioDto);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al crear el usuario en la plataforma.'
      );
    }
  },

  /**
   * Actualiza los datos de un usuario existente.
   * Endpoint: PUT /api/v1/usuarios/{id}
   * @param {number|string} id - ID del usuario.
   * @param {Object} usuarioDto - Datos actualizados, incluido el correo electrónico.
   * @returns {Promise<Object>} UsuarioResponseDTO
   */
  actualizarUsuario: async (id, usuarioDto) => {
    try {
      const response = await api.put(`/usuarios/${id}`, usuarioDto);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al actualizar los datos del usuario.'
      );
    }
  },

  /**
   * Asigna o actualiza los roles de un usuario.
   * Endpoint: PUT /api/v1/usuarios/asignar-roles
   * @param {Object} asignarRolesDto - Payload AsignarRolesDTO (ej. { usuarioId, rolesIds })
   * @returns {Promise<Object>} UsuarioResponseDTO
   */
  asignarRoles: async (asignarRolesDto) => {
    try {
      const response = await api.put('/usuarios/asignar-roles', asignarRolesDto);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al asignar los roles al usuario.'
      );
    }
  },

  /**
   * Cambia el estado del usuario (ej. 1 = Activo, 0 = Inactivo).
   * Endpoint: PATCH /api/v1/usuarios/{id}/estado?estado={estado}
   * @param {number|string} id - ID del usuario.
   * @param {number} estado - Estado numérico enviado como @RequestParam Integer.
   * @returns {Promise<void>} HTTP 204 No Content
   */
  cambiarEstado: async (id, estado) => {
    try {
      const response = await api.patch(`/usuarios/${id}/estado`, null, {
        params: { estado },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al cambiar el estado del usuario.'
      );
    }
  },

  cambiarEstadoUsuario: async (id, activo) => {
    return usuarioService.cambiarEstado(id, activo ? 1 : 0);
  },
};

export default usuarioService;
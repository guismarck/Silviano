import api from '../../Servicios/api/api';

const authService = {
  // Login directo que valida credenciales y retorna el perfil con roles
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; // Retorna { id, username, nombreCompleto, roles }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Credenciales inválidas o falla en el servidor escolar.';
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('sige_user');
  },

/**
   * Solicita el envío del código OTP contra /auth/solicitar-otp
   * @param {Object} solicitudData - SolicitudOTPDTO { identificacion, username }
   * @returns {Promise<Object>} RespuestaOTPDTO { mensaje, docenteId, emailOculto }
   */
  solicitarOTP: async (solicitudData) => {
    try {
      const response = await api.post('/auth/solicitar-otp', {
        identificacion: solicitudData.identificacion.trim(),
        username: solicitudData.username.trim(),
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'No se pudo procesar la solicitud del código OTP.'
      );
    }
  },

  /**
   * Verifica el token de recuperación y actualiza la contraseña contra /auth/verificar-otp
   * @param {Object} verificarData - VerificarOTPDTO { docenteId, tokenRecuperacion, otpCode, nuevaPassword }
   * @returns {Promise<Object>} Map<String, String> { mensaje: "..." }
   */
  verificarOTP: async (verificarData) => {
    try {
      const response = await api.post('/auth/verificar-otp', {
        docenteId: verificarData.docenteId,
        tokenRecuperacion: verificarData.tokenRecuperacion.trim(),
        otpCode: verificarData.otpCode.trim(),
        nuevaPassword: verificarData.nuevaPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          'Error al validar el código OTP o actualizar la clave.'
      );
    }
  },
};



export default authService;
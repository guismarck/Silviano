import api from '../api/api';

export const menuService = {
  /**
   * Obtiene la estructura jerárquica para el SideBar / PanelMenu
   */
  async getModulosUsuario() {
    try {
      const response = await api.get('/api/modulos/usuario-menu');
      return response.data || [];
    } catch (error) {
      console.error('Error al consumir /api/modulos/usuario-menu:', error);
      throw error;
    }
  },

  /**
   * Obtiene únicamente la lista plana de rutas para registro en React Router
   */
  async getRutasPlanasUsuario() {
    try {
      const response = await api.get('/api/modulos/usuario-rutas');
      return response.data || [];
    } catch (error) {
      console.error('Error al consumir /api/modulos/usuario-rutas:', error);
      throw error;
    }
  }
};
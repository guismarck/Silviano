import api from '../api/api';
import asignaturasMockData from '../data/asignaturasDocenteMock.json';

export const asignaturasService = {
  /**
   * Obtiene las asignaturas del docente. Permite simular la respuesta del backend
   * filtrada por idDocente (vía JWT) mediante JSON local.
   */
  getAsignaturasDocente: async () => {
    try {
      // En producción:
      // const { data } = await api.get('/planes-estudio/mis-asignaturas');
      // return data;

      // Simulación de respuesta diferida con JSON local
      return new Promise((resolve) => {
        setTimeout(() => {
          const asignaturasFormateadas = asignaturasMockData.map((item) => ({
            label: `${item.asignatura_nombre} - ${item.grado_nombre} "${item.seccion_nombre}" (${item.nivel_academico})`,
            value: item.iddetalle_plan_de_estudio,
            idPlan_de_estudio: item.idPlan_de_estudio,
            idAsignatura: item.idAsignatura
          }));
          resolve(asignaturasFormateadas);
        }, 500);
      });
    } catch (error) {
      throw new Error('Error al cargar la carga académica del docente.');
    }
  }
};
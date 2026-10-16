import api from '../api/api';

export const catalogosService = {
  /**
   * Obtiene la oferta académica asignada al docente autenticado.
   */
  getAsignacionesDocente: async (idDocente) => {
    const { data } = await api.get('estudiante-app/docentes/mis-asignaciones', {
      params: { idDocente }
    });

    return data.map((asignacion) => ({
      id_docente: idDocente,
      iddetalle_plan_de_estudio: asignacion.idDetallePlanDeEstudio,
      idPlan_de_estudio: asignacion.idPlanDeEstudio,
      idAsignatura: asignacion.idAsignatura,
      asignatura_nombre: asignacion.asignatura,
      idGrado: asignacion.idGrado,
      grado_nombre: asignacion.grado,
      anio_lectivo: asignacion.anioLectivo,
      idSalon: asignacion.idSalon,
      seccion: asignacion.seccion,
      turno: asignacion.turno
    }));
  },

  /**
   * Obtiene el catálogo de Periodos Evaluativos (Cortes Evaluativos MINED)
   */
  getPeriodosEvaluativos: async () => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { idperiodo_evaluativo: 1, nombre: 'I Corte Evaluativo' },
            { idperiodo_evaluativo: 2, nombre: 'II Corte Evaluativo' },
            { idperiodo_evaluativo: 3, nombre: 'III Corte Evaluativo' },
          ]);
        }, 300);
      });
    } catch (error) {
      throw new Error('Error al cargar periodos evaluativos.');
    }
  }
};
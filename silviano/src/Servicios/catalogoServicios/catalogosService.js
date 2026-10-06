import api from '../api/api';

export const catalogosService = {
  /**
   * Obtiene la oferta académica asignada al docente autenticado.
   */
  getAsignacionesDocente: async () => {
    try {
      // En producción:
      // const { data } = await api.get('/docentes/mis-asignaciones');
      // return data;

      // Datos simulados estructurados según la consulta SQL proveída:
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id_docente: 10,
              idAsignatura: 101,
              asignatura_nombre: 'Matemáticas',
              asignatura_codigo: 'MAT-7',
              idGrado: 1,
              grado_nombre: 'Séptimo Grado',
              idSalon: 5,
              seccion: 'A',
              turno: 'Mañana',
              idPlan_de_estudio: 20,
              iddetalle_plan_de_estudio: 501
            },
            {
              id_docente: 10,
              idAsignatura: 102,
              asignatura_nombre: 'Lengua y Literatura',
              asignatura_codigo: 'LEN-7',
              idGrado: 1,
              grado_nombre: 'Séptimo Grado',
              idSalon: 5,
              seccion: 'A',
              turno: 'Mañana',
              idPlan_de_estudio: 20,
              iddetalle_plan_de_estudio: 502
            },
            {
              id_docente: 10,
              idAsignatura: 103,
              asignatura_nombre: 'Ciencias Naturales',
              asignatura_codigo: 'CNT-8',
              idGrado: 2,
              grado_nombre: 'Octavo Grado',
              idSalon: 8,
              seccion: 'B',
              turno: 'Mañana',
              idPlan_de_estudio: 21,
              iddetalle_plan_de_estudio: 503
            }
          ]);
        }, 400);
      });
    } catch (error) {
      throw new Error('Error al obtener el catálogo de asignaciones docentes.');
    }
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
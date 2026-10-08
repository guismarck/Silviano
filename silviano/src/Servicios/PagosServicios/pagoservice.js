import api from '../api/api';

/**
 * Carga de catálogos base estandarizados { label, value } para el módulo de Caja
 */
export const getCatalogosCaja = async () => {
  try {
    const [estudiantesRes, nivelesRes] = await Promise.all([
      api.get('/estudiante-app/estudiantes'),
      api.get('/nivel-educativo/'),
    ]);

    const estudiantesData = Array.isArray(estudiantesRes.data)
      ? estudiantesRes.data
      : [];
    const estudiantes = estudiantesData.map((e) => ({
      label: `${e.codEstudiante ? `[${e.codEstudiante}] ` : ''}${e.nombre_completo || ''} ${e.apellido_completo || ''}`.trim(),
      value: e.idpersona || e.idestudiante || e.id,
    }));

    const nivelesData = Array.isArray(nivelesRes.data) ? nivelesRes.data : [];
    const niveles = nivelesData.map((n) => ({
      label: n.nombre,
      value: n.idnivel || n.id,
    }));

    return { estudiantes, niveles };
  } catch (error) {
    console.error('Error al cargar catálogos de caja:', error);
    return { estudiantes: [], niveles: [] };
  }
};

/**
 * Consulta de Grados Académicos filtrados por Nivel Educativo
 * Consume el endpoint Backend: @GetMapping("/nivel/{idNivel}")
 */
export const obtenerGradosPorNivel = async (idNivel) => {
  if (!idNivel) return [];
  try {
    const response = await api.get(`/estudiante-app/nivel/${idNivel}`);
    const rawData = Array.isArray(response.data) ? response.data : [];

    return rawData.map((g) => ({
      label: g.nombre || g.nombreGrado,
      value: g.idGrado || g.id,
    }));
  } catch (error) {
    console.error(`Error al obtener grados para el nivel ${idNivel}:`, error);
    return [];
  }
};

/**
 * Consulta de salones con disponibilidad de cupos (> 0)
 */
export const obtenerSalonesDisponibles = async (idGrado, anioLectivo) => {
  try {
    const response = await api.get('/estudiante-app/catalogo/salon', {
      params: { idGrado, anioLectivo },
    });

    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data?.salones || [];

    return rawData
      .filter((s) => Number(s.cupo_disponible || s.cupos || s.capacidad || 0) > 0)
      .map((s) => ({
        label: `${s.nombre_salon || s.nombre || `Sección ${s.seccion}`} (${s.capacidad || s.cupos} vacantes disponibles)`,
        value: s.idCatalogoSalon || s.id_salon || s.idSalon || s.id,
        cupos: s.capacidad || s.cupos,
      }));
  } catch (error) {
    console.error('Error al obtener salones disponibles:', error);
    return [];
  }
};

/**
 * Verificación de matrícula activa para el estudiante en el año lectivo dado
 */
export const obtenerMatriculaActiva = async (idpersona, anio_lectivo) => {
  try {
    const response = await api.get('/matricula/activa', {
      params: { idpersona, anio_lectivo },
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

/**
 * Registro unificado de la transacción (Matrícula / Cobro / Abono)
 */
export const registrarTransaccionCobro = async (payload) => {
  const response = await api.post('/pago/create', payload);
  return response.data;
};

const pagosService = {
  // Obtiene las cuentas por pagar de un estudiante
  obtenerCuentasPorPagar: async (idEstudiante) => {
    try {
      const response = await api.get(`/pagos/cuentas-por-pagar`, {
        params: {
          idEstudiante,
        },
      });
      return response.data;
    } catch (error) {
      // Manejar error al obtener cuentas por pagar (ej. registrar error, mostrar mensaje al usuario)
      console.error('Error al obtener cuentas por pagar:', error);
      throw error;
    }
  },

  // Registra un nuevo pago
  registrarPago: async (datosPago) => {
    try {
      const response = await api.post('/pagos/registrar', datosPago);
      return response.data;
    } catch (error) {
      // Manejar error al registrar pago (ej. registrar error, mostrar mensaje al usuario)
      console.error('Error al registrar pago:', error);
      throw error;
    }
  },
};

export default pagosService;
import api from '../api/api';

/**
 * Consulta la tarifa asignada por Grado, Año y Concepto
 */
export const obtenerTarifaPorNivelYConcepto = async (idnivel, anio_lectivo, concepto) => {
  const response = await api.get('/buscar', {
    params: { 
      idnivel, 
      anioLectivo: anio_lectivo, 
      concepto 
    }
  });
  return response.data;
};

/**
 * Consulta los salones configurados para un grado/año lectivo
 * Filtra únicamente los salones con cupos/vacantes disponibles (> 0)
 */
export const obtenerSalonesDisponibles = async (idGrado, anioLectivo) => {
  const response = await api.get('/salones/disponibles', {
    params: { idGrado, anioLectivo }
  });
  
  const rawData = Array.isArray(response.data) ? response.data : (response.data?.salones || []);

  return rawData
    .filter((s) => Number(s.cupo_disponible || s.cupos || 0) > 0)
    .map((s) => ({
      label: `${s.nombre_salon || s.nombre} (${s.cupo_disponible || s.cupos} vacantes disponibles)`,
      value: s.idsalon || s.id_salon || s.id,
      cupos: s.cupo_disponible || s.cupos
    }));
};

/**
 * Registra el pago en base de datos (La fecha se gestiona mediante CURRENT_TIMESTAMP en Node.js)
 */
export const registrarTransaccionCobro = async (payload) => {
  const response = await api.post('/pago/create', payload);
  return response.data;
};

/**
 * Carga de catálogos base para el módulo de Caja
 */
export const getCatalogosCaja = async () => {
  try {
    const [estudiantesRes, nivelesRes] = await Promise.all([
      api.get('/estudiante-app/estudiantes'),
      api.get('/nivel-educativo/') 
    ]);

    // 1. Mapeo defensivo de Estudiantes para Dropdown { label, value }
    const estudiantesData = Array.isArray(estudiantesRes.data) ? estudiantesRes.data : [];
    const estudiantes = estudiantesData.map((e) => ({
      label: `${e.codigo_estudiante ? `[${e.codigo_estudiante}] ` : ''}${e.nombres || e.nombre || ''} ${e.apellidos || e.apellido || ''}`.trim(),
      value: e.idpersona || e.idestudiante || e.id
    }));

    // 2. Mapeo defensivo de Niveles Educativos
    const niveles = Array.isArray(nivelesRes.data) ? nivelesRes.data : [];

    return { estudiantes, niveles };
  } catch (error) {
    console.error('Error al cargar catálogos de caja:', error);
    // Retorno defensivo para evitar crashes tipo "cannot read properties of undefined (reading 'findIndex')"
    return { estudiantes: [], niveles: [] };
  }
};

/**
 * Descarga en segundo plano del comprobante PDF de caja
 */
export const descargarComprobanteCaja = async (idTransaccion) => {
  const response = await api.get(`/reportes/comprobante-caja/${idTransaccion}`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.setAttribute('download', `Comprobante_Pago_${idTransaccion}.pdf`);
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
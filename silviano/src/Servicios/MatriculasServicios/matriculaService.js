import api from '../../Servicios/api/api';
/**
 * Carga de catálogos base (Estudiantes, Niveles)
 */
export const getCatalogosMatricula = async () => {
  try {
    const [estudiantesRes, nivelesRes] = await Promise.all([
      api.get('/estudiante-app/estudiantes'),
      api.get('/nivel-educativo/'),
    ]);

    const estudiantesData = Array.isArray(estudiantesRes.data) ? estudiantesRes.data : [];
    const estudiantes = estudiantesData.map((e) => ({
      label: `[${e.codEstudiante || e.codigo || 'SIN-COD'}] ${e.nombre_completo || e.nombre || ''} ${e.apellido_completo || e.apellido || ''}`.trim(),
      value: e.idpersona || e.idestudiante || e.id,
      codigo: e.codEstudiante || e.codigo,
      nombre: `${e.nombre_completo || e.nombre || ''} ${e.apellido_completo || e.apellido || ''}`.trim()
    }));

    const nivelesData = Array.isArray(nivelesRes.data) ? nivelesRes.data : [];
    const niveles = nivelesData.map((n) => ({
      label: n.nombre,
      value: n.idnivel || n.id,
    }));

    return { estudiantes, niveles };
  } catch (error) {
    console.error('Error al cargar catálogos de matrícula:', error);
    return { estudiantes: [], niveles: [] };
  }
};

/**
 * Consulta Grados filtrados por Nivel Educativo
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
    console.error(`Error al obtener grados:`, error);
    return [];
  }
};

/**
 * Consulta Salones disponibles por Grado y Año Lectivo
 */
export const obtenerSalonesDisponibles = async (idGrado, anioLectivo) => {
  if (!idGrado || !anioLectivo) return [];
  try {
    const { data } = await api.get(`/estudiante-app/disponibles/salon/${idGrado}/${anioLectivo}`);
    const rawData = Array.isArray(data) ? data : data?.salones || [];

    return rawData.map((s) => ({
      label: `${s.catalogoSalon?.nombreSalon || 'Aula'} - Secc "${s.seccion || 'A'}" (${s.turno || 'Matutino'})`,
      value: s.idSalon,
    }));
  } catch (error) {
    console.error('Error al consultar salones:', error);
    return [];
  }
};

/**
 * Registra la matrícula académica oficial
 */
export const registrarMatriculaOficial = async (payload) => {
  const payloadDTO = {
    idPersona: Number(payload.idpersona),
    idSalon: Number(payload.idSalon),
    anioLectivo: Number(payload.anio_lectivo),
    fechaInscripcion: new Date().toISOString().split('T')[0],
    usuario: payload.usuario || 'ADMIN',
  };

  const { data } = await api.post('/estudiante-app/matriculas/create', payloadDTO);
  return data;
};

/**
 * Descarga Ficha Oficial PDF de Jaspersoft REST API v2
 */
export const descargarFichaMatriculaPDF = async (idMatricula) => {
  const response = await api.get(`/reportes/ficha-matricula/${idMatricula}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `Ficha_Matricula_${idMatricula}.pdf`);
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
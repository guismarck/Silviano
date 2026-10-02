import api from '../../Servicios/api/api';

/**
 * Carga todos los catálogos requeridos para el formulario de matrícula en paralelo.
 */
export const getCatalogosNuevaMatricula = async () => {
  const [estudiantesRes, gradosRes, planesRes, pagosRes] = await Promise.all([
    api.get('/estudiante-app/estudiantes'),
    api.get('/estudiante-app/grados'),
    api.get('/estudiante-app/plandeEstudio'),
    api.get('/estudiante-app/pago')
  ]);

  return {
    estudiantes: estudiantesRes.data || [],
    grados: gradosRes.data || [],
    planes: planesRes.data || [],
    pagos: pagosRes.data || []
  };
};

/**
 * Registra una nueva matrícula en la base de datos.
 * @param {Object} payload - Datos formateados de la matrícula.
 */
export const crearMatricula = async (payload) => {
  const response = await api.post('/estudiante-app/matriculas/create', payload);
  return response.data;
};

/**
 * Obtiene el listado completo de matrículas registradas.
 */
export const getMatriculas = async () => {
  const response = await api.get('/estudiante-app/matriculas');
  return response.data;
};

/**
 * Elimina el registro de una matrícula por su ID.
 * @param {number|string} idMatricula - ID de la matrícula a eliminar.
 */
export const eliminarMatricula = async (idMatricula) => {
  const response = await api.delete(`/estudiante-app/matriculas/${idMatricula}`);
  return response.data;
};

/**
 * Obtiene el detalle de una matrícula por su ID.
 * @param {number|string} idMatricula - ID de la matrícula.
 */
export const getMatriculaById = async (idMatricula) => {
  const response = await api.get(`/estudiante-app/matriculas/${idMatricula}`);
  return response.data;
};


/**
 * Reutiliza la carga de catálogos base { label, value } para estudiantes y niveles.
 */
export const getCatalogosMatricula = async () => {
  try {
    const [estudiantesRes, nivelesRes] = await Promise.all([
      api.get('/estudiante-app/estudiantes'),
      api.get('/nivel-educativo/'),
    ]);

    const estudiantesData = Array.isArray(estudiantesRes.data) ? estudiantesRes.data : [];
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
    console.error('Error al cargar catálogos de matrícula:', error);
    return { estudiantes: [], niveles: [] };
  }
};

/**
 * Consulta Grados Académicos filtrados por Nivel Educativo.
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
 * Consulta Salones disponibles mapeando la estructura JPA anidada.
 */
export const obtenerSalonesDisponibles = async (idGrado, anioLectivo) => {
  if (!idGrado || !anioLectivo) return [];

  try {
    const { data } = await api.get(`/estudiante-app/disponibles/salon/${idGrado}/${anioLectivo}`);
    const rawData = Array.isArray(data) ? data : data?.salones || [];

    return rawData.map((s) => {
      const nombreSalon = s.catalogoSalon?.nombreSalon || s.catalogoSalon?.nombre || 'Aula Sin Nombre';
      const capacidad = s.catalogoSalon?.capacidadMax || s.catalogoSalon?.capacidad || 0;
      const seccion = s.seccion || 'A';
      const turno = s.turno || 'Matutino';

      return {
        label: `${nombreSalon} - Secc "${seccion}" (${turno})`,
        value: s.idSalon,
        detalles: {
          idCatalogoSalon: s.catalogoSalon?.idCatalogoSalon,
          capacidad,
          seccion,
          turno,
          anioLectivo: s.anioLectivo,
        },
      };
    });
  } catch (error) {
    console.error('Error al consultar salones disponibles:', error);
    return [];
  }
};

/**
 * Verifica si el estudiante posee matrícula activa en el año lectivo.
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
 * Registra la matrícula académica oficial en la base de datos (Sin cobro).
 */
export const registrarMatriculaOficial = async (payload) => {
  try {
    const payloadDTO = {
      idPersona: Number(payload.idpersona),
      idSalon: Number(payload.idSalon),
      anioLectivo: Number(payload.anio_lectivo),
      // Formato explícito YYYY-MM-DD para la API del MINED / SIGE
      fechaInscripcion: new Date(payload.fecha_transaccion).toISOString().split('T')[0],
      usuario: payload.usuario || 'ADMIN',
    };

    const { data } = await api.post('/estudiante-app/matriculas/create', payloadDTO);
    return data;
  } catch (error) {
    // Relanzamos el error para que sea capturado y mostrado por la UI (Toast)
    throw error;
  }
};

/**
 * Descarga la Ficha Oficial de Matrícula en PDF generada en Jaspersoft Server vía REST API v2.
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

  // Limpieza inmediata de memoria Blob
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
/*
// Obtener matrículas (por defecto los últimos 100 registros)
export const getMatriculas = async (limit = 100) => {
  const response = await api.get('/matriculas', {
    params: {
      _limit: limit,
      _sort: 'id',
      _order: 'desc'
    }
  });
  return response.data;
};*/
/*
// Eliminar matrícula por ID
export const eliminarMatricula = async (id) => {
  const response = await api.delete(`/matriculas/${id}`);
  return response.data;
};*/

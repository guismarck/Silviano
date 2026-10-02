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
 * Mapea correctamente la estructura JPA anidada de la entidad Salon:
 * Salon -> CatalogoSalon (nombre, capacidad)
 * Salon -> Grado
 */
export const obtenerSalonesDisponibles = async (idGrado, anioLectivo) => {
  if (!idGrado || !anioLectivo) return [];

  try {
    // Coincide con el backend @GetMapping("/disponibles/salon/{idGrado}/{anioLectivo}")
    const { data } = await api.get(`/estudiante-app/disponibles/salon/${idGrado}/${anioLectivo}`);

    const rawData = Array.isArray(data) ? data : data?.salones || [];

    return rawData.map((s) => {
      // Mapeo seguro navegando el objeto JPA deserializado
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
    console.error('Error al mapear la entidad Salon:', error);
    throw error;
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
 * Mapea y sanitiza el payload para adaptar la convención JavaScript -> Java DTO (camelCase)
 * @param {Object} payload - Datos de la transacción capturados en el formulario
 */
export const registrarTransaccionCobro = async (payload) => {
  // Formatear la fecha al estándar ISO-8601 esperado por LocalDateTime/LocalDate en Java
  const fechaFormateada = payload.p_fecha_transaccion
    ? new Date(payload.p_fecha_transaccion).toISOString().slice(0, 19)
    : new Date().toISOString().slice(0, 19);

  // Mapeo alineado al DTO de Java: EmisionReciboRequestDTO
  const payloadDTO = {
    idPersona: Number(payload.p_idpersona) || 0,
    idSalon: payload.p_idSalon ? Number(payload.p_idSalon) : null,
    anioLectivo: Number(payload.p_anio_lectivo) || new Date().getFullYear(),
    concepto: String(payload.p_concepto || '').trim(),
    tipoPago: String(payload.p_tipo_pago || '').trim(),
    monto: parseFloat(payload.p_monto) || 0.00,
    idTarifa: payload.p_idtarifa ? Number(payload.p_idtarifa) : null,
    fechaTransaccion: fechaFormateada, // Ej: "2026-09-26T08:00:00"
    usuario: payload.p_usuario || 'CAJERO_SESION'
  };

  console.group('[PAYLOAD SANITIZADO -> ENVIANDO A DTO JAVA]');
  console.log('Endpoint:', '/estudiante-app/procesar-emision');
  console.log('Payload DTO:', JSON.stringify(payloadDTO, null, 2));
  console.groupEnd();

  const { data } = await api.post('/estudiante-app/procesar-emision', payloadDTO);
  return data;
};

/*
export const registrarTransaccionCobro = async (payload) => {
  const response = await api.post('/pago/create', payload);
  return response.data;
};*/
/**
 * Solicita a Node.js (proxy hacia Jaspersoft REST API v2) la generación del PDF.
 * Descarga y libera los recursos de memoria blob.
 */
export const descargarReciboPDF = async (numRecibo) => {
  const response = await api.get(`/reportes/recibo/${numRecibo}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `Recibo_${numRecibo}.pdf`);
  document.body.appendChild(link);
  link.click();

  // Limpieza inmediata de memoria
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
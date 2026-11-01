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
 * Obtiene el detalle completo de una matrícula por su ID.
 * @param {number|string} idMatricula - ID de la matrícula.
 */
export const getMatriculaById = async (idMatricula) => {
  const response = await api.get(`/estudiante-app/matriculas/${idMatricula}/detalle`);
  return response.data;
};


/**
 * Reutiliza la carga de catálogos base { label, value } para estudiantes y niveles.
 */
/*
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
};*/

/**
 * Busca estudiantes por código, nombre o apellido.
 * @param {string} search - Término de búsqueda.
 */
export const buscarEstudiantesMatricula = async (search) => {
  const { data } = await api.get('/estudiante-app/estudiantes/buscar', {
    params: { search },
  });
  return Array.isArray(data) ? data : [];
};

export const obtenerEstudiantePorCodigo = async (codEstudiante) => {
  const codigo = String(codEstudiante || '').trim();
  if (!codigo) throw new Error('El código del estudiante es obligatorio.');

  const { data } = await api.get(
    `/estudiante-app/estudiantes/codigo/${encodeURIComponent(codigo)}`
  );
  return data;
};

/**
 * Consulta Grados Académicos filtrados por Nivel Educativo.
 */
/*
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
};*/

/**
 * Consulta Salones disponibles mapeando la estructura JPA anidada.
 */
/*
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
};*/

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
 * Consulta los pagos de matrícula de una persona para un año lectivo.
 * El endpoint responde 404 cuando aún no existen pagos.
 */
export const buscarSolvenciaMatricula = async (idPersona, anioLectivo) => {
  const { data } = await api.get('estudiante-app/pago/solvencia-matricula', {
    params: { idPersona, anioLectivo },
    headers: { Accept: 'application/json, application/xml, text/xml' }
  });

  if (Array.isArray(data)) return data;

  if (typeof data === 'string') {
    const contenido = data.trim();
    if (!contenido) return [];

    if (contenido.startsWith('[') || contenido.startsWith('{')) {
      const respuestaJson = JSON.parse(contenido);
      if (Array.isArray(respuestaJson)) return respuestaJson;
      if (Array.isArray(respuestaJson.item)) return respuestaJson.item;
      if (respuestaJson.item) return [respuestaJson.item];
      throw new Error('La respuesta de solvencia no tiene el formato esperado.');
    }

    const documento = new DOMParser().parseFromString(contenido, 'application/xml');
    if (documento.querySelector('parsererror')) {
      throw new Error('No se pudo interpretar la respuesta XML de solvencia.');
    }

    return Array.from(documento.getElementsByTagName('item')).map((item) => {
      const valor = (nombre) => item.getElementsByTagName(nombre)[0]?.textContent?.trim() ?? '';
      return {
        idPersona: valor('idPersona'),
        idTarifa: valor('idTarifa'),
        arancel: valor('arancel'),
        anioLectivo: valor('anioLectivo'),
        montoOficial: valor('montoOficial'),
        totalPagado: valor('totalPagado'),
        saldoPendiente: valor('saldoPendiente'),
        estado: valor('estado')
      };
    });
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.item)) return data.item;
    if (data.item) return [data.item];
  }

  throw new Error('La respuesta de solvencia no tiene el formato esperado.');
};

/**
 * Registra la matrícula académica oficial en la base de datos (Sin cobro).
 */
/*
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
};*/

/**
 * Carga de Niveles Educativos para los combos de ubicación académica.
 */
export const getCatalogosMatricula = async () => {
  try {
    const { data } = await api.get('estudiante-app/nivel-educativo');
    const nivelesData = Array.isArray(data) ? data : [];
    
    return nivelesData.map((n) => ({
      label: n.nombre || n.nombreNivel || 'Nivel sin nombre',
      value: n.idnivel || n.id,
    }));
  } catch (error) {
    console.error('Error al cargar catálogo de niveles:', error);
    return [];
  }
};

/**
 * Búsqueda dinámica de estudiantes/expedientes para el AutoComplete.
 */
export const buscarEstudiantesAuto = async (criterio) => {
  if (!criterio || criterio.trim().length < 2) return [];

  try {
    const { data } = await api.get(`/estudiante-app/buscar`, {
      params: { criterio }
    });

    const lista = Array.isArray(data) ? data : [data];
    return lista.map((e) => {
      const est = e.estudiante || e;
      const tut = e.tutor || {};
      const codigoMined = String(est.codigoMined ?? est.codigoMINED ?? '').trim();
      const nombreCompleto = `${est.nombres || est.nombre_completo || ''} ${est.apellidos || est.apellido_completo || ''}`.trim();
      const labelEstudiante = `[${codigoMined || 'SIN-COD'} ] - ${nombreCompleto}`;

      return {
        label: labelEstudiante,
        labelEstudiante,
        value: est.id || est.idPersona || est.idpersona,
        rawEstudiante: {
          id: est.id || est.idPersona || est.idpersona || '',
          idPersona: est.idPersona ?? est.idpersona ?? est.id,
          idPersonaEstudiante: est.idPersonaEstudiante ?? est.idEstudiante ?? est.idestudiante ?? est.id,
          nombres: est.nombres || est.nombre_completo || '',
          apellidos: est.apellidos || est.apellido_completo || '',
          codigoMined,
          codEstudiante: est.codEstudiante || est.cod_estudiante || est.codigo || '',
          cedulaDni: est.cedulaDni || est.codEstudiante || '',
          alergiasEnfermedades: est.alergiasEnfermedades || 'Ninguna'
        },
        rawTutor: {
          idPersonaTutor: tut.idPersonaTutor ?? tut.idPersona ?? tut.idpersona ?? tut.id,
          nombreCompleto: tut.nombreCompleto || tut.nombre || '',
          cedulaDni: tut.cedulaDni || tut.cedula || '',
          parentesco: tut.parentesco || 'PADRE',
          telefono: tut.telefono || '',
          correo: tut.correo || '',
          esResponsableFinanciero: tut.esResponsableFinanciero ?? true
        },
        pagoRealizado: e.pagoRealizado ?? true,
        numRecibo: e.numRecibo || 'REC-' + Math.floor(100000 + Math.random() * 900000)
      };
    });
  } catch (error) {
    // Mock de respaldo en desarrollo
    if (criterio === '123' || criterio.toLowerCase().includes('william') || criterio.toLowerCase().includes('mendez')) {
      return [{
        label: '[EST-1024 / 0801-2013-09122] - William Mendez',
        labelEstudiante: '[EST-1024 / 0801-2013-09122] - William Mendez',
        value: 1024,
        rawEstudiante: {
          id: 1024,
          nombres: 'William',
          apellidos: 'Mendez',
          codigoMined: '',
          cedulaDni: '0801-2013-09122',
          alergiasEnfermedades: 'Ninguna'
        },
        rawTutor: {
          nombreCompleto: 'Elena Mendoza de Silva',
          cedulaDni: '001-250885-0002K',
          parentesco: 'MADRE',
          telefono: '+505 8888-8888',
          correo: 'elena.mendoza@email.com',
          esResponsableFinanciero: true
        },
        pagoRealizado: true,
        numRecibo: 'REC-2026-7731'
      }];
    }
    return [];
  }
};

/**
 * Búsqueda específica por Tutor/Padre de Familia (Cédula CSE o Nombre del Tutor)
 */
export const buscarTutoresAuto = async (criterio) => {
  if (!criterio || String(criterio).trim().length < 2) return [];

  try {
    const { data } = await api.get(`/estudiante-app/tutores`, {
      params: { search: String(criterio).trim(), tipoBusqueda: 'TUTOR' }
    });

    const lista = Array.isArray(data) ? data : [data];
    return mapearRespuestaBuscador(lista);
  } catch (error) {
    const q = String(criterio).toLowerCase().trim();
    return MOCK_EXPEDIENTES.filter(item => 
      item.rawTutor.cedulaDni.toLowerCase().includes(q) ||
      item.rawTutor.nombreCompleto.toLowerCase().includes(q)
    );
  }
};

/**
 * Mapper helper inmutable y seguro contra valores undefined/null
 */
const mapearRespuestaBuscador = (lista) => {
  return lista.map((e) => {
    const tut = e.tutor || e;
    const nombresTutor = String(tut.nombres || tut.nombre_completo || '').trim();
    const apellidosTutor = String(tut.apellidos || tut.apellido_completo || '').trim();
    const nombreTutor = String(
      tut.nombreCompleto || tut.nombre || `${nombresTutor} ${apellidosTutor}`
    ).trim() || 'Sin nombre';
    const cedulaTutor = String(tut.cedulaDni || tut.cedula || tut.cedula_dni || '').trim();
    const idPersonaTutor = tut.idPersonaTutor ?? tut.idPersona ?? tut.idpersona ?? tut.id;

    return {
      labelTutor: `[Cédula: ${cedulaTutor || 'Sin DNI'}] - ${nombreTutor}`,
      value: idPersonaTutor,
      rawTutor: {
        idPersonaTutor,
        nombreCompleto: nombreTutor,
        cedulaDni: cedulaTutor,
        parentesco: typeof tut.parentesco === 'object' ? (tut.parentesco?.value || 'PADRE') : String(tut.parentesco || 'PADRE').trim(),
        telefono: String(tut.telefono || tut.telefonoPrincipal || tut.telefono_principal || '').replace(/\D/g, '').slice(0, 8),
        correo: String(tut.correo || tut.email || tut.correo_electronico || '').trim(),
        esResponsableFinanciero: tut.esResponsableFinanciero ?? true
      }
    };
  });
};

/**
 * Consulta Grados Académicos por Nivel.
 */
export const obtenerGradosPorNivel = async (idNivel) => {
  if (!idNivel) return [];
  try {
    const { data } = await api.get(`/estudiante-app/nivel/${idNivel}`);
    const rawData = Array.isArray(data) ? data : [];

    return rawData.map((g) => ({
      label: g.nombre || g.nombreGrado || 'Grado no especificado',
      value: g.idGrado || g.id,
    }));
  } catch (error) {
    console.error(`Error al obtener grados para el nivel ${idNivel}:`, error);
    return [];
  }
};

/**
 * Consulta Salones por Grado y Año Lectivo.
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
    console.error('Error al consultar salones disponibles:', error);
    return [];
  }
};

/**
 * Envía el expediente de matrícula completo a Spring Boot / Node.js
 */
export const registrarMatriculaOficial = async (payload) => {
  const payloadDTO = {
    idEstudiante: Number(payload.estudiante.id),
    estudianteActualizado: payload.estudiante,
    tutorActualizado: payload.tutor,
    tipoIngreso: payload.tipoIngreso, // 'NUEVO' | 'REINGRESO'
    idSalon: Number(payload.idSalon),
    anioLectivo: Number(payload.anioLectivo),
    pagoVerificado: Boolean(payload.pagoVerificado),
    numRecibo: payload.numRecibo,
    montoMatricula: Number(payload.montoMatricula),
    requisitos: payload.requisitos,
    fechaInscripcion: new Date().toISOString().split('T')[0]
  };

  const { data } = await api.post('/estudiante-app/matriculas/create', payloadDTO);
  return data;
};

/**
 * Registra una matrícula con el DTO completo del endpoint de matrículas.
 */
export const registrarMatriculaCompleta = async (payload) => {
  const estudiante = payload.estudiante || {};
  const tutor = payload.tutor || {};
  const requisitosId = {
    partidaNacimiento: 1,
    fotoCarnet: 2,
    boletinCalificaciones: 3,
    hojaTraslado: 4,
    constanciaConducta: 5,
    dniTutores: 6
  };

  const payloadDTO = {
    idPersona: Number(estudiante.idPersona ?? estudiante.id),
    idPersonaEstudiante: Number(estudiante.idPersonaEstudiante ?? estudiante.id),
    nombresEstudiante: estudiante.nombres,
    apellidosEstudiante: estudiante.apellidos,
    codigoMined: estudiante.codigoMined,
    idPersonaTutor: tutor.idPersonaTutor ? Number(tutor.idPersonaTutor) : null,
    nombreCompletoTutor: tutor.nombreCompleto,
    cedulaTutor: tutor.cedulaDni,
    telefonoTutor: tutor.telefono,
    correoTutor: tutor.correo,
    parentesco: tutor.parentesco,
    representanteLegalFinanciero: Number(Boolean(tutor.esResponsableFinanciero)),
    idSalon: Number(payload.idSalon),
    anioLectivo: String(payload.anioLectivo),
    tipoIngreso: payload.tipoIngreso,
    costoMatricula: Number(payload.montoMatricula),
    estado: 'ACTIVA',
    requisitosPresentados: Object.entries(requisitosId)
      .filter(([requisito]) => Boolean(payload.requisitos?.[requisito]))
      .map(([, id]) => id),
    fechaInscripcion: new Date().toISOString().split('T')[0],
    usuario: 'ADMIN'
  };

  const { data } = await api.post('estudiante-app/matriculas/completa', payloadDTO);
  return data;
};

/**
 * Descarga la hoja de matrícula desde la plantilla PDF de Jaspersoft.
 */
export const descargarFichaMatriculaPDF = async (idMatricula) => {
  const response = await api.post(
    '/reportes/descargar',
    {
      nombrePlantilla: 'HojaMatricula_silviano',
      formato: 'PDF',
      parametros: {
        P_IDMATRICULA: Number(idMatricula)
      }
    },
    {
      baseURL: process.env.NODE_ENV === 'development' ? '' : undefined,
      responseType: 'blob'
    }
  );

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'HojaMatricula_silviano.pdf');
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

const MOCK_EXPEDIENTES = [
  {
    labelEstudiante: '[EST-1024] - William Mendez',
    labelTutor: '[Cédula: 001-250885-0002K] - Elena Mendoza de Silva',
    value: 1024,
    rawEstudiante: {
      id: 1024,
      nombres: 'William',
      apellidos: 'Mendez',
      codEstudiante: 'EST-1024',
      alergiasEnfermedades: 'Ninguna'
    },
    rawTutor: {
      nombreCompleto: 'Elena Mendoza de Silva',
      cedulaDni: '001-250885-0002K',
      parentesco: 'MADRE',
      telefono: '88888888',
      correo: 'elena.mendoza@email.com',
      esResponsableFinanciero: true
    },
    pagoRealizado: true,
    numRecibo: 'REC-2026-7731'
  },
  {
    labelEstudiante: '[EST-2048] - Carlos Pérez',
    labelTutor: '[Cédula: 080-120578-0001A] - Roberto Pérez López',
    value: 2048,
    rawEstudiante: {
      id: 2048,
      nombres: 'Carlos',
      apellidos: 'Pérez',
      codEstudiante: 'EST-2048',
      alergiasEnfermedades: 'Asma'
    },
    rawTutor: {
      nombreCompleto: 'Roberto Pérez López',
      cedulaDni: '080-120578-0001A',
      parentesco: 'PADRE',
      telefono: '87654321',
      correo: 'roberto.perez@email.com',
      esResponsableFinanciero: true
    },
    pagoRealizado: false,
    numRecibo: ''
  }
];
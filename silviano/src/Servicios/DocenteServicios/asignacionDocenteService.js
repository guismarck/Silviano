import api from '../api/api'; 

/**
 * Convierte un documento XML en un arreglo de objetos JavaScript
 * @param {string} xmlText 
 */
const parseDocentesXml = (xmlText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');
  const docentes = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const getVal = (tagName) => item.getElementsByTagName(tagName)[0]?.textContent || '';

    docentes.push({
      idpersona: parseInt(getVal('idpersona'), 10),
      nombre_completo: getVal('nombre_completo'),
      apellido_completo: getVal('apellido_completo'),
      sexo: getVal('sexo'),
      direccion: getVal('direccion'),
      cedula: getVal('cedula'),
      codDocente: getVal('codDocente'),
      especialidad: getVal('especialidad'),
      estado: getVal('estado') === 'true',
    });
  }

  return docentes;
};

export const asignacionDocenteService = {
/**
   * Obtiene y normaliza la lista de docentes activos soportando XML y JSON
   */
  obtenerDocentes: async () => {
    try {
      const response = await api.get('/estudiante-app/docentes', {
        headers: { Accept: 'application/json, application/xml, text/xml' },
        responseType: 'text', // Recibimos el texto plano para parsing seguro
      });

      let docentesRaw = [];

      // 1. Si la respuesta es una cadena de texto XML
      if (typeof response.data === 'string' && response.data.includes('<List>')) {
        docentesRaw = parseDocentesXml(response.data);
      } else {
        // 2. Si la respuesta es JSON parseado automáticamente
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
          } catch {
            parsedData = [];
          }
        }

        if (Array.isArray(parsedData)) {
          docentesRaw = parsedData;
        } else if (parsedData?.List?.item) {
          docentesRaw = Array.isArray(parsedData.List.item)
            ? parsedData.List.item
            : [parsedData.List.item];
        } else if (parsedData?.item) {
          docentesRaw = Array.isArray(parsedData.item)
            ? parsedData.item
            : [parsedData.item];
        }
      }

      // Mapeo unificado a DTO para componentes React
      return docentesRaw.map((docente) => {
        const nombreStr = docente.nombre_completo || '';
        const apellidoStr = docente.apellido_completo || '';
        const nombreCompletoCalculado = `${nombreStr} ${apellidoStr}`.trim();

        return {
          idpersona: Number(docente.idpersona),
          codDocente: docente.codDocente || 'N/A',
          nombreCompleto: nombreCompletoCalculado || 'Docente Sin Nombre',
          labelCompleto: `${nombreCompletoCalculado} (${docente.codDocente || 'SIN-CÓDIGO'}) - ${docente.especialidad || 'General'}`,
          especialidad: docente.especialidad || 'General',
          cedula: docente.cedula || '',
          estado: Boolean(docente.estado),
        };
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al procesar la lista de docentes.');
    }
  },

/**
   * Consulta los Planes de Estudio por año lectivo
   */
  obtenerPlanesDeEstudio: async (anioLectivo = new Date().getFullYear()) => {
    try {
      const response = await api.get('/estudiante-app/plandeEstudio', {
        params: { anioLectivo },
      });

      const listaRaw = Array.isArray(response.data)
        ? response.data
        : response.data?.item || [];

      return listaRaw
        .filter((plan) => plan.estado !== false)
        .map((plan) => {
          const idGrado = plan.grado?.idGrado || null;
          const nombreGrado = plan.grado?.nombreGrado || plan.grado?.nombre || `Grado #${idGrado || 'S/N'}`;

          return {
            idPlanDeEstudio: plan.idPlanDeEstudio,
            idGrado: idGrado,
            grado: nombreGrado,
            anioLectivo: plan.anioLectivo || anioLectivo,
            labelPlan: `Plan ${plan.anioLectivo} - ${nombreGrado}`,
          };
        });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al consultar los planes de estudio.');
    }
  },

  /**
   * Consulta el catálogo general de asignaturas activas de la institución
   */
  obtenerCatalogoAsignaturas: async () => {
    try {
      const response = await api.get('/estudiante-app/asignatura');
      const listaRaw = Array.isArray(response.data)
        ? response.data
        : response.data?.item || [];

      return listaRaw.map((asig) => ({
        idAsignatura: asig.idAsignatura || asig.id,
        nombre: asig.nombre || '',
        codigo: asig.codigo || '',
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el catálogo de asignaturas.');
    }
  },

  /**
   * Consulta los salones disponibles para el grado y año lectivo seleccionados
   */
  obtenerSalonesDisponiblesPorGrado: async (idGrado, anioLectivo) => {
    if (!idGrado || !anioLectivo) return [];

    try {
      const response = await api.get(
        `/estudiante-app/disponibles/salon/${idGrado}/${anioLectivo}`
      );
      const listaRaw = Array.isArray(response.data)
        ? response.data
        : response.data?.salones || response.data?.item || [];

      return listaRaw.map((s) => ({
        idSalon: s.idSalon || s.id,
        seccion: s.seccion || s.nombreSeccion || '',
        turno: s.turno || '',
        labelSalon: `Sección: ${s.seccion || s.nombreSeccion || ''} (${s.turno || 'MATUTINO'})`,
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los salones disponibles.');
    }
  },
/**
   * Obtiene la carga académica actual asignada a un docente
   * @param {number} idDocente 
   */
  obtenerCargaAcademicaDocente: async (idDocente) => {
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
   * Asigna una asignatura/salón al expediente del docente
   * @param {Object} payload - { idDocente, idDetallePlanDeEstudio, idSalon }
   */
  asignarCargaDocente: async (payload) => {
    try {
      console.log('[asignarCargaDocente] Payload enviado:', payload);
      const response = await api.post('estudiante-app/docentes/asignar-carga', payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al procesar la asignación académica.');
    }
  },

  /**
   * Remueve una asignatura de la carga del docente
   * @param {number} idDetallePlanDeEstudio 
   * @param {number} idDocente 
   */
  eliminarAsignacion: async (idDetallePlanDeEstudio, idDocente) => {
    try {
      const response = await api.delete(`/docentes/${idDocente}/carga-academica/${idDetallePlanDeEstudio}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al desasignar la carga académica.');
    }
  },
};
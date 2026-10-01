import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import {
  getCatalogosMatricula,
  obtenerGradosPorNivel,
  obtenerSalonesDisponibles,
  obtenerMatriculaActiva,
  registrarMatriculaOficial,
  descargarFichaMatriculaPDF,
} from './matriculasService';

const ANIO_ACTUAL = new Date().getFullYear();

const getFechaFormateadaBD = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_FORM_STATE = {
  idpersona: null,
  idnivel: null,
  idGrado: null,
  idSalon: null,
  anio_lectivo: ANIO_ACTUAL,
  fecha_transaccion: getFechaFormateadaBD(),
};

export const RegistroMatricula = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [estudiantesOptions, setEstudiantesOptions] = useState([]);
  const [nivelesOptions, setNivelesOptions] = useState([]);
  const [gradosOptions, setGradosOptions] = useState([]);
  const [salonesOptions, setSalonesOptions] = useState([]);
  const [matriculaActiva, setMatriculaActiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [idMatriculaGenerada, setIdMatriculaGenerada] = useState(null);

  const toastRef = useRef(null);

  const aniosLectivos = useMemo(
    () => [
      { label: `${ANIO_ACTUAL}`, value: ANIO_ACTUAL },
      { label: `${ANIO_ACTUAL + 1}`, value: ANIO_ACTUAL + 1 },
    ],
    []
  );

  // Carga inicial de estudiantes y niveles
  useEffect(() => {
    let isMounted = true;
    getCatalogosMatricula()
      .then(({ estudiantes, niveles }) => {
        if (isMounted) {
          setEstudiantesOptions(estudiantes || []);
          setNivelesOptions(niveles || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          toastRef.current?.show({
            severity: 'error',
            summary: 'Error de Carga',
            detail: 'No se pudieron obtener los catálogos base de estudiantes y niveles.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Carga de Grados por Nivel
  useEffect(() => {
    if (!formData.idnivel) {
      setGradosOptions([]);
      return;
    }
    let isMounted = true;
    obtenerGradosPorNivel(formData.idnivel)
      .then((data) => {
        if (isMounted) setGradosOptions(data);
      })
      .catch(() => {
        if (isMounted) setGradosOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.idnivel]);

  // Carga de Salones con vacantes
  useEffect(() => {
    if (!formData.idGrado || !formData.anio_lectivo) {
      setSalonesOptions([]);
      return;
    }
    let isMounted = true;
    obtenerSalonesDisponibles(formData.idGrado, formData.anio_lectivo)
      .then((data) => {
        if (isMounted) setSalonesOptions(data);
      })
      .catch(() => {
        if (isMounted) setSalonesOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.idGrado, formData.anio_lectivo]);

  // Verificación de existencia de matrícula
  useEffect(() => {
    if (formData.idpersona && formData.anio_lectivo) {
      let isMounted = true;
      obtenerMatriculaActiva(formData.idpersona, formData.anio_lectivo)
        .then((res) => {
          if (isMounted) setMatriculaActiva(res);
        })
        .catch(() => {
          if (isMounted) setMatriculaActiva(null);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setMatriculaActiva(null);
    }
  }, [formData.idpersona, formData.anio_lectivo]);

  // Actualización inmutable del formulario
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'idnivel') {
        updated.idGrado = null;
        updated.idSalon = null;
      }
      if (field === 'idGrado') {
        updated.idSalon = null;
      }
      return updated;
    });
  }, []);

  const handleRestablecer = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setMatriculaActiva(null);
    setIdMatriculaGenerada(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idpersona || !formData.idnivel || !formData.idGrado || !formData.idSalon) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Campos Incompletos',
        detail: 'Debe seleccionar Estudiante, Nivel, Grado y Asignar un Salón.',
      });
      return;
    }

    if (matriculaActiva) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Inscripción Duplicada',
        detail: `El estudiante ya se encuentra matriculado en el ciclo lectivo ${formData.anio_lectivo}.`,
      });
      return;
    }

    setLoading(true);

    try {
      const respuesta = await registrarMatriculaOficial(formData);
      const idMatricula = respuesta.idMatricula || respuesta.id_matricula || respuesta.id;
      setIdMatriculaGenerada(idMatricula);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Matrícula Completada',
        detail: 'El expediente del alumno ha sido activado con éxito.',
      });

      if (idMatricula) {
        await descargarFichaMatriculaPDF(idMatricula);
      }
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error en Inscripción',
        detail: error.message || 'No se pudo completar el registro de la matrícula.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReimprimirFicha = async () => {
    if (!idMatriculaGenerada) return;
    setLoadingReporte(true);
    try {
      await descargarFichaMatriculaPDF(idMatriculaGenerada);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error Jaspersoft',
        detail: 'Ocurrió un fallo al descargar la Ficha Oficial.',
      });
    } finally {
      setLoadingReporte(false);
    }
  };

  const estudianteSeleccionadoLabel = useMemo(() => {
    if (!formData.idpersona) return '';
    const encontrado = estudiantesOptions.find((e) => e.value === formData.idpersona);
    return encontrado ? encontrado.label : '';
  }, [formData.idpersona, estudiantesOptions]);

  return (
    <div className="flex justify-content-center align-items-center min-h-full p-3 md:p-5">
      <Toast ref={toastRef} />

      <div className="card p-4 shadow-2 surface-card border-round w-full md:w-10 lg:w-8 max-w-60rem">
        <div className="mb-4 text-center md:text-left">
          <h3 className="m-0 text-900 font-bold text-xl md:text-2xl">Matrícula Escolar</h3>
          <span className="text-600 text-sm md:text-base">
            Asignación académica de nivel, grado y salón para el expediente estudiantil
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-fluid grid">
          {/* Estudiante */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="estudiante" className="font-bold mb-2 block">
              Estudiante <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="estudiante"
              value={formData.idpersona}
              options={estudiantesOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleInputChange('idpersona', e.value)}
              placeholder="Seleccione el estudiante"
              filter
              showClear
            />
          </div>

          {/* Año Lectivo */}
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="anio_lectivo" className="font-bold mb-2 block">
              Año Lectivo <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="anio_lectivo"
              value={formData.anio_lectivo}
              options={aniosLectivos}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleInputChange('anio_lectivo', e.value)}
              placeholder="Año Lectivo"
            />
          </div>

          {/* Nivel Educativo */}
          <div className="col-12 md:col-4 mb-3">
            <label htmlFor="nivel" className="font-bold mb-2 block">
              Nivel Educativo <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="nivel"
              value={formData.idnivel}
              options={nivelesOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleInputChange('idnivel', e.value)}
              placeholder="Seleccione Nivel"
            />
          </div>

          {/* Grado */}
          <div className="col-12 md:col-4 mb-3">
            <label htmlFor="grado" className="font-bold mb-2 block">
              Grado Académico <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="grado"
              value={formData.idGrado}
              options={gradosOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleInputChange('idGrado', e.value)}
              placeholder="Seleccione Grado"
              disabled={!formData.idnivel}
            />
          </div>

          {/* Salón / Sección */}
          <div className="col-12 md:col-4 mb-3">
            <label htmlFor="salon" className="font-bold mb-2 block">
              Salón / Sección Asignada <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="salon"
              value={formData.idSalon}
              options={salonesOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleInputChange('idSalon', e.value)}
              placeholder="Seleccione Salón Disponible"
              disabled={!formData.idGrado}
            />
          </div>

          {/* Feedback Informativo */}
          <div className="col-12 mb-3">
            {matriculaActiva && (
              <Message
                severity="warn"
                text={`El alumno ${estudianteSeleccionadoLabel} ya registra inscripción activa en ${formData.anio_lectivo}.`}
                className="w-full justify-content-start"
              />
            )}

            {!matriculaActiva && formData.idpersona && (
              <Message
                severity="info"
                text="Al procesar la Matrícula Oficial se asignará la sección y se abrirá el expediente para el registro de notas."
                className="w-full justify-content-start"
              />
            )}
          </div>

          {/* Acciones del Formulario */}
          <div className="col-12 flex flex-row sm:flex-row justify-content-center gap-2 mt-3">
            <Button
              type="button"
              label="Limpiar"
              icon="pi pi-trash"
              className="p-button-outlined p-button-secondary w-full sm:w-auto"
              onClick={handleRestablecer}
              disabled={loading}
            />

            {idMatriculaGenerada && (
              <Button
                type="button"
                label="Descargar Ficha (PDF)"
                icon="pi pi-file-pdf"
                className="p-button-warning w-full sm:w-auto"
                onClick={handleReimprimirFicha}
                loading={loadingReporte}
              />
            )}

            <Button
              type="submit"
              label="Generar Matrícula"
              icon="pi pi-check-circle"
              className="p-button-primary w-full sm:w-auto"
              loading={loading}
              disabled={!!matriculaActiva}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroMatricula;
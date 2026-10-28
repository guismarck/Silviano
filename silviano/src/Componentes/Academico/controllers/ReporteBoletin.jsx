import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { buscarEstudiantesMatricula, descargarBoletin } from '../../../Servicios/ReporteServicios/reportesService';

// Expresión regular para caracteres en español (letras, espacios, tildes, ñ/Ñ)
const REGEX_SOLO_LETRAS_ESPANOL = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

export const ReporteBoletin = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingEstudianteAuto, setLoadingEstudianteAuto] = useState(false);
  const anioActual = new Date().getFullYear();

  // Combo de Años Lectivos dinámico desde 1990 hasta el año actual
  const opcionesAnios = useMemo(() => {
    const anios = [];
    for (let yr = anioActual; yr >= 1990; yr--) {
      anios.push({ label: `${yr}`, value: yr });
    }
    return anios;
  }, [anioActual]);

  // Estado unificado e inmutable del formulario
  const [formData, setFormData] = useState({
    tipoReporte: null,
    periodoLectivo: anioActual,
    numeroPeriodo: null,
    codigoMined: '',
    idPersona: null,
  });

  const opcionesTipoReporte = useMemo(() => [
    { label: 'Boletín Parcial', value: 'parcial' },
    { label: 'Boletín Final', value: 'final' },
  ], []);

  const opcionesPeriodos = useMemo(() => [
    { label: 'I PARCIAL', value: 1 },
    { label: 'II PARCIAL', value: 2 },
    { label: 'III PARCIAL', value: 3 },
    { label: 'IV PARCIAL', value: 4 },
    { label: 'V PARCIAL', value: 5 },
  ], []);

  // Estados independientes para la búsqueda y autocompletado
  const [busquedaEstudianteInput, setBusquedaEstudianteInput] = useState('');
  const [sugerenciasEstudiantes, setSugerenciasEstudiantes] = useState([]);

  // Handler para inputs primitivos de texto con validación de tildes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const strVal = value ?? '';

    if (name === 'codigoMined' && strVal !== '' && !REGEX_SOLO_LETRAS_ESPANOL.test(strVal)) {
      // Si el código MINED solo permite ciertos caracteres, ajusta la regex aquí
    }

    setFormData((prev) => ({ ...prev, [name]: strVal }));
  }, []);

  // Handler inmutable para el Dropdown de años
  const handleDropdownChange = useCallback((name, value) => {
    const valorPrimitivo = typeof value === 'object' && value !== null ? value.value : value;
    setFormData((prev) => ({ ...prev, [name]: valorPrimitivo }));
  }, []);

  // Búsqueda en la API mediante AutoComplete
  const handleCompleteEstudiantes = async (e) => {
    const query = e.query ? e.query.trim() : '';
    if (!query) {
      setSugerenciasEstudiantes([]);
      return;
    }

    setLoadingEstudianteAuto(true);
    try {
      const resultados = await buscarEstudiantesMatricula(query);

      // Normalización de datos devueltos por el backend
      const datosFormateados = resultados.map((est) => {
        const idPersonaExtrahido = est.idPersona || est.id_persona || est.id || null;
        const codigoMinedExtraido = est.codigoMined || est.codigo_mined || est.codigo || '';
        const nombreStr = est.nombre_completo || `${est.nombres || ''} ${est.apellidos || ''}`.trim();

        return {
          ...est,
          idPersona: idPersonaExtrahido,
          codigoMined: codigoMinedExtraido,
          labelEstudiante: codigoMinedExtraido 
            ? `[${codigoMinedExtraido}] - ${nombreStr}` 
            : nombreStr,
        };
      });

      setSugerenciasEstudiantes(datosFormateados);
    } catch (error) {
      setSugerenciasEstudiantes([]);
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Búsqueda',
        detail: 'No se pudieron cargar las sugerencias de estudiantes.',
      });
    } finally {
      setLoadingEstudianteAuto(false);
    }
  };

  // Selección de un estudiante desde la lista desplegable
  const handleSelectEstudiante = (e) => {
    const item = e.value;
    if (!item) return;

    setBusquedaEstudianteInput(item.labelEstudiante || '');
    setFormData((prev) => ({
      ...prev,
      idPersona: item.idPersona,
      codigoMined: item.codigoMined || prev.codigoMined,
    }));
  };

  // Template personalizado para renderizar cada elemento en la lista desplegable
  const estudianteItemTemplate = (item) => {
    return (
      <div className="flex align-items-center justify-content-between p-1">
        <div>
          <span className="font-bold block text-800">{item.labelEstudiante}</span>
          {item.cedula && <small className="text-500">Cédula: {item.cedula}</small>}
        </div>
        {item.codigoMined && (
          <span className="p-tag p-tag-info font-normal text-xs">
            MINED: {item.codigoMined}
          </span>
        )}
      </div>
    );
  };

  // Handler principal para envío del formulario y generación del PDF
  const handleGenerarBoletin = async (e) => {
    e.preventDefault();

    if (!formData.tipoReporte) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar si desea generar un boletín parcial o final.',
      });
      return;
    }

    if (!formData.codigoMined.trim() && !formData.idPersona) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe ingresar un Código MINED o seleccionar un estudiante para continuar.',
      });
      return;
    }

    if (formData.tipoReporte === 'parcial' && !formData.numeroPeriodo) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar el período del boletín parcial.',
      });
      return;
    }

    setLoading(true);
    try {
      await descargarBoletin({
        idPersona: formData.idPersona,
        codigoMined: formData.codigoMined,
        anioLectivo: formData.periodoLectivo,
        tipoReporte: formData.tipoReporte,
        numeroPeriodo: formData.tipoReporte === 'parcial' ? formData.numeroPeriodo : undefined,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Boletín Generado',
        detail: 'El archivo PDF se ha descargado correctamente.',
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al generar reporte',
        detail: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow-1 border-round bg-white">
      <Toast ref={toast} />

      <div className="flex align-items-center gap-2 mb-4">
        <i className="bx bx-file text-primary text-3xl"></i>
        <div>
          <h3 className="text-xl font-bold m-0 text-800">
            Emisión de Boletín Académico 
          </h3>
          <small className="text-500">
            Generación oficial de boletines de calificaciones 
          </small>
        </div>
      </div>

      <form onSubmit={handleGenerarBoletin} className="p-fluid grid">
        {/* Tipo de boletín */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="tipoReporte" className="font-semibold block mb-2 text-700">
            Tipo de Boletín
          </label>
          <Dropdown
            id="tipoReporte"
            name="tipoReporte"
            value={formData.tipoReporte}
            options={opcionesTipoReporte}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleDropdownChange('tipoReporte', e.value)}
            placeholder="Seleccione el tipo de boletín"
          />
        </div>

        {/* Período únicamente para boletines parciales */}
        {formData.tipoReporte === 'parcial' && (
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="numeroPeriodo" className="font-semibold block mb-2 text-700">
              Período
            </label>
            <Dropdown
              id="numeroPeriodo"
              name="numeroPeriodo"
              value={formData.numeroPeriodo}
              options={opcionesPeriodos}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleDropdownChange('numeroPeriodo', e.value)}
              placeholder="Seleccione el período"
            />
          </div>
        )}

        {/* Selector de Año Lectivo (1990 - Año Actual) */}
        <div className="col-12 col-md-4 mb-3">
          <label htmlFor="periodoLectivo" className="font-semibold block mb-2 text-700">
            Año Lectivo
          </label>
          <Dropdown
            id="periodoLectivo"
            name="periodoLectivo"
            value={formData.periodoLectivo}
            options={opcionesAnios}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleDropdownChange('periodoLectivo', e.value)}
            placeholder="Seleccione el Año"
            filter
          />
        </div>

        {/* Buscador Autocompletado de Estudiantes */}
        <div className="col-12 mb-3 surface-50 p-3 border-round border-1 surface-border">
          <label htmlFor="autoEstudiante" className="font-bold block mb-2 text-700">
            🔍 Buscar Estudiante Existente (Código MINED o Nombres, ej: '123' o 'William')
          </label>
          <AutoComplete
            id="autoEstudiante"
            value={busquedaEstudianteInput}
            suggestions={sugerenciasEstudiantes}
            completeMethod={handleCompleteEstudiantes}
            field="labelEstudiante"
            itemTemplate={estudianteItemTemplate}
            onChange={(e) => {
              // Permite escribir texto sin romper la selección previa
              const val = e.value;
              setBusquedaEstudianteInput(typeof val === 'string' ? val : val?.labelEstudiante || '');
            }}
            onSelect={handleSelectEstudiante}
            placeholder="Escriba código MINED o nombre del alumno..."
            loading={loadingEstudianteAuto}
            dropdown
            emptyMessage="No se encontraron estudiantes"
            className="w-full"
          />
        </div>

        {/* Código MINED del Estudiante */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="codigoMined" className="font-semibold block mb-2 text-700">
            Código MINED Estudiante
          </label>
          <InputText
            id="codigoMined"
            name="codigoMined"
            value={formData.codigoMined}
            onChange={handleInputChange}
            placeholder="Ej. MINED-2026-88"
          />
        </div>

        {/* Botón de Envío */}
        <div className="col-12 flex justify-content-end gap-2 mt-2">
          <Button
            type="submit"
            label="Generar Boletín"
            icon="pi pi-file-pdf"
            loading={loading}
            className="p-button-primary font-bold"
          />
        </div>
      </form>
    </div>
  );
};

export default ReporteBoletin;
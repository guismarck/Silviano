import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

import { catalogosService } from '../../../Servicios/catalogoServicios/catalogosService';
import { calificacionesService } from '../../../Servicios/calificacionesServicios/calificacionesService2';


export const GestionCalificaciones = () => {
  const toastRef = useRef(null);

  // Estados de filtros
  const [asignacionesRaw, setAsignacionesRaw] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);

  // Estados de carga y datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingTabla, setLoadingTabla] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const [dataAsignaciones, dataPeriodos] = await Promise.all([
          catalogosService.getAsignacionesDocente(),
          catalogosService.getPeriodosEvaluativos()
        ]);
        setAsignacionesRaw(dataAsignaciones);
        setPeriodos(dataPeriodos);
      } catch (error) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error del Sistema',
          detail: error.message,
          life: 4000
        });
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  // Opciones de Grado unificadas
  const opcionesGrados = useMemo(() => {
    const mapaGrados = new Map();
    asignacionesRaw.forEach((item) => {
      if (!mapaGrados.has(item.idGrado)) {
        mapaGrados.set(item.idGrado, {
          idGrado: item.idGrado,
          grado_nombre: item.grado_nombre
        });
      }
    });
    return Array.from(mapaGrados.values());
  }, [asignacionesRaw]);

  // Opciones de Asignaturas filtradas por Grado
  const opcionesAsignaturas = useMemo(() => {
    if (!gradoSeleccionado) return [];
    return asignacionesRaw
      .filter((item) => item.idGrado === gradoSeleccionado.idGrado)
      .map((item) => ({
        iddetalle_plan_de_estudio: item.iddetalle_plan_de_estudio,
        label: `${item.asignatura_nombre} - Sec "${item.seccion}" (${item.turno})`,
        codigo: item.asignatura_codigo
      }));
  }, [asignacionesRaw, gradoSeleccionado]);

  const handleGradoChange = useCallback((e) => {
    setGradoSeleccionado(e.value);
    setAsignaturaSeleccionada(null);
    setEstudiantes([]);
  }, []);

  const handleConsultarNomina = useCallback(async () => {
    if (!asignaturaSeleccionada || !periodoSeleccionado) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Seleccione Grado, Asignatura y Periodo Evaluativo.',
        life: 3000
      });
      return;
    }

    setLoadingTabla(true);
    try {
      const data = await calificacionesService.getEstudiantesTabla(
        asignaturaSeleccionada.iddetalle_plan_de_estudio,
        periodoSeleccionado.idperiodo_evaluativo
      );
      setEstudiantes(data);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 4000
      });
    } finally {
      setLoadingTabla(false);
    }
  }, [asignaturaSeleccionada, periodoSeleccionado]);

  /**
   * Actualizador genérico inmutable para componentes de nota (Acumulado o Examen)
   */
  const handleNotaFieldChange = useCallback((idEstudiante, campo, nuevoValor) => {
    const valSanitizado = nuevoValor === null || nuevoValor === undefined ? 0 : nuevoValor;

    setEstudiantes((prevEstudiantes) =>
      prevEstudiantes.map((est) => {
        if (est.idEstudiante === idEstudiante) {
          const acumuladoActual = campo === 'acumulado' ? valSanitizado : est.acumulado;
          const examenActual = campo === 'examen' ? valSanitizado : est.examen;
          const sumaTotal = Number((acumuladoActual + examenActual).toFixed(2));

          return {
            ...est,
            [campo]: valSanitizado,
            notaFinal: sumaTotal,
            dirty: true
          };
        }
        return est;
      })
    );
  }, []);

  // Guardado masivo
  const handleGuardarBatch = async () => {
    const notasModificadas = estudiantes.filter((est) => est.dirty);
    if (notasModificadas.length === 0) {
      toastRef.current?.show({
        severity: 'info',
        summary: 'Sin Cambios',
        detail: 'No hay calificaciones pendientes de guardar.',
        life: 3000
      });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        iddetalle_plan_de_estudio: asignaturaSeleccionada.iddetalle_plan_de_estudio,
        idperiodo_evaluativo: periodoSeleccionado.idperiodo_evaluativo,
        calificaciones: notasModificadas.map((est) => ({
          idEstudiante: est.idEstudiante,
          acumulado: est.acumulado,
          examen: est.examen,
          notaFinal: est.notaFinal
        }))
      };

      const resp = await calificacionesService.guardarCalificacionesBatch(payload);
      setEstudiantes((prev) => prev.map((est) => ({ ...est, dirty: false })));

      toastRef.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: resp.message,
        life: 3000
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 4000
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarActa = async () => {
    if (!asignaturaSeleccionada || !periodoSeleccionado) return;
    setDescargandoPDF(true);
    try {
      await calificacionesService.descargarActaCalificacionesPDF(
        asignaturaSeleccionada.iddetalle_plan_de_estudio,
        periodoSeleccionado.idperiodo_evaluativo
      );
      toastRef.current?.show({
        severity: 'success',
        summary: 'Reporte Generado',
        detail: 'El acta oficial en PDF se ha descargado correctamente.',
        life: 3000
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error Reporte',
        detail: error.message,
        life: 4000
      });
    } finally {
      setDescargandoPDF(false);
    }
  };

  // Renderizadores de celdas editables
  const editorAcumuladoTemplate = (rowData) => (
    <InputNumber
      value={rowData.acumulado}
      onValueChange={(e) => handleNotaFieldChange(rowData.idEstudiante, 'acumulado', e.value)}
      min={0}
      max={40}
      minFractionDigits={0}
      maxFractionDigits={2}
      className={rowData.dirty ? 'p-invalid' : ''}
      inputClassName="text-center font-semibold"
    />
  );

  const editorExamenTemplate = (rowData) => (
    <InputNumber
      value={rowData.examen}
      onValueChange={(e) => handleNotaFieldChange(rowData.idEstudiante, 'examen', e.value)}
      min={0}
      max={60}
      minFractionDigits={0}
      maxFractionDigits={2}
      className={rowData.dirty ? 'p-invalid' : ''}
      inputClassName="text-center font-semibold"
    />
  );

  const notaFinalTemplate = (rowData) => {
    const esAprobado = rowData.notaFinal >= 60;
    return (
      <div className="flex align-items-center justify-content-center gap-2">
        <span className="font-bold text-lg">{rowData.notaFinal}</span>
        <Tag
          value={esAprobado ? 'AP' : 'REP'}
          severity={esAprobado ? 'success' : 'danger'}
        />
      </div>
    );
  };

  return (
    <div className="p-3">
      <Toast ref={toastRef} />

      <Card title="Sistema Integrado de Gestión Escolar - Evaluación por Corte" className="mb-4">
        <div className="p-fluid grid formgrid">
          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="combo-grado" className="font-bold block mb-2">
              Grado Académico:
            </label>
            <Dropdown
              id="combo-grado"
              value={gradoSeleccionado}
              options={opcionesGrados}
              onChange={handleGradoChange}
              optionLabel="grado_nombre"
              placeholder="-- Seleccione Grado --"
              loading={loadingCatalogos}
              filter
              className="w-full"
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="combo-asignatura" className="font-bold block mb-2">
              Asignatura / Sección:
            </label>
            <Dropdown
              id="combo-asignatura"
              value={asignaturaSeleccionada}
              options={opcionesAsignaturas}
              onChange={(e) => setAsignaturaSeleccionada(e.value)}
              optionLabel="label"
              placeholder={!gradoSeleccionado ? 'Seleccione un grado primero' : '-- Seleccione Asignatura --'}
              disabled={!gradoSeleccionado}
              filter
              className="w-full"
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="combo-periodo" className="font-bold block mb-2">
              Periodo Evaluativo:
            </label>
            <Dropdown
              id="combo-periodo"
              value={periodoSeleccionado}
              options={periodos}
              onChange={(e) => setPeriodoSeleccionado(e.value)}
              optionLabel="nombre"
              placeholder="-- Seleccione Periodo --"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-content-end mt-2">
          <Button
            label="Cargar Nómina"
            icon="pi pi-search"
            className="p-button-primary"
            onClick={handleConsultarNomina}
            loading={loadingTabla}
            disabled={!asignaturaSeleccionada || !periodoSeleccionado}
          />
          <Button
            label="Guardar Calificaciones"
            icon="pi pi-save"
            className="p-button-success"
            onClick={handleGuardarBatch}
            loading={guardando}
            disabled={estudiantes.length === 0}
          />
          <Button
            label="Descargar Acta (PDF)"
            icon="pi pi-file-pdf"
            className="p-button-help"
            onClick={handleDescargarActa}
            loading={descargandoPDF}
            disabled={estudiantes.length === 0}
          />
        </div>
      </Card>

      <Card>
        <DataTable
          value={estudiantes}
          loading={loadingTabla}
          emptyMessage="No hay datos de estudiantes cargados para la combinación seleccionada."
          responsiveLayout="scroll"
          stripedRows
          showGridlines
        >
          <Column field="codigoMINED" header="Código MINED" style={{ width: '12%' }} sortable />
          <Column field="codigoEstudiante" header="Código Est." style={{ width: '12%' }} sortable />
          <Column field="nombreCompleto" header="Nombre del Estudiante" style={{ width: '30%' }} sortable />
          <Column
            field="acumulado"
            header="Acumulado (Máx. 40)"
            body={editorAcumuladoTemplate}
            style={{ width: '15%', textAlign: 'center' }}
          />
          <Column
            field="examen"
            header="Examen (Máx. 60)"
            body={editorExamenTemplate}
            style={{ width: '15%', textAlign: 'center' }}
          />
          <Column
            field="notaFinal"
            header="Nota Final (100 pts)"
            body={notaFinalTemplate}
            style={{ width: '16%', textAlign: 'center' }}
            sortable
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default GestionCalificaciones;
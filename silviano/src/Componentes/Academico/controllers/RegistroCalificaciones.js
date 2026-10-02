import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

import { asignaturasService } from '../../../Servicios/AsignaturaService/asignaturasService';
import { calificacionesService } from '../../../Servicios/calificacionesServicios/calificacionesService';

export const RegistroCalificaciones = () => {
  const toastRef = useRef(null);

  // Filtros principales
  const [filtros, setFiltros] = useState({
    iddetalle_plan_de_estudio: null,
    idperiodo_evaluativo: null
  });

  // Catálogos
  const [asignaturasDocente, setAsignaturasDocente] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  // Estados de carga y datos de la grilla
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [loadingNomina, setLoadingNomina] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Carga inicial de períodos y asignaturas asociadas al docente autenticado
  useEffect(() => {
    const inicializarPantalla = async () => {
      setLoadingAsignaturas(true);
      try {
        setPeriodos([
          { label: 'I Bloque Evaluativo', value: 1 },
          { label: 'II Bloque Evaluativo', value: 2 },
          { label: 'III Bloque Evaluativo', value: 3 },
          { label: 'IV Bloque Evaluativo', value: 4 }
        ]);

        const asignaturasList = await asignaturasService.getAsignaturasDocente();
        setAsignaturasDocente(asignaturasList);
      } catch (error) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error de Catálogo',
          detail: error.message,
          life: 4000
        });
      } finally {
        setLoadingAsignaturas(false);
      }
    };

    inicializarPantalla();
  }, []);

  // Handler unificado de cambios en dropdowns
  const handleFiltroChange = (e, field) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: e.value
    }));
  };

  // Cargar nómina filtrada por Asignatura (detalle_plan_de_estudio) y Período
  const cargarNomina = useCallback(async () => {
    if (!filtros.iddetalle_plan_de_estudio || !filtros.idperiodo_evaluativo) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Filtros Incompletos',
        detail: 'Seleccione una asignatura asignada y el período evaluativo.',
        life: 3000
      });
      return;
    }

    setLoadingNomina(true);
    try {
      const data = await calificacionesService.getEstudiantesTabla(
        filtros.iddetalle_plan_de_estudio,
        filtros.idperiodo_evaluativo
      );
      setAlumnos(data);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error al Cargar',
        detail: error.message,
        life: 4000
      });
    } finally {
      setLoadingNomina(false);
    }
  }, [filtros.iddetalle_plan_de_estudio, filtros.idperiodo_evaluativo]);

  // Modificación inmutable de notas con recálculo dinámico de la columna GENERATED STORED
  const handleNotaChange = useCallback((idmatricula, field, value) => {
    const numValue = value ?? 0;

    setAlumnos((prevAlumnos) =>
      prevAlumnos.map((item) => {
        if (item.idmatricula === idmatricula) {
          const nuevoAcumulado = field === 'acumulado' ? numValue : item.acumulado;
          const nuevoExamen = field === 'examen' ? numValue : item.examen;

          // Recálculo exacto: acumulado + examen
          const notaFinal = Number((nuevoAcumulado + nuevoExamen).toFixed(2));

          return {
            ...item,
            [field]: numValue,
            nota_final: notaFinal,
            dirty: true // Marca de modificación local
          };
        }
        return item;
      })
    );
  }, []);

  // Guardado por lotes (Bulk Upsert)
  const handleGuardar = async () => {
    const modificados = alumnos.filter((a) => a.dirty);

    if (modificados.length === 0) {
      toastRef.current?.show({
        severity: 'info',
        summary: 'Sin Cambios',
        detail: 'No existen registros pendientes de guardar.',
        life: 3000
      });
      return;
    }

    const payload = {
      iddetalle_plan_de_estudio: filtros.iddetalle_plan_de_estudio,
      idperiodo_evaluativo: filtros.idperiodo_evaluativo,
      creado_por: 'DOCENTE_ACTIVO',
      calificaciones: modificados.map((item) => ({
        idcalificacion: item.idcalificacion || null,
        idmatricula: item.idmatricula,
        acumulado: item.acumulado,
        examen: item.examen
      }))
    };

    setSaving(true);
    try {
      await calificacionesService.guardarCalificacionesBatch(payload);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Registro Exitoso',
        detail: 'Las calificaciones se han guardado en el servidor.',
        life: 3000
      });
      cargarNomina();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error al Guardar',
        detail: error.message,
        life: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  // Descargar Acta Jaspersoft en PDF
  const handleImprimirActa = async () => {
    setDownloadingReport(true);
    try {
      await calificacionesService.descargarActaCalificacionesPDF(
        filtros.iddetalle_plan_de_estudio,
        filtros.idperiodo_evaluativo
      );
      toastRef.current?.show({
        severity: 'success',
        summary: 'Descarga Exitosa',
        detail: 'Se ha generado el acta oficial de calificaciones.',
        life: 3000
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de Jaspersoft',
        detail: error.message,
        life: 4000
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  // Renderizadores de celdas para la grilla
  const acumuladoEditor = (rowData) => (
    <InputNumber
      value={rowData.acumulado}
      onValueChange={(e) => handleNotaChange(rowData.idmatricula, 'acumulado', e.value)}
      min={0}
      max={60}
      minFractionDigits={2}
      maxFractionDigits={2}
      className="w-full p-inputtext-sm"
      suffix=" / 60"
    />
  );

  const examenEditor = (rowData) => (
    <InputNumber
      value={rowData.examen}
      onValueChange={(e) => handleNotaChange(rowData.idmatricula, 'examen', e.value)}
      min={0}
      max={40}
      minFractionDigits={2}
      maxFractionDigits={2}
      className="w-full p-inputtext-sm"
      suffix=" / 40"
    />
  );

  const notaFinalBody = (rowData) => {
    const esAprobado = rowData.nota_final >= 60;
    return (
      <div className="flex align-items-center gap-2 font-bold">
        <span>{rowData.nota_final?.toFixed(2) || '0.00'} pts</span>
        <Tag
          severity={esAprobado ? 'success' : 'danger'}
          value={esAprobado ? 'APROBADO' : 'REPROBADO'}
        />
      </div>
    );
  };

  const auditInfoBody = (rowData) => (
    <div className="text-xs text-500">
      <div><b>Usuario:</b> {rowData.creado_por}</div>
      <div><b>Fecha:</b> {rowData.creado_el}</div>
    </div>
  );

  // Cálculo del promedio general memoizado
  const promedioSeccion = useMemo(() => {
    if (alumnos.length === 0) return '0.00';
    const suma = alumnos.reduce((acc, curr) => acc + (curr.nota_final || 0), 0);
    return (suma / alumnos.length).toFixed(2);
  }, [alumnos]);

  return (
    <div className="p-3">
      <Toast ref={toastRef} />

      <Card title="SIGE MINED - Registro Masivo de Calificaciones" className="mb-4 shadow-1">
        {/* Banner de alerta si el docente no posee carga asignada */}
        {!loadingAsignaturas && asignaturasDocente.length === 0 && (
          <Message
            severity="warn"
            text="No tiene asignaturas asignadas en el plan de estudio actual. Consulte con la dirección académica."
            className="w-full mb-3 justify-content-start"
          />
        )}

        {/* Sección de Filtros */}
        <div className="row p-fluid">
          <div className="col-12 col-md-5 mb-3">
            <label htmlFor="iddetalle_plan_de_estudio" className="font-bold block mb-2">
              Mis Asignaturas / Secciones Asignadas
            </label>
            <Dropdown
              id="iddetalle_plan_de_estudio"
              value={filtros.iddetalle_plan_de_estudio}
              options={asignaturasDocente}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleFiltroChange(e, 'iddetalle_plan_de_estudio')}
              placeholder={loadingAsignaturas ? "Cargando carga académica..." : "Seleccione la Asignatura..."}
              disabled={loadingAsignaturas || asignaturasDocente.length === 0}
              showClear
              filter
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="idperiodo_evaluativo" className="font-bold block mb-2">
              Período Evaluativo
            </label>
            <Dropdown
              id="idperiodo_evaluativo"
              value={filtros.idperiodo_evaluativo}
              options={periodos}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleFiltroChange(e, 'idperiodo_evaluativo')}
              placeholder="Seleccione el Período..."
              showClear
            />
          </div>

          <div className="col-12 col-md-3 mb-3 flex align-items-end">
            <Button
              label="Cargar Estudiantes"
              icon="pi pi-users"
              className="p-button-primary w-full"
              onClick={cargarNomina}
              loading={loadingNomina}
              disabled={!filtros.iddetalle_plan_de_estudio || !filtros.idperiodo_evaluativo}
            />
          </div>
        </div>

        {/* Grilla Principal */}
        <div className="mt-3">
          <DataTable
            value={alumnos}
            loading={loadingNomina}
            emptyMessage="Seleccione una asignatura asignada y el período para visualizar la nómina."
            responsiveLayout="scroll"
            stripedRows
            showGridlines
            className="p-datatable-sm"
          >
            <Column field="codigo_mined" header="Código MINED" style={{ width: '15%' }} />
            <Column field="nombre_completo" header="Nombre del Estudiante" style={{ width: '30%' }} />
            <Column header="Acumulado (Máx 60.00)" body={acumuladoEditor} style={{ width: '18%' }} />
            <Column header="Examen (Máx 40.00)" body={examenEditor} style={{ width: '18%' }} />
            <Column header="Nota Final" body={notaFinalBody} style={{ width: '10%' }} />
            <Column header="Auditoría" body={auditInfoBody} style={{ width: '9%' }} />
          </DataTable>
        </div>

        {/* Resumen del Grupo */}
        {alumnos.length > 0 && (
          <div className="flex justify-content-end align-items-center mt-3 gap-3 pr-2">
            <span className="text-600 font-medium">Estudiantes Cargados: <b>{alumnos.length}</b></span>
            <span className="text-600 font-medium">Promedio General: <b>{promedioSeccion} pts</b></span>
          </div>
        )}

        {/* BARRA INFERIOR DE ACCIONES */}
        <div className="flex flex-column sm:flex-row justify-content-end gap-2 mt-4 pt-3 border-top-1 surface-border">
          <Button
            label="Imprimir Acta (PDF)"
            icon="pi pi-file-pdf"
            className="p-button-outlined p-button-secondary"
            onClick={handleImprimirActa}
            loading={downloadingReport}
            disabled={alumnos.length === 0}
          />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-outlined p-button-danger"
            onClick={cargarNomina}
            disabled={saving || loadingNomina || alumnos.length === 0}
          />
          <Button
            label="Guardar Calificaciones"
            icon="pi pi-save"
            className="p-button-success"
            onClick={handleGuardar}
            loading={saving}
            disabled={alumnos.length === 0}
          />
        </div>
      </Card>
    </div>
  );
};

export default RegistroCalificaciones;
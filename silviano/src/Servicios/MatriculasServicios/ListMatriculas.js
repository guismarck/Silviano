import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import MatriculaScreenSteps from '../../Componentes/matriculas/MatriculaPantallaUnica';
import VerMatricula from './VerMatriculas';

import {
  getMatriculas,
  eliminarMatricula,
  descargarFichaMatriculaPDF
} from './matriculasService';

const obtenerAnioMatricula = (matricula) => {
  const anio =
    matricula.anio_lectivo ??
    matricula.anioLectivo ??
    matricula.anio_escolar ??
    matricula.anio ??
    matricula.periodoLectivo ??
    matricula.salon?.anioLectivo ??
    matricula.salon?.anio_lectivo ??
    matricula.salon?.catalogoSalon?.anioLectivo ??
    matricula.salon?.catalogoSalon?.anio_lectivo;
  if (anio !== null && anio !== undefined && /^\d{4}$/.test(String(anio))) {
    return Number(anio);
  }

  const fecha =
    matricula.fecha_transaccion ||
    matricula.fechaInscripcion ||
    matricula.fecha_matricula ||
    matricula.fechaMatricula;
  const anioFecha = String(fecha || '').match(/^\d{4}/)?.[0];
  return anioFecha ? Number(anioFecha) : null;
};

export const ListMatriculas = ({ reloadTrigger }) => {
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [mostrarNuevaMatricula, setMostrarNuevaMatricula] = useState(false);
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const toast = useRef(null);

  const fetchMatriculas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMatriculas();
      setMatriculas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error del Sistema',
        detail: 'No se pudo cargar el listado de matrículas.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatriculas();
  }, [fetchMatriculas, reloadTrigger]);

  const anioActual = new Date().getFullYear();
  const matriculasDelAnio = useMemo(
    () => matriculas.filter((matricula) => obtenerAnioMatricula(matricula) === anioActual),
    [matriculas, anioActual]
  );

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      global: { ...prev.global, value }
    }));
    setGlobalFilterValue(value);
  };

  const handleDelete = async (idMatricula) => {
    try {
      await eliminarMatricula(idMatricula);
      setMatriculas((prev) => prev.filter((item) => item.idMatricula !== idMatricula));
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Matrícula anulada correctamente.',
        life: 3000
      });
    } catch (error) {
      const errorData = error.response?.data;
      const mensajeBackend =
        typeof errorData === 'string'
          ? errorData
          : errorData?.detail ||
            errorData?.mensaje ||
            errorData?.message ||
            errorData?.error;

      toast.current?.show({
        severity: 'error',
        summary: 'No se pudo anular la matrícula',
        detail:
          mensajeBackend ||
          error.message ||
          'Ocurrió un error al anular la matrícula seleccionada.',
        life: 4000
      });
    }
  };

  const handleDownloadPDF = async (idMatricula) => {
    setDownloadingId(idMatricula);
    try {
      await descargarFichaMatriculaPDF(idMatricula);
      toast.current?.show({
        severity: 'info',
        summary: 'Reporte Generado',
        detail: 'Ficha de matrícula MINED descargada con éxito.',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Impresión',
        detail: 'Fallo al procesar el reporte en Jaspersoft Reports.',
        life: 4000
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Safe Templates

  const codEstudianteTemplate = (rowData) => {
    const est = rowData.estudiante;
    if (!est) return 'N/A';
    if (typeof est === 'object') {
      return est.cod_estudiante || est.codEstudiante || est.codigo || 'N/A';
    }
    return String(est);
  };

  const estudianteTemplate = (rowData) => {
    const est = rowData.estudiante;
    if (!est) return 'N/A';
    if (typeof est === 'object') {
      const nombreCompleto = est.nombre_completo || `${est.nombres || ''} ${est.apellidos || ''}`.trim();
      return nombreCompleto || `Estudiante #${est.idpersona || est.id || ''}`;
    }
    return String(est);
  };

  const gradoTemplate = (rowData) => {
    const grado = rowData.salon?.grado || rowData.grado;
    if (typeof grado === 'object') return grado.nombre || grado.descripcion || 'N/A';
    return grado || 'N/A';
  };

  const salonTemplate = (rowData) => {
    const salon = rowData.salon;
    if (!salon) return 'N/A';
    if (typeof salon === 'object') {
      const cat = salon.catalogoSalon;
      if (typeof cat === 'object') return cat.nombreSalon || cat.nombre || `Salón #${salon.idSalon || ''}`;
      return salon.nombreSalon || salon.nombre || cat || `Salón #${salon.idSalon || ''}`;
    }
    return String(salon);
  };

  const turnoTemplate = (rowData) => {
    const turno = rowData.salon?.turno || rowData.turno;
    if (typeof turno === 'object') return turno.nombre || turno.descripcion || 'N/A';
    return turno || 'N/A';
  };

  const seccionTemplate = (rowData) => {
    const seccion = rowData.salon?.seccion || rowData.seccion;
    if (typeof seccion === 'object') return seccion.nombre || seccion.letra || 'N/A';
    return seccion || 'N/A';
  };

  const accionesTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon="pi pi-eye"
          rounded
          outlined
          severity="info"
          tooltip="Ver Expediente"
          onClick={() => setMatriculaSeleccionada(rowData)}
        />
        <Button
          icon="pi pi-file-pdf"
          rounded
          outlined
          severity="help"
          tooltip="Ficha MINED (PDF)"
          loading={downloadingId === rowData.idMatricula}
          onClick={() => handleDownloadPDF(rowData.idMatricula)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          tooltip="Anular Matrícula"
          onClick={() => handleDelete(rowData.idMatricula)}
        />
      </div>
    );
  };

  // Header superior alineado a la izquierda
  const renderHeader = useMemo(() => {
    return (
      <div className="d-flex justify-content-start align-items-center p-2">
        <span className="p-input-icon-left w-full md:w-auto">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por estudiante, grado, salón..."
            className="w-full md:w-20rem"
          />
        </span>
      </div>
    );
  }, [globalFilterValue]);

  // Footer inferior con el botón de creación
  const renderFooter = useMemo(() => {
    return (
      <div className="d-flex justify-content-start align-items-center p-2">
        <Button
          label="Nueva Matrícula"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setMostrarNuevaMatricula(true)}
        />
      </div>
    );
  }, []);

  return (
    <div className="card shadow-1 p-4 surface-card border-round">
      <Toast ref={toast} />

      <h2 className="text-xl font-bold text-800 mb-4">Gestión de Matrículas</h2>

      <DataTable
        value={matriculasDelAnio}
        loading={loading}
        paginator
        rows={15}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        filters={filters}
        globalFilterFields={[
          'estudiante.cod_estudiante',
          'estudiante.nombre_completo',
          'estudiante.codEstudiante',
          'salon.nombreSalon',
          'salon.catalogoSalon.nombreSalon'
        ]}
        header={renderHeader}
        footer={renderFooter}
        emptyMessage={`No se encontraron matrículas del año ${anioActual}.`}
        responsiveLayout="scroll"
        stripedRows
        className="p-datatable-sm"
      >
        <Column header="Codigo" body={codEstudianteTemplate} sortable style={{ width: '12%' }} />
        <Column header="Estudiante" body={estudianteTemplate} sortable style={{ minWidth: '14rem' }} />
        <Column header="Grado" body={gradoTemplate} sortable style={{ minWidth: '8rem' }} />
        <Column header="Salón" body={salonTemplate} sortable style={{ minWidth: '8rem' }} />
        <Column header="Turno" body={turnoTemplate} sortable style={{ minWidth: '7rem' }} />
        <Column header="Sección" body={seccionTemplate} sortable style={{ minWidth: '6rem' }} />
        <Column header="Acciones" body={accionesTemplate} exportable={false} style={{ width: '12%', minWidth: '10rem' }} />
      </DataTable>

      <Dialog
        header="Registro de Nueva Matrícula"
        visible={mostrarNuevaMatricula}
        onHide={() => setMostrarNuevaMatricula(false)}
        style={{ width: '95vw' }}
        contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        modal
        maximizable
        draggable={false}
        resizable={false}
      >
        <MatriculaScreenSteps
          onCancel={() => setMostrarNuevaMatricula(false)}
          onSuccess={fetchMatriculas}
        />
      </Dialog>

      <Dialog
        header="Expediente de Matrícula"
        visible={Boolean(matriculaSeleccionada)}
        onHide={() => setMatriculaSeleccionada(null)}
        style={{ width: '95vw' }}
        contentStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        modal
        maximizable
        draggable={false}
        resizable={false}
      >
        {matriculaSeleccionada && (
          <VerMatricula idmatricula={matriculaSeleccionada.idMatricula} />
        )}
      </Dialog>
    </div>
  );
};

export default ListMatriculas;
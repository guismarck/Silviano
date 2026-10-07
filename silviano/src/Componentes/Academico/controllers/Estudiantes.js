import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import { getEstudiantes, deleteEstudiante, exportarNominaEstudiantesPDF } from '../../../Servicios/estudianteService';
import VerEstudiante from '../../../Servicios/EstudiantesServicios/VerEstudiantes';
import AddEstudiante from '../../../Servicios/EstudiantesServicios/AgregarEstudiantes';
import UpdateEstudiante from '../../../Servicios/EstudiantesServicios/EditarEstudiantes';
import BuscarEstudiantes from '../../../Servicios/EstudiantesServicios/BuscarEstudiantes';

export default function Estudiantes() {
  const toast = useRef(null);
  
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const [showViewMode, setShowViewMode] = useState(false);
  const [showAddMode, setShowAddMode] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [selectedEstudianteId, setSelectedEstudianteId] = useState(null);

  const cargarEstudiantes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEstudiantes();
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Red',
        detail: 'No se pudo cargar la lista de estudiantes.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstudiantes();
  }, [cargarEstudiantes]);

  const handleConfirmDelete = (idPersona) => {
    confirmDialog({
      message: '¿Está seguro de eliminar este expediente de estudiante?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteEstudiante(idPersona);
          toast.current?.show({
            severity: 'success',
            summary: 'Registro Eliminado',
            detail: 'El estudiante ha sido removido del sistema.',
            life: 3000
          });
          cargarEstudiantes();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se logró eliminar el registro seleccionado.',
            life: 4000
          });
        }
      }
    });
  };

  const handleDescargarReporte = async () => {
    setDownloadingReport(true);
    try {
      await exportarNominaEstudiantesPDF();
      toast.current?.show({
        severity: 'info',
        summary: 'Reporte Generado',
        detail: 'La nómina oficial en PDF se ha descargado correctamente.',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Reporte',
        detail: 'No se pudo generar el reporte desde Jaspersoft Server.',
        life: 4000
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  const statusBodyTemplate = (rowData) => {
    const isActivo = Boolean(rowData.estado);
    return (
      <Tag
        value={isActivo ? 'ACTIVO' : 'INACTIVO'}
        severity={isActivo ? 'success' : 'danger'}
      />
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon="pi pi-eye"
          severity="info"
          rounded
          outlined
          tooltip="Ver Expediente"
          tooltipOptions={{ position: 'top' }}
          onClick={() => {
            setSelectedEstudianteId(rowData.idpersona);
            setShowViewMode(true);
          }}
        />
        <Button
          icon="pi pi-pencil"
          severity="warning"
          rounded
          outlined
          tooltip="Editar Estudiante"
          tooltipOptions={{ position: 'top' }}
          onClick={() => {
            setSelectedEstudianteId(rowData.idpersona);
            setShowEditMode(true);
          }}
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          rounded
          outlined
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleConfirmDelete(rowData.idpersona)}
        />
      </div>
    );
  };

  // Buscador centrado y más amplio
  const header = (
    <div className="flex justify-content-center align-items-center w-full py-2">
      <div className="w-full md:w-8" style={{ minWidth: '320px' }}>
        <BuscarEstudiantes onFilter={(filteredData) => setEstudiantes(filteredData)} loadAll={cargarEstudiantes} />
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card title="Expedientes de Estudiantes - SIGE">
        <DataTable
          value={estudiantes}
          paginator
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          dataKey="idpersona"
          stripedRows
          loading={loading}
          header={header}
          emptyMessage="No se encontraron registros de estudiantes."
          responsiveLayout="scroll"
        >
          <Column field="idpersona" header="ID" sortable style={{ minWidth: '5rem' }} />
          <Column field="cod_estudiante" header="Código" sortable style={{ minWidth: '8rem' }} />
          <Column field="codigo_MINED" header="Código MINED" sortable style={{ minWidth: '9rem' }} />
          <Column field="nombre_completo" header="Nombres" sortable style={{ minWidth: '12rem' }} />
          <Column field="apellido_completo" header="Apellidos" sortable style={{ minWidth: '12rem' }} />
          <Column field="estado" header="Estado" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }} />
          <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '10rem', textAlign: 'center' }} />
        </DataTable>

        {/* Sección de acciones inferior dentro del Fieldset */}
        <Fieldset legend="Acciones" className="mt-4">
          <div className="flex flex-wrap gap-3 align-items-center">
            <Button
              label="Nuevo Estudiante"
              icon="pi pi-plus"
              severity="primary"
              onClick={() => setShowAddMode(true)}
            />
            <Button
              label="Reporte MINED"
              icon="pi pi-file-pdf"
              severity="help"
              outlined
              loading={downloadingReport}
              onClick={handleDescargarReporte}
            />
          </div>
        </Fieldset>
      </Card>

      {/* Modal Ver Estudiante */}
      <Dialog
        header="Detalle del Expediente"
        visible={showViewMode}
        style={{ width: '90vw', maxWidth: '700px' }}
        onHide={() => {
          setShowViewMode(false);
          setSelectedEstudianteId(null);
        }}
      >
        {selectedEstudianteId && <VerEstudiante idPersona={selectedEstudianteId} />}
      </Dialog>

      {/* Modal Agregar Estudiante */}
      <Dialog
        header="Registrar Nuevo Estudiante"
        visible={showAddMode}
        style={{ width: '90vw', maxWidth: '850px' }}
        onHide={() => setShowAddMode(false)}
      >
        <AddEstudiante
          cargarEstudiante={cargarEstudiantes}
          setEstudiantedoAdd={() => setShowAddMode(false)}
        />
      </Dialog>

      {/* Modal Editar Estudiante */}
      <Dialog
        header="Editar Expediente de Estudiante"
        visible={showEditMode}
        style={{ width: '90vw', maxWidth: '850px' }}
        onHide={() => {
          setShowEditMode(false);
          setSelectedEstudianteId(null);
        }}
      >
        {selectedEstudianteId && (
          <UpdateEstudiante
            idPersona={selectedEstudianteId}
            onEstudianteUpdate={() => {
              setShowEditMode(false);
              setSelectedEstudianteId(null);
              cargarEstudiantes();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
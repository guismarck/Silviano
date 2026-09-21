import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';

import { getMatriculas, eliminarMatricula } from '../matriculasService';
import VerMatricula from './VerMatriculas';
import NuevaMatricula from '../../../src/Componentes/matriculas/NuevaMatricula';

export default function ListMatriculas() {
  const toast = useRef(null);

  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectMatriculaID, setSelectMatriculaID] = useState(null);

  // Estados de Modales
  const [showViewMode, setShowViewMode] = useState(false);
  const [showAddMode, setShowAddMode] = useState(false);

  // Filtros Globales de Busqueda
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const cargarMatriculas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMatriculas();
      setMatriculas(data || []);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Carga',
        detail: 'No se pudo obtener la lista de matrículas.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMatriculas();
  }, [cargarMatriculas]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleEliminar = (idmatricula) => {
    confirmDialog({
      message: '¿Está seguro de eliminar esta matrícula? Esta acción no se puede deshacer.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await eliminarMatricula(idmatricula);
          toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'La matrícula fue removida correctamente.',
            life: 3000
          });
          cargarMatriculas();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el registro seleccionado.',
            life: 4000
          });
        }
      }
    });
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('es-NI', {
      style: 'currency',
      currency: 'NIO'
    });
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          severity="info"
          size="small"
          rounded
          outlined
          tooltip="Ver Detalle"
          onClick={() => {
            setSelectMatriculaID(rowData.idMatricula);
            setShowViewMode(true);
          }}
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          size="small"
          rounded
          outlined
          tooltip="Eliminar"
          onClick={() => handleEliminar(rowData.idMatricula)}
        />
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-2">
        <Button
          label="Nueva Matrícula"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setShowAddMode(true)}
        />
        <span className="p-input-icon-left w-full sm:w-auto">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por estudiante, grado..."
            className="w-full"
          />
        </span>
      </div>
    );
  };

  return (
    <div className="p-2">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card title="Gestión de Matrículas">
        <DataTable
          value={matriculas}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          stripedRows
          dataKey="idmatricula"
          loading={loading}
          filters={filters}
          header={renderHeader()}
          emptyMessage="No se encontraron registros de matrículas."
          responsiveLayout="scroll"
        >
          <Column field="idMatricula" header="ID" sortable style={{ minWidth: '6rem' }} />
          <Column field="estudiante.nombre_completo" header="Estudiante" sortable style={{ minWidth: '14rem' }} />
          <Column field="grado.nombre" header="Grado" sortable style={{ minWidth: '10rem' }} />
          <Column field="turno" header="Turno" sortable style={{ minWidth: '8rem' }} />
          <Column
            field="costo_matricula"
            header="Costo"
            sortable
            body={(row) => formatCurrency(row.costoMatricula)}
            style={{ minWidth: '10rem' }}
          />
          <Column header="Acciones" body={actionsTemplate} exportable={false} style={{ minWidth: '8rem' }} />
        </DataTable>
      </Card>

      {/* Modal de Detalle */}
      <Dialog
        header="Detalle de Matrícula"
        visible={showViewMode}
        style={{ width: '90vw', maxWidth: '600px' }}
        onHide={() => setShowViewMode(false)}
        dismissableMask
      >
        <VerMatricula idmatricula={selectMatriculaID} />
      </Dialog>

      {/* Modal de Registro */}
      <Dialog
        header="Registrar Nueva Matrícula"
        visible={showAddMode}
        style={{ width: '90vw', maxWidth: '800px' }}
        onHide={() => setShowAddMode(false)}
        dismissableMask
      >
        <NuevaMatricula
          setMatriculaAdd={() => {
            setShowAddMode(false);
            cargarMatriculas();
          }}
          onCancel={() => setShowAddMode(false)}
        />
      </Dialog>
    </div>
  );
}
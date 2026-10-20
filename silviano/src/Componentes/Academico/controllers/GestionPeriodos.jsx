import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { periodoEvaluativoService } from '../../../Servicios/periodoEvaluativo/periodoEvaluativoService';

export const GestionPeriodos = () => {
  const toast = useRef(null);

  // Estados de Datos
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados del Modal
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Modelo del Formulario inicial (Coincide 1:1 con la BD)
  const initialFormState = {
    idperiodo_evaluativo: null,
    nombre_periodo: '',
    numero_periodo: 1,
    anio_escolar: new Date().getFullYear(),
    fecha_inicio: null,
    fecha_fin: null,
    fecha_cierre_docente: null,
    estado: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Formateadores estrictos de fechas académicos (YYYY-MM-DD)
  const formatDateToDB = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const formatDateTimeToDB = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const hours = `${d.getHours()}`.padStart(2, '0');
    const minutes = `${d.getMinutes()}`.padStart(2, '0');
    const seconds = `${d.getSeconds()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Carga inicial de Períodos
  const cargarPeriodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await periodoEvaluativoService.obtenerPeriodos();
      setPeriodos(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Servidor',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPeriodos();
  }, [cargarPeriodos]);

  // Handler unificado para actualizar inputs
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Abrir Modal para Crear
  const handleOpenNew = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setDialogVisible(true);
  };

  // Abrir Modal para Editar
  const handleEdit = (rowData) => {
    setFormData({
      idperiodo_evaluativo: rowData.idperiodo_evaluativo,
      nombre_periodo: rowData.nombre_periodo,
      numero_periodo: rowData.numero_periodo,
      anio_escolar: rowData.anio_escolar,
      fecha_inicio: rowData.fecha_inicio ? new Date(rowData.fecha_inicio) : null,
      fecha_fin: rowData.fecha_fin ? new Date(rowData.fecha_fin) : null,
      fecha_cierre_docente: rowData.fecha_cierre_docente ? new Date(rowData.fecha_cierre_docente) : null,
      estado: rowData.estado,
    });
    setIsEditMode(true);
    setDialogVisible(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre_periodo.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campo Requerido',
        detail: 'Ingrese el nombre del período (ej. I Bloque Evaluativo / I Trimestre).',
        life: 3000,
      });
      return;
    }

    if (!formData.fecha_inicio || !formData.fecha_fin || !formData.fecha_cierre_docente) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Fechas Incompletas',
        detail: 'Debe seleccionar las fechas de inicio, fin y cierre para docentes.',
        life: 3000,
      });
      return;
    }

    // Payload formateado listo para Spring Boot
    const payload = {
      nombre_periodo: formData.nombre_periodo.trim(),
      numero_periodo: Number(formData.numero_periodo),
      anio_escolar: Number(formData.anio_escolar),
      fecha_inicio: formatDateToDB(formData.fecha_inicio),
      fecha_fin: formatDateToDB(formData.fecha_fin),
      fecha_cierre_docente: formatDateTimeToDB(formData.fecha_cierre_docente),
      estado: formData.estado ? 1 : 0, // Convertimos a número entero para la columna TINYINT
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await periodoEvaluativoService.actualizarPeriodo(formData.idperiodo_evaluativo, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Período Actualizado',
          detail: 'El período evaluativo se actualizó correctamente.',
          life: 3000,
        });
      } else {
        await periodoEvaluativoService.crearPeriodo(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Período Creado',
          detail: 'Nuevo período evaluativo registrado con éxito.',
          life: 3000,
        });
      }

      setDialogVisible(false);
      cargarPeriodos();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error en la Operación',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar Eliminación
  const handleDelete = (rowData) => {
    confirmDialog({
      message: `¿Está seguro de eliminar o inactivar el período "${rowData.nombre_periodo}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await periodoEvaluativoService.eliminarPeriodo(rowData.idperiodo_evaluativo);
          toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'El período ha sido eliminado.',
            life: 3000,
          });
          cargarPeriodos();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error al Eliminar',
            detail: error.message,
            life: 4000,
          });
        }
      },
    });
  };

  // Renderizadores de columnas en DataTable
  const estadoBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.estado ? 'ACTIVO' : 'INACTIVO'}
        severity={rowData.estado ? 'success' : 'danger'}
      />
    );
  };

  const accionesBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-text"
          onClick={() => handleEdit(rowData)}
          tooltip="Editar Período"
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
          onClick={() => handleDelete(rowData)}
          tooltip="Eliminar Período"
          tooltipOptions={{ position: 'bottom' }}
        />
      </div>
    );
  };

  return (
    <div className="card p-4 shadow-1 border-round bg-white w-full">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header del Módulo */}
      <div className="flex flex-column sm:flex-row justify-content-between align-items-center border-bottom-1 surface-border pb-3 mb-4 gap-3">
        <h2 className="text-xl font-bold text-900 m-0 flex align-items-center gap-2">
          <i className="bx bx-calendar-event text-primary text-2xl"></i>
          Gestión de Períodos Lectivos y Evaluativos
        </h2>
        <Button
          label="Nuevo Período"
          icon="pi pi-plus"
          className="p-button-success font-bold"
          onClick={handleOpenNew}
        />
      </div>

      {/* Tabla Principal */}
      <DataTable
        value={periodos}
        loading={loading}
        dataKey="idperiodo_evaluativo"
        emptyMessage="No hay períodos evaluativos registrados."
        responsiveLayout="scroll"
        className="p-datatable-sm p-datatable-gridlines"
      >
        <Column field="idperiodo_evaluativo" header="ID" sortable style={{ width: '70px', textAlign: 'center' }} />
        <Column field="nombre_periodo" header="Nombre Período" sortable className="font-bold text-800" />
        <Column field="numero_periodo" header="N° Bloque" sortable style={{ width: '100px', textAlign: 'center' }} />
        <Column field="anio_escolar" header="Año Escolar" sortable style={{ width: '110px', textAlign: 'center' }} />
        <Column field="fecha_inicio" header="Fecha Inicio" style={{ width: '120px', textAlign: 'center' }} />
        <Column field="fecha_fin" header="Fecha Fin" style={{ width: '120px', textAlign: 'center' }} />
        <Column field="fecha_cierre_docente" header="Cierre Notas Docente" style={{ width: '180px', textAlign: 'center' }} />
        <Column field="estado" header="Estado" body={estadoBodyTemplate} style={{ width: '110px', textAlign: 'center' }} />
        <Column body={accionesBodyTemplate} header="Acciones" style={{ width: '120px', textAlign: 'center' }} />
      </DataTable>

      {/* Modal de Creación / Edición */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '90vw', maxWidth: '650px' }}
        header={isEditMode ? 'Editar Período Evaluativo' : 'Registrar Nuevo Período Evaluativo'}
        modal
        className="p-fluid"
        onHide={() => setDialogVisible(false)}
      >
        <form onSubmit={handleSubmit} className="grid mt-2">
          <div className="col-12 col-md-8 mb-3">
            <label htmlFor="nombre_periodo" className="font-semibold text-700 block mb-2">
              Nombre del Período / Trimestre *
            </label>
            <InputText
              id="nombre_periodo"
              value={formData.nombre_periodo}
              onChange={(e) => handleInputChange('nombre_periodo', e.target.value)}
              placeholder="Ej. I Bloque Evaluativo / I Trimestre"
              required
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="numero_periodo" className="font-semibold text-700 block mb-2">
              Número Bloque *
            </label>
            <InputNumber
              id="numero_periodo"
              value={formData.numero_periodo}
              onValueChange={(e) => handleInputChange('numero_periodo', e.value)}
              min={1}
              max={10}
              showButtons
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="anio_escolar" className="font-semibold text-700 block mb-2">
              Año Escolar *
            </label>
            <InputNumber
              id="anio_escolar"
              value={formData.anio_escolar}
              onValueChange={(e) => handleInputChange('anio_escolar', e.value)}
              useGrouping={false}
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="fecha_inicio" className="font-semibold text-700 block mb-2">
              Fecha Inicio *
            </label>
            <Calendar
              id="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={(e) => handleInputChange('fecha_inicio', e.value)}
              dateFormat="yy-mm-dd"
              placeholder="YYYY-MM-DD"
              showIcon
            />
          </div>

          <div className="col-12 col-md-4 mb-3">
            <label htmlFor="fecha_fin" className="font-semibold text-700 block mb-2">
              Fecha Fin *
            </label>
            <Calendar
              id="fecha_fin"
              value={formData.fecha_fin}
              onChange={(e) => handleInputChange('fecha_fin', e.value)}
              dateFormat="yy-mm-dd"
              placeholder="YYYY-MM-DD"
              showIcon
            />
          </div>

          <div className="col-12 col-md-8 mb-3">
            <label htmlFor="fecha_cierre_docente" className="font-semibold text-700 block mb-2">
              Fecha y Hora Cierre Calificaciones Docente *
            </label>
            <Calendar
              id="fecha_cierre_docente"
              value={formData.fecha_cierre_docente}
              onChange={(e) => handleInputChange('fecha_cierre_docente', e.value)}
              showTime
              hourFormat="24"
              dateFormat="yy-mm-dd"
              placeholder="YYYY-MM-DD HH:mm:ss"
              showIcon
            />
          </div>

          <div className="col-12 col-md-4 mb-3 flex flex-column justify-content-center">
            <label htmlFor="estado" className="font-semibold text-700 block mb-2">
              Estado Período
            </label>
            <div className="flex align-items-center gap-2">
              <InputSwitch
                id="estado"
                checked={formData.estado}
                onChange={(e) => handleInputChange('estado', e.value)}
              />
              <span className="font-bold text-600">
                {formData.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="col-12 flex justify-content-end gap-2 mt-3 border-top-1 surface-border pt-3">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-secondary p-button-outlined"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              type="submit"
              label={isEditMode ? 'Actualizar' : 'Guardar Período'}
              icon="pi pi-save"
              loading={submitting}
              className="p-button-success font-bold"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};
export default GestionPeriodos;
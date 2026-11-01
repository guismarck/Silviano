import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import usuarioService from '../../../Servicios/UsuarioService/usuarioService';
import { UsuarioFormModal } from './UsuarioFormModal';

const textoDeCelda = (valor, fallback = '') => {
  if (valor === null || valor === undefined || valor === '') return fallback;
  if (typeof valor !== 'object') return String(valor);

  return textoDeCelda(
    valor.label ?? valor.codigo ?? valor.nombre ?? valor.value,
    fallback
  );
};

export const GestionUsuarios = () => {
  const toast = useRef(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usuarioService.obtenerUsuarios();
      setUsuarios(data);
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
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleToggleEstado = (usuario) => {
    const nuevoEstado = !usuario.activo;
    const accionText = nuevoEstado ? 'activar' : 'inactivar';

    confirmDialog({
      message: `¿Desea ${accionText} la cuenta del usuario "${usuario.username}"?`,
      header: `Confirmar Acción`,
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: nuevoEstado ? 'p-button-success' : 'p-button-danger',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await usuarioService.cambiarEstadoUsuario(usuario.id, nuevoEstado);
          toast.current?.show({
            severity: 'success',
            summary: 'Estado Actualizado',
            detail: `El usuario "${usuario.username}" fue ${nuevoEstado ? 'activado' : 'inactivado'}.`,
            life: 3000,
          });
          cargarUsuarios();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error al cambiar estado',
            detail: error.message,
            life: 4000,
          });
        }
      },
    });
  };

  const rolesBodyTemplate = (rowData) => {
    const roles = Array.isArray(rowData.roles)
      ? rowData.roles
      : rowData.roles
        ? [rowData.roles]
        : [];
    const rolesTexto = roles
      .map((rol) =>
        textoDeCelda(
          rol && typeof rol === 'object'
            ? rol.codigo ?? rol.nombre ?? rol.label ?? rol.value
            : rol
        )
      )
      .filter(Boolean)
      .join(', ');

    return rolesTexto || 'Sin roles';
  };

  const textoBodyTemplate = (field) => (rowData) =>
    textoDeCelda(rowData[field], '—');

  const estadoBodyTemplate = (rowData) => (
    <Tag
      value={rowData.activo ? 'ACTIVO' : 'INACTIVO'}
      severity={rowData.activo ? 'success' : 'danger'}
      className="font-bold px-2 py-1"
    />
  );

  const accionesBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-warning p-button-sm"
        onClick={() => {
          setUsuarioSeleccionado(rowData);
          setModalVisible(true);
        }}
        tooltip="Editar Usuario y Roles"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon={rowData.activo ? 'pi pi-user-minus' : 'pi pi-user-plus'}
        className={`p-button-rounded p-button-text p-button-sm ${
          rowData.activo ? 'p-button-danger' : 'p-button-success'
        }`}
        onClick={() => handleToggleEstado(rowData)}
        tooltip={rowData.activo ? 'Inactivar' : 'Activar'}
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  const leftToolbarTemplate = () => (
    <Button
      label="Nuevo Usuario"
      icon="pi pi-plus"
      className="p-button-success font-bold"
      onClick={() => {
        setUsuarioSeleccionado(null);
        setModalVisible(true);
      }}
    />
  );

  const rightToolbarTemplate = () => (
    <div className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscar por usuario, nombre, rol..."
        className="w-full sm:w-20rem"
      />
    </div>
  );

  return (
    <div className="p-4 surface-card border-round shadow-2">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-900 m-0">Gestión de Usuarios y Roles </h2>
          <span className="text-sm text-500">
            Catálogo de cuentas de Usuario y asignación de permisos.
          </span>
        </div>
      </div>

      <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

      <DataTable
        value={usuarios}
        loading={loading}
        paginator
        rows={10}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        globalFilter={globalFilter}
        emptyMessage="No hay usuarios registrados."
        responsiveLayout="scroll"
        className="p-datatable-sm"
      >
        <Column
          field="username"
          header="Usuario"
          body={textoBodyTemplate('username')}
          sortable
          className="font-semibold"
        />
        <Column
          field="nombreCompleto"
          header="Nombre Completo"
          body={textoBodyTemplate('nombreCompleto')}
          sortable
        />
        <Column
          field="email"
          header="Correo Electrónico"
          body={textoBodyTemplate('email')}
          sortable
        />
        <Column header="Roles Asignados" body={rolesBodyTemplate} />
        <Column header="estado" body={estadoBodyTemplate} sortable field="activo" />
        <Column header="Acciones" body={accionesBodyTemplate} style={{ minWidth: '120px' }} />
      </DataTable>

      <UsuarioFormModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        usuarioEdit={usuarioSeleccionado}
        onSaveSuccess={cargarUsuarios}
        toastRef={toast}
      />
    </div>
  );
};
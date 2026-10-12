import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';

import { getGrados, eliminarGrado } from '../../../Servicios/GradoServicios/gradoService';
import Addgrado from '../../../Servicios/GradoServicios/AgregarGrados';
import Updategrado from '../../../Servicios/GradoServicios/EditarGrado';
import { normalizarNombre } from '../../../Util/validaciones/ValidacionGenericas.js';
import BuscadorGrados from '../../../Servicios/GradoServicios/BuscadorGrado';

export default function ListarGrados() {
    const toast = useRef(null);

    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);
    const [selectedGradoId, setSelectedGradoId] = useState(null);

    // Filtro por nombre del grado y nombre del nivel educativo.
    // Cada palabra escrita debe aparecer en alguno de los dos ("primaria 4to").
    const gradosFiltrados = useMemo(() => {
        const terminos = normalizarNombre(busqueda).split(/\s+/).filter(Boolean);
        if (terminos.length === 0) return grados;

        return grados.filter((g) => {
            const texto = normalizarNombre(`${g.nombre ?? ''} ${g.nivelEducativo?.nombre ?? ''}`);
            return terminos.every((t) => texto.includes(t));
        });
    }, [grados, busqueda]);

    const mostrarToast = useCallback((severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    }, []);

    const cargarGrados = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getGrados();
            setGrados(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar grados:', error);
            mostrarToast('error', 'Error de red', 'No se pudo cargar la lista de grados.');
        } finally {
            setLoading(false);
        }
    }, [mostrarToast]);

    useEffect(() => {
        cargarGrados();
    }, [cargarGrados]);


    const confirmarEliminar = (grado) => {
        confirmDialog({
            message: `¿Desea eliminar el grado "${grado.nombre}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => eliminarGrado(grado.idGrado)
        });
    };

    // Cierra el modal de edición y limpia el grado seleccionado.
    const cerrarEdicion = () => {
        setShowEditMode(false);
        setSelectedGradoId(null);
    };

    const nivelBodyTemplate = (rowData) => rowData.nivelEducativo?.nombre ?? '—';

    const actionsBodyTemplate = (rowData) => (
        <div className="flex gap-2 justify-content-center">
            <Button
                icon="pi pi-pencil"
                severity="warning"
                rounded
                outlined
                tooltipOptions={{ position: 'top' }}
                onClick={() => {
                    setSelectedGradoId(rowData.idGrado);
                    setShowEditMode(true);
                }}
            />
            <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                outlined
                tooltipOptions={{ position: 'top' }}
                onClick={() => confirmarEliminar(rowData)}
            />
        </div>
    );

    return (
        <div className="p-3 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Card title="Grados">
                {/* Barra de búsqueda */}
                <BuscadorGrados value={busqueda} onChange={setBusqueda} />
                <small className="block mb-3 text-color-secondary text-center">
                    {gradosFiltrados.length} de {grados.length} grado(s)
                </small>

                <DataTable
                    value={gradosFiltrados}
                    dataKey="idGrado"
                    loading={loading}
                    paginator
                    rows={10}
                    stripedRows
                    emptyMessage={busqueda ? 'No se encontraron grados con ese nombre.' : 'No hay grados registrados.'}
                    tableStyle={{ minWidth: '30rem' }}
                >
                    <Column header="Nivel educativo" body={nivelBodyTemplate} style={{ width: '25%' }} />
                    <Column field="nombre" header="Nombre" style={{ width: '25%' }} />
                    <Column header="Acción" body={actionsBodyTemplate} />
                </DataTable>

                <Fieldset legend="Acciones" className="mt-4">
                    <div className="flex flex-wrap gap-3 align-items-center">
                        <Button
                            label="Nuevo Grado"
                            icon="pi pi-plus"
                            severity="primary"
                            onClick={() => setShowAddMode(true)}
                        />
                    </div>
                </Fieldset>
            </Card>

            {/* Modal Agregar Grado */}
            <Dialog
                header="Registrar Nuevo Grado"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => setShowAddMode(false)}
            >
                <Addgrado
                    cargarGrado={cargarGrados}
                    // Revisa en AgregarGrados.js con qué valor llama a setGradoAdd:
                    // aquí se espera true para mostrar el modal y false para cerrarlo.
                    setGradoAdd={(visible) => setShowAddMode(Boolean(visible))}
                />
            </Dialog>

            {/* Modal Editar Grado */}
            <Dialog
                header="Editar Grado"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={cerrarEdicion}
            >
                {selectedGradoId && (
                    <Updategrado
                        idGrado={selectedGradoId}
                        onGradoUpdate={async () => {
                            cerrarEdicion();
                            await cargarGrados();
                            mostrarToast('success', 'Grado actualizado', 'Los cambios se guardaron correctamente.');
                        }}
                    />
                )}
            </Dialog>
        </div>
    );
}
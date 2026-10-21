
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';

import { getGrados } from '../../../Servicios/GradoServicios/gradoService.js';

import Addgrado from '../../../Servicios/GradoServicios/AgregarGrados.js';
import Updategrado from '../../../Servicios/GradoServicios/EditarGrado.js';

export default function Grados() {
    const toast = useRef(null);

    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);

    const [selectedGradoId, setSelectedGradoId] = useState(null);

    // Cargar la tabla de grados.
    const cargarGrados = useCallback(async () => {
        setLoading(true);

        try {
            const data = await getGrados();

            setGrados(
                data.map((grado) => ({
                    ...grado,
                    idGrado: grado.idGrado ?? grado.id,
                    nombre: grado.nombre ?? grado.nombreGrado
                }))
            );
        } catch (error) {
            console.error('Error al cargar los grados:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la lista de grados.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarGrados();
    }, [cargarGrados]);

    // Mostrar el nombre del nivel educativo.
    const nivelBodyTemplate = (rowData) => {
        return (
            rowData.nivelEducativo?.nombre ??
            rowData.nivelEducativo?.descripcion ??
            'Sin nivel asignado'
        );
    };

    // Abrir el modal con el ID del grado elegido.
    const abrirEdicion = (grado) => {
        setSelectedGradoId(grado.idGrado);
        setShowEditMode(true);
    };

    // Cerrar el modal de edición y limpiar la selección.
    const cerrarEdicion = () => {
        setShowEditMode(false);
        setSelectedGradoId(null);
    };

    // Acciones de cada fila.
    const actionsBodyTemplate = (rowData) => (
        <div className="flex gap-2 justify-content-center">
            <Button
                type="button"
                icon="pi pi-pencil"
                severity="warning"
                rounded
                outlined
                tooltip="Editar grado"
                tooltipOptions={{ position: 'top' }}
                onClick={() => abrirEdicion(rowData)}
            />
        </div>
    );

    // Se ejecuta después de guardar una actualización exitosa.
    const finalizarActualizacion = async () => {
        await cargarGrados();

        cerrarEdicion();

        toast.current?.show({
            severity: 'success',
            summary: 'Actualización exitosa',
            detail: 'El grado se actualizó correctamente.',
            life: 3000
        });
    };

    return (
        <div className="p-3 md:p-4">
            <Toast ref={toast} />

            <Card title="Grados">
                <DataTable
                    value={grados}
                    loading={loading}
                    stripedRows
                    paginator
                    rows={10}
                    emptyMessage="No hay grados registrados."
                    tableStyle={{ minWidth: '40rem' }}
                >
                    <Column
                        header="Nivel educativo"
                        body={nivelBodyTemplate}
                        style={{ width: '30%' }}
                    />

                    <Column
                        field="nombre"
                        header="Nombre"
                        style={{ width: '35%' }}
                    />

                    <Column
                        header="Acciones"
                        body={actionsBodyTemplate}
                        style={{ width: '20%' }}
                    />
                </DataTable>

                <Fieldset legend="Acciones" className="mt-4">
                    <div className="flex flex-wrap gap-3 align-items-center">
                        <Button
                            type="button"
                            label="Nuevo Grado"
                            icon="pi pi-plus"
                            severity="primary"
                            onClick={() => setShowAddMode(true)}
                        />
                    </div>
                </Fieldset>
            </Card>

            {/* Modal para agregar un grado */}
            <Dialog
                header="Registrar Nuevo Grado"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                breakpoints={{
                    '768px': '95vw',
                    '480px': '100vw'
                }}
                modal
                draggable={false}
                resizable={false}
                onHide={() => setShowAddMode(false)}
            >
                <Addgrado
                    cargarGrado={cargarGrados}
                    setGradoAdd={() => setShowAddMode(false)}
                />
            </Dialog>

            {/* Modal para editar el grado seleccionado */}
            <Dialog
                header="Editar Grado"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                breakpoints={{
                    '768px': '95vw',
                    '480px': '100vw'
                }}
                modal
                draggable={false}
                resizable={false}
                onHide={cerrarEdicion}
            >
                {selectedGradoId !== null && (
                    <Updategrado
                        key={selectedGradoId}
                        idGrado={selectedGradoId}
                        onGradoUpdate={finalizarActualizacion}
                    />
                )}
            </Dialog>
        </div>
    );
}

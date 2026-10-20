
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getTutores, deleteTutor } from '../../../Servicios/tutorService';
import UpdateTutor from '../../../Servicios/TutoresServicios/EditarTutores';
//import AddDocente from '../../../Servicios/DocenteServicios/agregarDocente';
//import VerDocente from '../../../Servicios/DocenteServicios/VerDocentes';
//import BuscarDocente from '../../../Servicios/DocenteServicios/BuscarDocentes';



export default function Tutores() {

    const toast = useRef(null);
    //const header;

    const [showViewMode, setShowViewMode] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);

    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTutorId, setSelectedTutorId] = useState(null);


    const cargarTutores = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTutores();
            setTutores(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar la lista de tutores.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarTutores();
    }, [cargarTutores]);

    const handleConfirmDelete = (idPersona) => {
        confirmDialog({
            message: '¿Está seguro de eliminar al Tutor ?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí, Eliminar',
            rejectLabel: 'Cancelar',
            accept: async () => {
                try {
                    await deleteTutor(idPersona);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Registro Eliminado',
                        detail: 'El docente ha sido removido del sistema.',
                        life: 3000
                    });
                    cargarTutores();
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



    const actionsBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-eye"
                    severity="info"
                    rounded
                    outlined
                    //tooltip="Ver Expediente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedTutorId(rowData.idpersona);
                        setShowViewMode(true);
                    }}
                />
                <Button
                    icon="pi pi-pencil"
                    severity="warning"
                    rounded
                    outlined
                    //tooltip="Editar Docente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedTutorId(rowData.idpersona);
                        setShowEditMode(true);
                    }}
                />
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    outlined
                    //tooltip="Eliminar"
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

            </div>
        </div>
    )


    return (
        <div className="p-3 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Card title="Expedientes de Tutores - SIGE">
                <DataTable

                    value={tutores}
                    paginator
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    dataKey="idpersona"
                    stripedRows
                    loading={loading}
                    header={header}
                    emptyMessage="No se encontraron registros de tutores."
                    responsiveLayout="scroll"
                >
                    <Column field="nombre_completo" header="Nombres" sortable style={{ minWidth: '12rem' }} />
                    <Column field="apellido_completo" header="Apellidos" sortable style={{ minWidth: '12rem' }} />
                    <Column field="ocupacion" header="Ocupacion" sortable style={{ minWidth: '12rem' }} />
                    <Column field="telefonoPrincipal" header="Telefono" sortable style={{ minWidth: '12rem' }} />

                    <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '10rem', textAlign: 'center' }} />
                </DataTable>

                {/* Sección de acciones inferior dentro del Fieldset */}
                <Fieldset legend="Acciones" className="mt-4">
                    <div className="flex flex-wrap gap-3 align-items-center">
                        <Button
                            label="Nuevo Docente"
                            icon="pi pi-plus"
                            severity="primary"
                            onClick={() => setShowAddMode(true)}
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
                    setSelectedTutorId(null);
                }}
            >
                {/*selectedTutorId && <VerDocente idPersona={selectedTutorId} />*/}
            </Dialog>

            {/* Modal Agregar Estudiante */}
            <Dialog
                header="Registrar Nuevo Docente"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => setShowAddMode(false)}

            >
                { /*<AddDocente
                    cargarDocente={cargarTutores}
                    setDocentedoAdd={() => setShowAddMode(false)}
                />*/}

            </Dialog>

            {/* Modal Editar Estudiante */}

            {/* Modal Editar Tutor */}
            <Dialog
                header="Editar expediente de tutor"
                visible={showEditMode}
                modal
                style={{ width: '90vw', maxWidth: '850px' }}
                breakpoints={{
                    '768px': '95vw',
                    '480px': '100vw'
                }}
                onHide={() => {
                    setShowEditMode(false);
                    setSelectedTutorId(null);
                }}
            >
                {selectedTutorId && (
                    <UpdateTutor
                        idPersona={selectedTutorId}
                        onCancel={() => {
                            setShowEditMode(false);
                            setSelectedTutorId(null);
                        }}
                        onTutorUpdate={async () => {
                            // Actualizar los registros de la tabla.
                            await cargarTutores();

                            // Mostrar confirmación en el Toast de Tutores.js.
                            toast.current?.show({
                                severity: 'success',
                                summary: 'Actualización exitosa',
                                detail: 'El expediente del tutor se actualizó correctamente.',
                                life: 3000
                            });

                            // Cerrar el modal después de guardar.
                            setShowEditMode(false);
                            setSelectedTutorId(null);
                        }}
                    />
                )}
            </Dialog>

        </div>
    );



}

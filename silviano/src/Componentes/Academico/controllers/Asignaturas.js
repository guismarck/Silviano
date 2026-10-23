
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getAsignaturas, deleteAsignatura } from '../../../Servicios/AsignaturaService/asignaturasService';
import AddAsignatura from '../../../Servicios/AsignaturaService/agregarAsignatura';
//import VerAsignatura from '../../../Servicios/DocenteServicios/VerAsignaturas';
import UpdateAsignatura  from '../../../Servicios/AsignaturaService/EditarAsignaturas';
//import BuscarDocente from '../../../Servicios/DocenteServicios/BuscarAsignaturas';






export default function Asignaturas() {


    const toast = useRef(null);
    //const header;

    const [showViewMode, setShowViewMode] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);

    const [asignaturas, setAsignaturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAsignaturateId, setSelectedAsignatturaId] = useState(null);


    const cargarAsignaturas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAsignaturas();
            setAsignaturas(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar la lista de asignaturas.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarAsignaturas();
    }, [cargarAsignaturas]);

    const handleConfirmDelete = (idAsignatura) => {
       confirmDialog({
         message: '¿Está seguro de eliminar este expediente de Asignatura?',
         header: 'Confirmar Eliminación',
         icon: 'pi pi-exclamation-triangle',
         acceptClassName: 'p-button-danger',
         acceptLabel: 'Sí, Eliminar',
         rejectLabel: 'Cancelar',
         accept: async () => {
           try {
             await deleteAsignatura(idAsignatura);
             toast.current?.show({
               severity: 'success',
               summary: 'Registro Eliminado',
               detail: 'El asignatura ha sido removido del sistema.',
               life: 3000
             });
             cargarAsignaturas();
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
                        setSelectedAsignatturaId(rowData.idAsignatura);
                        setShowViewMode(true);
                    }}
                />
                <Button
                    icon="pi pi-pencil"
                    severity="warning"
                    rounded
                    outlined
                    
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedAsignatturaId(rowData.idAsignatura);
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
                onClick={() => handleConfirmDelete(rowData.idAsignatura)}
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

            <Card title="Expedientes de Asignaturas - SIGE">
                <DataTable

                    value={asignaturas}
                    paginator
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    dataKey="idAsignatura"
                    stripedRows
                    loading={loading}
                    header={header}
                    emptyMessage="No se encontraron registros de asignaturas."
                    responsiveLayout="scroll"
                >
                    <Column field="idAsignatura" header="ID" sortable style={{ minWidth: '5rem' }} />
                    <Column field="nombre" header="nombre" sortable style={{ minWidth: '8rem' }} />
                    <Column field="codigo" header="Codigo " sortable style={{ minWidth: '9rem' }} />
                    <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '10rem', textAlign: 'center' }} />
                </DataTable>

                {/* Sección de acciones inferior dentro del Fieldset */}
                <Fieldset legend="Acciones" className="mt-4">
                    <div className="flex flex-wrap gap-3 align-items-center">
                        <Button
                            label="Nueva Asignatura"
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
                    setSelectedAsignatturaId(null);
                }}
            >
                {/*selectedAsignaturateId && <VerAsignatura idAsignatura={selectedAsignaturateId} />*/}
            </Dialog>

            {/* Modal Agregar Estudiante */}
            <Dialog
                header="Registrar Nuevo Asignatura"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => setShowAddMode(false)}

            >
                <AddAsignatura
                    cargarAsignatura={cargarAsignaturas}
                    setAsignaturaAdd={() => setShowAddMode(false)}
                />
            </Dialog>

            {/* Modal Editar Asignatura */}
            <Dialog
                header="Editar Expediente de Asignatura"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => {
                    setShowEditMode(false);
                    setSelectedAsignatturaId(null);
                }}

            >
                {selectedAsignaturateId && (
                        <UpdateAsignatura 
                          idAsignatura={selectedAsignaturateId}
                          onAsignaturaUpdate={() => {
                            setShowEditMode(false);
                            setSelectedAsignatturaId(null);
                            cargarAsignaturas();
                          }}
                        />
                      )}
            </Dialog>
        </div>


      


    );



}

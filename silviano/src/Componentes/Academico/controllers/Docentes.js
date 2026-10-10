
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

import { getDocentes } from '../../../Servicios/DocenteServicios/docenteService';
import AddDocente from '../../../Servicios/DocenteServicios/agregarDocente';
import VerDocente from '../../../Servicios/DocenteServicios/VerDocentes';
import UpdateDocente from '../../../Servicios/DocenteServicios/EditarDocentes';

//import BuscarDocentes from '../../../Servicios/DocenteServicios/BuscarDocentes';



export default function Docentes() {

    const toast = useRef(null);
    //const header;

    const [showViewMode, setShowViewMode] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);

    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [selectedDocenteId, setSelectedDocenteId] = useState(null);


    const cargarDocentes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDocentes();
            setDocentes(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar la lista de docentes.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDocentes();
    }, [cargarDocentes]);

    

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
                    //tooltip="Ver Expediente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedDocenteId(rowData.idpersona);
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
                        setSelectedDocenteId(rowData.idpersona);
                        setShowEditMode(true);
                    }}
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

            <Card title="Expedientes de Docentes - SIGE">
                <DataTable

                    value={docentes}
                    paginator
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    dataKey="idpersona"
                    stripedRows
                    loading={loading}
                    header={header}
                    emptyMessage="No se encontraron registros de docentes."
                    responsiveLayout="scroll"
                >
                    <Column field="idpersona" header="ID" sortable style={{ minWidth: '5rem' }} />
                    <Column field="codDocente" header="Código" sortable style={{ minWidth: '8rem' }} />
                    <Column field="especialidad" header="Especialidad" sortable style={{ minWidth: '9rem' }} />
                    <Column field="nombre_completo" header="Nombres" sortable style={{ minWidth: '12rem' }} />
                    <Column field="apellido_completo" header="Apellidos" sortable style={{ minWidth: '12rem' }} />
                    <Column field="estado" header="Estado" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }} />
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
                    setSelectedDocenteId(null);
                }}
            >
               {selectedDocenteId && <VerDocente idPersona={selectedDocenteId} />}
            </Dialog>

            {/* Modal Agregar Estudiante */}
            <Dialog
                header="Registrar Nuevo Docente"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => setShowAddMode(false)}

            >
                <AddDocente
                    cargarDocente={cargarDocentes}
                    setDocentedoAdd={() => setShowAddMode(false)}
                />
            </Dialog>

            {/* Modal Editar Estudiante */}
            <Dialog
                header="Editar Expediente de Docente"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => {
                    setShowEditMode(false);
                    setSelectedDocenteId(null);
                }}

            >
              {selectedDocenteId && (
                        <UpdateDocente
                          idPersona={selectedDocenteId}
                          onEstudianteUpdate={() => {
                            setShowEditMode(false);
                            setSelectedDocenteId(null);
                            cargarDocentes();
                          }}
                        />
                      )}
            </Dialog>
        </div>
    );



}

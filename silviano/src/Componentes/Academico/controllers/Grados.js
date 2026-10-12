import React, { useState, useEffect, useCallback, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
//import Vergrado from '../../../Servicios/GradoServicios/VerGrados';

//import settings from '../../settings.json';
import { getGrados, getNivelEducativo } from '../../../Servicios/GradoServicios/gradoService';
import Addgrado from '../../../Servicios/GradoServicios/AgregarGrados';
import Updategrado from '../../../Servicios/GradoServicios/EditarGrado';
import { Fieldset } from 'primereact/fieldset';

export default function ListarGrados() {
    /**
     * declaaracion de variables
     */
    const toast = useRef(null);
    const [grados, setGrados] = useState([]);
    const [niveles, setNiveles] = useState([]);

    const [showViewMode, setShowViewMode] = useState(false);
    const [showAddMode, setShowAddMode,] = useState(false);
    const [showEditMode, setShowEditMode,] = useState(false);
    //const [selectGradoID, setSelectGradoID] = useState(null);

    const [loading, setLoading] = useState(false);
    const [selectedGradoId, setSelectedGradoId] = useState(null);

    const cargarGrados = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getGrados();
            setGrados(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar la lista de grados.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }


        const data = await getGrados();
        console.log("Grados recibidos:", data);
        setGrados(Array.isArray(data) ? data : []);

    }, []);

    const cargarNivel = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNivelEducativo();
            setNiveles(Array.isArray(data) ? data : []);
            console.log(data)
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar Niveles.',
                life: 4000
            });
            console.log(error)
        } finally {
            setLoading(false);
        }
        const data = await getGrados();
        console.log("Grados recibidos:", data);
        setGrados(Array.isArray(data) ? data : []);
    }, []);

    const nivelBodyTemplate = (rowData) => {

        return rowData.nivelEducativo.nombre;
    };



    useEffect(() => {
        cargarGrados();
        // cargarNivel();
    }, [cargarGrados, cargarNivel]);

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
                        setSelectedGradoId(rowData.idpersona);
                        //setShowViewMode(true);
                    }}
                />
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
                    //tooltip="Eliminar"
                    tooltipOptions={{ position: 'top' }}
                //@ts-expect-erroronClick={() => handleConfirmDelete(rowData.idpersona)}
                />

            </div>
        );
    };

    return (
        <div className="p-3 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Card title="Grados">

                <DataTable value={grados} stripedRows tableStyle={{ minWidth: '50rem' }}>
                    <Column field="idGrado" header="ID-Grado" style={{ width: '25%' }}></Column>
                    <Column header="Nivel educativo" body={nivelBodyTemplate} style={{ width: '25%' }} />
                    <Column field="nombre" header="Nombre" style={{ width: '25%' }}></Column>
                    <Column header="Accion" body={actionsBodyTemplate} ></Column>
                </DataTable>


                {/* Sección de acciones inferior dentro del Fieldset */}
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
                    setGradoAdd={() => setShowAddMode(true)}
                />
            </Dialog>

           

            {/* Modal Editar Grado */}
            <Dialog
                header="Editar Grado"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => {
                    setShowEditMode(false);
                    setSelectedGradoId(null);
                }}
                
            >
           {selectedGradoId && (
                    <Updategrado
                        idPersona={selectedGradoId}
                        onEstudianteUpdate={() => {
                            setShowEditMode(false);
                            setSelectedGradoId(null);
                            cargarGrados();
                        }}
                    />
                )}
            </Dialog>

           
        </div>

    );
}



import React, { useState, useEffect, useCallback, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { Button } from 'primereact/button';
//import Vergrado from '../../../Servicios/GradoServicios/VerGrados';
//import Addgrado from '../../../Servicios/GradoServicios/AgregarGrados';
//import Updategrado from '../../../Servicios/GradoServicios/EditarGrado';
//import settings from '../../settings.json';
import { getGrados } from '../../../Servicios/GradoServicios/gradoService';


export default function ListarGrados() {
    /**
     * declaaracion de variables
     */
    const toast = useRef(null);
    const [grados, setGrados] = useState([]);
    const [showViewMode, setshowViewMode] = useState(false);
    const [showAddMode, setshowAddMode,] = useState(false);
    const [showEditMode, setshowEditMode,] = useState(false);
    //const [selectGradoID, setSelectGradoID] = useState(null);

    const [docentes, setDocentes] = useState([]);
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
    }, []);


    useEffect(() => {
        cargarGrados();
    }, [cargarGrados]);

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
                    //tooltip="Editar Docente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedGradoId(rowData.idpersona);
                        // setShowEditMode(true);
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
        <div className="card">

            <Card title="Grados">

                <div className='addGrado'>
                    <Button className='btnAgregar'
                        label="Nuevo Grado" text raised onClick={() => setshowAddMode(true)} />
                </div>

                <div className='listarGrados' >

                    <DataTable value={grados} stripedRows tableStyle={{ minWidth: '50rem' }}>
                        <Column field="idGrado" header="ID-Grado" style={{ width: '25%' }}></Column>
                        <Column field="idnivel" header="Nivel" style={{ width: '25%' }} ></Column>
                        <Column field="nombre" header="Nombre" style={{ width: '25%' }}></Column>
                        <Column header="Accion" body={actionsBodyTemplate} ></Column>
                    </DataTable>
                </div>
            </Card>
            <Dialog header="" visible={showViewMode}
                style={{ width: '50vw' }}
                onHide={() => setshowViewMode(false)} >
                {/* <Vergrado idGrado={selectedGradoId} /> */}
            </Dialog>
            <Dialog header="" visible={showAddMode}
                style={{ width: '50vw' }}
                onHide={() => setshowAddMode(false)} >


            </Dialog>

            <Dialog header="" visible={showEditMode}
                style={{ width: '50vw' }}
                onHide={() => setshowEditMode(false)} >

            </Dialog>
        </div>

    );
}



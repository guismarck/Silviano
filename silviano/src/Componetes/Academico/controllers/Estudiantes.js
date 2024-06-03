import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import settings from '../../../settings.json';
import axios from 'axios';
import VerEstudiante from '../../../Servicios/EstudiantesServicios/VerEstudinates';
import AddEstudiante from '../../../Servicios/EstudiantesServicios/AgregarEstudinates';
import UpdateEstudiante from '../../../Servicios/EstudiantesServicios/EditarEstudiantes';
import BuscarEstudiantes from '../../../Servicios/EstudiantesServicios/BuscarEstudiantes';

export default function Estudiantes() {

    const urlBase = `${settings.api.baseUrl}/estudiantes`;

    const [estudiantes, setEstudiantes] = useState([]);
    const [showViewMode, setshowViewMode] = useState(false);
    const [showAddMode, setshowAddMode] = useState(false);
    const [showEditMode, setshowEditMode] = useState(false);
    const [selectEstudiantesID, setSelectEstudianteID] = useState(null);

    useEffect(() => {
        cargarEstudiante()
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const cargarEstudiante = async () => {//peticion asicrona
        try {
            const resultado = await axios.get(urlBase);
            if (resultado) {
                // console.log(resultado.data);
                setEstudiantes(resultado.data);
            }
        } catch (error) { }
    }
    const onClickDelete = async (id) => {
        try {
            const respuesta = await axios
                .delete(`${urlBase}/${id}`);
            if (respuesta) {
                cargarEstudiante();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const onFilter = (data) => {
        console.log('Entro')
        setEstudiantes(data);
    };
    const renderHeader = () => {
        
        return (

            <div className="busqueda">
                 <BuscarEstudiantes 
                 onFilter={onFilter} loadAll={cargarEstudiante}/>
            
                <div className="btnAdd">
                    <Button className='btn-add'
                        raised label=" Nuevo "
                        icon="pi pi-plus"
                        onClick={() => setshowAddMode(true)}
                    />
                </div>
             
            </div>
        );
    };

    const header = renderHeader();

    const actionsTemplate = (RowDate) => {
        return (
            <>
                <button className='btn btn-success' onClick={() => {
                    setSelectEstudianteID(RowDate.idpersona)
                    setshowViewMode(true)
                }} >
                    <img className='icon' src="https://img.icons8.com/material-outlined/visible--v1.png" alt="visible--v1" />
                </button>
                <button className='btn btn-primary'
                    onClick={() => {
                        setSelectEstudianteID(RowDate.idpersona)
                        setshowEditMode(true)
                    }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/edit--v1.png" alt="edit--v1" />
                </button>
                <button className='btn btn-danger' onClick={() => {
                    onClickDelete(RowDate.idpersona);
                }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/filled-trash.png" alt="filled-trash" />
                </button>
            </>
        )

    }
    return (
        <div className="card">
            <Card title="Estudiantes">

                <DataTable value={estudiantes} paginator rows={10} dataKey="id" stripedRows
                    //  filters={filters} filterDisplay="row" loading={loading}
                    header={header} emptyMessage="No se encontro el estudiante."
                >
                    <Column field="idpersona" header="ID" style={{ minWidth: '4rem' }} />
                    <Column field="cod_estudiante" header="Codigo" style={{ minWidth: '10rem' }} />
                    <Column field="nombre_completo" header="Nombres" style={{ minWidth: '12rem' }} />
                    <Column field="apellido_completo" header="Apellidos" style={{ minWidth: '12rem' }} />
                    <Column field="estado" header="Estado" style={{ minWidth: '10rem' }} />
                    <Column header="Accion" body={actionsTemplate} style={{ minWidth: '12rem' }} ></Column>
                </DataTable>
            </Card>
            <Dialog header="" visible={showViewMode}
                style={{ width: '50vw' }}
                onHide={() => setshowViewMode(false)} >
                <VerEstudiante idpersona={selectEstudiantesID} />
            </Dialog>
            <Dialog header="" visible={showAddMode}
                style={{ width: '50vw' }}
                onHide={() => setshowAddMode(false)} >
                <AddEstudiante setEstudiantedoAdd={() => {

                    setshowAddMode(false)
                    cargarEstudiante()
                }} />
            </Dialog>
            <Dialog header="" visible={showEditMode}
                style={{ width: '50vw' }}
                onHide={() => setshowEditMode(false)} >
                <UpdateEstudiante
                    IDpersona={selectEstudiantesID}
                    setEstudianteUpdate={() => {

                        setshowEditMode(false)
                        cargarEstudiante()
                    }} />
            </Dialog>

        </div>
    );
}

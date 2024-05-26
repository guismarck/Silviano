import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { Button } from 'primereact/button';
import Vergrado from './VerGrados';
import Addgrado from './AgregarGrados';
import Updategrado from './EditarGrado';
import settings from '../../../settings.json';
//import { ServicioGrado } from '../../../Servicios/ServicioGrado';

export default ListarGrados;
const urlBase = `${settings.api.baseUrl}/grados`;

function ListarGrados() {
    /**
     * declaaracion de variables
     */
    const [grados, setGrados] = useState([]);
    const [showViewMode, setshowViewMode] = useState(false);
    const [showAddMode, setshowAddMode,] = useState(false);
    const [showEditMode, setshowEditMode,] = useState(false);
    const [selectGradoID, setSelectGradoID] = useState(null);
    useEffect(() => {
        cargarGrado();
    }, []);

    const cargarGrado = async () => {//peticion asicrona
        try {
            //ServicioGrado.getGradosMini().then(data  => setGrados(data));
            const resultado = await axios.get(urlBase);
            if (resultado) {
                // console.log(resultado.data);
                setGrados(resultado.data);
            }
        } catch (error) { }
    }

    const onClickDelete = async (id) => {
        try {
            const respuesta = await axios
                .delete(`${urlBase}/${id}`);
            if (respuesta) {
                cargarGrado();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const actionsTemplate = (rowDate) => { //botones de la occion
        return (
            <>
                <button className='btn btn-success' onClick={() => {
                    setSelectGradoID(rowDate.idGrado)
                    setshowViewMode(true)
                }} >
                    <img className='icon' src="https://img.icons8.com/material-outlined/visible--v1.png" alt="visible--v1" />
                </button>
                <button className='btn btn-primary'
                    onClick={() => {
                        setSelectGradoID(rowDate.idGrado)
                        setshowEditMode(true)
                    }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/edit--v1.png" alt="edit--v1" />
                </button>
                <button className='btn btn-danger' onClick={() => {
                    onClickDelete(rowDate.idGrado);
                }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/filled-trash.png" alt="filled-trash" />
                </button>
            </>
        )
    }

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
                        <Column field="categoria" header="Nivel" style={{ width: '25%' }} ></Column>
                        <Column field="nombre" header="Nombre" style={{ width: '25%' }}></Column>
                        <Column header="Accion" body={actionsTemplate} ></Column>
                    </DataTable>
                </div>
            </Card>
            <Dialog header="" visible={showViewMode}
                style={{ width: '50vw' }}
                onHide={() => setshowViewMode(false)} >
                <Vergrado idGrado={selectGradoID} />
            </Dialog>
            <Dialog header="" visible={showAddMode}
                style={{ width: '50vw' }}
                onHide={() => setshowAddMode(false)} >
                <Addgrado setGradoAdd={() => {

                    setshowAddMode(false)
                    cargarGrado()
                }} />
            </Dialog>
            <Dialog header="" visible={showEditMode}
                style={{ width: '50vw' }}
                onHide={() => setshowEditMode(false)} >
                <Updategrado
                    gradoID={selectGradoID}
                    setGradoUpdate={() => {

                        setshowEditMode(false)
                        cargarGrado()
                    }} />
            </Dialog>
        </div>

    );
}



import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { Button } from 'primereact/button';
import Versalon from './VerCatalogoSalon';
import Addsalon from './AgregarSalon';
import Updatesalon from './EditarCatalogoSalon';
import settings from '../../../settings.json';



export default ListarCatalogoSalon;
const urlBase = `${settings.api.baseUrl}/catalogo/salon`;

function ListarCatalogoSalon() {
    /**
     * declaración de variables
     */
    const [salon, setCatSalon] = useState([]);
    const [showViewMode, setshowViewMode] = useState(false);
    const [showAddMode, setshowAddMode,] = useState(false);
    const [showEditMode, setshowEditMode,] = useState(false);
    const [selectCatSalonID, setSelectCatSalonID] = useState(null);
    useEffect(() => {
        cargarCatalogoSalon();
    }, []);

    const cargarCatalogoSalon = async () => {//peticion asicrona
        try {
            //ServicioGrado.getGradosMini().then(data  => setGrados(data));
            const resultado = await axios.get(urlBase);
            if (resultado) {
                // console.log(resultado.data);
                setCatSalon(resultado.data);
            }
        } catch (error) {console.log(error.data) }
    }

    const onClickDelete = async (id) => {
        try {
            const respuesta = await axios
                .delete(`${urlBase}/${id}`);
            if (respuesta) {
                cargarCatalogoSalon();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const actionsTemplate = (rowDate) => { //botones de la opción
        return (
            <>
                <button className='btn btn-success' onClick={() => {
                    setSelectCatSalonID(rowDate.idcatalogo_salon)
                    setshowViewMode(true)
                }} >
                    <img className='icon' src="https://img.icons8.com/material-outlined/visible--v1.png" alt="visible--v1" />
                </button>
                <button className='btn btn-primary'
                        onClick={() => {
                            setSelectCatSalonID(rowDate.idcatalogo_salon)
                            setshowEditMode(true)
                        }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/edit--v1.png" alt="edit--v1" />
                </button>
                <button className='btn btn-danger' onClick={() => {
                    onClickDelete(rowDate.idcatalogo_salon);
                }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/filled-trash.png" alt="filled-trash" />
                </button>
            </>
        )
    }

    return (
        <div className="card">

            <Card title="Catalogo Salón">

                <div className='addGrado'>
                    <Button className='btnAgregar'
                            label="Nuevo Salón" text raised onClick={() => setshowAddMode(true)} />
                </div>

                <div className='listarGrados' >

                    <DataTable value={salon} stripedRows tableStyle={{ minWidth: '50rem' }}>
                        <Column field="idcatalogo_salon" header="ID-Catalogo-Salón" style={{ width: '25%' }}></Column>
                        <Column field="nombre_salon" header="Nombre" style={{ width: '25%' }}></Column>
                        <Column header="Acción" body={actionsTemplate} ></Column>
                    </DataTable>
                </div>
            </Card>
            <Dialog header="" visible={showViewMode}
                    style={{ width: '50vw' }}
                    onHide={() => setshowViewMode(false)} >
                <Versalon idcatalogo_salon={selectCatSalonID} />
            </Dialog>
            <Dialog header="" visible={showAddMode}
                    style={{ width: '50vw' }}
                    onHide={() => setshowAddMode(false)} >
                <Addsalon setSalonAdd={() => {
                    setshowAddMode(false)
                    cargarCatalogoSalon()
                }} />
            </Dialog>
            <Dialog header="" visible={showEditMode}
                    style={{ width: '50vw' }}
                    onHide={() => setshowEditMode(false)} >
                <Updatesalon
                    salonID={selectCatSalonID}
                    setCatSalonUpdate={() => {
                        setshowEditMode(false)
                        cargarCatalogoSalon()
                    }} />
            </Dialog>
        </div>

    );
}


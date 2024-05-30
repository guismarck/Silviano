import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
//import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import settings from '../../../../silviano/src/settings.json';
import axios from 'axios';
//import BuscarEstudiantes from '../../../Servicios/EstudiantesServicios/BuscarEstudiantes';


export default function ListMatriculas() {
    const urlMatricula = `${settings.api.baseUrl}/matriculas`;
    const urlBase = `${settings.api.baseUrl}/estudiantes`;
   

    const [estudiantes, setEstudiantes] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
   
    useEffect(() => {
        cargarEstudiante()
        cargarMatricula()
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const cargarEstudiante = async () => {//peticion asicrona
        try {
           
            const resultado = await axios.get(urlBase);
           
            if (resultado ) {
                // console.log(resultado.data);
                setEstudiantes(resultado.data);
                
            }
        } catch (error) { }
    }

    const cargarMatricula = async () => {//peticion asicrona
        try {
            const resulMatricula = await axios.get(urlMatricula);
            if ( resulMatricula) {
                // console.log(resultado.data);
                
                setMatriculas(resulMatricula.data)
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

           /* <div className="busqueda">
                 <BuscarEstudiantes 
                 onFilter={onFilter} loadAll={cargarEstudiante}/>
            
                <div className="btnAdd">
                    <Button className='btn-add'
                        raised label=" Nuevo "
                        icon="pi pi-plus"
                       // onClick={() => setshowAddMode(true)}
                    />
                </div>
             
            </div>*/
            <h1>probando cambios</h1>
        );
    };

    const header = renderHeader();

    const actionsTemplate = (RowDate) => {
        return (
            <>
                <button className='btn btn-success' onClick={() => {
                   // setSelectEstudianteID(RowDate.idpersona)
                   // setshowViewMode(true)
                }} >
                    <img className='icon' src="https://img.icons8.com/material-outlined/visible--v1.png" alt="visible--v1" />
                </button>
                <button className='btn btn-primary'
                    onClick={() => {
                        //setSelectEstudianteID(RowDate.idpersona)
                       // setshowEditMode(true)
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
            <Card title="Matriculas">

                <DataTable  paginator rows={10} dataKey="id" stripedRows
                    //  filters={filters} filterDisplay="row" loading={loading}
                    header={header} emptyMessage="No se encontro el estudiante."
                >
                    <Column field="idmatricula" header="ID" style={{ minWidth: '4rem' }} value={matriculas} />
                    <Column field="nombre_completo" header="Nombres" style={{ minWidth: '12rem' }} valu={estudiantes} />
                    <Column field="turno" header="Turno" style={{ minWidth: '12rem' }} />
                    <Column field="costo_matricula" header="Costo" style={{ minWidth: '12rem' }} />
                    <Column field="estado" header="Estado" style={{ minWidth: '10rem' }} />
                    <Column header="Accion" body={actionsTemplate} style={{ minWidth: '12rem' }} ></Column>
                </DataTable>
            </Card>
         

        </div>
    );
}

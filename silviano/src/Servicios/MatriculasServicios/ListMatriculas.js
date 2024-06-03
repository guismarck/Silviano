import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import BuscarEstudiantes from '../../../src/Servicios/EstudiantesServicios/BuscarEstudiantes';
import settings from '../../../../silviano/src/settings.json';
import VerMatricula from './VerMatriculas';
export default function ListMatriculas() {
    const urlMatricula = `${settings.api.baseUrl}/matriculas`;
    
    const [matriculas, setMatriculas] = useState([]);
    const [showViewMode, setshowViewMode] = useState(false);
    const [selectMatriculaID, setSelectMatriculaID] = useState(null);

    useEffect(() => {
        cargarMatricula()
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

   /*const cargarMatricula = async () => {//peticion asicrona
        try {
            const resulMatricula = await axios.get(urlMatricula);
            if (resulMatricula) {
                const m = resulMatricula.data.map((i) => {

                    return { idmatricula: i.idmatricula }
                })
                console.log(m);

                setMatriculas(m)
            }
        } catch (error) { }
    }*/
    const cargarMatricula = async () => {//peticion asicrona
        try {
            const resulMatricula = await axios.get(urlMatricula);
            if (resulMatricula) {
                 console.log(resulMatricula.data);
                setMatriculas(resulMatricula.data);
            }
        } catch (error) { }
    }

   /*const onClickDelete = async (id) => {
        try {
            const respuesta = await axios
                .delete(`${urlBase}/${id}`);
            if (respuesta) {
                cargarEstudiante();
            }
        } catch (error) {
            console.log(error)
        }
    }*/

    const onFilter = (data) => {
        console.log('Entro')
        //setEstudiantes(data);
    };

    const renderHeader = () => {

        return (

             <div className="busqueda">
                  <BuscarEstudiantes 
                  onFilter={onFilter} loadAll={ cargarMatricula()}/>
             
                 <div className="btnAdd">
                     <Button className='btn-add'
                         raised label=" Nuevo "
                         icon="pi pi-plus"
                        // onClick={() => setshowAddMode(true)}
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
                     setSelectMatriculaID(RowDate.idmatricula)
                     setshowViewMode(true)
                }} >
                    <img className='icon' src="https://img.icons8.com/material-outlined/visible--v1.png" alt="visible--v1" />
                </button>
                <button className='btn btn-primary'
                    onClick={() => {
                        // setSelectMatriculaID(RowDate.idmatricula)
                        // setshowEditMode(true)
                    }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/edit--v1.png" alt="edit--v1" />
                </button>
                <button className='btn btn-danger' onClick={() => {
                   // onClickDelete(RowDate.idmatricula);
                }}  >
                    <img className='icon' src="https://img.icons8.com/material-outlined/filled-trash.png" alt="filled-trash" />
                </button>
            </>
        )

    }

    return (
        <div className="card">
            <Card title="Matriculas">

                <DataTable  value={matriculas}  paginator rows={10} stripedRows dataKey="id"
                    //  filters={filters} filterDisplay="row" loading={loading}
                    header={header} emptyMessage="No se encontro la matricula."
                >
                    <Column field="idmatricula" header="ID Matricula" style={{ minWidth: '10rem' }} />
                    <Column field="costo_matricula" header="Costo" style={{ minWidth: '12rem' }} />
                    <Column field="turno" header="Turno" style={{ minWidth: '12rem' }} />
                    <Column field="grado.nombre" header="Nivel" style={{ minWidth: '12rem' }} />
                    <Column field="estudiante.nombre_completo" header="Nombre" style={{ minWidth: '12rem' }} />
                    <Column header="Accion" body={actionsTemplate} style={{ minWidth: '12rem' }} ></Column>
                </DataTable> 
            </Card>
            <Dialog header="" visible={showViewMode}
                style={{ width: '50vw' }}
                onHide={() => setshowViewMode(false)} >
             <VerMatricula idmatricula={selectMatriculaID} />
            </Dialog>
          
        </div>
    );
}
  // 


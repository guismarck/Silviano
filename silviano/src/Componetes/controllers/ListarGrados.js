import React, { useState, useEffect } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';

export default ListarGrados;
const urlBase = "http://localhost8080/estudiante-app/grados";


/*useEffect(() => {
   cargarGrados();
}, []);*/




function ListarGrados() {
    
    const [grados, setGrados] = useState([]);

    const cargarGrado = async () => {//peticio asicrona
        const resultado = await axios.get(urlBase);
        setGrados(resultado)
    }

    cargarGrado()
    
    return (
        <div className="card">
            <DataTable value={grados} tableStyle={{ minWidth: '50rem' }}>
                <Column field="IdGrado" header="ID-Grado"></Column>
                <Column field="categoria" header="Nivel"></Column>
                <Column field="nombre" header="Nombre"></Column>

            </DataTable>
        </div>
    );
}



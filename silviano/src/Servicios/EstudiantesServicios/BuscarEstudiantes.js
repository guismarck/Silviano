import React, { useState, useEffect } from 'react';
import axios from 'axios';
import settings from '../../settings.json'
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
export default function BuscarEstudiantes(props) {

    const urlBase = `${settings.api.baseUrl}/estudiantes`
    const [estudiantes, setEstudiantes] = useState([]);
    const [search, setSearch] = useState();

    const [estudianteInfo, setEstudianteInfo] = useState({
        idpersona: '',
        nombre_completo: '',
        apellido_completo: '',
        direccion: '',
        fecha_nacimiento: '',
        cedula: '',
        cod_estudiante: '',
        codigo_MINED: '',
        nombre_tutor: '',
        estado: '',
        sexo: ''
    })

    //peticion 
    const estudianteSearch = async (search) => {
        try {
            const respuesta = await axios
                .get(`${urlBase}?search=${search}`);
            console.log(respuesta)
            if (respuesta) {
                console.log(respuesta.data)
                props.onFilter(respuesta.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        estudianteSearch(estudianteInfo.idpersona)
        console.log(estudianteInfo)
    }, []);
    //funcion de busqueda
    const Busqueda = (e) => {
        if (e.key !== 'Enter') return;
        if (search === undefined ||  search === ''){
            props.loadAll();
            return;
        }
         
        estudianteSearch(search);
    }
    //filtrar los datos 
   //* const resultados = !estudiantes ? estudianteInfo : estudianteInfo.filter((val) => val.nombre_completo.toLowerCase().includes(estudianteInfo.toLowerCase().in))*/
     //console.log(resultados)

    return (
        <>
            <IconField iconPosition="left" >
                <InputText value={search}
                    onChange={(e) => setSearch(e.target.value)} placeholder="Buscar "
                    onKeyUp={Busqueda}
                    className='busqueda-icon'
                    type='text'
                />
            </IconField>


        </>
    )
}

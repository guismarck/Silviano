import React, { useEffect, useState } from 'react';
import axios from 'axios';
import settings from '../../settings.json'

function VerMatricula(props) {

    const urlBase = `${settings.api.baseUrl}/matriculas/`;

    const inicialMatriculaInfo = {

        idmatricula: '',
        estudiante: {
            idpersona: '',
            nombre_completo: '',
        },
        grado: {
            idGrado: '',
            categoria: '',
            nombre: ''
        },
        turno: '',
        costo_matricula: ''
    }
    const [matriculaInfo, setmatriculaInfo] = useState(inicialMatriculaInfo)

    useEffect(() => {
        matriculaData()
        console.log(matriculaInfo)
    }, []);

    const matriculaData = async () => {
        try {
            const respuesta = await axios
                .get(urlBase + props.idmatricula);
            if (respuesta) {
                console.log(respuesta.data)
                setmatriculaInfo(respuesta.data)
            }
        } catch (error) {
            // console.log(error)
        }
    }

    return (

        <div className='grado-gradoInfo'>
            <h1>Infomacion de la Matricula</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID Matricula : </span>
                            <span>{matriculaInfo.idmatricula} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre  : </span>
                            <span>{matriculaInfo.estudiante.nombre_completo} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Grado : </span>
                            <span>{matriculaInfo.grado.nombre} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Turno : </span>
                            <span>{matriculaInfo.turno} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Costo de Matricula : </span>
                            <span>{matriculaInfo.costo_matricula} </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerMatricula
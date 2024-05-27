import React, { useEffect, useState } from 'react';
import axios from 'axios';
import settings from '../../settings.json'

function VerEstudiante(props) {

    const urlBase = `${settings.api.baseUrl}/estudiantes/`;

    const inicialEstudiantesInfo = {

        idpersona: '',
        nombre_completo: '',
        apellido_completo: '',
        sexo: '',
        direccion: '',
        partidad_nacimiento: '',
        fecha_nacimiento: '',
        cedula: '',
        cod_estudiante: '',
        codigo_MINED: '',
        nombre_tutor: '',
        estado: false
    }
    const [estudianteInfo, setestudianteInfo] = useState(inicialEstudiantesInfo)

    useEffect(() => {
        estudianteData()
        console.log(estudianteInfo)
    }, []);

    const estudianteData = async () => {
        try {
            const respuesta = await axios
                .get(urlBase + props.idpersona);
            if (respuesta) {
                console.log(respuesta.data)
                setestudianteInfo(respuesta.data)
            }
        } catch (error) {
            // console.log(error)
        }
    }

    return (

        <div className='grado-gradoInfo'>
            <h1>Datos Personales</h1>
            <div className='box'>
                <div className='row'>
                   
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombres : </span>
                            <span>{estudianteInfo.nombre_completo} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Apellidos : </span>
                            <span>{estudianteInfo.apellido_completo} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Sexo : </span>
                            <span>{estudianteInfo.sexo} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Direcion : </span>
                            <span>{estudianteInfo.direccion} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Fecha de Nacimiento : </span>
                            <span>{estudianteInfo.fecha_nacimiento} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Partida de Nacimiento : </span>
                            <span>{estudianteInfo.partidad_nacimiento} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Cedula : </span>
                            <span>{estudianteInfo.cedula} </span>
                        </p>
                    </div>


                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre tutor : </span>
                            <span>{estudianteInfo.nombre_tutor} </span>
                        </p>
                    </div>


                </div>

            </div>
            <h1>Infomacion del Estudinate</h1>
            <div className='box'>
                <div className='row'>
                <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID :  </span>
                            <span>{estudianteInfo.idpersona} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Codigo Estudiante : </span>
                            <span>{estudianteInfo.cod_estudiante} </span>
                        </p>
                    </div>
                </div>
                <div className='col-sm-12 col-md-6'>
                    <p>
                        <span>Codigo MINED : </span>
                        <span>{estudianteInfo.codigo_MINED} </span>
                    </p>
                </div>
                <div className='col-sm-12 col-md-6'>
                    <p>
                        <span>Estado :  </span>
                        <span>{estudianteInfo.estado?'Activo':'Inactivo'} </span>
                    </p>
                </div>
            </div>
        </div>
    )

}

export default VerEstudiante
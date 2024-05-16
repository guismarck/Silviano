import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Vergrado(props) {

    const inicialGradoInfo = {
        idGrado: '',
        categoria: '',
        nombre: ''
    }

    const [gradoInfo, setgradoInfo] = useState(inicialGradoInfo)

    useEffect(() => {
        gradoData()
        console.log(gradoInfo)
    }, []);

    const gradoData = async () => {
        try {
            const respuesta = await axios
                .get('http://localhost:8080/estudiante-app/grados/' + props.idGrado);
            if (respuesta) {
                console.log(respuesta.data)
                setgradoInfo(respuesta.data)
            }
        } catch (error) {
            // console.log(error)
        }
    }

    return (
        <div className='grado-gradoInfo'>
            <h1>Info de Grados</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID: </span>
                            <span>{gradoInfo.idGrado} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nivel: </span>
                            <span>{gradoInfo.categoria} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre: </span>
                            <span>{gradoInfo.nombre} </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default Vergrado

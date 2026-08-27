import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Versalon(props) {

    const inicialsalonInfo = {
        idcatalogo_salon: '',
        nombre_salon: ''
    }

    const [salonInfo, setsalonInfo] = useState(inicialsalonInfo)

    useEffect(() => {
        salonData()
        console.log(salonInfo)
    }, []);

    const salonData = async () => {
        try {
            const respuesta = await axios
                .get('http://localhost:8080/estudiante-app/catalogo/salon/' + props.idcatalogo_salon);
            if (respuesta) {
                console.log(respuesta.data)
                setsalonInfo(respuesta.data)
            }
        } catch (error) {
            // console.log(error)
        }
    }

    return (
        <div className='grado-gradoInfo'>
            <h1>Datos del Salón</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID:</span>
                            <span>{salonInfo.idcatalogo_salon} </span>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre: </span>
                            <span>{salonInfo.nombre_salon} </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default Versalon

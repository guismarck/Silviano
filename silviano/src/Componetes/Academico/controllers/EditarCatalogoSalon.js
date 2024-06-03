import React from 'react';

import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';

function Updatesalon(props) {

    const [salonInfo, setsalonInfo] = useState({
        idcatalogo_salon: "",
        nombre_salon: ""
    })

    useEffect(() => {
        findById(props.salonID)
        console.log(salonInfo)
    }, []);

    const findById = async (id) => {
        try {
            const respuesta = await axios
                .get(`http://localhost:8080/estudiante-app/catalogo/salon/${id}`);
            if (respuesta) {
                console.log(respuesta.data)
                setsalonInfo(respuesta.data)
            }
        } catch (error) {
            // console.log(error)
        }
    }


    const UpdatesalonData = async (e) => {
        try {
            console.log(salonInfo)
            const respuesta = await axios
                .put(`http://localhost:8080/estudiante-app/catalogo/salon/${salonInfo.idcatalogo_salon}`, salonInfo);

            if (respuesta) {
                console.log(respuesta.data)
                //gradoInfo(respuesta.data)o
                props.setCatSalonUpdate();
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='grado-gradoInfo input'>
            <h1>Editar Catalogo Salón</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID: </span>
                            <InputText className='form-control'
                                       value={salonInfo.idcatalogo_salon}
                                       disabled/>

                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre: </span>
                            <InputText className='form-control' placeholder='Nombre' name='nombre' required={true}
                                       value={salonInfo.nombre_salon}
                                       onChange={(e) => setsalonInfo({ ...salonInfo, nombre_salon: e.target.value })}
                            />
                        </p>
                    </div>
                </div>
            </div>
            <div className='btn-guardar'>
                <Button className='btn-guardar-save'
                        label="Editar"
                        severity="success"
                        raised onClick={UpdatesalonData} />
            </div>

        </div>

    );
}
export default Updatesalon

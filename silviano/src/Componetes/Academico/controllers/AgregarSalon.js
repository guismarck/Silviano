import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useForm } from 'react-hook-form'

function Addsalon(props) {

    const [salonInfo, setsalonInfo] = useState({
        idcatalogo_salon: "",
        nombre_salon: ""
    })

    const { register, handleSubmit, formState: { errors } } = useForm()//Validando campos
    const customSubmit = (salonInfo) => {
        // console.log(gradoInfo)
    }

    const AddsalonData = async (e) => {
        try {
            console.log(salonInfo)
            const respuesta = await axios
                .post('http://localhost:8080/estudiante-app/catalogo/salon/create', salonInfo);
            if (respuesta) {
                console.log(respuesta.data)
                //gradoInfo(respuesta.data)
                props.setSalonAdd();

            }
        } catch (error) {
            console.log(error)

        }
    }

    return (
        <div className='grado-gradoInfo input'>
            <h1>Nuevo Salón</h1>
            <div className='box'>

                <form onSubmit={handleSubmit(customSubmit)}>
                    <div className='row'>
                        <div className='col-sm-12 col-md-6'>
                            <p>
                                <span>ID: </span>
                                <InputText className='form-control' placeholder='Id'
                                           onChange={(e) => setsalonInfo({ ...salonInfo, idcatalogo_salon: e.target.value })}

                                />
                            </p>
                        </div>

                        <div className='col-sm-12 col-md-6'>
                            <p>
                                <span>Nombre del salón: </span>
                                <InputText className='form-control' placeholder='Nombre'
                                           onChange={(e) => setsalonInfo({ ...salonInfo, nombre_salon: e.target.value })}

                                />
                                {errors.nombre && <span>Este campo es requerido</span>}
                            </p>

                        </div>
                    </div>
                </form>

            </div>

            <div className='btn-guardar'>
                <Button className='btn-guardar-save'
                        label="Guardar"
                        severity="success"
                        raised onClick={AddsalonData}

                />

            </div>

        </div>

    );
}
export default Addsalon

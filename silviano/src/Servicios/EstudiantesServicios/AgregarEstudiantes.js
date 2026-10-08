import React, { useState, useRef } from 'react';
import axios from 'axios';
import settings from '../../settings.json'
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from 'primereact/toast';

import { Message } from 'primereact/message';
import api from '../api/api';
import { ServicioValidado } from '../../Servicios/estudianteService.js';

function AddEstudiante(props) {

    //const urlBase = `${settings.api.baseUrl}/estudiantes/create`;
    const toast = useRef(null);

    const [estudianteInfo, setEstudianteInfo] = useState({
        idpersona: '',
        nombre_completo: '',
        apellido_completo: '',
        direccion: '',
        fecha_nacimiento: '',
        cedula: '',
        partida_nacimiento: '',
        codEstudiante: '',
        codigoMined: '',
        nombre_tutor: '',
        estado: '',
        sexo: ''
    })

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const options = [
        { label: 'Femenino ', value: 'F' },
        { label: 'Masculino ', value: 'M' },
    ];

    const optionsAdd = [
        { label: 'Si', value: 'si' },
        { label: 'No ', value: 'no' },
    ]

    /* const AddEstudianteData = async (e) => {
 
         try {
             console.log(estudianteInfo)
             const toSent = estudianteInfo
             toSent['sexo'] = toSent['sexo'].value
             toSent['partida_nacimiento'] = toSent['partida_nacimiento'].value
             console.log(toSent)
 
             const respuesta = await api.post('/estudiante-app/estudiantes/create',toSent).catch(function(error){
                 console.log(error);
             });
 
           
 
             if (respuesta) {
                 console.log(respuesta.data)
                 props.cargarEstudiante(); 
                 props.setEstudiantedoAdd();
                 
             }
         } catch (error) {
             console.log(error)
 
         }
     }*/

    const AddEstudianteData = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        try {
            // Se delega la validación y el envío HTTP al servicio
            await ServicioValidado (estudianteInfo);

            toast.current?.show({
                severity: 'success',
                summary: 'Registro Exitoso',
                detail: 'El estudiante se ha guardado correctamente en la base de datos.',
                life: 3000
            });

            // Reiniciar estado o ejecutar callbacks del padre
            setTimeout(() => {
                if (props.cargarEstudiante) props.cargarEstudiante();
                if (props.setEstudiantedoAdd) props.setEstudiantedoAdd(false);
            }, 1200);

        } catch (error) {
            console.error("Error al registrar estudiante:", error);
            const mensajeError = error.response?.data?.mensaje || error.message || "Error al procesar el registro.";
            setErrorMessage(mensajeError);

            toast.current?.show({
                severity: 'error',
                summary: 'Error en Guardado',
                detail: mensajeError,
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    /*return (

        <div className='grado-gradoInfo'>
            <h1>Nuevo Estudiante</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombres : </span>
                            <InputText className='form-control' placeholder='nombres'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, nombre_completo: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Apellidos : </span>
                            <InputText className='form-control' placeholder='apellidos'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, apellido_completo: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Sexo : </span>
                            <Dropdown value={estudianteInfo.sexo}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, sexo: e.target.value })}
                                options={options} optionLabel="label"
                                className="w-full md:w-14rem" placeholder="" />

                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Partida de Nacimiento : </span>
                            <Dropdown value={estudianteInfo.partida_nacimiento}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, partida_nacimiento: e.target.value })}
                                options={optionsAdd} optionLabel="label"
                                className="w-full md:w-14rem" />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Dirección : </span>
                            <InputText className='form-control' placeholder='Direccion'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, direccion: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <span>Fecha de Nacimiento : </span>
                        <Calendar className='control-form' value={estudianteInfo.fecha_nacimiento}
                            onChange={(e) => setEstudianteInfo({ ...estudianteInfo, fecha_nacimiento: e.target.value })} />
                    </div>

                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Cedula : </span>
                            <InputText className='form-control' placeholder='Cedula'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, cedula: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre tutor : </span>
                            <InputText className='form-control' placeholder='Nombre del Tutor'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, nombre_tutor: e.target.value })}
                            />
                        </p>
                    </div>
                </div>
            </div>
            <h1>Información del Estudiante</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID :  </span>
                            <InputText className='form-control' placeholder='ID' disabled
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, idpersona: e.target.value })}
                            />

                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Codigo Estudiante : </span>
                            <InputText className='form-control' placeholder='Codigo Estudiante'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, codEstudiante: e.target.value })}
                            />
                        </p>
                    </div>
                </div>
                <div className='col-sm-12 col-md-6'>
                    <p>
                        <span>Codigo MINED : </span>
                        <InputText className='form-control' placeholder='Codigo MINED'
                            onChange={(e) => setEstudianteInfo({ ...estudianteInfo, codigoMined: e.target.value })}
                        />
                    </p>
                </div>
                <div className='col-sm-12 col-md-6'>
                    <span>Estado  : </span>
                    <InputSwitch checked={estudianteInfo.estado}
                        onChange={e => setEstudianteInfo({ ...estudianteInfo, estado: e.target.value })} />

                </div>
            </div>
            <div className='btn-guardar'>
                <Button className='btn-guardar-save'
                    label="Guardar"
                    severity="success"
                    raised onClick={AddEstudianteData}
                />
            </div>
        </div>
    )*/
   return (
        <div className='grado-gradoInfo p-4'>
            <Toast ref={toast} />

            <h1>Nuevo Estudiante</h1>

            {errorMessage && (
                <div className="mb-3">
                    <Message severity="error" text={errorMessage} className="w-full" />
                </div>
            )}

            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Nombres * : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Nombres del estudiante'
                                value={estudianteInfo.nombre_completo}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, nombre_completo: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Apellidos * : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Apellidos del estudiante'
                                value={estudianteInfo.apellido_completo}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, apellido_completo: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Sexo * : </span>
                            <Dropdown 
                                value={estudianteInfo.sexo}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, sexo: e.value })}
                                options={options} 
                                optionLabel="label"
                                optionValue="value"
                                className="w-full md:w-14rem" 
                                placeholder="Seleccione Sexo"  
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Partida de Nacimiento : </span>
                            <Dropdown 
                                value={estudianteInfo.partida_nacimiento}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, partida_nacimiento: e.value })}
                                options={optionsAdd} 
                                optionLabel="label"
                                optionValue="value"
                                className="w-full md:w-14rem" 
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Dirección : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Dirección exacta'
                                value={estudianteInfo.direccion}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, direccion: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <span>Fecha de Nacimiento * : </span>
                        <Calendar 
                            className='control-form w-full' 
                            value={estudianteInfo.fecha_nacimiento}
                            dateFormat="yy-mm-dd"
                            showIcon
                            onChange={(e) => setEstudianteInfo({ ...estudianteInfo, fecha_nacimiento: e.value })} 
                        />
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Cédula : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Cédula de identidad'
                                value={estudianteInfo.cedula}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, cedula: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Nombre Tutor * : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Nombre completo del tutor'
                                value={estudianteInfo.nombre_tutor}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, nombre_tutor: e.target.value })}
                            />
                        </p>
                    </div>
                </div>
            </div>

            <h1>Información del Estudiante</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>ID : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Autogenerado' 
                                disabled
                                value={estudianteInfo.idpersona}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Código Estudiante * : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Código único de estudiante'
                                value={estudianteInfo.codEstudiante}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, codEstudiante: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Código MINED : </span>
                            <InputText 
                                className='form-control' 
                                placeholder='Código oficial MINED'
                                value={estudianteInfo.codigoMined}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, codigoMined: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <span>Estado : </span>
                        <InputSwitch 
                            checked={Boolean(estudianteInfo.estado)}
                            onChange={(e) => setEstudianteInfo({ ...estudianteInfo, estado: e.value })} 
                        />
                    </div>
                </div>
            </div>

            <div className='btn-guardar mt-3'>
                <Button 
                    className='btn-guardar-save'
                    label={loading ? "Guardando..." : "Guardar"}
                    severity="success"
                    icon="pi pi-check"
                    loading={loading}
                    raised 
                    onClick={AddEstudianteData}
                />
            </div>
        </div>
    );
}
export default AddEstudiante
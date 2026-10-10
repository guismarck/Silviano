
import React, { useState, useRef } from 'react';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from 'primereact/toast';
import { extraerFechaNacimientoCedula } from '../../Util/validaciones/ValidacionGenericas'
import { Message } from 'primereact/message';

import { ServicioValidado } from '../../Servicios/DocenteServicios/docenteService';
import { CedulaInput, } from '../../Componentes/CedulaComponent/cedulaInput'

function AddDocente(props) {

    //const urlBase = `${settings.api.baseUrl}/docentes/create`;
    const toast = useRef(null);

    const [docenteInfo, setDocenteInfo] = useState({

        nombre_completo: '',
        apellido_completo: '',
        direccion: '',
        fecha_nacimiento: '',
        cedula: '',
        codDocente: '',
        espacialidad: '',
        estado: '',
        sexo: ''
    })

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const options = [
        { label: 'Femenino ', value: 'F' },
        { label: 'Masculino ', value: 'M' },
    ];



    const AddDocenteData = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        try {
            // Se delega la validación y el envío HTTP al servicio
            await ServicioValidado(docenteInfo);

            toast.current?.show({
                severity: 'success',
                summary: 'Registro Exitoso',
                detail: 'El docente se ha guardado correctamente en la base de datos.',
                life: 3000
            });

            // Reiniciar estado o ejecutar callbacks del padre
            setTimeout(() => {
                if (props.cargarDocente) props.cargarDocente();
                if (props.setDocentedoAdd) props.setDocentedoAdd(false);
            }, 1200);

        } catch (error) {
            console.error("Error al registrar docente:", error);
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



    return (
        <div className='grado-gradoInfo p-4'>
            <Toast ref={toast} />

            <h1>Nuevo Docente</h1>

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
                                placeholder='Nombres del docente'
                                value={docenteInfo.nombre_completo}
                                onChange={(e) => setDocenteInfo({ ...docenteInfo, nombre_completo: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Apellidos * : </span>
                            <InputText
                                className='form-control'
                                placeholder='Apellidos del docente'
                                value={docenteInfo.apellido_completo}
                                onChange={(e) => setDocenteInfo({ ...docenteInfo, apellido_completo: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Especialidad : </span>
                            <InputText
                                className='form-control'
                                placeholder='Especialidad del docente'
                                value={docenteInfo.especialidad}
                                onChange={(e) => setDocenteInfo({ ...docenteInfo, especialidad: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Sexo * : </span>
                            <Dropdown
                                value={docenteInfo.sexo}
                                onChange={(e) => setDocenteInfo({ ...docenteInfo, sexo: e.value })}
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
                            <span>Dirección : </span>
                            <InputText
                                className='form-control'
                                placeholder='Dirección exacta'
                                value={docenteInfo.direccion}
                                onChange={(e) => setDocenteInfo({ ...docenteInfo, direccion: e.target.value })}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <span>Fecha de Nacimiento * : </span>
                        <Calendar
                            value={docenteInfo.fecha_nacimiento}
                            onChange={(e) => {
                                setDocenteInfo(prev => ({
                                    ...prev,
                                    fecha_nacimiento: e.value
                                }));
                            }}
                            dateFormat="yy-mm-dd"
                            showIcon
                            disable
                        />
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Cédula : </span>
                            <CedulaInput

                                value={docenteInfo.cedula}
                                onChange={(e) => {
                                    setDocenteInfo(prev => ({
                                        ...prev,
                                        cedula: e.target.value
                                    }));
                                }}
                                onValidChage={(isvalid, numeroCedula) => {
                                    if (!isvalid) return;

                                    const resultado =
                                        extraerFechaNacimientoCedula(numeroCedula);

                                    if (resultado.esValida && resultado.fechaNacimiento) {
                                        setDocenteInfo(prev => ({
                                            ...prev,
                                            fecha_nacimiento: resultado.fechaNacimiento
                                        }));
                                    }
                                }}

                            />

                        </p>
                    </div>


                </div>
            </div>

            <h1>Información del Docente</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>ID : </span>
                            <InputText
                                className='form-control'
                                placeholder='Autogenerado'
                                disabled
                                value={docenteInfo.idpersona}
                            />
                        </p>
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Código Docente * : </span>
                            <InputText
                                className='form-control'
                                placeholder='Código único de docente'
                                value={docenteInfo.codDocente}
                                onChange={(e) => setDocenteInfo({ ...docenteInfo, codDocente: e.target.value })}
                            />
                        </p>
                    </div>


                    <div className='col-sm-12 col-md-6 mb-3'>
                        <span>Estado : </span>
                        <InputSwitch
                            checked={Boolean(docenteInfo.estado)}
                            onChange={(e) => setDocenteInfo({ ...docenteInfo, estado: e.value })}
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
                    onClick={AddDocenteData}
                />
            </div>
        </div>
    );
}
export default AddDocente
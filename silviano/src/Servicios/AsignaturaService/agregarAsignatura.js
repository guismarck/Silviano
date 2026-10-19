

import React, { useState, useRef } from 'react';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { ServicioValidado } from '../../Servicios/AsignaturaService/asignaturasService';

function AddAsignatura(props) {

    //const urlBase = `${settings.api.baseUrl}/docentes/create`;
    const toast = useRef(null);

    const [asignaturaInfo, setAsignaturaInfo] = useState({

        nombre: '',
        codigo: ''

    })

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

  
    const AddAsignaturaData = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        try {
            // Se delega la validación y el envío HTTP al servicio
            await ServicioValidado(asignaturaInfo);

            toast.current?.show({
                severity: 'success',
                summary: 'Registro Exitoso',
                detail: 'La Asignatura se registro extosamente.',
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

            <h1>Nueva Signatura</h1>

            {errorMessage && (
                <div className="mb-3">
                    <Message severity="error" text={errorMessage} className="w-full" />
                </div>
            )}

            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Nombre * : </span>
                            <InputText
                                className='form-control'
                                placeholder='Nombre de la Asignatura'
                                value={asignaturaInfo.nombre}
                                onChange={(e) => setAsignaturaInfo({ ...asignaturaInfo, nombre: e.target.value })}
                            />
                        </p>
                    </div>

                      <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Codigo * : </span>
                            <InputText
                                className='form-control'
                                placeholder='Codigo Asignatura'
                                value={asignaturaInfo.codigo}
                                onChange={(e) => setAsignaturaInfo({ ...asignaturaInfo, codigo: e.target.value })}
                            />
                        </p>
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
                    onClick={AddAsignaturaData}
                />
            </div> 
        </div>
    );
}
export default AddAsignatura

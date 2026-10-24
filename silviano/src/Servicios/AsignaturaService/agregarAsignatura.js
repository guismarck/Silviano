import React, { useState, useEffect, useMemo, useRef } from 'react';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import {
    ServicioValidado,
    getAsignaturas
} from '../../Servicios/AsignaturaService/asignaturasService';
import {
    buscarNombreDuplicado,
    buscarCodigoDuplicado,
    sugerirCodigos,
    normalizarCodigo,
    validarDuplicadosAsignatura
} from '../../Util/validaciones/validacionDuplicadosAsignatura.js';

function AddAsignatura(props) {

    const toast = useRef(null);

    const [asignaturaInfo, setAsignaturaInfo] = useState({
        nombre: '',
        codigo: ''
    });

    // Asignaturas ya registradas, para validar duplicados mientras se escribe.
    const [existentes, setExistentes] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        let activo = true;

        const cargarExistentes = async () => {
            try {
                const data = await getAsignaturas();
                if (activo) setExistentes(Array.isArray(data) ? data : []);
            } catch (error) {
                // Si falla la carga, se vuelve a validar con datos frescos al guardar.
                console.error('No se pudo cargar la lista de asignaturas:', error);
            }
        };

        cargarExistentes();

        return () => {
            activo = false;
        };
    }, []);

    // Validación en vivo: nombre y código repetidos.
    const nombreDuplicado = useMemo(
        () => buscarNombreDuplicado(asignaturaInfo.nombre, existentes),
        [asignaturaInfo.nombre, existentes]
    );

    const codigoDuplicado = useMemo(
        () => buscarCodigoDuplicado(asignaturaInfo.codigo, existentes),
        [asignaturaInfo.codigo, existentes]
    );

    // Códigos sugeridos según el nombre (solo se sugieren, no se asignan solos).
    const sugerencias = useMemo(() => {
        if (asignaturaInfo.nombre.trim().length < 3 || nombreDuplicado) return [];
        return sugerirCodigos(asignaturaInfo.nombre, existentes.map((a) => a.codigo));
    }, [asignaturaInfo.nombre, existentes, nombreDuplicado]);

    const AddAsignaturaData = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        try {
            // 1. Validar duplicados con la lista más reciente del servidor.
            const lista = await getAsignaturas();
            const actuales = Array.isArray(lista) ? lista : [];
            setExistentes(actuales);

            const duplicados = validarDuplicadosAsignatura(asignaturaInfo, actuales);

            if (!duplicados.esValido) {
                setErrorMessage(duplicados.error);

                toast.current?.show({
                    severity: 'warn',
                    summary: 'Asignatura repetida',
                    detail: duplicados.error,
                    life: 5000
                });
                return;
            }

            // 2. Se delega la validación de campos y el envío HTTP al servicio
            await ServicioValidado(asignaturaInfo);

            toast.current?.show({
                severity: 'success',
                summary: 'Registro Exitoso',
                detail: 'La Asignatura se registró exitosamente.',
                life: 3000
            });

            // 3. Recargar la tabla y cerrar el modal tras mostrar el mensaje.
            setTimeout(() => {
                if (props.cargarAsignatura) props.cargarAsignatura();
                if (props.setAsignaturaAdd) props.setAsignaturaAdd(false);
            }, 1000);

        } catch (error) {
            console.error('Error al registrar asignatura:', error);

            const errorData = error.response?.data;
            const mensajeError =
                errorData?.detail ||
                errorData?.title ||
                errorData?.mensaje ||
                errorData?.message ||
                error.message ||
                'Error al procesar el registro.';

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

            <h1>Nueva Asignatura</h1>

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
                                className={`form-control ${nombreDuplicado ? 'p-invalid' : ''}`}
                                placeholder='Nombre de la Asignatura'
                                value={asignaturaInfo.nombre}
                                disabled={loading}
                                onChange={(e) => {
                                    setAsignaturaInfo({ ...asignaturaInfo, nombre: e.target.value });
                                    setErrorMessage(null);
                                }}
                            />
                        </p>

                        {nombreDuplicado && (
                            <small className="p-error block">
                                Ya existe una asignatura llamada "{String(nombreDuplicado.nombre).trim()}".
                            </small>
                        )}
                    </div>

                    <div className='col-sm-12 col-md-6 mb-3'>
                        <p>
                            <span>Codigo * : </span>
                            <InputText
                                className={`form-control ${codigoDuplicado ? 'p-invalid' : ''}`}
                                placeholder='Codigo Asignatura'
                                value={asignaturaInfo.codigo}
                                disabled={loading}
                                onChange={(e) => {
                                    // Los códigos se guardan en mayúsculas y sin espacios.
                                    setAsignaturaInfo({
                                        ...asignaturaInfo,
                                        codigo: normalizarCodigo(e.target.value)
                                    });
                                    setErrorMessage(null);
                                }}
                            />
                        </p>

                        {codigoDuplicado && (
                            <small className="p-error block">
                                El código "{normalizarCodigo(asignaturaInfo.codigo)}" ya está registrado en "
                                {String(codigoDuplicado.nombre).trim()}".
                            </small>
                        )}

                        {/* Sugerencias de código: el usuario elige una, no se asigna sola */}
                        {sugerencias.length > 0 && (
                            <div className="mt-2">
                                <small className="block mb-2 text-color-secondary">
                                    Te sugiero un código (haz clic para usarlo):
                                </small>

                                <div className="flex flex-wrap gap-2">
                                    {sugerencias.map((sugerencia) => (
                                        <Button
                                            key={sugerencia.codigo}
                                            type="button"
                                            size="small"
                                            outlined
                                            severity="secondary"
                                            icon="pi pi-lightbulb"
                                            label={`${sugerencia.etiqueta}: ${sugerencia.codigo}`}
                                            disabled={loading}
                                            onClick={() => {
                                                setAsignaturaInfo({
                                                    ...asignaturaInfo,
                                                    codigo: sugerencia.codigo
                                                });
                                                setErrorMessage(null);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
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
                    disabled={loading || Boolean(nombreDuplicado) || Boolean(codigoDuplicado)}
                    raised
                    onClick={AddAsignaturaData}
                />

            </div> 

            </div>

       
    );
}
export default AddAsignatura

import React, { useState, useEffect, useCallback, useRef } from 'react';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

import {
    getAsignaturaById,
    updateAsignaturaService
} from '../../Servicios/AsignaturaService/asignaturasService.js';

import {
    ValidarAsignatura
} from '../../Util/validaciones/validacionAsignatura.js';

import '../../estilosCSS/UpdateAsignatura.css';

const UpdateAsignatura = ({
    idAsignatura,
    onAsignaturaUpdate,
    onCancel
}) => 
    {
    const toast = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');

    const [formValues, setFormValues] = useState({
        nombre: '',
        codigo: ''
    });

    // Cargar los datos de la asignatura seleccionada
    const fetchAsignaturaData = useCallback(async () => {
        if (idAsignatura == null) {
            setErrorCarga('No se recibió el ID de la asignatura.');
            setFetching(false);
            return;
        }

        setFetching(true);
        setErrorCarga('');

        try {
            const data = await getAsignaturaById(idAsignatura);

            setFormValues({
                nombre: data.nombre ?? '',
                codigo: data.codigo ?? ''
            });
        } catch (error) {
            console.error(
                'Error al cargar asignatura:',
                error
            );

            setErrorCarga(
                'No se pudo obtener la información de la asignatura.'
            );
        } finally {
            setFetching(false);
        }
    }, [idAsignatura]);

    useEffect(() => {
        fetchAsignaturaData();
    }, [fetchAsignaturaData]);

    // Controlar los cambios de los campos
    const handleChange = (field, value) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Validar y actualizar la asignatura
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || fetching) return;

        // Llamar a la validación que ya tenés implementada
        const validacion = ValidarAsignatura(formValues);

        // Si no es válido, mostrar el mensaje y detener el envío
        if (!validacion.esValido) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Validación de datos',
                detail: validacion.error,
                life: 4000
            });

            return;
        }

        setLoading(true);

        try {
            // Utilizar el payload saneado por ValidarAsignatura
            const payload = validacion.payloadFormateado;

            // Actualizar mediante el ID seleccionado
            await updateAsignaturaService(
                idAsignatura,
                payload
            );

            toast.current?.show({
                severity: 'success',
                summary: 'Actualización exitosa',
                detail: 'La asignatura se actualizó correctamente.',
                life: 3000
            });

            if (typeof onAsignaturaUpdate === 'function') {
                onAsignaturaUpdate();
            }
        } catch (error) {
            console.error(
                'Error al actualizar asignatura:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Error al guardar',
                detail:
                    error.response?.data?.message ??
                    'Ocurrió un error al actualizar la asignatura.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="actualizar-asignatura">
            <Toast ref={toast} />

            {/* Encabezado */}
            <div className="asignatura-header">
                <div className="asignatura-header-icon">
                    <i className="pi pi-book" />
                </div>

                <div className="asignatura-header-text">
                    <span className="asignatura-eyebrow">
                        GESTIÓN ACADÉMICA
                    </span>

                    <h2>Actualizar asignatura</h2>

                    <p>
                        Modifique la información de la asignatura.
                    </p>
                </div>
            </div>

            <Divider />

            {/* Estado de carga o error */}
            {fetching ? (
                <div className="asignatura-loading">
                    <ProgressSpinner
                        style={{
                            width: '42px',
                            height: '42px'
                        }}
                        strokeWidth="5"
                    />

                    <span>Cargando información...</span>
                </div>
            ) : errorCarga ? (
                <div className="asignatura-error">
                    <Message
                        severity="error"
                        text={errorCarga}
                    />

                    <Button
                        type="button"
                        label="Reintentar"
                        icon="pi pi-refresh"
                        outlined
                        onClick={fetchAsignaturaData}
                    />
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="asignatura-form"
                >
                    {/* Identificación */}
                    <div className="asignatura-section-title">
                        <i className="pi pi-info-circle" />

                        <span>Información general</span>
                    </div>

                   

                    <div className="asignatura-fields">
                        {/* Nombre */}
                        <div className="asignatura-field">
                            <label htmlFor="nombre">
                                Nombre de la asignatura
                                <span className="required">*</span>
                            </label>

                            <InputText
                                id="nombre"
                                value={formValues.nombre}
                                onChange={e =>
                                    handleChange(
                                        'nombre',
                                        e.target.value
                                    )
                                }
                                placeholder="Ingrese el nombre"
                                disabled={loading}
                            />
                        </div>

                        {/* Código */}
                        <div className="asignatura-field">
                            <label htmlFor="codigo">
                                Código de asignatura
                                <span className="required">*</span>
                            </label>

                            <InputText
                                id="codigo"
                                value={formValues.codigo}
                                onChange={e =>
                                    handleChange(
                                        'codigo',
                                        e.target.value
                                    )
                                }
                                placeholder="Ingrese el código"
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="asignatura-note">
                       
                    </div>

                    <Divider />

                    {/* Botones */}
                    <div className="asignatura-actions">
                        {typeof onCancel === 'function' && (
                            <Button
                                type="button"
                                label="Cancelar"
                                icon="pi pi-times"
                                severity="secondary"
                                outlined
                                disabled={loading}
                                onClick={onCancel}
                            />
                        )}

                        <Button
                            type="submit"
                            label="Guardar cambios"
                            icon="pi pi-check"
                            loading={loading}
                            disabled={loading || fetching}
                        />
                    </div>
                </form>
            )}
        </div>
    );
};

export default UpdateAsignatura;

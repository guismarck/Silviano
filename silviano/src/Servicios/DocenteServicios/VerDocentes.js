

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';

import { getDocenteById } from '../../Servicios/DocenteServicios/docenteService';

export default function VerDocente({ idPersona }) {

    const toast = useRef(null);

    const [docente, setDocente] = useState(null);
    const [loading, setLoading] = useState(true);
    //const [downloadingReport, setDownloadingReport] = useState(false);


    const cargarDocenteData = useCallback(async () => {
        if (!idPersona) return;

        setLoading(true);
        try {
            const data = await getDocenteById(idPersona);
            setDocente(data || null);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Carga',
                detail: 'No se pudo obtener la información del expediente académico.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    }, [idPersona]);


    useEffect(() => {
        cargarDocenteData();
    }, [cargarDocenteData]);


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toISOString().slice(0, 10);
    };

    if (loading) {
        return (
            <div className="p-3">
                <Skeleton width="100%" height="2rem" className="mb-3" />
                <div className="row">
                    <div className="col-12 col-md-6 mb-3"><Skeleton height="3rem" /></div>
                    <div className="col-12 col-md-6 mb-3"><Skeleton height="3rem" /></div>
                    <div className="col-12 col-md-6 mb-3"><Skeleton height="3rem" /></div>
                    <div className="col-12 col-md-6 mb-3"><Skeleton height="3rem" /></div>

                </div>
            </div>
        );
    }

    if (!docente) {
        return (
            <div className="p-4 text-center text-500">
                <i className="pi pi-exclamation-circle text-3xl mb-2" />
                <p>No se encontraron datos registrados para el ID proporcionado.</p>
            </div>
        );
    }

    return (
        <div className="p-2">
            <Toast ref={toast} />

            {/* Encabezado y Acción de Reporte */}
            <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-3 gap-2">
                <div>
                    <h2 className="text-xl font-bold text-900 m-0">
                        {docente.nombre_completo} {docente.apellido_completo}
                    </h2>
                    <span className="text-sm text-500">Expediente Académico del Docente</span>
                </div>
                <Button
                    label="Imprimir Ficha PDF"
                    icon="pi pi-file-pdf"
                    severity="help"
                    outlined
                    size="small"
                    //loading={downloadingReport}
                    //onClick={handleDescargarFichaPDF}
                />
            </div>

            {/* Datos Personales */}
            <Card title="Datos Personales" className="mb-3 shadow-1">
                <div className="row">
                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Nombres</span>
                        <span className="text-900 font-semibold">{docente.nombre_completo || 'N/A'}</span>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Apellidos</span>
                        <span className="text-900 font-semibold">{docente.apellido_completo || 'N/A'}</span>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Sexo</span>
                        <span className="text-900 font-semibold">{docente.sexo || 'N/A'}</span>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Cédula de Identidad</span>
                        <span className="text-900 font-semibold">{docente.cedula || 'N/A'}</span>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Fecha de Nacimiento</span>
                        <span className="text-900 font-semibold">{formatDate(docente.fecha_nacimiento)}</span>
                    </div>


                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Dirección Domiciliar</span>
                        <span className="text-900 font-semibold">{docente.direccion || 'N/A'}</span>
                    </div>
                </div>
            </Card>

            <Divider />

            {/* Infomacion del DOCENTE */}
            <Card title="Información Institucional MINED" className="shadow-1">
                <div className="row">
                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">ID Sistema</span>
                        <span className="text-900 font-semibold">{docente.idpersona}</span>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Código Docente</span>
                        <span className="text-900 font-semibold">{docente.codDocente || 'N/A'}</span>
                    </div>

                   <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Especialidad</span>
                        <span className="text-900 font-semibold">{docente.especialidad || 'N/A'}</span>
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                        <span className="text-500 block font-medium mb-1">Estado del docente</span>
                        <Tag
                            value={Boolean(docente.estado) ? 'ACTIVO' : 'INACTIVO'}
                            severity={Boolean(docente.estado) ? 'success' : 'danger'}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );


}
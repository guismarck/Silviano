import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';

import { getEstudianteById, exportarExpedienteEstudiantePDF } from '../estudianteService';

export default function VerEstudiante({ idPersona }) {
  const toast = useRef(null);
  
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const cargarEstudianteData = useCallback(async () => {
    if (!idPersona) return;
    
    setLoading(true);
    try {
      const data = await getEstudianteById(idPersona);
      setEstudiante(data || null);
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
    cargarEstudianteData();
  }, [cargarEstudianteData]);

  const handleDescargarFichaPDF = async () => {
    if (!idPersona) return;
    setDownloadingReport(true);
    try {
      await exportarExpedienteEstudiantePDF(idPersona);
      toast.current?.show({
        severity: 'success',
        summary: 'Descarga Completada',
        detail: 'La ficha del estudiante se ha generado correctamente.',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Exportación',
        detail: 'No se pudo obtener el PDF del expediente desde Jaspersoft.',
        life: 4000
      });
    } finally {
      setDownloadingReport(false);
    }
  };

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

  if (!estudiante) {
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
            {estudiante.nombre_completo} {estudiante.apellido_completo}
          </h2>
          <span className="text-sm text-500">Expediente Académico del Estudiante</span>
        </div>
        <Button
          label="Imprimir Ficha PDF"
          icon="pi pi-file-pdf"
          severity="help"
          outlined
          size="small"
          loading={downloadingReport}
          onClick={handleDescargarFichaPDF}
        />
      </div>

      {/* Datos Personales */}
      <Card title="Datos Personales" className="mb-3 shadow-1">
        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Nombres</span>
            <span className="text-900 font-semibold">{estudiante.nombre_completo || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Apellidos</span>
            <span className="text-900 font-semibold">{estudiante.apellido_completo || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Sexo</span>
            <span className="text-900 font-semibold">{estudiante.sexo || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Cédula de Identidad</span>
            <span className="text-900 font-semibold">{estudiante.cedula || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Fecha de Nacimiento</span>
            <span className="text-900 font-semibold">{formatDate(estudiante.fecha_nacimiento)}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Partida de Nacimiento / Folio</span>
            <span className="text-900 font-semibold">{estudiante.partidad_nacimiento || estudiante.partida_nacimiento || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Nombre del Tutor / Apoderado</span>
            <span className="text-900 font-semibold">{estudiante.nombre_tutor || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Dirección Domiciliar</span>
            <span className="text-900 font-semibold">{estudiante.direccion || 'N/A'}</span>
          </div>
        </div>
      </Card>

      <Divider />

      {/* Información Escolar / MINED */}
      <Card title="Información Institucional MINED" className="shadow-1">
        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">ID Sistema</span>
            <span className="text-900 font-semibold">{estudiante.idpersona}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Código Interno de Estudiante</span>
            <span className="text-900 font-semibold">{estudiante.cod_estudiante || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Código Único MINED</span>
            <span className="text-900 font-semibold">{estudiante.codigo_MINED || 'N/A'}</span>
          </div>

          <div className="col-12 col-md-6 mb-3">
            <span className="text-500 block font-medium mb-1">Estado de Matrícula</span>
            <Tag
              value={Boolean(estudiante.estado) ? 'ACTIVO' : 'INACTIVO'}
              severity={Boolean(estudiante.estado) ? 'success' : 'danger'}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

VerEstudiante.propTypes = {
  idPersona: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
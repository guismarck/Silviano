import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

import { getMatriculaById } from './matriculasService';

export default function VerMatricula({ idmatricula }) {
  const toast = useRef(null);

  const [matricula, setMatricula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cargarDetalleMatricula = useCallback(async () => {
    if (!idmatricula) return;

    setLoading(true);
    setError(false);

    try {
      const data = await getMatriculaById(idmatricula);
      setMatricula(data);
    } catch (err) {
      setError(true);
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Carga',
        detail: 'No se pudo obtener el detalle de la matrícula seleccionada.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  }, [idmatricula]);

  useEffect(() => {
    cargarDetalleMatricula();
  }, [cargarDetalleMatricula]);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('es-NI', {
      style: 'currency',
      currency: 'NIO'
    });
  };

  const getTurnoBadge = (turno) => {
    const turnosMap = {
      M: { label: 'Matutino', severity: 'info' },
      V: { label: 'Vespertino', severity: 'warning' },
      S: { label: 'Sabatino', severity: 'help' }
    };

    const config = turnosMap[turno] || { label: turno || 'N/A', severity: 'secondary' };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es-NI');
  };

  const getEstadoSeverity = (estado) => {
    const normalized = String(estado || '').toUpperCase();
    if (normalized.includes('ACTIV')) return 'success';
    if (normalized.includes('ANUL') || normalized.includes('CANCEL')) return 'danger';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="p-4">
        <Toast ref={toast} />
        <Skeleton width="60%" height="2rem" className="mb-3" />
        <Skeleton width="100%" height="1.5rem" className="mb-2" />
        <Skeleton width="80%" height="1.5rem" className="mb-2" />
        <Skeleton width="40%" height="1.5rem" />
      </div>
    );
  }

  if (error || !matricula) {
    return (
      <div className="p-3">
        <Toast ref={toast} />
        <Message
          severity="error"
          text="No fue posible cargar la información de la matrícula especificada."
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="p-2">
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-2">
        <span className="text-xl font-bold text-900">
          Matrícula N° {matricula.idMatricula ?? 'N/A'}
        </span>
        <Tag
          value={matricula.estadoMatricula || 'Estado no disponible'}
          severity={getEstadoSeverity(matricula.estadoMatricula)}
        />
      </div>

      <Divider className="my-2" />

      <div className="grid formgrid p-fluid">
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Estudiante</span>
          <span className="text-900 font-semibold">
            {matricula.nombreCompletoEstudiante ||
              `${matricula.nombreEstudiante || ''} ${matricula.apellidoEstudiante || ''}`.trim() ||
              'N/A'}
          </span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">ID del estudiante</span>
          <span className="text-900">{matricula.estudianteId ?? 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Nivel</span>
          <span className="text-900">{matricula.nivel || 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Grado</span>
          <span className="text-900">{matricula.grado || 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Salón</span>
          <span className="text-900">{matricula.salon || 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Turno</span>
          {getTurnoBadge(matricula.turno)}
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Sección</span>
          <span className="text-900">{matricula.seccion || 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Plan de estudio</span>
          <span className="text-900">{matricula.planDeEstudio || 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">ID del plan de estudio</span>
          <span className="text-900">{matricula.idPlanEstudio ?? 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Año del plan de estudio</span>
          <span className="text-900">{matricula.anioPlanEstudio ?? 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Año lectivo</span>
          <span className="text-900">{matricula.anioLectivo ?? 'N/A'}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Costo de matrícula</span>
          <span className="text-green-600 font-bold">{formatCurrency(matricula.costoMatricula)}</span>
        </div>
        <div className="col-12 md:col-6 lg:col-4 mb-3">
          <span className="text-500 font-medium block mb-1">Fecha de matrícula</span>
          <span className="text-900">{formatDate(matricula.fechaMatricula)}</span>
        </div>
      </div>
    </div>
  );
}

VerMatricula.propTypes = {
  idmatricula: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
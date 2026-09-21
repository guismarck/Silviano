import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

import { getMatriculaById } from '../matriculasService';

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

  if (loading) {
    return (
      <div className="p-4">
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
          Matrícula N° #{matricula.idMatricula}
        </span>
        {getTurnoBadge(matricula.turno)}
      </div>

      <Divider className="my-2" />

      <div className="grid formgrid p-fluid">
        {/* Estudiante */}
        <div className="col-12 col-md-6 mb-3">
          <span className="text-500 font-medium block mb-1">Estudiante</span>
          <span className="text-900 font-semibold text-lg">
            {matricula.estudiante?.nombre_completo || 'Sin Registrar'}
          </span>
        </div>

        {/* Grado Académico */}
        <div className="col-12 col-md-6 mb-3">
          <span className="text-500 font-medium block mb-1">Grado / Nivel</span>
          <span className="text-900 font-semibold text-lg">
            {matricula.grado?.nombre || 'Sin Registrar'}
          </span>
        </div>

        {/* Plan de Estudio */}
        <div className="col-12 col-md-6 mb-3">
          <span className="text-500 font-medium block mb-1">Plan de Estudio / Año Lectivo</span>
          <span className="text-900 font-semibold">
            {matricula.plan_de_estudio?.año_electivo || 'N/A'}
          </span>
        </div>

        {/* Costo de Matrícula */}
        <div className="col-12 col-md-6 mb-3">
          <span className="text-500 font-medium block mb-1">Costo de Matrícula</span>
          <span className="text-green-600 font-bold text-xl">
            {formatCurrency(matricula.costoMatricula)}
          </span>
        </div>
      </div>
    </div>
  );
}

VerMatricula.propTypes = {
  idmatricula: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
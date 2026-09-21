import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { TURNOS_ENUM } from '../../Util/metodosGenericos';
import { 
  getCatalogosNuevaMatricula, 
  crearMatricula 
} from '../../Servicios/matriculasService';

const INITIAL_FORM_STATE = Object.freeze({
  idpersona: null,
  idGrado: null,
  idPlan_de_estudio: null,
  idpago: null,
  turno: 'M',
  costo_matricula: 0.00
});

export default function NuevaMatricula({ setMatriculaAdd, onCancel }) {
  const toast = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  const [listEstudiantes, setListEstudiantes] = useState([]);
  const [listGrados, setListGrados] = useState([]);
  const [listPlanes, setListPlanes] = useState([]);
  const [listPagos, setListPagos] = useState([]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Carga de catálogos con prevención de fugas de memoria (isMounted pattern)
  const cargarCatalogos = useCallback(async () => {
    let isMounted = true;
    setLoadingCatalogos(true);

    try {
      const { estudiantes, grados, planes, pagos } = await getCatalogosNuevaMatricula();
      if (isMounted) {
        setListEstudiantes(estudiantes);
        setListGrados(grados);
        setListPlanes(planes);
        setListPagos(pagos);
      }
    } catch (error) {
      if (isMounted) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error de Conexión',
          detail: 'No se pudieron obtener los catálogos necesarios para matricular.',
          life: 4000
        });
      }
    } finally {
      if (isMounted) setLoadingCatalogos(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Handler unificado inmutable para inputs del formulario
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!formData.idpersona || !formData.idGrado || !formData.idPlan_de_estudio) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Por favor complete el Estudiante, Grado y Plan de Estudio.',
        life: 3500
      });
      return;
    }

    setLoading(true);
    try {
      const respuesta = await crearMatricula(formData);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Matrícula Creada',
        detail: 'El expediente de matrícula ha sido guardado exitosamente.',
        life: 3000
      });

      // Emisión e impresión automática del comprobante de matrícula vía Jaspersoft
    /*  if (respuesta?.idMatricula) {
        await descargarComprobanteMatricula(respuesta.idMatricula);
      }*/

      setFormData(INITIAL_FORM_STATE);

      if (setMatriculaAdd) {
        setMatriculaAdd();
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al Registrar',
        detail: error.response?.data?.message || 'Ocurrió un fallo en el servidor al crear la matrícula.',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Registro de Nueva Matrícula" className="shadow-2 border-round">
      <Toast ref={toast} />

      <form onSubmit={handleGuardar} className="p-fluid">
        <div className="grid">
          
          {/* Estudiante */}
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="estudiante" className="font-bold block mb-1">
              Estudiante <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="estudiante"
              value={formData.idpersona}
              options={listEstudiantes}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange('idpersona', e.value)}
              placeholder={loadingCatalogos ? 'Cargando estudiantes...' : 'Seleccione un estudiante'}
              filter
              filterBy="label"
              loading={loadingCatalogos}
              disabled={loadingCatalogos}
              emptyMessage="No se encontraron estudiantes"
              className="w-full"
              required
            />
          </div>

          {/* Grado Académico */}
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="grado" className="font-bold block mb-1">
              Grado Académico <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="grado"
              value={formData.idGrado}
              options={listGrados}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange('idGrado', e.value)}
              placeholder={loadingCatalogos ? 'Cargando grados...' : 'Seleccione el grado'}
              filter
              filterBy="label"
              loading={loadingCatalogos}
              disabled={loadingCatalogos}
              emptyMessage="No se encontraron grados"
              className="w-full"
              required
            />
          </div>

          {/* Plan de Estudio */}
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="plan" className="font-bold block mb-1">
              Plan de Estudio <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="plan"
              value={formData.idPlan_de_estudio}
              options={listPlanes}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange('idPlan_de_estudio', e.value)}
              placeholder={loadingCatalogos ? 'Cargando planes...' : 'Seleccione plan lectivo'}
              loading={loadingCatalogos}
              disabled={loadingCatalogos}
              emptyMessage="No se encontraron planes lectivos"
              className="w-full"
              required
            />
          </div>

          {/* Comprobante de Pago */}
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="pago" className="font-bold block mb-1">
              ID Pago / Comprobante
            </label>
            <Dropdown
              id="pago"
              value={formData.idpago}
              options={listPagos}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange('idpago', e.value)}
              placeholder={loadingCatalogos ? 'Cargando pagos...' : 'Asociar comprobante de pago'}
              loading={loadingCatalogos}
              disabled={loadingCatalogos}
              showClear
              emptyMessage="No hay comprobantes pendientes"
              className="w-full"
            />
          </div>

          {/* Turno */}
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="turno" className="font-bold block mb-1">
              Turno <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="turno"
              value={formData.turno}
              options={TURNOS_ENUM}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange('turno', e.value)}
              placeholder="Seleccione turno"
              className="w-full"
              required
            />
          </div>

          {/* Costo de Matrícula */}
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="costo" className="font-bold block mb-1">
              Costo de Matrícula <span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="costo"
              value={formData.costo_matricula}
              onValueChange={(e) => handleChange('costo_matricula', e.value ?? 0)}
              mode="currency"
              currency="NIO"
              locale="es-NI"
              min={0}
              minFractionDigits={2}
              className="w-full"
              required
            />
          </div>

        </div>

        {/* Acciones */}
        <div className="flex justify-content-end gap-2 mt-4">
          {onCancel && (
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={onCancel}
              disabled={loading}
            />
          )}
          <Button
            type="submit"
            label="Guardar Matrícula"
            icon="pi pi-check"
            severity="success"
            loading={loading}
          />
        </div>
      </form>
    </Card>
  );
}

NuevaMatricula.propTypes = {
  setMatriculaAdd: PropTypes.func,
  onCancel: PropTypes.func
};
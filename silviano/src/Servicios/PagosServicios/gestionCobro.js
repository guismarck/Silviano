// src/Componentes/GestionPagosMatricula.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import {
  getCatalogosCaja,
  obtenerGradosPorNivel,
  obtenerSalonesDisponibles,
  obtenerMatriculaActiva,
  registrarTransaccionCobro,
} from '../PagosServicios/pagoservice';

const ANIO_ACTUAL = new Date().getFullYear();

// Función auxiliar para garantizar el formato ISO de fecha requerido por la BD (YYYY-MM-DD)
const getFechaFormateadaBD = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_FORM_STATE = {
  idpersona: null,
  concepto: 'MENSUALIDAD',
  idnivel: null,
  idGrado: null,
  idSalon: null,
  anio_lectivo: ANIO_ACTUAL,
  tipo_pago: 'EFECTIVO',
  monto: 0,
  fecha_transaccion: getFechaFormateadaBD(),
};

export const GestionPagosMatricula = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [estudiantesOptions, setEstudiantesOptions] = useState([]);
  const [nivelesOptions, setNivelesOptions] = useState([]);
  const [gradosOptions, setGradosOptions] = useState([]);
  const [salonesOptions, setSalonesOptions] = useState([]);
  const [matriculaActiva, setMatriculaActiva] = useState(null);
  const [loading, setLoading] = useState(false);

  const toastRef = useRef(null);

  const conceptosPago = useMemo(
    () => [
      { label: 'Mensualidad', value: 'MENSUALIDAD' },
      { label: 'Matrícula Oficial', value: 'MATRICULA' },
      { label: 'Abono a Cuenta', value: 'ABONO' },
      { label: 'Arancel / Otro', value: 'ARANCEL' },
    ],
    []
  );

  const tiposPago = useMemo(
    () => [
      { label: 'Efectivo', value: 'EFECTIVO' },
      { label: 'Transferencia', value: 'TRANSFERENCIA' },
      { label: 'Tarjeta', value: 'TARJETA' },
      { label: 'Depósito', value: 'DEPOSITO' },
    ],
    []
  );

  const aniosLectivos = useMemo(
    () => [
      { label: `${ANIO_ACTUAL}`, value: ANIO_ACTUAL },
      { label: `${ANIO_ACTUAL + 1}`, value: ANIO_ACTUAL + 1 },
    ],
    []
  );

  // Carga inicial de catálogos base en formato { label, value }
  useEffect(() => {
    let isMounted = true;
    getCatalogosCaja().then(({ estudiantes, niveles }) => {
      if (isMounted) {
        setEstudiantesOptions(estudiantes);
        setNivelesOptions(niveles);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Carga reactiva de Grados académicos según Nivel
  useEffect(() => {
    if (!formData.idnivel) {
      setGradosOptions([]);
      return;
    }
    obtenerGradosPorNivel(formData.idnivel).then(setGradosOptions);
  }, [formData.idnivel]);

  // Carga reactiva de Salones con vacantes disponibles
  useEffect(() => {
    if (!formData.idGrado || !formData.anio_lectivo) {
      setSalonesOptions([]);
      return;
    }
    obtenerSalonesDisponibles(formData.idGrado, formData.anio_lectivo).then(setSalonesOptions);
  }, [formData.idGrado, formData.anio_lectivo]);

  // Consulta de matrícula activa para cobros regulares
  useEffect(() => {
    if (formData.idpersona && formData.anio_lectivo && formData.concepto !== 'MATRICULA') {
      obtenerMatriculaActiva(formData.idpersona, formData.anio_lectivo).then(setMatriculaActiva);
    } else {
      setMatriculaActiva(null);
    }
  }, [formData.idpersona, formData.anio_lectivo, formData.concepto]);

  // Handler inmutable y unificado para actualización de campos
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'idnivel') {
        updated.idGrado = null;
        updated.idSalon = null;
      }
      if (field === 'idGrado') {
        updated.idSalon = null;
      }
      return updated;
    });
  }, []);

  const handleRestablecer = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setMatriculaActiva(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idpersona || !formData.idnivel || formData.monto <= 0) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Seleccione un estudiante, nivel educativo y especifique un monto mayor a 0.',
      });
      return;
    }

    const esMatricula = formData.concepto === 'MATRICULA';

    if (esMatricula && (!formData.idGrado || !formData.idSalon)) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Asignación Académica Requerida',
        detail: 'Para matricular debe asignar el Grado y un Salón con vacantes disponibles.',
      });
      return;
    }

    if (!esMatricula && !matriculaActiva) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Sin Matrícula Activa',
        detail: `El estudiante seleccionado no posee una matrícula activa para el año ${formData.anio_lectivo}.`,
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        idpersona: formData.idpersona,
        concepto: formData.concepto,
        idnivel: formData.idnivel,
        idGrado: formData.idGrado,
        idSalon: formData.idSalon,
        anio_lectivo: formData.anio_lectivo,
        tipo_pago: formData.tipo_pago,
        monto: formData.monto,
        fecha_transaccion: formData.fecha_transaccion,
        idmatricula: matriculaActiva?.idmatricula || null,
      };

      const respuesta = await registrarTransaccionCobro(payload);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Transacción Registrada',
        detail: 'El cobro se ha procesado con éxito. Descargando recibo oficial...',
      });

  

      handleRestablecer();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error en Transacción',
        detail: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const esConceptoMatricula = formData.concepto === 'MATRICULA';

  // Memoización segura para extraer la cadena legible del estudiante seleccionado (previene rendering de objetos)
  const estudianteSeleccionadoLabel = useMemo(() => {
    if (!formData.idpersona) return '';
    const encontrado = estudiantesOptions.find((e) => e.value === formData.idpersona);
    return encontrado ? encontrado.label : '';
  }, [formData.idpersona, estudiantesOptions]);

  return (
    <div className="card p-4">
      <Toast ref={toastRef} />

      <div className="mb-4">
        <h3 className="m-0 text-900 font-bold">Módulo de Recaudación y Matrícula Escolar</h3>
        <span className="text-600">
          Procesamiento de mensualidades, abonos y asignación de salones por ciclo lectivo
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-fluid grid">
        {/* Estudiante */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="estudiante" className="font-bold mb-2 block">
            Estudiante <span className="text-danger">*</span>
          </label>
          <Dropdown
            id="estudiante"
            value={formData.idpersona}
            options={estudiantesOptions}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleInputChange('idpersona', e.value)}
            placeholder="Seleccione el estudiante"
            filter
            showClear
          />
        </div>

        {/* Concepto de Pago */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="concepto" className="font-bold mb-2 block">
            Concepto de Pago <span className="text-danger">*</span>
          </label>
          <Dropdown
            id="concepto"
            value={formData.concepto}
            options={conceptosPago}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleInputChange('concepto', e.value)}
            placeholder="Seleccione el concepto"
          />
        </div>

        {/* Nivel Educativo */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="nivel" className="font-bold mb-2 block">
            Nivel Educativo <span className="text-danger">*</span>
          </label>
          <Dropdown
            id="nivel"
            value={formData.idnivel}
            options={nivelesOptions}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleInputChange('idnivel', e.value)}
            placeholder="Seleccione Nivel"
          />
        </div>

        {/* Año Lectivo */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="anio_lectivo" className="font-bold mb-2 block">
            Año Lectivo <span className="text-danger">*</span>
          </label>
          <Dropdown
            id="anio_lectivo"
            value={formData.anio_lectivo}
            options={aniosLectivos}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleInputChange('anio_lectivo', e.value)}
            placeholder="Año Lectivo"
          />
        </div>

        {/* Campos condicionales para Matrícula */}
        {esConceptoMatricula && (
          <>
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="grado" className="font-bold mb-2 block">
                Grado a Matricular <span className="text-danger">*</span>
              </label>
              <Dropdown
                id="grado"
                value={formData.idGrado}
                options={gradosOptions}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => handleInputChange('idGrado', e.value)}
                placeholder="Seleccione Grado"
                disabled={!formData.idnivel}
              />
            </div>

            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="salon" className="font-bold mb-2 block">
                Salón / Sección Asignada <span className="text-danger">*</span>
              </label>
              <Dropdown
                id="salon"
                value={formData.idSalon}
                options={salonesOptions}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => handleInputChange('idSalon', e.value)}
                placeholder="Seleccione Salón Disponible"
                disabled={!formData.idGrado}
              />
            </div>
          </>
        )}

        {/* Forma de Pago */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="tipo_pago" className="font-bold mb-2 block">
            Forma de Pago <span className="text-danger">*</span>
          </label>
          <Dropdown
            id="tipo_pago"
            value={formData.tipo_pago}
            options={tiposPago}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleInputChange('tipo_pago', e.value)}
          />
        </div>

        {/* Monto Acreditar */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="monto" className="font-bold mb-2 block">
            Monto Acreditar (C$) <span className="text-danger">*</span>
          </label>
          <InputNumber
            id="monto"
            value={formData.monto}
            onValueChange={(e) => handleInputChange('monto', e.value || 0)}
            mode="currency"
            currency="NIO"
            locale="es-NI"
            min={0}
          />
        </div>

        {/* Mensajes Informativos del Expediente */}
        <div className="col-12 mb-3">
          {!esConceptoMatricula && matriculaActiva && (
            <Message
              severity="success"
              text={`Matrícula ACTIVA confirmada para ${estudianteSeleccionadoLabel} en el ciclo ${formData.anio_lectivo}.`}
              className="w-full justify-content-start"
            />
          )}

          {!esConceptoMatricula && !matriculaActiva && formData.idpersona && (
            <Message
              severity="warn"
              text={`El alumno ${estudianteSeleccionadoLabel} no posee matrícula activa en ${formData.anio_lectivo}. Seleccione "Matrícula Oficial" para efectuar la inscripción.`}
              className="w-full justify-content-start"
            />
          )}

          {esConceptoMatricula && (
            <Message
              severity="info"
              text="Al procesar la Matrícula Oficial se descontará una vacante del cupo del salón y se abrirá el expediente del alumno."
              className="w-full justify-content-start"
            />
          )}
        </div>

        {/* Botones de Acción */}
        <div className="col-12 grid gap-2 mt-2">
          <div className="col-12 col-md-6">
            <Button
              type="button"
              label="Restablecer"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-secondary w-full"
              onClick={handleRestablecer}
              disabled={loading}
            />
          </div>
          <div className="col-12 col-md-6">
            <Button
              type="submit"
              label="Procesar y Emitir Recibo"
              icon="pi pi-print"
              className="p-button-info w-full"
              loading={loading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default GestionPagosMatricula;
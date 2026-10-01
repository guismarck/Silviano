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
  descargarReciboPDF,
} from '../PagosServicios/pagoservice';

const ANIO_ACTUAL = new Date().getFullYear();

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

  // Carga inicial de catálogos
  useEffect(() => {
    let isMounted = true;
    getCatalogosCaja()
      .then(({ estudiantes, niveles }) => {
        if (isMounted) {
          setEstudiantesOptions(estudiantes || []);
          setNivelesOptions(niveles || []);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toastRef.current?.show({
            severity: 'error',
            summary: 'Error de Carga',
            detail: 'No se pudieron obtener los catálogos base.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Carga de Grados según Nivel
  useEffect(() => {
    if (!formData.idnivel) {
      setGradosOptions([]);
      return;
    }
    let isMounted = true;
    obtenerGradosPorNivel(formData.idnivel)
      .then((data) => {
        if (isMounted) setGradosOptions(data);
      })
      .catch(() => {
        if (isMounted) setGradosOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.idnivel]);

  // Carga de Salones con vacantes
  useEffect(() => {
    if (!formData.idGrado || !formData.anio_lectivo) {
      setSalonesOptions([]);
      return;
    }
    let isMounted = true;
    obtenerSalonesDisponibles(formData.idGrado, formData.anio_lectivo)
      .then((data) => {
        if (isMounted) setSalonesOptions(data);
      })
      .catch(() => {
        if (isMounted) setSalonesOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.idGrado, formData.anio_lectivo]);

  // Consulta de matrícula activa
  useEffect(() => {
    if (formData.idpersona && formData.anio_lectivo && formData.concepto !== 'MATRICULA') {
      let isMounted = true;
      obtenerMatriculaActiva(formData.idpersona, formData.anio_lectivo)
        .then((res) => {
          if (isMounted) setMatriculaActiva(res);
        })
        .catch(() => {
          if (isMounted) setMatriculaActiva(null);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setMatriculaActiva(null);
    }
  }, [formData.idpersona, formData.anio_lectivo, formData.concepto]);

  // Handler unificado e inmutable con log de consola
  const handleInputChange = useCallback((field, value) => {
    console.log(`📝 [Form Change] ${field}:`, value);
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
    console.log('🧹 Limpiando formulario...');
    setFormData(INITIAL_FORM_STATE);
    setMatriculaActiva(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.group('🔍 [VALIDACIÓN PREVIA AL ENVÍO]');
    console.log('Estado actual del formulario:', formData);
    console.log('Matrícula Activa en memoria:', matriculaActiva);
    console.groupEnd();

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
      const fechaHoraTransaccion = `${formData.fecha_transaccion} 08:00:00`;

      // Se determina idSalon dependiendo de si es matrícula nueva o cobro regular
      const idSalonCalculado = esMatricula ? formData.idSalon : (matriculaActiva?.idSalon || null);

      const payload = {
        p_idpersona: formData.idpersona,
        p_idSalon: idSalonCalculado,
        p_anio_lectivo: formData.anio_lectivo,
        p_concepto: formData.concepto,
        p_tipo_pago: formData.tipo_pago,
        p_monto: formData.monto,
        p_idtarifa: null,
        p_fecha_transaccion: fechaHoraTransaccion,
        p_usuario: 'CAJERO_SESION',
      };

      const respuesta = await registrarTransaccionCobro(payload);
      const numReciboGenerado = respuesta.numReciboGenerado || respuesta.id_recibo || respuesta.numRecibo;

      toastRef.current?.show({
        severity: 'success',
        summary: 'Transacción Registrada',
        detail: `Recibo #${numReciboGenerado} generado correctamente.`,
      });

      if (numReciboGenerado) {
        await descargarReciboPDF(numReciboGenerado);
      }

      handleRestablecer();
    } catch (error) {
      console.error('❌ [Error al Procesar Transacción]:', error);
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

        {/* Mensajes Informativos */}
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
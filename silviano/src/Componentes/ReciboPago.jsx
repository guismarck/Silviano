import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from 'primereact/card';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import moment from 'moment';

import { searchEstudiantes } from '../Servicios/estudianteService';
import  tarifaService from '../Servicios/TarifaService/tarifaService';
import pagosService from '../Servicios/PagosServicios/pagoservice';
import '../estilosCSS/styles.css';

// Límite fijado en Córdobas (C$15,000.00)
const LIMITE_MAXIMO_CORDOBAS = 15000;

const ESTADO_INICIAL = {
  num_recibo: 'Cargando...',
  estudiante: null,
  fecha_pago: new Date(),
  monto_total: 0,
  monto_tarifa_oficial: 0,
  id_tarifa: null,
  concepto: ''
};

const ReciboPago = () => {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [errors, setErrors] = useState({});
  const [sugerencias, setSugerencias] = useState([]);
  const [conceptosCatalogo, setConceptosCatalogo] = useState([]);
  const [cargandoTarifas, setCargandoTarifas] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);

  const toast = useRef(null);
  const hoy = useMemo(() => new Date(), []);

  // Carga inicial aislada (Solución técnica al congelamiento del Dropdown)
  useEffect(() => {
    let isMounted = true;

    const inicializarPantalla = async () => {
      setCargandoTarifas(true);
      try {
        const anioLectivoActual = new Date().getFullYear();

        const [resRecibo, dataTarifas] = await Promise.all([
          pagosService.obtenerSiguienteNumRecibo().catch(() => ({ num_recibo: 'AUTO-GENERADO' })),
          tarifaService.listarTarifas(anioLectivoActual).catch(() => [])
        ]);

        if (!isMounted) return;

        if (Array.isArray(dataTarifas) && dataTarifas.length > 0) {
          const opciones = dataTarifas.map((t) => ({
            label: `${t.concepto} (C$${Number(t.monto).toFixed(2)})`,
            value: t.concepto,
            rawTarifa: t
          }));

          setConceptosCatalogo(opciones);

          // Establecer la primera opción solo en el montaje inicial
          const primeraTarifa = opciones[0].rawTarifa;
          const montoBase = Number(primeraTarifa.monto) || 0;

          setFormData((prev) => ({
            ...prev,
            num_recibo: resRecibo?.num_recibo || 'AUTO-GENERADO',
            concepto: primeraTarifa.concepto,
            monto_total: montoBase,
            monto_tarifa_oficial: montoBase,
            id_tarifa: primeraTarifa.idTarifa || primeraTarifa.id_tarifa || null
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            num_recibo: resRecibo?.num_recibo || 'AUTO-GENERADO'
          }));
        }
      } catch (error) {
        if (isMounted) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error de Conexión',
            detail: 'No se logró obtener el catálogo de tarifas desde el servidor.'
          });
        }
      } finally {
        if (isMounted) setCargandoTarifas(false);
      }
    };

    inicializarPantalla();

    return () => {
      isMounted = false;
    };
  }, []); // Sin dependencias para garantizar ejecución única

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  // Handler del Dropdown (Permite seleccionar libremente el 2do, 3ro o cualquier ítem)
  const handleConceptoChange = (e) => {
    const valorSeleccionado = e.value;
    if (!valorSeleccionado) return;

    // Búsqueda sincrónica sobre la lista ya cargada en memoria
    const opcionEncontrada = conceptosCatalogo.find((c) => c.value === valorSeleccionado);

    if (opcionEncontrada?.rawTarifa) {
      const tarifaBD = opcionEncontrada.rawTarifa;
      const montoBase = Number(tarifaBD.monto) || 0;

      if (montoBase > LIMITE_MAXIMO_CORDOBAS) {
        setFormData((prev) => ({
          ...prev,
          concepto: valorSeleccionado,
          monto_total: 0,
          monto_tarifa_oficial: montoBase,
          id_tarifa: tarifaBD.idTarifa || tarifaBD.id_tarifa || null
        }));

        toast.current?.show({
          severity: 'warn',
          summary: 'Excede Límite de Caja',
          detail: `La tarifa de ${valorSeleccionado} (C$${montoBase.toFixed(2)}) supera C$15,000.00. Se restableció el monto a 0.`,
          life: 4000
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          concepto: valorSeleccionado,
          monto_total: montoBase,
          monto_tarifa_oficial: montoBase,
          id_tarifa: tarifaBD.idTarifa || tarifaBD.id_tarifa || null
        }));
      }
    } else {
      handleInputChange('concepto', valorSeleccionado);
    }
  };

  const handleMontoChange = (nuevoMonto) => {
    const valor = Number(nuevoMonto) || 0;

    if (valor > LIMITE_MAXIMO_CORDOBAS) {
      handleInputChange('monto_total', 0);
      toast.current?.show({
        severity: 'warn',
        summary: 'Límite Excedido',
        detail: 'El monto ingresado excede el límite de C$15,000.00. Se ha restablecido a 0.',
        life: 4000
      });

      setErrors((prev) => ({
        ...prev,
        monto_total: 'Monto máximo permitido: C$15,000.00'
      }));
      return;
    }

    handleInputChange('monto_total', valor);
  };

  const handleBuscarEstudiantes = async (event) => {
    if (!event.query || event.query.trim().length === 0) {
      setSugerencias([]);
      return;
    }

    try {
      const data = await searchEstudiantes(event.query.trim());
      if (Array.isArray(data)) {
        setSugerencias(
          data.map((est) => {
            const idPersona = est.idpersona || est.idPersona || est.id;
            const codEst = est.cod_estudiante || est.codigo || 'S/C';
            const mined = est.codigo_MINED ? ` - MINED: ${est.codigo_MINED}` : '';
            const nombre = est.nombre_completo 
              ? `${est.nombre_completo} ${est.apellido_completo || ''}` 
              : `${est.nombres || ''} ${est.apellidos || ''}`;

            return {
              idpersona: idPersona,
              codigo_MINED: est.codigo_MINED,
              cod_estudiante: codEst,
              displayLabel: `[${codEst}] ${nombre}${mined}`.trim(),
              raw: est
            };
          })
        );
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Búsqueda',
        detail: 'No se logró consultar la base de datos de estudiantes.'
      });
    }
  };

  const handleSelectEstudiante = (e) => {
    handleInputChange('estudiante', e.value);
  };

  const diferencia = useMemo(() => {
    return (Number(formData.monto_total) || 0) - (Number(formData.monto_tarifa_oficial) || 0);
  }, [formData.monto_total, formData.monto_tarifa_oficial]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.estudiante) {
      nuevosErrores.estudiante = 'Debe seleccionar un estudiante de la lista.';
    }

    if (!formData.concepto) {
      nuevosErrores.concepto = 'Debe seleccionar un concepto de pago.';
    }

    const monto = Number(formData.monto_total) || 0;
    if (monto <= 0) {
      nuevosErrores.monto_total = 'El monto a pagar debe ser mayor a cero (0).';
    } else if (monto > LIMITE_MAXIMO_CORDOBAS) {
      nuevosErrores.monto_total = 'El monto máximo en Córdobas es C$15,000.00';
    }

    if (!formData.fecha_pago) {
      nuevosErrores.fecha_pago = 'La fecha de pago es requerida.';
    } else {
      const fechaSeleccionada = moment(formData.fecha_pago).startOf('day');
      const fechaHoy = moment(hoy).startOf('day');
      if (fechaSeleccionada.isAfter(fechaHoy)) {
        nuevosErrores.fecha_pago = 'La fecha de pago no puede ser posterior a la fecha actual.';
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleCancelar = () => {
    setFormData((prev) => ({
      ...ESTADO_INICIAL,
      num_recibo: prev.num_recibo,
      fecha_pago: new Date()
    }));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Formulario Inválido',
        detail: 'Por favor corrija los campos resaltados antes de aplicar el recibo.'
      });
      return;
    }

    setRegistrandoPago(true);

    const payload = {
      idpersona_estudiante: formData.estudiante.idpersona,
      idmatricula: formData.estudiante.raw?.idmatricula || null,
      num_recibo: formData.num_recibo !== 'AUTO-GENERADO' ? formData.num_recibo : null,
      anio_lectivo: new Date(formData.fecha_pago).getFullYear(),
      fecha_pago: moment(formData.fecha_pago).format('YYYY-MM-DD HH:mm:ss'),
      tipo_pago: 'Efectivo',
      monto_total: formData.monto_total,
      moneda: 'NIO',
      creado_por: 'Cajero_Sistema',
      detalles: [
        {
          id_tarifa: formData.id_tarifa,
          concepto: formData.concepto,
          monto: formData.monto_total
        }
      ]
    };

    try {
      const res = await pagosService.registrarPago(payload);
      const numeroAsignado = res?.num_recibo || formData.num_recibo;

      toast.current?.show({
        severity: 'success',
        summary: 'Pago Registrado',
        detail: `Recibo N° ${numeroAsignado} (C$${formData.monto_total.toFixed(2)}) procesado exitosamente.`
      });

      if (res?.idpago) {
        await pagosService.descargarReciboPDF(res.idpago);
      }

      handleCancelar();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al Procesar',
        detail: error.response?.data?.message || 'Ocurrió un problema al guardar el pago.'
      });
    } finally {
      setRegistrandoPago(false);
    }
  };

  return (
    <div className="recibo-wrapper-80 my-4">
      <Toast ref={toast} />
      <Card title="Recibo de Pago de Colegiaturas" className="recibo-card-full shadow-2">
        <div className="grid p-fluid">
          {/* SECCIÓN IZQUIERDA: FORMULARIO */}
          <div className="col-12 col-md-6 p-3">
            <div className="mb-3">
              <label htmlFor="num_recibo" className="font-bold block mb-1">
                No Recibo (Sistema)
              </label>
              <div className="badge-recibo-auto">
                <span>N° {formData.num_recibo}</span>
                <i className="pi pi-lock text-sm" title="Número autogenerado por el sistema"></i>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="estudiante" className="font-bold block mb-1">
                Nombre o código de estudiante
              </label>
              <AutoComplete
                id="estudiante"
                value={formData.estudiante}
                suggestions={sugerencias}
                completeMethod={handleBuscarEstudiantes}
                field="displayLabel"
                onSelect={handleSelectEstudiante}
                onChange={(e) => handleInputChange('estudiante', e.value)}
                placeholder="Código o Nombre de Estudiante"
                className={errors.estudiante ? 'p-invalid' : ''}
                forceSelection
              />
              {errors.estudiante && <small className="p-error block mt-1">{errors.estudiante}</small>}
            </div>

            <div className="mb-3">
              <label htmlFor="fecha_pago" className="font-bold block mb-1">
                Fecha
              </label>
              <Calendar
                id="fecha_pago"
                value={formData.fecha_pago}
                onChange={(e) => handleInputChange('fecha_pago', e.value)}
                dateFormat="dd/mm/yy"
                maxDate={hoy}
                showIcon
                className={errors.fecha_pago ? 'p-invalid' : ''}
              />
              {errors.fecha_pago && <small className="p-error block mt-1">{errors.fecha_pago}</small>}
            </div>

            <div className="mb-3">
              <label htmlFor="monto_total" className="font-bold block mb-1">
                Monto a Pagar (Córdobas C$)
              </label>
              <InputNumber
                id="monto_total"
                value={formData.monto_total}
                onValueChange={(e) => handleMontoChange(e.value)}
                mode="currency"
                currency="NIO"
                locale="es-NI"
                min={0}
                minFractionDigits={2}
                className={errors.monto_total ? 'p-invalid' : ''}
              />
              {errors.monto_total && <small className="p-error block mt-1">{errors.monto_total}</small>}
            </div>

            <div className="mb-3">
              <label htmlFor="concepto" className="font-bold block mb-1">
                Concepto de Pago (Catálogo BD)
              </label>
              <Dropdown
                id="concepto"
                value={formData.concepto}
                options={conceptosCatalogo}
                optionLabel="label"
                optionValue="value"
                onChange={handleConceptoChange}
                placeholder={cargandoTarifas ? 'Cargando conceptos...' : 'Seleccione un concepto de la BD'}
                className={errors.concepto ? 'p-invalid' : ''}
                disabled={cargandoTarifas}
              />
              {errors.concepto && <small className="p-error block mt-1">{errors.concepto}</small>}
            </div>
          </div>

          {/* SECCIÓN DERECHA: RESUMEN Y BALANCES */}
          <div className="col-12 col-md-6 p-3">
            <Card title="Resumen del Arancel (Tabla catalogo_tarifa)" className="surface-100 mb-3 w-full">
              <div className="flex flex-column gap-3 p-2">
                <div className="flex justify-content-between border-bottom-1 surface-border pb-2">
                  <span className="font-bold text-600">Arancel Oficial en BD:</span>
                  <span className="font-bold text-900">
                    C${formData.monto_tarifa_oficial.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-content-between border-bottom-1 surface-border pb-2">
                  <span className="font-bold text-600">ID Tarifa Vinculada:</span>
                  <span className="font-bold text-primary">
                    {formData.id_tarifa ? `#${formData.id_tarifa}` : 'Sin ID'}
                  </span>
                </div>
              </div>
            </Card>

            <div className="grid p-fluid">
              <div className="col-12 col-md-6 mb-3">
                <label className="font-bold block mb-1">Monto Oficial Estipulado:</label>
                <InputNumber
                  value={formData.monto_tarifa_oficial}
                  mode="currency"
                  currency="NIO"
                  locale="es-NI"
                  disabled
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label className="font-bold block mb-1">Diferencia (Saldo / Abono):</label>
                <InputNumber
                  value={diferencia}
                  mode="currency"
                  currency="NIO"
                  locale="es-NI"
                  disabled
                />
              </div>
            </div>

            {/* BOTONES INSTITUCIONALES UNIFICADOS */}
            <div className="flex gap-2 justify-content-end mt-3">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="btn-institucional-outlined"
                type="button"
                onClick={handleCancelar}
              />
              <Button
                label="Aplicar recibo"
                icon="pi pi-check"
                className="btn-institucional"
                loading={registrandoPago}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReciboPago;
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
  const [imprimiendoRecibo, setImprimiendoRecibo] = useState(false);
  const [ultimoReciboGenerado, setUltimoReciboGenerado] = useState(null);
  const [saldoRestante, setSaldoRestante] = useState(null);
  const [saldoConsulta, setSaldoConsulta] = useState(null);
  const [consultandoSaldo, setConsultandoSaldo] = useState(false);

  const toast = useRef(null);
  const hoy = useMemo(() => new Date(), []);

  // Carga inicial aislada (Solución técnica al congelamiento del Dropdown)
  useEffect(() => {
    let isMounted = true;

    const inicializarPantalla = async () => {
      setCargandoTarifas(true);
      try {
        const anioLectivoActual = new Date().getFullYear();

        const dataTarifas = await tarifaService.listarTarifas(anioLectivoActual).catch((error) => {
          if (isMounted) {
            toast.current?.show({
              severity: 'error',
              summary: 'Error al cargar tarifas',
              detail: error.message || 'No se pudo consultar el catálogo de tarifas.'
            });
          }
          return null;
        });

        if (!isMounted) return;

        if (Array.isArray(dataTarifas) && dataTarifas.length > 0) {
          const opciones = dataTarifas.map((t) => ({
            label: `${t.concepto} (C$${Number(t.monto).toFixed(2)})${t.idnivel?.nombre ? ` - ${t.idnivel.nombre}` : ''}`,
            value: Number(t.idTarifa ?? t.id_tarifa),
            rawTarifa: t
          }));

          setConceptosCatalogo(opciones);
        }

        setFormData((prev) => ({
          ...prev,
          num_recibo: 'AUTO-GENERADO'
        }));
      } catch (error) {
        if (isMounted) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error de Conexión',
            detail: error.message || 'No se pudo inicializar la pantalla de recibos.'
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

  useEffect(() => {
    const idPersona = Number(formData.estudiante?.idpersona);
    const idTarifa = Number(formData.id_tarifa);

    if (!Number.isInteger(idPersona) || idPersona <= 0 || !Number.isInteger(idTarifa) || idTarifa <= 0) {
      setSaldoConsulta(null);
      setConsultandoSaldo(false);
      return undefined;
    }

    let vigente = true;
    setSaldoConsulta(null);
    setConsultandoSaldo(true);

    tarifaService.buscarSaldoPorPersonaYTarifa(idPersona, idTarifa)
      .then((saldo) => {
        if (!vigente) return;
        setSaldoConsulta(saldo);

        const saldoPendiente = Number(saldo?.saldoRestante);
        if (Number.isFinite(saldoPendiente)) {
          setFormData((prev) => ({
            ...prev,
            monto_total: Math.min(Math.max(saldoPendiente, 0), LIMITE_MAXIMO_CORDOBAS)
          }));
        }
      })
      .catch((error) => {
        if (!vigente) return;
        toast.current?.show({
          severity: 'error',
          summary: 'Error al consultar saldo',
          detail: error.response?.data?.message || error.response?.data?.mensaje || error.message ||
            'No se pudo consultar el saldo pendiente para el concepto seleccionado.'
        });
      })
      .finally(() => {
        if (vigente) setConsultandoSaldo(false);
      });

    return () => {
      vigente = false;
    };
  }, [formData.estudiante, formData.id_tarifa]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    if (field === 'estudiante' || field === 'monto_total') {
      setSaldoRestante(null);
    }
  }, []);

  const handleConceptoChange = (e) => {
    setSaldoRestante(null);
    const opcionEncontrada = conceptosCatalogo.find((opcion) => opcion.value === e.value);

    if (opcionEncontrada?.rawTarifa) {
      const tarifaBD = opcionEncontrada.rawTarifa;
      const montoBase = Number(tarifaBD.monto) || 0;
      const concepto = tarifaBD.concepto;
      const idTarifa = Number(tarifaBD.idTarifa ?? tarifaBD.id_tarifa) || null;

      if (montoBase > LIMITE_MAXIMO_CORDOBAS) {
        setFormData((prev) => ({
          ...prev,
          concepto,
          monto_total: 0,
          monto_tarifa_oficial: montoBase,
          id_tarifa: idTarifa
        }));

        toast.current?.show({
          severity: 'warn',
          summary: 'Excede Límite de Caja',
          detail: `La tarifa de ${concepto} (C$${montoBase.toFixed(2)}) supera C$15,000.00. Se restableció el monto a 0.`,
          life: 4000
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          concepto,
          monto_total: montoBase,
          monto_tarifa_oficial: montoBase,
          id_tarifa: idTarifa
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        concepto: '',
        monto_total: 0,
        monto_tarifa_oficial: 0,
        id_tarifa: null
      }));
    }
    setErrors((prev) => ({ ...prev, concepto: null, monto_total: null }));
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
            const mined = est.codigoMined ? ` - MINED: ${est.codigoMined}` : '';
            const nombre = est.nombre_completo 
              ? `${est.nombre_completo} ${est.apellido_completo || ''}` 
              : `${est.nombres || ''} ${est.apellidos || ''}`;

            return {
              idpersona: idPersona,
              codigoMined: est.codigoMined,
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
    } else if (!formData.id_tarifa) {
      nuevosErrores.concepto = 'El concepto seleccionado no está asociado a una tarifa válida.';
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
      num_recibo: null,
      fecha_pago: new Date()
    }));
    setErrors({});
    setSaldoRestante(null);
  };

  const handleImprimirRecibo = async () => {
    if (!ultimoReciboGenerado) return;

    const ventana = window.open('', '_blank');
    if (!ventana) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Ventana bloqueada',
        detail: 'Permita ventanas emergentes para abrir el recibo PDF.'
      });
      return;
    }

    setImprimiendoRecibo(true);
    try {
      const pdf = await pagosService.descargarComprobante(ultimoReciboGenerado, 'ADMIN');
      const url = URL.createObjectURL(pdf);
      ventana.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      ventana.close();
      toast.current?.show({
        severity: 'error',
        summary: 'Error al imprimir recibo',
        detail: error.message || 'No se pudo descargar el recibo.'
      });
    } finally {
      setImprimiendoRecibo(false);
    }
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

    const estudiante = formData.estudiante.raw || {};
    const payload = {
      idPersona: Number(formData.estudiante.idpersona),
      idSalon: estudiante.idSalon ?? estudiante.id_salon ?? null,
      anioLectivo: new Date(formData.fecha_pago).getFullYear(),
      concepto: formData.concepto,
      tipoPago: 'Efectivo',
      monto: formData.monto_total,
      idTarifa: Number(formData.id_tarifa),
      fechaTransaccion: moment(formData.fecha_pago).format('YYYY-MM-DDTHH:mm:ss'),
      usuario: 'Cajero_Sistema'
    };

    try {
      const res = await pagosService.emitirRecibo(payload);
      const numeroAsignado =
        (typeof res === 'string' ? res : null) ||
        res?.numeroRecibo ||
        res?.numRecibo ||
        res?.num_recibo ||
        res?.reciboGenerado ||
        res?.p_recibo_generado ||
        null;

      setUltimoReciboGenerado(numeroAsignado);
      const saldoDevuelto = res?.saldoRestante;
      setSaldoRestante(
        saldoDevuelto !== null && saldoDevuelto !== undefined && Number.isFinite(Number(saldoDevuelto))
          ? Number(saldoDevuelto)
          : null
      );
      const montoEmitido = Number(formData.monto_total) || 0;
      setSaldoConsulta((prev) => {
        if (!prev) return prev;
        const saldoRespuesta = Number(saldoDevuelto);
        const saldoActual = Number(prev.saldoRestante);
        return {
          ...prev,
          montoPagado: (Number(prev.montoPagado) || 0) + montoEmitido,
          saldoRestante: saldoDevuelto !== null &&
            saldoDevuelto !== undefined &&
            Number.isFinite(saldoRespuesta)
            ? saldoRespuesta
            : Number.isFinite(saldoActual)
              ? Math.max(saldoActual - montoEmitido, 0)
              : prev.saldoRestante
        };
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Pago Registrado',
        detail: numeroAsignado
          ? `Recibo N° ${numeroAsignado} (C$${formData.monto_total.toFixed(2)}) procesado exitosamente.`
          : `Pago procesado (C$${formData.monto_total.toFixed(2)}), pero el servidor no devolvió el número del recibo para imprimirlo.`
      });

      setFormData((prev) => ({
        ...prev,
        monto_total: 0,
        num_recibo: numeroAsignado || prev.num_recibo
      }));
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al Procesar',
        detail: error.message || 'Ocurrió un problema al guardar el pago.'
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
              <label htmlFor="concepto" className="font-bold block mb-1">
                Concepto de Pago 
              </label>
              <Dropdown
                id="concepto"
                options={conceptosCatalogo}
                optionLabel="label"
                optionValue="value"
                value={formData.id_tarifa}
                onChange={handleConceptoChange}
                placeholder={
                  cargandoTarifas
                    ? 'Cargando conceptos...'
                    : conceptosCatalogo.length === 0
                      ? 'No hay tarifas registradas para el año lectivo actual'
                      : 'Seleccione concepto de pago'
                }
                className={errors.concepto ? 'p-invalid' : ''}
                disabled={cargandoTarifas || conceptosCatalogo.length === 0}
              />
              {!cargandoTarifas && conceptosCatalogo.length === 0 && (
                <small className="p-error block mt-1">
                  La API no devolvió tarifas para el año lectivo {new Date().getFullYear()}.
                </small>
              )}
              {errors.concepto && <small className="p-error block mt-1">{errors.concepto}</small>}
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
                disabled={consultandoSaldo}
              />
              {errors.monto_total && <small className="p-error block mt-1">{errors.monto_total}</small>}
              {consultandoSaldo && <small className="block mt-1">Consultando saldo pendiente...</small>}
            </div>
          </div>

          {/* SECCIÓN DERECHA: RESUMEN Y BALANCES */}
          <div className="col-12 col-md-6 p-3">
            <Card title="Resumen del Arancel " className="surface-100 mb-3 w-full">
              <div className="flex flex-column gap-3 p-2">
                <div className="flex justify-content-between border-bottom-1 surface-border pb-2">
                  <span className="font-bold text-600">Arancel :</span>
                  <span className="font-bold text-900">
                  {formData.concepto}
                  </span>
                </div>
                <div className="flex justify-content-between border-bottom-1 surface-border pb-2">
                  <span className="font-bold text-600">Monto a Pagar :</span>
                  <span className="font-bold text-900">
                    C${formData.monto_total.toFixed(2)}
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
                <label className="font-bold block mb-1">
                  {saldoConsulta ? 'Saldo pendiente:' : saldoRestante === null ? 'Diferencia (Saldo / Abono):' : 'Saldo restante:'}
                </label>
                <InputNumber
                  value={
                    saldoConsulta?.saldoRestante !== undefined && saldoConsulta?.saldoRestante !== null
                      ? Number(saldoConsulta.saldoRestante)
                      : saldoRestante ?? diferencia
                  }
                  mode="currency"
                  currency="NIO"
                  locale="es-NI"
                  disabled
                />
              </div>
              {saldoConsulta && (
                <div className="col-12 mb-3">
                  <small className="text-600">
                    Pagado: C${Number(saldoConsulta.montoPagado || 0).toFixed(2)}
                    {' · '}Tarifa: C${Number(saldoConsulta.montoTarifa || 0).toFixed(2)}
                    {saldoConsulta.anioLectivo ? ` · Año lectivo: ${saldoConsulta.anioLectivo}` : ''}
                  </small>
                </div>
              )}
            </div>

            {/* BOTONES INSTITUCIONALES UNIFICADOS */}
            <div className="flex gap-2 justify-content-end mt-3">
              <Button
                label="Generar Recibo"
                icon="pi pi-check"
                className="btn-institucional"
                loading={registrandoPago}
                onClick={handleSubmit}
              />
              {ultimoReciboGenerado && (
                <Button
                  label="Imprimir recibo"
                  icon="pi pi-print"
                  className="btn-institucional-outlined"
                  type="button"
                  loading={imprimiendoRecibo}
                  onClick={handleImprimirRecibo}
                />
              )}
              <Button
                label="Limpiar"
                icon="pi pi-trash"
                className="btn-institucional-outlined"
                type="button"
                onClick={handleCancelar}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReciboPago;
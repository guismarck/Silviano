import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from 'primereact/card';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import moment from 'moment';
import pagosService from '../Servicios/PagosServicios/pagoservice';
import '../estilosCSS/styles.css';

// Reglas de negocio para límites de caja según divisa
const LIMITES_MONEDA = {
  USD: { min: 0.01, max: 1000, simbolo: 'US$', label: 'Dólares' },
  NIO: { min: 0.01, max: 15000, simbolo: 'C$', label: 'Córdobas' }
};

const CONCEPTOS_PAGO = [
  { label: 'Cancelación de mensualidad', value: 'Cancelación de mensualidad' },
  { label: 'Matrícula', value: 'Matrícula' },
  { label: 'Aguinaldo', value: 'Aguinaldo' },
  { label: 'Traje Deportivo', value: 'Traje Deportivo' },
  { label: 'Examen Extratemporal', value: 'Examen Extratemporal' },
  { label: 'Derecho de Graduación', value: 'Derecho de Graduación' },
  { label: 'Otros / Varios', value: 'Otros / Varios' }
];

const OPCIONES_MONEDA = [
  { label: 'US$', value: 'USD' },
  { label: 'C$', value: 'NIO' }
];

const ESTADO_INICIAL = {
  num_recibo: 'Cargando...',
  estudiante: null,
  fecha_pago: new Date(),
  monto_total: 0,
  concepto: 'Cancelación de mensualidad',
  moneda: 'NIO'
};

const ReciboPago = () => {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [errors, setErrors] = useState({});
  const [sugerencias, setSugerencias] = useState([]);
  const [cuentasPorPagar, setCuentasPorPagar] = useState([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);

  const toast = useRef(null);
  const hoy = useMemo(() => new Date(), []);

  // Configuración del límite según la moneda seleccionada
  const limiteActual = useMemo(() => {
    return LIMITES_MONEDA[formData.moneda] || LIMITES_MONEDA.NIO;
  }, [formData.moneda]);

  const cargarConsecutivoRecibo = useCallback(async () => {
    try {
      const res = await pagosService.obtenerSiguienteNumRecibo();
      setFormData((prev) => ({
        ...prev,
        num_recibo: res?.num_recibo || 'AUTO-GENERADO'
      }));
    } catch (error) {
      setFormData((prev) => ({ ...prev, num_recibo: 'AUTO-GENERADO' }));
    }
  }, []);

  useEffect(() => {
    cargarConsecutivoRecibo();
  }, [cargarConsecutivoRecibo]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  // Manejador del cambio de monto con reestablecimiento a 0 en caso de sobrepasar el límite
  const handleMontoChange = (nuevoMonto) => {
    const valor = Number(nuevoMonto) || 0;

    if (valor > limiteActual.max) {
      // 1. Reestablece el valor a 0 inmediatamente
      handleInputChange('monto_total', 0);

      // 2. Notifica mediante Toast
      toast.current?.show({
        severity: 'warn',
        summary: 'Límite Excedido',
        detail: `El monto ingresado excede el límite permitido para ${limiteActual.label} (${limiteActual.simbolo}${limiteActual.max.toLocaleString('es-NI')}). Se ha reestablecido el monto a 0.`,
        life: 5000
      });

      // 3. Marca el error en el input
      setErrors((prev) => ({
        ...prev,
        monto_total: `Monto máximo permitido: ${limiteActual.simbolo}${limiteActual.max.toLocaleString('es-NI')}.`
      }));
      return;
    }

    handleInputChange('monto_total', valor);
  };

  // Manejador del cambio de divisa con re-verificación del monto existente
  const handleMonedaChange = (nuevaMoneda) => {
    handleInputChange('moneda', nuevaMoneda);
    const nuevoLimite = LIMITES_MONEDA[nuevaMoneda];

    if (formData.monto_total > nuevoLimite.max) {
      handleInputChange('monto_total', 0);
      toast.current?.show({
        severity: 'warn',
        summary: 'Límite Excedido',
        detail: `El monto rebasaba el límite permitido de la nueva moneda (${nuevoLimite.simbolo}${nuevoLimite.max.toLocaleString('es-NI')}). Se reestableció a 0.`,
        life: 5000
      });
      setErrors((prev) => ({
        ...prev,
        monto_total: `Monto máximo permitido: ${nuevoLimite.simbolo}${nuevoLimite.max.toLocaleString('es-NI')}.`
      }));
    }
  };

  const totalAPagar = useMemo(() => {
    return cuentasPorPagar.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  }, [cuentasPorPagar]);

  const diferencia = useMemo(() => {
    return (Number(formData.monto_total) || 0) - totalAPagar;
  }, [formData.monto_total, totalAPagar]);

  const buscarEstudiantes = async (event) => {
    try {
      const data = await pagosService.buscarEstudiantes(event.query);
      setSugerencias(
        data.map((est) => ({
          idpersona_estudiante: est.idpersona,
          codigo_MINED: est.codigo_MINED,
          cod_estudiante: est.cod_estudiante,
          displayLabel: `[${est.cod_estudiante}] ${est.nombre_completo} ${est.apellido_completo}`,
          raw: est
        }))
      );
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se logró consultar la base de datos de estudiantes.'
      });
    }
  };

  const handleSelectEstudiante = async (e) => {
    const selec = e.value;
    handleInputChange('estudiante', selec);
    setCargandoCuentas(true);

    try {
      const cuentas = await pagosService.obtenerCuentasPorPagar(selec.idpersona_estudiante);
      setCuentasPorPagar(cuentas);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al consultar las cuentas por pagar.'
      });
    } finally {
      setCargandoCuentas(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.estudiante) {
      nuevosErrores.estudiante = 'Debe seleccionar un estudiante de la lista.';
    }

    const monto = Number(formData.monto_total) || 0;
    if (monto <= 0) {
      nuevosErrores.monto_total = 'El monto a pagar debe ser mayor a cero (0).';
    } else if (monto > limiteActual.max) {
      nuevosErrores.monto_total = `El monto máximo permitido en ${limiteActual.label} es ${limiteActual.simbolo}${limiteActual.max.toLocaleString('es-NI')}.`;
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
    setFormData({ ...ESTADO_INICIAL, fecha_pago: new Date() });
    setCuentasPorPagar([]);
    setErrors({});
    cargarConsecutivoRecibo();
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
      idpersona_estudiante: formData.estudiante.idpersona_estudiante,
      idmatricula: formData.estudiante.raw?.idmatricula || null,
      num_recibo: formData.num_recibo !== 'AUTO-GENERADO' ? formData.num_recibo : null,
      anio_lectivo: new Date(formData.fecha_pago).getFullYear(),
      fecha_pago: moment(formData.fecha_pago).format('YYYY-MM-DD HH:mm:ss'),
      tipo_pago: 'Efectivo',
      monto_total: formData.monto_total,
      moneda: formData.moneda,
      creado_por: 'Cajero_Sistema',
      detalles: [
        {
          id_tarifa: null,
          concepto: typeof formData.concepto === 'object' ? formData.concepto.value : formData.concepto,
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
        detail: `Recibo N° ${numeroAsignado} procesado exitosamente.`
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
          <div className="col-12 md:col-6 p-3">
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
                completeMethod={buscarEstudiantes}
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
              <label className="font-bold block mb-1">Tipo de Moneda</label>
              <SelectButton
                value={formData.moneda}
                options={OPCIONES_MONEDA}
                onChange={(e) => e.value && handleMonedaChange(e.value)}
              />
            </div>

            <div className="mb-3">
              <div className="flex justify-content-between align-items-center mb-1">
                <label htmlFor="monto_total" className="font-bold block">
                  Monto a Pagar
                </label>
                <span className="text-xs text-500 font-semibold">
                  Máx: {limiteActual.simbolo}{limiteActual.max.toLocaleString('es-NI')}
                </span>
              </div>
              <InputNumber
                id="monto_total"
                value={formData.monto_total}
                onValueChange={(e) => handleMontoChange(e.value)}
                mode="currency"
                currency={formData.moneda}
                locale="es-NI"
                min={0}
                minFractionDigits={2}
                className={errors.monto_total ? 'p-invalid' : ''}
              />
              {errors.monto_total && <small className="p-error block mt-1">{errors.monto_total}</small>}
            </div>

            <div className="mb-3">
              <label htmlFor="concepto" className="font-bold block mb-1">
                Concepto de Pago
              </label>
              <Dropdown
                id="concepto"
                value={formData.concepto}
                options={CONCEPTOS_PAGO}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => handleInputChange('concepto', e.value)}
                placeholder="Seleccione un concepto"
              />
            </div>
          </div>

          {/* SECCIÓN DERECHA: TABLA Y TOTALES */}
          <div className="col-12 md:col-6 p-3">
            <Card title="Información de cuentas por pagar" className="surface-100 mb-3 w-full">
              {cargandoCuentas ? (
                <div className="flex justify-content-center p-4">
                  <ProgressSpinner style={{ width: '35px', height: '35px' }} />
                </div>
              ) : (
                <DataTable
                  value={cuentasPorPagar}
                  rows={3}
                  paginator
                  size="small"
                  emptyMessage="No hay cuentas por pagar para este estudiante"
                  className="w-full"
                >
                  <Column field="concepto" header="Concepto" />
                  <Column
                    field="fechaVencimiento"
                    header="Fecha Vencimiento"
                    body={(r) => moment(r.fechaVencimiento).format('DD/MM/YYYY')}
                  />
                  <Column
                    field="monto"
                    header="Monto"
                    body={(r) =>
                      r.monto?.toLocaleString('es-NI', {
                        style: 'currency',
                        currency: formData.moneda
                      })
                    }
                  />
                </DataTable>
              )}
            </Card>

            <div className="grid p-fluid">
              <div className="col-12 md:col-6 mb-3">
                <label className="font-bold block mb-1">Total a Pagar:</label>
                <InputNumber
                  value={totalAPagar}
                  mode="currency"
                  currency={formData.moneda}
                  locale="es-NI"
                  disabled
                />
              </div>

              <div className="col-12 md:col-6 mb-3">
                <label className="font-bold block mb-1">Diferencia:</label>
                <InputNumber
                  value={diferencia}
                  mode="currency"
                  currency={formData.moneda}
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
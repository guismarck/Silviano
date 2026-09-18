import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import { CONCEPTOS_TARIFA_ENUM, getAniosLectivos } from '../../Util/metodosGenericos';
import { 
  getCatalogosCaja,
  obtenerTarifaPorNivelYConcepto, 
  obtenerSalonesDisponibles,
  registrarTransaccionCobro,
  descargarComprobanteCaja
} from '../PagosServicios/pagoservice';

const INITIAL_STATE = Object.freeze({
  idpersona: null,
  idnivel: null,
  idsalon: null,
  anio_lectivo: new Date().getFullYear(),
  concepto: 'Matrícula',
  idtarifa: null,
  monto: 0.00
});

export const GestionCobroForm = () => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loadingTarifa, setLoadingTarifa] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingSalones, setLoadingSalones] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Garantizar inicialización en arreglos vacíos
  const [listEstudiantes, setListEstudiantes] = useState([]);
  const [listNiveles, setListNiveles] = useState([]);
  const [listSalones, setListSalones] = useState([]);
  const [tarifaInfo, setTarifaInfo] = useState(null);

  const toastRef = useRef(null);
  const aniosOptions = useMemo(() => getAniosLectivos() || [], []);

  // Carga inicial en paralelo de Estudiantes y Niveles Educativos
  useEffect(() => {
    let isMounted = true;

    const cargarCatalogosIniciales = async () => {
      setLoadingCatalogos(true);
      try {
        const { estudiantes, niveles } = await getCatalogosCaja();
        if (isMounted) {
          setListEstudiantes(estudiantes);
          setListNiveles(niveles);
        }
      } catch (error) {
        if (isMounted) {
          setListEstudiantes([]);
          setListNiveles([]);
          toastRef.current?.show({
            severity: 'error',
            summary: 'Error de Red',
            detail: 'No se pudieron consultar los catálogos base de caja.',
            life: 4000
          });
        }
      } finally {
        if (isMounted) setLoadingCatalogos(false);
      }
    };

    cargarCatalogosIniciales();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const { idnivel, anio_lectivo, concepto, idsalon } = formData;
  const esMatricula = concepto === 'Matrícula';

  // Consulta dinámica de tarifa parametrizada por Nivel Educativo
  useEffect(() => {
    if (!idnivel || !anio_lectivo || !concepto) {
      setTarifaInfo(null);
      setFormData((prev) => ({ ...prev, idtarifa: null, monto: 0.00 }));
      return;
    }

    let isMounted = true;

    const fetchTarifa = async () => {
      setLoadingTarifa(true);
      try {
        const tarifaData = await obtenerTarifaPorNivelYConcepto(idnivel, anio_lectivo, concepto);
        if (isMounted) {
          if (tarifaData && (tarifaData.idtarifa || tarifaData.id_tarifa)) {
            const tarifaId = tarifaData.idtarifa || tarifaData.id_tarifa;
            setTarifaInfo(tarifaData);
            setFormData((prev) => ({
              ...prev,
              idtarifa: tarifaId,
              monto: Number(tarifaData.monto || 0)
            }));
          } else {
            setTarifaInfo(null);
            setFormData((prev) => ({ ...prev, idtarifa: null, monto: 0.00 }));
          }
        }
      } catch (error) {
        if (isMounted) {
          setTarifaInfo(null);
          setFormData((prev) => ({ ...prev, idtarifa: null, monto: 0.00 }));
          toastRef.current?.show({
            severity: 'warn',
            summary: 'Sin Tarifa Asignada',
            detail: `No existe tarifa registrada para ${concepto} en el nivel educativo seleccionado.`,
            life: 4000
          });
        }
      } finally {
        if (isMounted) setLoadingTarifa(false);
      }
    };

    fetchTarifa();

    return () => {
      isMounted = false;
    };
  }, [idnivel, anio_lectivo, concepto]);

  // Consulta de salones con cupos disponibles según Nivel Educativo
  useEffect(() => {
    if (!esMatricula || !idnivel || !anio_lectivo) {
      setListSalones([]);
      setFormData((prev) => ({ ...prev, idsalon: null }));
      return;
    }

    let isMounted = true;

    const fetchSalonesDisponibles = async () => {
      setLoadingSalones(true);
      try {
        const salones = await obtenerSalonesDisponibles(idnivel, anio_lectivo);
        if (isMounted) {
          setListSalones(salones);
          setFormData((prev) => ({ ...prev, idsalon: null }));
          if (salones.length === 0) {
            toastRef.current?.show({
              severity: 'warn',
              summary: 'Aulas Agotadas',
              detail: 'No hay salones con vacantes disponibles para este nivel educativo.',
              life: 5000
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setListSalones([]);
          setFormData((prev) => ({ ...prev, idsalon: null }));
          toastRef.current?.show({
            severity: 'error',
            summary: 'Error de Consulta',
            detail: 'No se pudo obtener la disponibilidad de salones.',
            life: 4000
          });
        }
      } finally {
        if (isMounted) setLoadingSalones(false);
      }
    };

    fetchSalonesDisponibles();

    return () => {
      isMounted = false;
    };
  }, [esMatricula, idnivel, anio_lectivo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idpersona || !formData.idnivel || !formData.idtarifa) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Campos Requeridos',
        detail: 'Seleccione un estudiante, un nivel educativo y valide la tarifa activa.',
        life: 4000
      });
      return;
    }

    if (esMatricula && !idsalon) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Salón Requerido',
        detail: 'Debe seleccionar un salón con cupo disponible para completar la matrícula.',
        life: 4000
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      const result = await registrarTransaccionCobro(payload);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Transacción Exitosa',
        detail: `Operación registrada correctamente. Recibo N° ${result.idTransaccion || result.id_pago || 'OK'}`,
        life: 4000
      });

      const transaccionId = result.idTransaccion || result.id_pago;
      if (transaccionId) {
        await descargarComprobanteCaja(transaccionId);
      }

      setFormData(INITIAL_STATE);
      setTarifaInfo(null);
      setListSalones([]);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de Transacción',
        detail: error.response?.data?.message || 'Ocurrió un fallo en el servidor al registrar el cobro.',
        life: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-4 shadow-1 border-round">
      <Toast ref={toastRef} />

      <h3 className="text-xl font-bold mb-4 text-900 flex align-items-center gap-2">
        <i className="pi pi-wallet text-primary text-2xl"></i>
        Módulo de Caja: Matrículas y Mensualidades (SIGE)
      </h3>

      <form onSubmit={handleSubmit} className="p-fluid grid">
        
        {/* Estudiante */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="idpersona" className="font-bold block mb-2">
            Estudiante <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="idpersona"
            value={formData.idpersona}
            options={listEstudiantes || []}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleChange('idpersona', e.value)}
            placeholder={loadingCatalogos ? "Cargando estudiantes..." : "Seleccione el estudiante"}
            filter
            filterBy="label"
            loading={loadingCatalogos}
            disabled={loadingCatalogos}
            emptyMessage="No se encontraron estudiantes"
            className="w-full"
            required
          />
        </div>

        {/* Concepto de Pago */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="concepto" className="font-bold block mb-2">
            Concepto de Pago <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="concepto"
            value={formData.concepto}
            options={CONCEPTOS_TARIFA_ENUM || []}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleChange('concepto', e.value)}
            className="w-full"
            required
          />
        </div>

        {/* Nivel Educativo */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="idnivel" className="font-bold block mb-2">
            Nivel Educativo <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="idnivel"
            value={formData.idnivel}
            options={listNiveles || []}
            optionLabel="nombre"
            optionValue="idnivel"
            onChange={(e) => handleChange('idnivel', e.value)}
            placeholder={loadingCatalogos ? "Cargando niveles..." : "Seleccione el Nivel Educativo"}
            filter
            filterBy="nombre"
            loading={loadingCatalogos}
            disabled={loadingCatalogos}
            emptyMessage="No se encontraron niveles educativos"
            className="w-full"
            required
          />
        </div>

        {/* Salón de Clase */}
        {esMatricula && (
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="idsalon" className="font-bold block mb-2 text-primary">
              Salón de Clase / Sección Asignada <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="idsalon"
              value={formData.idsalon}
              options={listSalones || []}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleChange('idsalon', e.value)}
              placeholder={
                !idnivel 
                  ? "Seleccione un nivel educativo primero" 
                  : loadingSalones 
                    ? "Consultando disponibilidad de vacantes..." 
                    : "Seleccione un salón disponible"
              }
              loading={loadingSalones}
              disabled={!idnivel || loadingSalones || (listSalones && listSalones.length === 0)}
              emptyMessage="No hay salones con cupos disponibles para este nivel"
              className="w-full"
              required={esMatricula}
            />
          </div>
        )}

        {/* Año Lectivo */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="anio_lectivo" className="font-bold block mb-2">
            Año Lectivo <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="anio_lectivo"
            value={formData.anio_lectivo}
            options={aniosOptions || []}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleChange('anio_lectivo', e.value)}
            className="w-full"
            required
          />
        </div>

        {/* Monto Acreditar */}
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="monto" className="font-bold block mb-2">
            Monto Acreditar (C$) {loadingTarifa && <i className="pi pi-spin pi-spinner ml-2 text-primary"></i>}
          </label>
          <InputNumber
            id="monto"
            value={formData.monto}
            onValueChange={(e) => handleChange('monto', e.value ?? 0)}
            mode="currency"
            currency="NIO"
            locale="es-NI"
            min={0}
            minFractionDigits={2}
            className="w-full"
            disabled={!tarifaInfo} 
            required
          />
        </div>

        {/* Banner Informativo */}
        <div className="col-12 mb-3">
          {tarifaInfo ? (
            <Message 
              severity="success" 
              text={`Tarifa aplicada ID #${tarifaInfo.idtarifa || tarifaInfo.id_tarifa}: C$ ${tarifaInfo.monto}`} 
              className="w-full justify-content-start"
            />
          ) : (
            <Message 
              severity="info" 
              text="Seleccione Nivel Educativo y Año Lectivo para validar el catálogo oficial de tarifas." 
              className="w-full justify-content-start"
            />
          )}
        </div>

        {/* Botones de Acción */}
        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Restablecer"
            icon="pi pi-refresh"
            className="p-button-outlined p-button-secondary"
            onClick={() => {
              setFormData(INITIAL_STATE);
              setTarifaInfo(null);
              setListSalones([]);
            }}
            disabled={submitting}
          />
          <Button
            type="submit"
            label="Procesar y Emitir Recibo"
            icon="pi pi-print"
            loading={submitting}
            disabled={!formData.idtarifa || submitting || (esMatricula && !idsalon)}
            className="p-button-primary"
          />
        </div>

      </form>
    </div>
  );
};

export default GestionCobroForm;
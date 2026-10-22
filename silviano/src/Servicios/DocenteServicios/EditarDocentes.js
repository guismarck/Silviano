import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';

import { updateDocenteService, getDocenteById } from '../../Servicios/DocenteServicios/docenteService';

import { validarSoloTexto } from '../../Util/validaciones/validacionEstudiante.js';

import {
  formatearCedula,
  extraerFechaDeCedula,
  validarFechaNacimiento,
  validarCedula
} from '../../Util/validaciones/Validacioncedula.js';

// =========================================================
// CONSTANTES Y UTILIDADES
// =========================================================

const SEXO_OPTIONS = [
  { label: 'Femenino', value: 'F' },
  { label: 'Masculino', value: 'M' }
];

const ESTADO_INICIAL = {
  idpersona: '',
  nombre_completo: '',
  apellido_completo: '',
  direccion: '',
  fecha_nacimiento: null,
  cedula: '',
  codDocente: '',
  especialidad: '',
  estado: true,
  sexo: ''
};

// Convierte el string de la BD (YYYY-MM-DD) a Date, sin desfase de zona horaria.
const parseDateFromDB = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).slice(0, 10).split('-').map(Number);
  const fecha = new Date(year, month - 1, day);

  return isNaN(fecha.getTime()) ? null : fecha;
};

// Convierte un Date a YYYY-MM-DD para enviarlo a la BD.
const formatDateToDB = (dateObj) => {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizarSexo = (valor) => {
  const texto = String(valor ?? '').trim().toUpperCase();
  if (texto.startsWith('F')) return 'F';
  if (texto.startsWith('M')) return 'M';
  return '';
};

// =========================================================
// COMPONENTES AUXILIARES
// Están fuera del componente principal para no remontarse en cada render.
// =========================================================

const Campo = ({ id, label, requerido, ayuda, error, className = 'col-12 md:col-6', children }) => (
  <div className={`${className} field`}>
    <label htmlFor={id} className="font-semibold text-700 block mb-2">
      {label}
      {requerido && <span className="text-red-500"> *</span>}
    </label>

    {children}

    {error ? (
      <small className="p-error block mt-1">{error}</small>
    ) : ayuda ? (
      <small className="text-500 block mt-1">{ayuda}</small>
    ) : null}
  </div>
);

Campo.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  requerido: PropTypes.bool,
  ayuda: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

const Seccion = ({ icono, titulo, children }) => (
  <section className="surface-card border-round shadow-1 p-3 md:p-4 mb-3">
    <div className="flex align-items-center gap-2 mb-3">
      <i className={`pi ${icono} text-primary text-xl`} />
      <h3 className="m-0 text-lg font-semibold text-900">{titulo}</h3>
    </div>

    {children}
  </section>
);

Seccion.propTypes = {
  icono: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  children: PropTypes.node
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

const UpdateDocente = ({ idPersona, onDocenteUpdate, onEstudianteUpdate, onCancel }) => {
  const toast = useRef(null);

  // Docentes.jsx puede pasar el callback como onDocenteUpdate o, como
  // estaba antes, onEstudianteUpdate: se aceptan los dos nombres.
  const notificarActualizacion = onDocenteUpdate ?? onEstudianteUpdate;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // { campo: 'cedula' | 'nombre_completo' | ... | null, mensaje: string }
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState(ESTADO_INICIAL);

  // ---------------------------------------------------------
  // CARGAR DATOS DEL DOCENTE
  // ---------------------------------------------------------

  const fetchDocenteData = useCallback(async () => {
    if (!idPersona) return;

    setFetching(true);
    setLoadError(false);

    try {
      const data = await getDocenteById(idPersona);

      // Los demás campos que devuelve el backend (por ejemplo, la partida
      // de nacimiento) se conservan tal cual vienen.
      setFormValues({
        ...ESTADO_INICIAL,
        ...data,
        nombre_completo: data.nombre_completo ?? '',
        apellido_completo: data.apellido_completo ?? '',
        direccion: data.direccion ?? '',
        cedula: formatearCedula(data.cedula ?? ''),
        codDocente: data.codDocente ?? '',
        especialidad: data.especialidad ?? '',
        sexo: normalizarSexo(data.sexo),
        fecha_nacimiento: parseDateFromDB(data.fecha_nacimiento),
        estado: Boolean(data.estado)
      });
    } catch (err) {
      setLoadError(true);

      toast.current?.show({
        severity: 'error',
        summary: 'Error de carga',
        detail: 'No se pudo obtener la información del docente.',
        life: 4000
      });
    } finally {
      setFetching(false);
    }
  }, [idPersona]);

  useEffect(() => {
    fetchDocenteData();
  }, [fetchDocenteData]);

  // ---------------------------------------------------------
  // CAMBIOS EN EL FORMULARIO
  // ---------------------------------------------------------

  const handleChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));

    setError(null);
  };

  // La cédula se formatea al escribir y, cuando está completa,
  // su fecha pasa al campo de fecha de nacimiento.
  const handleCedula = (valor) => {
    const cedula = formatearCedula(valor);
    const fecha = extraerFechaDeCedula(cedula);

    setFormValues((prev) => ({
      ...prev,
      cedula,
      ...(fecha ? { fecha_nacimiento: fecha } : {})
    }));

    if (cedula.length === 16 && !fecha) {
      setError({
        campo: 'cedula',
        mensaje: 'La cédula no contiene una fecha de nacimiento válida.'
      });
    } else {
      setError(null);
    }
  };

  // ---------------------------------------------------------
  // VALIDACIÓN
  // Devuelve { campo, mensaje } con el primer problema, o null.
  // ---------------------------------------------------------

  const validarFormulario = () => {
    const errorNombre = validarSoloTexto(formValues.nombre_completo, 'Nombres');
    if (errorNombre) return { campo: 'nombre_completo', mensaje: errorNombre };

    const errorApellido = validarSoloTexto(formValues.apellido_completo, 'Apellidos');
    if (errorApellido) return { campo: 'apellido_completo', mensaje: errorApellido };

    if (!formValues.sexo) {
      return { campo: 'sexo', mensaje: 'Seleccione el sexo del docente.' };
    }

    if (!formValues.fecha_nacimiento) {
      return { campo: 'fecha_nacimiento', mensaje: 'La fecha de nacimiento es obligatoria.' };
    }

    const errorFecha = validarFechaNacimiento(formValues.fecha_nacimiento, 'del docente');
    if (errorFecha) return { campo: 'fecha_nacimiento', mensaje: errorFecha };

    const errorCedula = validarCedula(
      formValues.cedula,
      formValues.fecha_nacimiento,
      'del docente'
    );
    if (errorCedula) return { campo: 'cedula', mensaje: errorCedula };

    return null;
  };

  // ---------------------------------------------------------
  // GUARDAR
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const problema = validarFormulario();

    if (problema) {
      setError(problema);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formValues,
        nombre_completo: formValues.nombre_completo.trim(),
        apellido_completo: formValues.apellido_completo.trim(),
        fecha_nacimiento: formatDateToDB(formValues.fecha_nacimiento),
        cedula: formValues.cedula.trim() || null,
        direccion: formValues.direccion.trim(),
        especialidad: formValues.especialidad.trim() || null,
        estado: Boolean(formValues.estado)
      };

      await updateDocenteService(formValues.idpersona, payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Operación exitosa',
        detail: 'Expediente del docente actualizado correctamente.',
        life: 3000
      });

      if (typeof notificarActualizacion === 'function') {
        notificarActualizacion();
      }
    } catch (err) {
      console.error('Error al actualizar docente:', err);

      const respuestaError = err.response?.data;

      const mensaje =
        typeof respuestaError === 'string'
          ? respuestaError
          : respuestaError?.mensaje ||
            respuestaError?.message ||
            err.message ||
            'Ocurrió un error al intentar actualizar los datos.';

      setError({ campo: null, mensaje });

      toast.current?.show({
        severity: 'error',
        summary: 'Error al guardar',
        detail: mensaje,
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // AYUDAS DE RENDER
  // ---------------------------------------------------------

  const errorDe = (campo) => (error?.campo === campo ? error.mensaje : undefined);
  const claseInvalida = (campo) => (error?.campo === campo ? 'p-invalid' : '');

  const iniciales =
    `${(formValues.nombre_completo || '').trim().charAt(0)}${(formValues.apellido_completo || '')
      .trim()
      .charAt(0)}`.toUpperCase() || 'D';

  // ---------------------------------------------------------
  // ESTADOS DE CARGA
  // ---------------------------------------------------------

  if (fetching) {
    return (
      <div className="p-2 md:p-3">
        <Toast ref={toast} />
        <Skeleton height="5rem" className="mb-3" />
        <Skeleton height="16rem" className="mb-3" />
        <Skeleton height="9rem" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-2 md:p-3 flex flex-column align-items-center gap-3 text-center">
        <Toast ref={toast} />
        <Message severity="error" text="No se pudo cargar la información del docente." />
        <Button
          type="button"
          label="Reintentar"
          icon="pi pi-refresh"
          size="small"
          outlined
          onClick={fetchDocenteData}
          style={{ width: 'auto' }}
        />
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="p-2 md:p-3">
      <Toast ref={toast} />

      <form onSubmit={handleSubmit} className="p-fluid" noValidate>
        {/* RESUMEN DEL DOCENTE */}

        <div className="flex align-items-center gap-3 surface-card border-round shadow-1 p-3 mb-3">
          <Avatar
            label={iniciales}
            size="xlarge"
            shape="circle"
            className="bg-primary text-white font-bold"
          />

          <div className="flex-grow-1">
            <div className="text-xl font-bold text-900">
              {`${formValues.nombre_completo} ${formValues.apellido_completo}`.trim() || 'Docente'}
            </div>

            <div className="text-600 text-sm mt-1">
              {[
                formValues.codDocente ? `Código ${formValues.codDocente}` : null,
                formValues.especialidad || null
              ]
                .filter(Boolean)
                .join('  |  ') || 'Sin código asignado'}
            </div>
          </div>

          <Tag
            value={formValues.estado ? 'ACTIVO' : 'INACTIVO'}
            severity={formValues.estado ? 'success' : 'danger'}
          />
        </div>

        {/* ERROR GENERAL (los errores de campo se muestran bajo cada campo) */}

        {error && !error.campo && (
          <Message severity="error" text={error.mensaje} className="w-full mb-3" />
        )}

        {/* DATOS PERSONALES */}

        <Seccion icono="pi-user" titulo="Datos personales">
          <div className="formgrid grid">
            <Campo
              id="nombre_completo"
              label="Nombres"
              requerido
              error={errorDe('nombre_completo')}
            >
              <InputText
                id="nombre_completo"
                placeholder="Ingrese los nombres"
                value={formValues.nombre_completo}
                onChange={(e) => handleChange('nombre_completo', e.target.value)}
                className={`w-full ${claseInvalida('nombre_completo')}`}
                maxLength={100}
                disabled={loading}
              />
            </Campo>

            <Campo
              id="apellido_completo"
              label="Apellidos"
              requerido
              error={errorDe('apellido_completo')}
            >
              <InputText
                id="apellido_completo"
                placeholder="Ingrese los apellidos"
                value={formValues.apellido_completo}
                onChange={(e) => handleChange('apellido_completo', e.target.value)}
                className={`w-full ${claseInvalida('apellido_completo')}`}
                maxLength={100}
                disabled={loading}
              />
            </Campo>

            <Campo
              id="cedula"
              label="Cédula"
              ayuda="La fecha de nacimiento se completa sola con la fecha de la cédula."
              error={errorDe('cedula')}
            >
              <InputText
                id="cedula"
                placeholder="000-000000-0000X"
                value={formValues.cedula}
                onChange={(e) => handleCedula(e.target.value)}
                className={`w-full ${claseInvalida('cedula')}`}
                maxLength={16}
                disabled={loading}
              />
            </Campo>

            <Campo
              id="fecha_nacimiento"
              label="Fecha de nacimiento"
              requerido
              error={errorDe('fecha_nacimiento')}
            >
              <Calendar
                inputId="fecha_nacimiento"
                value={formValues.fecha_nacimiento}
                onChange={(e) => handleChange('fecha_nacimiento', e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                maxDate={new Date()}
                placeholder="dd/mm/aaaa"
                className={`w-full ${claseInvalida('fecha_nacimiento')}`}
                inputClassName="w-full"
                disabled={loading}
              />
            </Campo>

            <Campo id="sexo" label="Sexo" requerido error={errorDe('sexo')}>
              <Dropdown
                inputId="sexo"
                options={SEXO_OPTIONS}
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione sexo"
                value={formValues.sexo}
                onChange={(e) => handleChange('sexo', e.value)}
                className={`w-full ${claseInvalida('sexo')}`}
                disabled={loading}
              />
            </Campo>

            <Campo id="especialidad" label="Especialidad">
              <InputText
                id="especialidad"
                placeholder="Especialidad del docente"
                value={formValues.especialidad}
                onChange={(e) => handleChange('especialidad', e.target.value)}
                className="w-full"
                maxLength={100}
                disabled={loading}
              />
            </Campo>

            <Campo
              id="direccion"
              label="Dirección domiciliar"
              className="col-12"
              ayuda={`${(formValues.direccion || '').length}/300 caracteres`}
            >
              <InputTextarea
                id="direccion"
                placeholder="Dirección exacta del docente"
                value={formValues.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                rows={3}
                autoResize
                maxLength={300}
                className="w-full"
                disabled={loading}
              />
            </Campo>
          </div>
        </Seccion>

        {/* INFORMACIÓN DEL DOCENTE */}

        <Seccion icono="pi-briefcase" titulo="Información del docente">
          <div className="formgrid grid">
            <Campo id="idpersona" label="ID del sistema">
              <InputText id="idpersona" value={formValues.idpersona} className="w-full" disabled />
            </Campo>

            <Campo
              id="codDocente"
              label="Código de docente"
              ayuda="Se asigna al registrar y no se modifica."
            >
              <InputText
                id="codDocente"
                value={formValues.codDocente}
                className="w-full"
                disabled
              />
            </Campo>

            <Campo id="estado" label="Estado del docente">
              <div className="flex align-items-center gap-3 pt-2">
                <InputSwitch
                  inputId="estado"
                  checked={Boolean(formValues.estado)}
                  onChange={(e) => handleChange('estado', e.value)}
                  disabled={loading}
                />

                <span className="font-medium text-600">
                  {formValues.estado ? 'Docente activo' : 'Docente inactivo'}
                </span>
              </div>
            </Campo>
          </div>
        </Seccion>

        {/* BOTONES */}

        <div className="flex justify-content-end gap-2 mt-3">
          {typeof onCancel === 'function' && (
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              size="small"
              className="p-button-outlined p-button-secondary"
              onClick={onCancel}
              disabled={loading}
              style={{ width: 'auto' }}
            />
          )}

          <Button
            type="submit"
            label={loading ? 'Guardando...' : 'Guardar cambios'}
            icon="pi pi-check"
            size="small"
            severity="success"
            loading={loading}
            disabled={loading}
            style={{ width: 'auto' }}
          />
        </div>
      </form>
    </div>
  );
};

UpdateDocente.propTypes = {
  idPersona: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDocenteUpdate: PropTypes.func,
  onEstudianteUpdate: PropTypes.func,
  onCancel: PropTypes.func
};

export default UpdateDocente;
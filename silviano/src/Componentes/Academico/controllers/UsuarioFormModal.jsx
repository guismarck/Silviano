import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import usuarioService from '../../../Servicios/UsuarioService/usuarioService';
import rolService from '../../../Servicios/RolService/rolService';
import {
  getDocenteById,
  searchDocente,
} from '../../../Servicios/DocenteServicios/docenteService';

const obtenerCorreoDocente = (docente = {}) =>
  docente.email ||
  docente.correo ||
  docente.correoElectronico ||
  docente.correo_electronico ||
  '';

const generarUsernameSugerido = (nombres, apellidos) => {
  const primerNombre = nombres.trim().split(/\s+/).filter(Boolean)[0];
  const primerApellido = apellidos.trim().split(/\s+/).filter(Boolean)[0];
  if (!primerNombre || !primerApellido) return '';

  const normalizar = (texto) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '');

  return `${normalizar(primerNombre).charAt(0)}${normalizar(primerApellido)}`.toUpperCase();
};

const SEXO_OPTIONS = [
  { label: 'Femenino', value: 'F' },
  { label: 'Masculino', value: 'M' },
];

const normalizarFecha = (fecha) => {
  if (!fecha) return '';
  const valor = String(fecha).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor : '';
};

const fechaDesdeString = (fecha) => {
  const valor = normalizarFecha(fecha);
  if (!valor) return null;
  const [anio, mes, dia] = valor.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
};

const fechaAString = (fecha) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return '';
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const normalizarSexo = (sexo) => {
  const valor = String(sexo || '').trim().toUpperCase();
  if (valor.startsWith('F')) return 'F';
  if (valor.startsWith('M')) return 'M';
  return '';
};

const normalizarUsuarioFormulario = (usuario) => {
  const datosUsuario = usuario.usuario || usuario.data || usuario;
  const persona =
    datosUsuario.persona ||
    datosUsuario.datosPersona ||
    datosUsuario.personaResponseDTO ||
    {};
  const datos = { ...datosUsuario, ...persona };
  const roles = datos.roles || datos.rolesAsignados || datos.rolesIds || [];
  const nombreCompleto =
    datos.nombres ||
    datos.nombre ||
    datos.nombre_completo ||
    datos.nombreCompleto ||
    '';

  return {
    nombreCompleto,
    apellidoCompleto:
      datos.apellidos ||
      datos.apellido ||
      datos.apellido_completo ||
      datos.apellidoCompleto ||
      '',
    username: datos.username || '',
    email: datos.email || datos.correo || '',
    codigoMined: datos.codigoMined || datos.codigo_mined || '',
    cedula: datos.cedula || '',
    sexo: normalizarSexo(datos.sexo),
    fechaNacimiento: normalizarFecha(
      datos.fechaNacimiento || datos.fecha_nacimiento
    ),
    direccion: datos.direccion || '',
    password: '',
    roles: Array.isArray(roles)
      ? roles.slice(0, 1).map((rol) =>
          Number(
            rol && typeof rol === 'object'
              ? rol.id ?? rol.idRol ?? rol.id_rol
              : rol
          )
        )
      : [],
    activo: datos.activo ?? true,
  };
};

const combinarUsuarioConDetalle = (usuarioLista, detalle) => {
  const usuarioCompleto = { ...usuarioLista };
  Object.entries(detalle || {}).forEach(([campo, valor]) => {
    if (valor !== undefined && valor !== null) {
      usuarioCompleto[campo] = valor;
    }
  });
  return usuarioCompleto;
};

export const UsuarioFormModal = ({
  visible,
  onHide,
  usuarioEdit,
  onSaveSuccess,
  toastRef,
}) => {
  const isEditing = useMemo(() => Boolean(usuarioEdit?.id), [usuarioEdit]);

  const initialState = useMemo(
    () => ({
      nombreCompleto: '',
      apellidoCompleto: '',
      username: '',
      email: '',
      codigoMined: '',
      cedula: '',
      sexo: '',
      fechaNacimiento: '',
      direccion: '',
      password: '',
      roles: [], // Array de nombres de rol o IDs devueltos por la API
      activo: true,
    }),
    []
  );

  const [formData, setFormData] = useState(initialState);
  const [rolesCatalogo, setRolesCatalogo] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [busquedaDocente, setBusquedaDocente] = useState('');
  const [sugerenciasDocentes, setSugerenciasDocentes] = useState([]);
  const [loadingDocentes, setLoadingDocentes] = useState(false);
  const [loadingDocenteDetalle, setLoadingDocenteDetalle] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const docenteDetalleRequestId = useRef(0);

  // Carga asíncrona del catálogo de roles desde el backend al abrir el modal
  const cargarRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const rolesData = await rolService.obtenerRoles();
      // Formateo del catálogo para MultiSelect
      const opcionesFormatted = rolesData.map((r) => ({
        label: r.descripcion || r.nombre,
        value: Number(r.id),
        codigo: r.codigo || r.nombre || r.descripcion,
      }));
      setRolesCatalogo(opcionesFormatted);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Catálogo de Roles',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoadingRoles(false);
    }
  }, [toastRef]);

  useEffect(() => {
    docenteDetalleRequestId.current += 1;
    setLoadingDocenteDetalle(false);
    if (!visible) return undefined;

    let active = true;
    cargarRoles();
    setFormData(usuarioEdit ? normalizarUsuarioFormulario(usuarioEdit) : initialState);
    setBusquedaDocente('');
    setSugerenciasDocentes([]);
    setDocenteSeleccionado(null);
    setUsernameError('');

    if (usuarioEdit?.id) {
      setLoadingUserDetails(true);
      usuarioService
        .obtenerPorId(usuarioEdit.id)
        .then((detalle) => {
          if (active) {
            setFormData(
              normalizarUsuarioFormulario(
                combinarUsuarioConDetalle(usuarioEdit, detalle)
              )
            );
          }
        })
        .catch((error) => {
          if (active) {
            toastRef.current?.show({
              severity: 'error',
              summary: 'No se pudieron cargar los datos completos',
              detail: error.message,
              life: 4000,
            });
          }
        })
        .finally(() => {
          if (active) setLoadingUserDetails(false);
        });
    }

    return () => {
      active = false;
    };
  }, [visible, usuarioEdit, initialState, cargarRoles, toastRef]);

  const esRolDocente = useCallback(
    (roleId) =>
      rolesCatalogo.some(
        (rol) =>
          String(rol.value) === String(roleId) &&
          String(rol.codigo).toUpperCase().replace(/^ROLE_/, '') === 'DOCENTE'
      ),
    [rolesCatalogo]
  );

  const requiereSeleccionDocente =
    !isEditing && formData.roles.some(esRolDocente);
  const usernameSugerido = generarUsernameSugerido(
    formData.nombreCompleto,
    formData.apellidoCompleto
  );

  const handleCompleteDocentes = async (e) => {
    const query = e.query?.trim() || '';
    if (!query) {
      setSugerenciasDocentes([]);
      return;
    }

    setLoadingDocentes(true);
    try {
      const resultados = await searchDocente(query);
      setSugerenciasDocentes(
        (Array.isArray(resultados) ? resultados : []).map((docente) => {
          const nombreCompleto =
            docente.nombre_completo || docente.nombres || docente.nombreCompleto || '';
          const apellidoCompleto =
            docente.apellido_completo || docente.apellidos || docente.apellidoCompleto || '';
          const codigoDocente =
            docente.codDocente || docente.codigoDocente || docente.codigo || '';

          return {
            ...docente,
            idPersona: docente.idPersona || docente.idpersona || docente.id,
            nombreCompleto,
            apellidoCompleto,
            nombreCompletoMostrar:
              docente.nombreCompleto ||
              `${nombreCompleto} ${apellidoCompleto}`.trim(),
            cedula: docente.cedula || docente.cedulaDni || docente.cedula_dni || '',
            codigoDocente,
            labelDocente: codigoDocente
              ? `[${codigoDocente}] - ${nombreCompleto} ${apellidoCompleto}`.trim()
              : `${nombreCompleto} ${apellidoCompleto}`.trim(),
          };
        })
      );
    } catch (error) {
      setSugerenciasDocentes([]);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de Búsqueda',
        detail: error.message || 'No se pudieron cargar los docentes.',
        life: 4000,
      });
    } finally {
      setLoadingDocentes(false);
    }
  };

  const handleSelectDocente = async (e) => {
    const docente = e.value;
    if (!docente) return;

    const requestId = ++docenteDetalleRequestId.current;
    setDocenteSeleccionado(docente);
    setBusquedaDocente(docente.labelDocente || docente.nombreCompletoMostrar || '');
    setFormData((prev) => ({
      ...prev,
      nombreCompleto: docente.nombreCompleto || '',
      apellidoCompleto: docente.apellidoCompleto || '',
      cedula: docente.cedula || '',
      email: obtenerCorreoDocente(docente),
      sexo: normalizarSexo(docente.sexo),
      fechaNacimiento: normalizarFecha(
        docente.fecha_nacimiento || docente.fechaNacimiento
      ),
      direccion: docente.direccion || '',
    }));

    setLoadingDocenteDetalle(true);
    try {
      const detalle = await getDocenteById(docente.idPersona);
      if (requestId === docenteDetalleRequestId.current) {
        setFormData((prev) => ({
          ...prev,
          email: obtenerCorreoDocente(detalle) || obtenerCorreoDocente(docente),
        }));
      }
    } catch (error) {
      if (requestId === docenteDetalleRequestId.current) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'No se pudo cargar el correo del docente',
          detail: error.message,
          life: 4000,
        });
      }
    } finally {
      if (requestId === docenteDetalleRequestId.current) {
        setLoadingDocenteDetalle(false);
      }
    }
  };

  const docenteItemTemplate = (docente) => (
    <div className="flex align-items-center justify-content-between p-1">
      <div>
        <span className="font-bold block text-800">{docente.labelDocente}</span>
        {docente.cedula && <small className="text-500">Cédula: {docente.cedula}</small>}
      </div>
      {docente.codigoDocente && (
        <span className="p-tag p-tag-info font-normal text-xs">
          Código: {docente.codigoDocente}
        </span>
      )}
    </div>
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'nombreCompleto' || name === 'apellidoCompleto') {
      docenteDetalleRequestId.current += 1;
      setLoadingDocenteDetalle(false);
      setDocenteSeleccionado(null);
      setBusquedaDocente('');
    }
  }, []);

  const handleRolesChange = (e) => {
    setFormData((prev) => ({ ...prev, roles: e.value }));
    if (!e.value.some(esRolDocente)) {
      docenteDetalleRequestId.current += 1;
      setLoadingDocenteDetalle(false);
      setDocenteSeleccionado(null);
      setBusquedaDocente('');
      setSugerenciasDocentes([]);
    }
  };

  // Validación en blur de la disponibilidad de username
  const handleUsernameBlur = async () => {
    const usernameTrimmed = formData.username.trim();
    if (!usernameTrimmed) return;

    setCheckingUsername(true);
    setUsernameError('');

    try {
      const existe = await usuarioService.verificarUsernameExistente(
        usernameTrimmed,
        usuarioEdit?.id || null
      );
      if (existe) {
        setUsernameError(`El nombre de usuario "${usernameTrimmed}" ya está ocupado.`);
      }
    } catch (error) {
      console.error('Error validando disponibilidad:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingUserDetails || loadingDocenteDetalle) return;

    if (usernameError) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Usuario Invalido',
        detail: 'Corrija el nombre de usuario antes de continuar.',
        life: 3000,
      });
      return;
    }

    if (
      !formData.nombreCompleto.trim() ||
      (!isEditing &&
        !requiereSeleccionDocente &&
        (!formData.apellidoCompleto.trim() ||
          !formData.sexo ||
          !formData.fechaNacimiento ||
          !formData.direccion.trim())) ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      formData.roles.length === 0 ||
      (!isEditing && !formData.password)
    ) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Campos Incompletos',
        detail: 'Por favor llene los campos obligatorios (*).',
        life: 3000,
      });
      return;
    }

    if (requiereSeleccionDocente && !docenteSeleccionado) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Seleccione un docente',
        detail: 'Para crear un usuario con rol DOCENTE, busque y seleccione un docente registrado.',
        life: 4000,
      });
      return;
    }

    setLoadingSubmit(true);
    try {
      const payload = isEditing
        ? {
            username: formData.username.trim(),
            nombres: formData.nombreCompleto.trim(),
            apellidos: formData.apellidoCompleto.trim(),
            sexo: formData.sexo,
            fechaNacimiento: formData.fechaNacimiento || null,
            direccion: formData.direccion.trim(),
            email: formData.email.trim().toLowerCase(),
            estado: formData.activo ? 1 : 0,
            rolesIds: formData.roles.map(Number),
          }
        : {
            idPersona: docenteSeleccionado?.idPersona ?? null,
            cedula: formData.cedula.trim(),
            nombres: formData.nombreCompleto.trim(),
            apellidos: formData.apellidoCompleto.trim(),
            sexo: formData.sexo,
            fechaNacimiento: formData.fechaNacimiento || null,
            direccion: formData.direccion.trim(),
            username: formData.username.trim(),
            password: formData.password,
            estado: 1,
            rolesIds: formData.roles.map(Number),
          };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditing) {
        await usuarioService.actualizarUsuario(usuarioEdit.id, payload);
        toastRef.current?.show({
          severity: 'success',
          summary: 'Actualización Exitosa',
          detail: `Los roles y datos de ${payload.username} han sido guardados.`,
          life: 3000,
        });
      } else {
        await usuarioService.crearUsuario(payload);
        toastRef.current?.show({
          severity: 'success',
          summary: 'Usuario Registrado',
          detail: `Usuario ${payload.username} creado con sus roles asignados.`,
          life: 3000,
        });
      }

      onSaveSuccess();
      onHide();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error al Guardar',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Dialog
      header={isEditing ? 'Editar Usuario y Asignar Roles' : 'Crear Usuario Escolar'}
      visible={visible}
      style={{ width: '90vw', maxWidth: '650px' }}
      onHide={onHide}
      draggable={false}
      resizable={false}
      className="p-fluid"
      appendTo={typeof window !== 'undefined' ? document.body : undefined}
      blockScroll
    >
      <form onSubmit={handleSubmit} className="grid grid-nogutter row-gap-3 mt-1" autoComplete="off">
        {loadingUserDetails && (
          <div className="col-12 text-primary text-sm">
            <i className="pi pi-spin pi-spinner mr-2" />
            Cargando datos completos del usuario...
          </div>
        )}

        <div className="col-12 col-md-6 pl-0 md:pl-2">
          <label htmlFor="roles" className="block text-xs font-semibold text-700 mb-1">
            {isEditing ? 'Roles Asignados *' : 'Asignar Rol *'}
          </label>
          <Dropdown
            id="roles"
            name="roles"
            value={formData.roles[0] ?? null}
            options={rolesCatalogo}
            onChange={(e) => handleRolesChange({ value: e.value ? [e.value] : [] })}
            optionLabel="label"
            optionValue="value"
            placeholder={loadingRoles ? 'Cargando roles...' : 'Seleccione roles'}
            loading={loadingRoles}
            disabled={loadingSubmit || loadingRoles || loadingUserDetails}
            className="w-full"
          />
        </div>

        {requiereSeleccionDocente && (
          <div className="col-12">
            <label htmlFor="busquedaDocente" className="block text-xs font-semibold text-700 mb-1">
              Buscar docente por nombre, cédula o código *
            </label>
            <AutoComplete
              id="busquedaDocente"
              value={busquedaDocente}
              suggestions={sugerenciasDocentes}
              completeMethod={handleCompleteDocentes}
              field="labelDocente"
              itemTemplate={docenteItemTemplate}
              onChange={(e) => {
                const value = e.value;
                setBusquedaDocente(
                  typeof value === 'string' ? value : value?.labelDocente || ''
                );
                if (typeof value === 'string') {
                  docenteDetalleRequestId.current += 1;
                  setLoadingDocenteDetalle(false);
                  setDocenteSeleccionado(null);
                }
              }}
              onSelect={handleSelectDocente}
              placeholder="Escriba nombre, cédula o código del docente..."
              loading={loadingDocentes}
              dropdown
              emptyMessage="No se encontraron docentes"
              className="w-full"
              disabled={loadingSubmit || loadingUserDetails}
            />
            {loadingDocenteDetalle && (
              <small className="text-primary block mt-1">
                <i className="pi pi-spin pi-spinner mr-1" />
                Cargando correo del docente...
              </small>
            )}
          </div>
        )}

        <div className="col-12 col-md-6 pr-0 md:pr-2">
          <label htmlFor="nombreCompleto" className="block text-xs font-semibold text-700 mb-1">
            Nombres *
          </label>
          <InputText
            id="nombreCompleto"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            placeholder="Nombres"
            maxLength={150}
            autoComplete="off"
            disabled={loadingSubmit || loadingUserDetails || Boolean(docenteSeleccionado)}
          />
        </div>

        <div className="col-12 col-md-6 pl-0 md:pl-2">
          <label htmlFor="apellidoCompleto" className="block text-xs font-semibold text-700 mb-1">
            Apellidos *
          </label>
          <InputText
            id="apellidoCompleto"
            name="apellidoCompleto"
            value={formData.apellidoCompleto}
            onChange={handleChange}
            placeholder="Apellidos"
            maxLength={150}
            autoComplete="off"
            disabled={loadingSubmit || loadingUserDetails || Boolean(docenteSeleccionado)}
          />
        </div>

        <div className="col-12 col-md-6 pr-0 md:pr-2">
          <label htmlFor="sexo" className="block text-xs font-semibold text-700 mb-1">
            Sexo *
          </label>
          <Dropdown
            id="sexo"
            name="sexo"
            value={formData.sexo}
            options={SEXO_OPTIONS}
            optionLabel="label"
            optionValue="value"
            onChange={handleChange}
            placeholder="Seleccione el sexo"
            disabled={loadingSubmit || loadingUserDetails || Boolean(docenteSeleccionado)}
          />
        </div>

        <div className="col-12 col-md-6 pl-0 md:pl-2">
          <label htmlFor="fechaNacimiento" className="block text-xs font-semibold text-700 mb-1">
            Fecha de nacimiento *
          </label>
          <Calendar
            inputId="fechaNacimiento"
            value={fechaDesdeString(formData.fechaNacimiento)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                fechaNacimiento: fechaAString(e.value),
              }))
            }
            dateFormat="dd/mm/yy"
            showIcon
            maxDate={new Date()}
            placeholder="dd/mm/aaaa"
            disabled={loadingSubmit || loadingUserDetails || Boolean(docenteSeleccionado)}
          />
        </div>

        <div className="col-12">
          <label htmlFor="direccion" className="block text-xs font-semibold text-700 mb-1">
            Dirección *
          </label>
          <InputTextarea
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows={2}
            autoResize
            maxLength={300}
            placeholder="Dirección de residencia"
            disabled={loadingSubmit || loadingUserDetails || Boolean(docenteSeleccionado)}
          />
        </div>

        <div className="col-12 col-md-6 pr-0 md:pr-2">
          <label htmlFor="username" className="block text-xs font-semibold text-700 mb-1">
            Username / Usuario *
          </label>
          <div className="p-input-icon-right w-full">
            {checkingUsername && <i className="pi pi-spin pi-spinner" />}
            <InputText
              id="username"
              name="username"
              value={formData.username}
              onChange={(e) => {
                handleChange(e);
                if (usernameError) setUsernameError('');
              }}
              onBlur={handleUsernameBlur}
              placeholder="Ej. WGUZMAN"
              className={usernameError ? 'p-invalid' : ''}
              autoComplete="off"
              disabled={loadingSubmit || loadingUserDetails}
            />
          </div>
          {usernameSugerido && (
            <Button
              type="button"
              label={`Usar sugerencia: ${usernameSugerido}`}
              icon="pi pi-refresh"
              className="p-button-text p-button-sm p-0 mt-1"
              onClick={() => {
                setFormData((prev) => ({ ...prev, username: usernameSugerido }));
                setUsernameError('');
              }}
              disabled={loadingSubmit || loadingUserDetails}
            />
          )}
          {usernameError && <small className="p-error block mt-1">{usernameError}</small>}
        </div>

        <div className="col-12 col-md-6 pl-0 md:pl-2">
          <label htmlFor="email" className="block text-xs font-semibold text-700 mb-1">
            Correo Electrónico *
          </label>
          <InputText
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="docente@mined.gob.ni"
            autoComplete="off"
            disabled={loadingSubmit || loadingUserDetails || loadingDocenteDetalle}
          />
        </div>

        <div className="col-12 col-md-6 pr-0 md:pr-2">
          <label htmlFor="password" className="block text-xs font-semibold text-700 mb-1">
            {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
          </label>
          <Password
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            toggleMask
            feedback={!isEditing}
            promptLabel="Ingrese una contraseña"
            weakLabel="Débil"
            mediumLabel="Media"
            strongLabel="Fuerte"
            placeholder={isEditing ? 'Dejar vacío si no cambia' : '••••••••'}
            autoComplete="new-password"
            disabled={loadingSubmit || loadingUserDetails}
          />
        </div>

        <div className="col-12 flex align-items-center gap-3 surface-100 p-3 border-round border-1 surface-border mt-2">
          <InputSwitch
            inputId="activo"
            checked={formData.activo}
            onChange={(e) => handleChange({ target: { name: 'activo', value: e.value } })}
            disabled={!isEditing || loadingSubmit || loadingUserDetails}
          />
          <label htmlFor="activo" className="text-sm font-semibold text-700 cursor-pointer">
            Estado
          </label>
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-secondary"
            onClick={onHide}
            disabled={loadingSubmit}
          />
          <Button
            type="submit"
            label={loadingSubmit ? 'Procesando...' : isEditing ? 'Guardar Cambios' : 'Registrar'}
            icon={loadingSubmit ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            loading={loadingSubmit}
            disabled={loadingUserDetails || loadingDocenteDetalle}
            className="p-button-success font-bold"
          />
        </div>
      </form>
    </Dialog>
  );
};

import React, {
    useState,
    useEffect,
    useCallback,
    useRef
} from 'react';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';

import { CedulaInput } from '../../Componentes/CedulaComponent/cedulaInput';
import { extraerFechaNacimientoCedula } from '../../Util/validaciones/ValidacionGenericas';

import {
    updateTutorService,
    getTutorById
} from '../tutorService';

import { ValidarEditarTutor } from './validacionEditarTutor';

import './EditarTutores.css';

const SEXO_OPTIONS = [
    { label: 'Femenino', value: 'F' },
    { label: 'Masculino', value: 'M' }
];

const estadoInicial = {
    nombre_completo: '',
    apellido_completo: '',
    sexo: '',
    direccion: '',
    partida_nacimiento: 'no',
    fecha_nacimiento: null,
    cedula: '',
    ocupacion: '',
    telefonoPrincipal: '',
    telefonoSecundario: ''
};

const parseDateFromDB = (dateString) => {
    if (!dateString) return null;

    // Si la fecha viene en formato YYYY-MM-DD, convertirla
    // sin usar new Date(string), para evitar desfases horarios.
    const [year, month, day] = String(dateString).split('-');

    if (!year || !month || !day) return null;

    const fecha = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const formatDateToDB = (dateObj) => {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
        return null;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const UpdateTutor = ({
    idPersona,
    onTutorUpdate,
    onCancel
}) => {
    const toast = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [tutorInfo, setTutorInfo] = useState(estadoInicial);
    const [errores, setErrores] = useState({});
    const [cedulaValida, setCedulaValida] = useState(false);

    const fetchTutorData = useCallback(async () => {
        if (!idPersona) {
            setFetching(false);
            return;
        }

        setFetching(true);

        try {
            const data = await getTutorById(idPersona);

            setTutorInfo({
                ...estadoInicial,
                ...data,
                fecha_nacimiento: parseDateFromDB(data.fecha_nacimiento),
                cedula: data.cedula || '',
                telefonoPrincipal: data.telefonoPrincipal || '',
                telefonoSecundario: data.telefonoSecundario || '',
                ocupacion: data.ocupacion || '',
                direccion: data.direccion || '',
                sexo: data.sexo || ''
            });

            // Los datos existentes se cargan desde un expediente guardado.
            // Al editar la cédula, CedulaInput volverá a informar su validez.
            setCedulaValida(Boolean(data.cedula));
            setErrores({});
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de carga',
                detail: 'No se pudo obtener la información del tutor.',
                life: 4000
            });
        } finally {
            setFetching(false);
        }
    }, [idPersona]);

    useEffect(() => {
        fetchTutorData();
    }, [fetchTutorData]);

    const handleChange = (campo, valor) => {
        setTutorInfo(prev => ({
            ...prev,
            [campo]: valor
        }));

        // Quitar el error del campo al empezar a corregirlo.
        setErrores(prev => ({
            ...prev,
            [campo]: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const resultado = ValidarEditarTutor(
            tutorInfo,
            cedulaValida
        );

        setErrores(resultado.errores);

        if (!resultado.esValido) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Revise el formulario',
                detail: 'Complete los campos obligatorios y corrija los datos indicados.',
                life: 3500
            });

            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...tutorInfo,
                nombre_completo: tutorInfo.nombre_completo.trim(),
                apellido_completo: tutorInfo.apellido_completo.trim(),
                direccion: tutorInfo.direccion.trim(),
                ocupacion: tutorInfo.ocupacion.trim(),
                telefonoPrincipal: tutorInfo.telefonoPrincipal.trim(),
                telefonoSecundario: tutorInfo.telefonoSecundario.trim(),
                fecha_nacimiento: formatDateToDB(tutorInfo.fecha_nacimiento)
            };

            await updateTutorService(idPersona, payload);

            // El componente padre recarga la tabla y cierra el diálogo.
            if (typeof onTutorUpdate === 'function') {
                onTutorUpdate();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error al actualizar',
                detail:
                    error?.response?.data?.message ||
                    'No se pudieron actualizar los datos del tutor.',
                life: 4500
            });
        } finally {
            setLoading(false);
        }
    };

    const campoConError = (campo) => (
        errores[campo]
            ? <small className="p-error tutor-error">{errores[campo]}</small>
            : null
    );

    if (fetching) {
        return (
            <div className="tutor-loading">
                <i className="pi pi-spin pi-spinner" />
                <span>Cargando expediente del tutor...</span>
            </div>
        );
    }

    return (
        <div className="editar-tutor">
            <Toast ref={toast} />

            <div className="tutor-form-heading">
                <div className="tutor-heading-icon">
                    <i className="pi pi-user-edit" />
                </div>

                <div>
                    <h2>Actualizar expediente</h2>
                    <p>Modifique los datos personales y de contacto del tutor.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <Card className="tutor-form-card">
                    <div className="tutor-section-title">
                        <i className="pi pi-user" />
                        <span>Información personal</span>
                    </div>

                    <div className="tutor-form-grid">
                        <div className="tutor-field">
                            <label htmlFor="nombre_completo">
                                Nombres <span>*</span>
                            </label>

                            <InputText
                                id="nombre_completo"
                                value={tutorInfo.nombre_completo}
                                placeholder="Ingrese los nombres"
                                className={errores.nombre_completo ? 'p-invalid' : ''}
                                onChange={e => handleChange(
                                    'nombre_completo',
                                    e.target.value
                                )}
                                maxLength={100}
                                disabled={loading}
                            />

                            {campoConError('nombre_completo')}
                        </div>

                        <div className="tutor-field">
                            <label htmlFor="apellido_completo">
                                Apellidos <span>*</span>
                            </label>

                            <InputText
                                id="apellido_completo"
                                value={tutorInfo.apellido_completo}
                                placeholder="Ingrese los apellidos"
                                className={errores.apellido_completo ? 'p-invalid' : ''}
                                onChange={e => handleChange(
                                    'apellido_completo',
                                    e.target.value
                                )}
                                maxLength={100}
                                disabled={loading}
                            />

                            {campoConError('apellido_completo')}
                        </div>

                        <div className="tutor-field">
                            <label htmlFor="sexo">
                                Sexo <span>*</span>
                            </label>

                            <Dropdown
                                id="sexo"
                                value={tutorInfo.sexo}
                                options={SEXO_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Seleccione el sexo"
                                className={errores.sexo ? 'p-invalid' : ''}
                                onChange={e => handleChange('sexo', e.value)}
                                disabled={loading}
                            />

                            {campoConError('sexo')}
                        </div>

                        <div className="tutor-field">
                            <label htmlFor="fecha_nacimiento">
                                Fecha de nacimiento <span>*</span>
                            </label>

                            <Calendar
                                id="fecha_nacimiento"
                                value={tutorInfo.fecha_nacimiento}
                                onChange={e => handleChange(
                                    'fecha_nacimiento',
                                    e.value
                                )}
                                dateFormat="dd/mm/yy"
                                placeholder="Día / Mes / Año"
                                showIcon
                                maxDate={new Date()}
                                className={errores.fecha_nacimiento ? 'p-invalid' : ''}
                                disabled={loading}
                            />

                            {campoConError('fecha_nacimiento')}
                        </div>

                        <div className="tutor-field tutor-field-full">
                            <label htmlFor="cedula">
                                Cédula <span>*</span>
                            </label>

                            <CedulaInput
                                value={tutorInfo.cedula}
                                onChange={e => handleChange(
                                    'cedula',
                                    e.target.value
                                )}
                                onValidChage={(esValida, numeroCedula) => {
                                    setCedulaValida(esValida);

                                    if (esValida) {
                                        setErrores(prev => ({
                                            ...prev,
                                            cedula: ''
                                        }));

                                        const resultado =
                                            extraerFechaNacimientoCedula(
                                                numeroCedula
                                            );

                                        if (
                                            resultado.esValida &&
                                            resultado.fechaNacimiento
                                        ) {
                                            handleChange(
                                                'fecha_nacimiento',
                                                resultado.fechaNacimiento
                                            );
                                        }
                                    }
                                }}
                            />

                            {campoConError('cedula')}
                        </div>

                        <div className="tutor-field tutor-field-full">
                            <label htmlFor="direccion">
                                Dirección domiciliar <span>*</span>
                            </label>

                            <InputText
                                id="direccion"
                                value={tutorInfo.direccion}
                                placeholder="Barrio, municipio, referencias"
                                className={errores.direccion ? 'p-invalid' : ''}
                                onChange={e => handleChange(
                                    'direccion',
                                    e.target.value
                                )}
                                maxLength={200}
                                disabled={loading}
                            />

                            {campoConError('direccion')}
                        </div>
                    </div>
                </Card>

                <Card className="tutor-form-card">
                    <div className="tutor-section-title">
                        <i className="pi pi-phone" />
                        <span>Información de contacto</span>
                    </div>

                    <div className="tutor-form-grid">
                        <div className="tutor-field">
                            <label htmlFor="ocupacion">
                                Ocupación <span>*</span>
                            </label>

                            <InputText
                                id="ocupacion"
                                value={tutorInfo.ocupacion}
                                placeholder="Ej. Docente, comerciante"
                                className={errores.ocupacion ? 'p-invalid' : ''}
                                onChange={e => handleChange(
                                    'ocupacion',
                                    e.target.value
                                )}
                                maxLength={100}
                                disabled={loading}
                            />

                            {campoConError('ocupacion')}
                        </div>

                        <div className="tutor-field">
                            <label htmlFor="telefonoPrincipal">
                                Teléfono principal <span>*</span>
                            </label>

                            <InputText
                                id="telefonoPrincipal"
                                value={tutorInfo.telefonoPrincipal}
                                placeholder="8 dígitos"
                                keyfilter="int"
                                maxLength={8}
                                className={errores.telefonoPrincipal ? 'p-invalid' : ''}
                                onChange={e => handleChange(
                                    'telefonoPrincipal',
                                    e.target.value
                                )}
                                disabled={loading}
                            />

                            {campoConError('telefonoPrincipal')}
                        </div>

                        <div className="tutor-field">
                            <label htmlFor="telefonoSecundario">
                                Teléfono secundario
                            </label>

                            <InputText
                                id="telefonoSecundario"
                                value={tutorInfo.telefonoSecundario}
                                placeholder="Opcional, 8 dígitos"
                                keyfilter="int"
                                maxLength={8}
                                className={errores.telefonoSecundario ? 'p-invalid' : ''}
                                onChange={e => handleChange(
                                    'telefonoSecundario',
                                    e.target.value
                                )}
                                disabled={loading}
                            />

                            {campoConError('telefonoSecundario')}
                        </div>
                    </div>
                </Card>

                <div className="tutor-required-note">
                    <span>*</span> Campos obligatorios
                </div>

                <Divider />

                <div className="tutor-form-actions">
                    <Button
                        type="button"
                        label="Cancelar"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        onClick={onCancel}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        label={loading ? 'Guardando...' : 'Guardar cambios'}
                        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        severity="success"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default UpdateTutor;

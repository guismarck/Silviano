import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import { extraerFechaNacimientoCedula } from '../../Util/validaciones/ValidacionGenericas';
import { CedulaInput } from '../../Componentes/CedulaComponent/cedulaInput';
import { generarCodigoDocente } from '../../Util/validaciones/CodigoDocente.js';

import { ServicioValidado, getDocentes } from '../../Servicios/DocenteServicios/docenteService';

// =========================================================
// CONSTANTES
// =========================================================

const SEXO_OPTIONS = [
    { label: 'Femenino', value: 'F' },
    { label: 'Masculino', value: 'M' }
];

const DOCENTE_INICIAL = {
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

// Las validaciones de ValidarDocente devuelven un mensaje de texto. Para
// marcar el campo afectado se busca a qué campo se refiere ese mensaje.
// Si no coincide con ninguno, el mensaje se muestra arriba del formulario.
const CAMPOS_POR_TEXTO = [
    ['Nombres', 'nombre_completo'],
    ['Apellidos', 'apellido_completo'],
    ['Especialidad', 'especialidad'],
    ['Código Docente', 'codDocente'],
    ['sexo', 'sexo'],
    ['Fecha de Nacimiento', 'fecha_nacimiento']
];

const campoDelError = (mensaje = '') =>
    CAMPOS_POR_TEXTO.find(([texto]) => mensaje.includes(texto))?.[1] ?? null;

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

function AddDocente(props) {
    const toast = useRef(null);

    const [docenteInfo, setDocenteInfo] = useState(DOCENTE_INICIAL);
    const [loading, setLoading] = useState(false);

    // { campo: 'nombre_completo' | ... | null, mensaje: string }
    const [error, setError] = useState(null);

    // Códigos ya registrados, para calcular el consecutivo del nuevo código.
    const [codigosExistentes, setCodigosExistentes] = useState([]);

    // ---------------------------------------------------------
    // CARGAR CÓDIGOS EXISTENTES
    // ---------------------------------------------------------

    useEffect(() => {
        const cargarCodigos = async () => {
            try {
                const respuesta = await getDocentes();

                const lista = Array.isArray(respuesta)
                    ? respuesta
                    : respuesta?.content ?? [];

                setCodigosExistentes(
                    lista.map(d => d.codDocente).filter(Boolean)
                );
            } catch (err) {
                console.error('No se pudieron cargar los códigos existentes:', err);
            }
        };

        cargarCodigos();
    }, []);

    // ---------------------------------------------------------
    // AUTOGENERAR EL CÓDIGO
    // Se recalcula cuando cambian nombres o apellidos.
    // ---------------------------------------------------------

    useEffect(() => {
        const codigo = generarCodigoDocente(
            docenteInfo.nombre_completo,
            docenteInfo.apellido_completo,
            codigosExistentes
        );

        setDocenteInfo(prev =>
            prev.codDocente === codigo ? prev : { ...prev, codDocente: codigo }
        );
    }, [docenteInfo.nombre_completo, docenteInfo.apellido_completo, codigosExistentes]);

    // ---------------------------------------------------------
    // CAMBIOS EN EL FORMULARIO
    // Siempre con función, porque la cédula actualiza dos campos
    // (cédula y fecha) casi al mismo tiempo.
    // ---------------------------------------------------------

    const handleChange = (campo, valor) => {
        setDocenteInfo(prev => ({ ...prev, [campo]: valor }));
        setError(null);
    };

    // Cuando la cédula es válida, su fecha pasa al campo de fecha de nacimiento.
    const handleCedulaValida = (esValida, numeroCedula) => {
        if (!esValida) return;

        const resultado = extraerFechaNacimientoCedula(numeroCedula);

        if (resultado.esValida && resultado.fechaNacimiento) {
            handleChange('fecha_nacimiento', resultado.fechaNacimiento);
        }
    };

    // ---------------------------------------------------------
    // GUARDAR
    // La validación de campos y el envío los hace ServicioValidado.
    // ---------------------------------------------------------

    const guardarDocente = async (e) => {
        if (e) e.preventDefault();

        if (loading) return;

        setError(null);
        setLoading(true);

        try {
            await ServicioValidado(docenteInfo);

            toast.current?.show({
                severity: 'success',
                summary: 'Registro exitoso',
                detail: 'El docente se ha guardado correctamente.',
                life: 3000
            });

            // Se da tiempo a ver el aviso antes de cerrar el modal.
            setTimeout(() => {
                if (props.cargarDocente) props.cargarDocente();
                if (props.setDocentedoAdd) props.setDocentedoAdd(false);
            }, 1200);
        } catch (err) {
            console.error('Error al registrar docente:', err);

            const respuestaError = err.response?.data;

            const mensaje =
                typeof respuestaError === 'string'
                    ? respuestaError
                    : respuestaError?.mensaje ||
                      respuestaError?.message ||
                      err.message ||
                      'Error al procesar el registro.';

            setError({ campo: campoDelError(mensaje), mensaje });

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

    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------

    return (
        <div className="p-2 md:p-3">
            <Toast ref={toast} />

            <form onSubmit={guardarDocente} className="p-fluid" noValidate>

                <p className="text-600 text-sm mt-0 mb-3">
                    Complete los datos del docente. Los campos marcados con
                    <span className="text-red-500"> *</span> son obligatorios.
                </p>

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
                                placeholder="Nombres del docente"
                                value={docenteInfo.nombre_completo}
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
                                placeholder="Apellidos del docente"
                                value={docenteInfo.apellido_completo}
                                onChange={(e) => handleChange('apellido_completo', e.target.value)}
                                className={`w-full ${claseInvalida('apellido_completo')}`}
                                maxLength={100}
                                disabled={loading}
                            />
                        </Campo>

                        <Campo
                            id="cedula"
                            label="Cédula"
                            ayuda="Al completarla, la fecha de nacimiento se llena sola."
                        >
                            <CedulaInput
                                value={docenteInfo.cedula}
                                onChange={(e) => handleChange('cedula', e.target.value)}
                                onValidChage={handleCedulaValida}
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
                                value={docenteInfo.fecha_nacimiento}
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
                                value={docenteInfo.sexo}
                                onChange={(e) => handleChange('sexo', e.value)}
                                className={`w-full ${claseInvalida('sexo')}`}
                                disabled={loading}
                            />
                        </Campo>

                        <Campo
                            id="especialidad"
                            label="Especialidad"
                            requerido
                            error={errorDe('especialidad')}
                        >
                            <InputText
                                id="especialidad"
                                placeholder="Especialidad del docente"
                                value={docenteInfo.especialidad}
                                onChange={(e) => handleChange('especialidad', e.target.value)}
                                className={`w-full ${claseInvalida('especialidad')}`}
                                maxLength={100}
                                disabled={loading}
                            />
                        </Campo>

                        <Campo
                            id="direccion"
                            label="Dirección domiciliar"
                            className="col-12"
                            ayuda={`${docenteInfo.direccion.length}/300 caracteres`}
                        >
                            <InputTextarea
                                id="direccion"
                                placeholder="Dirección exacta del docente"
                                value={docenteInfo.direccion}
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
                            <InputText
                                id="idpersona"
                                placeholder="Autogenerado"
                                className="w-full"
                                disabled
                            />
                        </Campo>

                        <Campo
                            id="codDocente"
                            label="Código de docente"
                            requerido
                            ayuda="Se genera con las iniciales de nombres y apellidos más un consecutivo."
                            error={errorDe('codDocente')}
                        >
                            <InputText
                                id="codDocente"
                                placeholder="Se genera automáticamente"
                                value={docenteInfo.codDocente}
                                className={`w-full ${claseInvalida('codDocente')}`}
                                maxLength={20}
                                disabled
                            />
                        </Campo>

                        <Campo id="estado" label="Estado del docente">
                            <div className="flex align-items-center gap-3 pt-2">
                                <InputSwitch
                                    inputId="estado"
                                    checked={Boolean(docenteInfo.estado)}
                                    onChange={(e) => handleChange('estado', e.value)}
                                    disabled={loading}
                                />

                                <span className="font-medium text-600">
                                    {docenteInfo.estado ? 'Docente activo' : 'Docente inactivo'}
                                </span>
                            </div>
                        </Campo>

                    </div>
                </Seccion>

                {/* BOTONES */}

                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        type="button"
                        label="Cancelar"
                        icon="pi pi-times"
                        size="small"
                        className="p-button-outlined p-button-secondary"
                        onClick={() => props.setDocentedoAdd?.(false)}
                        disabled={loading}
                        style={{ width: 'auto' }}
                    />

                    <Button
                        type="submit"
                        label={loading ? 'Guardando...' : 'Guardar docente'}
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
}

AddDocente.propTypes = {
    cargarDocente: PropTypes.func,
    setDocentedoAdd: PropTypes.func
};

export default AddDocente;
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import { extraerFechaNacimientoCedula } from '../../Util/validaciones/ValidacionGenericas';
import { CedulaInput } from '../../Componentes/CedulaComponent/cedulaInput';
import { generarCodigoDocente } from '../../Util/validaciones/CodigoDocente.js';

// NUEVO: edad mínima del docente (18 años cumplidos).
import { validarEdadMinima } from '../../Util/validaciones/ValidacionEdad.js';
import { EDAD_MINIMA_DOCENTE } from '../../Util/validaciones/validacionDocente.js';

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
    telefono: '',
    email: '',
    sexo: ''
};

const MENSAJE_CODIGO_REPETIDO =
    'Ya existe un docente con este código (mismas iniciales y fecha de nacimiento).';

// Las validaciones de ValidarDocente devuelven un mensaje de texto. Para
// marcar el campo afectado se busca a qué campo se refiere ese mensaje.
// Si no coincide con ninguno, el mensaje se muestra arriba del formulario.
const CAMPOS_POR_TEXTO = [
    ['Nombres', 'nombre_completo'],
    ['Apellidos', 'apellido_completo'],
    ['Especialidad', 'especialidad'],
    ['Código Docente', 'codDocente'],
    ['sexo', 'sexo'],
    ['Teléfono', 'telefono'],
    ['Correo', 'email'],
    ['Fecha de Nacimiento', 'fecha_nacimiento'],
    ['fecha de nacimiento', 'fecha_nacimiento'],
    ['años cumplidos', 'fecha_nacimiento']
];

const campoDelError = (mensaje = '') =>
    CAMPOS_POR_TEXTO.find(([texto]) => mensaje.includes(texto))?.[1] ?? null;

// Fecha más reciente permitida = hoy menos 18 años.
// Los días posteriores quedan deshabilitados en el Calendar.
const fechaMaximaDocente = () => {
    const hoy = new Date();

    return new Date(
        hoy.getFullYear() - EDAD_MINIMA_DOCENTE,
        hoy.getMonth(),
        hoy.getDate()
    );
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

function AddDocente(props) {
    const toast = useRef(null);

    const [docenteInfo, setDocenteInfo] = useState(DOCENTE_INICIAL);
    const [loading, setLoading] = useState(false);

    // { campo: 'nombre_completo' | ... | null, mensaje: string }
    const [error, setError] = useState(null);

    // Códigos ya registrados, para avisar si el código generado ya existe.
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
    // Formato INICIALES-DDMMAA. Se recalcula cuando cambian nombres,
    // apellidos o la fecha de nacimiento (que sale de la cédula o del
    // calendario).
    //
    // CORREGIDO: antes el tercer parámetro era la lista de códigos
    // existentes. generarCodigoDocente espera la FECHA, y al no recibirla
    // devolvía siempre '' (por eso el código nunca se generaba).
    // ---------------------------------------------------------

    useEffect(() => {
        const codigo = generarCodigoDocente(
            docenteInfo.nombre_completo,
            docenteInfo.apellido_completo,
            docenteInfo.fecha_nacimiento
        );

        setDocenteInfo(prev =>
            prev.codDocente === codigo ? prev : { ...prev, codDocente: codigo }
        );
    }, [
        docenteInfo.nombre_completo,
        docenteInfo.apellido_completo,
        docenteInfo.fecha_nacimiento
    ]);

    // El código no lleva consecutivo, así que dos docentes con las mismas
    // iniciales y fecha de nacimiento darían el mismo código. Se avisa
    // antes de guardar (la columna del código es única en la base de datos).
    const codigoRepetido =
        docenteInfo.codDocente !== '' &&
        codigosExistentes.some(
            c => String(c).toUpperCase() === docenteInfo.codDocente.toUpperCase()
        );

    // ---------------------------------------------------------
    // CAMBIOS EN EL FORMULARIO
    // Siempre con función, porque la cédula actualiza dos campos
    // (cédula y fecha) casi al mismo tiempo.
    // ---------------------------------------------------------

    const handleChange = (campo, valor) => {
        setDocenteInfo(prev => ({ ...prev, [campo]: valor }));
        setError(null);
    };

    // ---------------------------------------------------------
    // EDAD SEGÚN LA CÉDULA
    // Se calcula en cada render a partir de la cédula escrita, así el
    // mensaje aparece y desaparece solo, sin depender del orden de eventos.
    // ---------------------------------------------------------

    const resultadoCedula =
        docenteInfo.cedula.length === 16
            ? extraerFechaNacimientoCedula(docenteInfo.cedula)
            : null;

    const errorEdadCedula =
        resultadoCedula?.esValida && resultadoCedula.fechaNacimiento
            ? validarEdadMinima(
                  resultadoCedula.fechaNacimiento,
                  EDAD_MINIMA_DOCENTE,
                  'docente'
              )
            : null;

    // Cuando la cédula es válida, su fecha pasa al campo de fecha de nacimiento,
    // siempre que el docente tenga la edad mínima. Si no la tiene, la fecha
    // se deja vacía y el error se muestra bajo la cédula.
    const handleCedulaValida = (esValida, numeroCedula) => {
        if (!esValida) return;

        const resultado = extraerFechaNacimientoCedula(numeroCedula);

        if (!resultado.esValida || !resultado.fechaNacimiento) return;

        const errorEdad = validarEdadMinima(
            resultado.fechaNacimiento,
            EDAD_MINIMA_DOCENTE,
            'docente'
        );

        if (errorEdad) {
            handleChange('fecha_nacimiento', null);

            toast.current?.show({
                severity: 'warn',
                summary: 'Edad no permitida',
                detail: errorEdad,
                life: 4000
            });

            return;
        }

        handleChange('fecha_nacimiento', resultado.fechaNacimiento);
    };

    // Fecha elegida o escrita en el calendario: se rechaza si es menor de 18 años.
    const handleFechaChange = (nueva) => {
        if (nueva) {
            const errorEdad = validarEdadMinima(
                nueva,
                EDAD_MINIMA_DOCENTE,
                'docente'
            );

            if (errorEdad) {
                handleChange('fecha_nacimiento', null);

                // Después, porque handleChange() limpia el error.
                setError({ campo: 'fecha_nacimiento', mensaje: errorEdad });

                toast.current?.show({
                    severity: 'warn',
                    summary: 'Edad no permitida',
                    detail: errorEdad,
                    life: 4000
                });

                return;
            }
        }

        handleChange('fecha_nacimiento', nueva);
    };

    // ---------------------------------------------------------
    // GUARDAR
    // La validación de campos y el envío los hace ServicioValidado.
    // ---------------------------------------------------------

    const guardarDocente = async (e) => {
        if (e) e.preventDefault();

        if (loading) return;

        // La cédula escrita corresponde a una persona menor de 18 años.
        if (errorEdadCedula) {
            setError({ campo: 'cedula', mensaje: errorEdadCedula });

            toast.current?.show({
                severity: 'error',
                summary: 'Edad no permitida',
                detail: errorEdadCedula,
                life: 5000
            });

            return;
        }

        // El código generado ya pertenece a otro docente.
        if (codigoRepetido) {
            setError({ campo: 'codDocente', mensaje: MENSAJE_CODIGO_REPETIDO });

            toast.current?.show({
                severity: 'error',
                summary: 'Código repetido',
                detail: MENSAJE_CODIGO_REPETIDO,
                life: 5000
            });

            return;
        }

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
                            ayuda="Al completarla, la fecha de nacimiento se llena sola. El docente debe ser mayor de 18 años."
                            error={errorDe('cedula') ?? errorEdadCedula ?? undefined}
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
                                onChange={(e) => handleFechaChange(e.value)}
                                dateFormat="dd/mm/yy"
                                showIcon
                                maxDate={fechaMaximaDocente()}
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

                {/* DATOS DE CONTACTO (NUEVO) */}

                <Seccion icono="pi-phone" titulo="Datos de contacto">
                    <div className="formgrid grid">

                        <Campo
                            id="telefono"
                            label="Teléfono"
                            requerido
                            ayuda="8 dígitos, sin guiones ni espacios."
                            error={errorDe('telefono')}
                        >
                            <InputText
                                id="telefono"
                                placeholder="88881234"
                                value={docenteInfo.telefono}
                                onChange={(e) => handleChange('telefono', e.target.value)}
                                className={`w-full ${claseInvalida('telefono')}`}
                                maxLength={8}
                                keyfilter="int"
                                inputMode="numeric"
                                disabled={loading}
                            />
                        </Campo>

                        <Campo
                            id="email"
                            label="Correo electrónico"
                            requerido
                            ayuda="Ejemplo: nombre@correo.com"
                            error={errorDe('email')}
                        >
                            <InputText
                                id="email"
                                type="email"
                                placeholder="nombre@correo.com"
                                value={docenteInfo.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={`w-full ${claseInvalida('email')}`}
                                maxLength={100}
                                disabled={loading}
                            />
                        </Campo>

                    </div>
                </Seccion>

                {/* INFORMACIÓN DEL DOCENTE */}

                <Seccion icono="pi-briefcase" titulo="Información del docente">
                    <div className="formgrid grid">

                        <Campo
                            id="codDocente"
                            label="Código de docente"
                            requerido
                            ayuda="Se genera con las iniciales de nombres y apellidos más la fecha de nacimiento (DDMMAA)."
                            error={
                                errorDe('codDocente') ??
                                (codigoRepetido ? MENSAJE_CODIGO_REPETIDO : undefined)
                            }
                        >
                            <InputText
                                id="codDocente"
                                placeholder="Se genera automáticamente"
                                value={docenteInfo.codDocente}
                                className={`w-full ${claseInvalida('codDocente')} ${codigoRepetido ? 'p-invalid' : ''}`}
                                maxLength={20}
                                disabled
                            />
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
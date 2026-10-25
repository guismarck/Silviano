import React, { useState, useRef, useEffect } from 'react';
 
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Steps } from 'primereact/steps';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
 
import {
    getEstudiantes,
    registrarEstudianteConTutor
} from '../../Servicios/estudianteService.js';
 
import { ValidarEstudiante } from '../../Util/validaciones/validacionEstudiante.js';
 
import {
    formatearCedula,
    extraerFechaDeCedula,
    validarFechaNacimiento,
    validarCedula
} from '../../Util/validaciones/Validacioncedula.js';
 
import { generarCodigoEstudiante } from '../../Util/validaciones/CodigoEstudiante';
 
import '../../estilosCSS/AgregarEstudiantes.css';
 
function AddEstudianteTutor(props) {
    const toast = useRef(null);
 
    const [pasoActivo, setPasoActivo] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
 
    // Códigos ya registrados, para calcular el consecutivo del nuevo código.
    const [codigosExistentes, setCodigosExistentes] = useState([]);
 
    // =========================================================
    // ESTADO DEL ESTUDIANTE
    // Los campos se mantienen planos para facilitar validación
    // y construcción del payload.
    // =========================================================
 
    const [estudianteInfo, setEstudianteInfo] = useState({
        idpersona: '',
        nombre_completo: '',
        apellido_completo: '',
        sexo: '',
        direccion: '',
        partida_nacimiento: 'no',
        fecha_nacimiento: null,
        cedula: '',
        codEstudiante: '',
        codigoMined: '',
        estado: true
    });
 
    // =========================================================
    // ESTADO DEL TUTOR
    // Los datos personales están separados de los datos
    // de la relación estudiante-tutor.
    // =========================================================
 
    const [tutorInfo, setTutorInfo] = useState({
        nombre_completo: '',
        apellido_completo: '',
        sexo: '',
        direccion: '',
        partida_nacimiento: 'no',
        fecha_nacimiento: null,
        cedula: '',
        ocupacion: '',
        telefonoPrincipal: '',
        telefonoSecundario: '',
 
        parentesco: 'Padre',
        activo: true
    });
 
    // =========================================================
    // OPCIONES DE LOS DROPDOWNS
    // =========================================================
 
    const opcionesSexo = [
        { label: 'Femenino', value: 'F' },
        { label: 'Masculino', value: 'M' }
    ];
 
    const opcionesPartida = [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
    ];
 
    const opcionesParentesco = [
        { label: 'Padre', value: 'Padre' },
        { label: 'Madre', value: 'Madre' },
        { label: 'Abuelo/a', value: 'Abuelo/a' },
        { label: 'Tío/a', value: 'Tío/a' },
        { label: 'Tutor legal', value: 'Tutor legal' },
        { label: 'Otro', value: 'Otro' }
    ];
 
    const pasos = [
        { label: 'Datos del estudiante' },
        { label: 'Datos del tutor' }
    ];
 
    // =========================================================
    // EFECTO: CARGAR CÓDIGOS EXISTENTES
    // Se usan para calcular el consecutivo (0001, 0002, ...).
    // =========================================================
 
    useEffect(() => {
        const cargarCodigos = async () => {
            try {
                const respuesta = await getEstudiantes();
 
                const lista = Array.isArray(respuesta)
                    ? respuesta
                    : respuesta?.content ?? [];
 
                setCodigosExistentes(
                    lista.map(e => e.codEstudiante).filter(Boolean)
                );
            } catch (error) {
                console.error(
                    'No se pudieron cargar los códigos existentes:',
                    error
                );
            }
        };
 
        cargarCodigos();
    }, []);
 
    // =========================================================
    // EFECTO: AUTOGENERAR CÓDIGO DE ESTUDIANTE
    // Se recalcula cuando cambian nombres, apellidos o fecha.
    // =========================================================
 
    useEffect(() => {
        const codigo = generarCodigoEstudiante(
            estudianteInfo.nombre_completo,
            estudianteInfo.apellido_completo,
            estudianteInfo.fecha_nacimiento,
            codigosExistentes
        );
 
        setEstudianteInfo(prev =>
            prev.codEstudiante === codigo
                ? prev
                : { ...prev, codEstudiante: codigo }
        );
    }, [
        estudianteInfo.nombre_completo,
        estudianteInfo.apellido_completo,
        estudianteInfo.fecha_nacimiento,
        codigosExistentes
    ]);
 
    // =========================================================
    // ACTUALIZAR FORMULARIOS
    // =========================================================
 
    const actualizarEstudiante = (campo, valor) => {
        setEstudianteInfo(prev => ({
            ...prev,
            [campo]: valor
        }));
 
        setErrorMessage('');
    };
 
    const actualizarTutor = (campo, valor) => {
        setTutorInfo(prev => ({
            ...prev,
            [campo]: valor
        }));
 
        setErrorMessage('');
    };
 
    // =========================================================
    // CÉDULA: DAR FORMATO Y OBTENER LA FECHA DE NACIMIENTO
    // Sirve para el estudiante (esTutor = false) y el tutor.
    // =========================================================
 
    const manejarCedula = esTutor => (_campo, valor) => {
        const actualizar = esTutor ? actualizarTutor : actualizarEstudiante;
        const cedula = formatearCedula(valor);
 
        actualizar('cedula', cedula);
 
        const fecha = extraerFechaDeCedula(cedula);
 
        if (fecha) {
            actualizar('fecha_nacimiento', fecha);
        } else if (cedula.length === 16) {
            setErrorMessage(
                'La cédula no contiene una fecha de nacimiento válida.'
            );
        }
    };
 
    // =========================================================
    // CONVERTIR FECHA DE PRIME REACT A yyyy-MM-dd
    // Evita desplazamientos de fecha por zona horaria.
    // =========================================================
 
    const convertirFecha = fecha => {
        if (!fecha) return null;
 
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
 
        return `${anio}-${mes}-${dia}`;
    };
 
    // =========================================================
    // VALIDAR ESTUDIANTE
    // =========================================================
 
    const validarPasoEstudiante = () => {
        const requeridos = [
            ['nombre_completo', 'Nombres del estudiante'],
            ['apellido_completo', 'Apellidos del estudiante'],
            ['sexo', 'Sexo del estudiante'],
            ['fecha_nacimiento', 'Fecha de nacimiento'],
            ['codEstudiante', 'Código de estudiante']
        ];
 
        for (const [campo, etiqueta] of requeridos) {
            const valor = estudianteInfo[campo];
 
            if (
                valor === null ||
                valor === undefined ||
                String(valor).trim() === ''
            ) {
                setErrorMessage(
                    `El campo ${etiqueta} es obligatorio.`
                );
 
                return false;
            }
        }
 
        const errorFecha = validarFechaNacimiento(
            estudianteInfo.fecha_nacimiento,
            'del estudiante'
        );
 
        if (errorFecha) {
            setErrorMessage(errorFecha);
            return false;
        }
 
        const errorCedula = validarCedula(
            estudianteInfo.cedula,
            estudianteInfo.fecha_nacimiento,
            'del estudiante'
        );
 
        if (errorCedula) {
            setErrorMessage(errorCedula);
            return false;
        }
 
        setErrorMessage('');
        return true;
    };
 
    // =========================================================
    // VALIDAR TUTOR
    // El teléfono secundario, la cédula y la fecha son opcionales.
    // =========================================================
 
    const validarPasoTutor = () => {
        const requeridos = [
            ['nombre_completo', 'Nombres del tutor'],
            ['apellido_completo', 'Apellidos del tutor'],
            ['ocupacion', 'Ocupación'],
            ['telefonoPrincipal', 'Teléfono principal'],
            ['parentesco', 'Parentesco']
        ];
 
        for (const [campo, etiqueta] of requeridos) {
            const valor = tutorInfo[campo];
 
            if (
                valor === null ||
                valor === undefined ||
                String(valor).trim() === ''
            ) {
                setErrorMessage(
                    `El campo ${etiqueta} es obligatorio.`
                );
 
                return false;
            }
        }
 
        if (!/^[0-9]{8}$/.test(tutorInfo.telefonoPrincipal)) {
            setErrorMessage(
                'El teléfono principal debe contener exactamente 8 dígitos.'
            );
 
            return false;
        }
 
        if (
            tutorInfo.telefonoSecundario &&
            !/^[0-9]{8}$/.test(tutorInfo.telefonoSecundario)
        ) {
            setErrorMessage(
                'El teléfono secundario debe contener exactamente 8 dígitos.'
            );
 
            return false;
        }
 
        const errorFecha = validarFechaNacimiento(
            tutorInfo.fecha_nacimiento,
            'del tutor'
        );
 
        if (errorFecha) {
            setErrorMessage(errorFecha);
            return false;
        }
 
        const errorCedula = validarCedula(
            tutorInfo.cedula,
            tutorInfo.fecha_nacimiento,
            'del tutor'
        );
 
        if (errorCedula) {
            setErrorMessage(errorCedula);
            return false;
        }
 
        setErrorMessage('');
        return true;
    };
 
    // =========================================================
    // NAVEGACIÓN ENTRE LOS PASOS
    // =========================================================
 
    const siguientePaso = () => {
        if (!validarPasoEstudiante()) return;
 
        setPasoActivo(1);
        setErrorMessage('');
    };
 
    const pasoAnterior = () => {
        setPasoActivo(0);
        setErrorMessage('');
    };
 
    const seleccionarPaso = e => {
        if (e.index === 0) {
            setPasoActivo(0);
            setErrorMessage('');
            return;
        }
 
        if (e.index === 1 && validarPasoEstudiante()) {
            setPasoActivo(1);
        }
    };
 
    // =========================================================
    // CONSTRUIR JSON COMPUESTO
    // Los campos opcionales vacíos se envían como null
    // (evita choques con columnas únicas como la cédula).
    // =========================================================
 
    const construirPayload = () => {
        const estudiante = {
            ...estudianteInfo,
            fecha_nacimiento: convertirFecha(
                estudianteInfo.fecha_nacimiento
            )
        };
 
        const tutor = {
            nombre_completo: tutorInfo.nombre_completo.trim(),
            apellido_completo: tutorInfo.apellido_completo.trim(),
            sexo: tutorInfo.sexo || null,
            direccion: tutorInfo.direccion.trim() || null,
            partida_nacimiento: tutorInfo.partida_nacimiento,
            fecha_nacimiento: convertirFecha(
                tutorInfo.fecha_nacimiento
            ),
            cedula: tutorInfo.cedula.trim() || null,
            ocupacion: tutorInfo.ocupacion.trim(),
            telefonoPrincipal: tutorInfo.telefonoPrincipal.trim(),
            telefonoSecundario:
                tutorInfo.telefonoSecundario.trim() || null
        };
 
        return {
            estudiante,
            tutores: [
                {
                    tutor,
                    parentesco: tutorInfo.parentesco,
                    activo: tutorInfo.activo
                }
            ]
        };
    };
 
    // =========================================================
    // GUARDAR ESTUDIANTE Y TUTOR
    // Una sola llamada con el JSON compuesto { estudiante, tutores },
    // que es el formato que ya acepta el backend.
    // =========================================================
 
    const guardarRegistro = async e => {
        e.preventDefault();
 
        if (loading) return;
 
        if (!validarPasoEstudiante()) {
            setPasoActivo(0);
            return;
        }
 
        if (!validarPasoTutor()) {
            setPasoActivo(1);
            return;
        }
 
        setLoading(true);
        setErrorMessage('');
 
        try {
            const payload = construirPayload();
 
            // Valida y sanea los datos del estudiante.
            const validacion = ValidarEstudiante(payload.estudiante);
 
            if (!validacion.esValido) {
                throw new Error(validacion.error);
            }
 
            await registrarEstudianteConTutor({
                estudiante: validacion.payloadFormateado,
                tutores: payload.tutores
            });
 
            toast.current?.show({
                severity: 'success',
                summary: 'Registro completado',
                detail:
                    'El estudiante y el tutor fueron registrados correctamente.',
                life: 4000
            });
 
            // Recargar listado de estudiantes si el padre
            // del componente proporciona esta función.
            if (props.cargarEstudiante) {
                await props.cargarEstudiante();
            }
 
            // Cerrar el modal si se proporcionó el callback.
            if (props.setEstudiantedoAdd) {
                props.setEstudiantedoAdd(false);
            }
 
        } catch (error) {
            console.error(
                'Error al registrar estudiante y tutor:',
                error
            );
 
            const respuestaError = error.response?.data;
 
            const mensaje =
                typeof respuestaError === 'string'
                    ? respuestaError
                    : respuestaError?.mensaje ||
                    respuestaError?.message ||
                    error.message ||
                    'No fue posible completar el registro.';
 
            setErrorMessage(mensaje);
 
            toast.current?.show({
                severity: 'error',
                summary: 'Error al guardar',
                detail: mensaje,
                life: 6000
            });
 
        } finally {
            setLoading(false);
        }
    };
 
    // =========================================================
    // COMPONENTE AUXILIAR: INPUT DE TEXTO
    // =========================================================
 
    const campoTexto = (
        etiqueta,
        campo,
        valor,
        actualizar,
        opciones = {}
    ) => (
        <div
            className="col-12 md:col-6 registro-campo"
            key={campo}
        >
            <label htmlFor={campo}>
                {etiqueta}
 
                {opciones.obligatorio && (
                    <span className="registro-obligatorio"> *</span>
                )}
            </label>
 
            <InputText
                id={campo}
                value={valor ?? ''}
                onChange={e =>
                    actualizar(campo, e.target.value)
                }
                placeholder={
                    opciones.placeholder ||
                    `Ingrese ${etiqueta.toLowerCase()}`
                }
                className="w-full"
                maxLength={opciones.maxLength}
                disabled={loading || opciones.disabled || false}
                keyfilter={
                    opciones.digitos ? 'int' : undefined
                }
            />
        </div>
    );
 
    // =========================================================
    // COMPONENTE AUXILIAR: DROPDOWN
    // =========================================================
 
    const campoDropdown = (
        etiqueta,
        campo,
        valor,
        actualizar,
        opciones,
        placeholder = 'Seleccione'
    ) => (
        <div
            className="col-12 md:col-6 registro-campo"
            key={campo}
        >
            <label htmlFor={campo}>{etiqueta}</label>
 
            <Dropdown
                inputId={campo}
                value={valor}
                options={opciones}
                optionLabel="label"
                optionValue="value"
                onChange={e =>
                    actualizar(campo, e.value)
                }
                placeholder={placeholder}
                className="w-full"
                disabled={loading}
            />
        </div>
    );
 
    // =========================================================
    // COMPONENTE AUXILIAR: FECHA
    // =========================================================
 
    const campoFecha = (
        etiqueta,
        campo,
        valor,
        actualizar,
        obligatorio = false
    ) => (
        <div
            className="col-12 md:col-6 registro-campo"
            key={campo}
        >
            <label htmlFor={campo}>
                {etiqueta}
 
                {obligatorio && (
                    <span className="registro-obligatorio"> *</span>
                )}
            </label>
 
            <Calendar
                inputId={campo}
                value={valor}
                onChange={e =>
                    actualizar(campo, e.value)
                }
                dateFormat="dd/mm/yy"
                showIcon
                maxDate={new Date()}
                className="w-full"
                inputClassName="w-full"
                placeholder="dd/mm/aaaa"
                disabled={loading}
            />
        </div>
    );
 
    // =========================================================
    // COMPONENTE AUXILIAR: DIRECCIÓN
    // =========================================================
 
    const campoDireccion = (esTutor = false) => {
        const valor = esTutor
            ? tutorInfo.direccion
            : estudianteInfo.direccion;
 
        const actualizar = esTutor
            ? actualizarTutor
            : actualizarEstudiante;
 
        return (
            <div className="col-12 registro-campo">
                <label>
                    Dirección {esTutor ? 'del tutor' : 'del estudiante'}
                </label>
 
                <InputTextarea
                    value={valor}
                    onChange={e =>
                        actualizar('direccion', e.target.value)
                    }
                    rows={2}
                    autoResize
                    className="w-full"
                    placeholder="Dirección exacta"
                    disabled={loading}
                />
            </div>
        );
    };
 
    // =========================================================
    // RENDER DEL FORMULARIO
    // =========================================================
 
    return (
        <div className="registro-estudiante p-3">
            <Toast ref={toast} />
 
            {/* CABECERA */}
 
            <header className="registro-cabecera flex align-items-center gap-3 mb-3">
                <div
                    className="registro-logo flex align-items-center justify-content-center bg-primary text-white border-round-md"
                    style={{
                        width: '45px',
                        height: '45px'
                    }}
                >
                    <i className="pi pi-graduation-cap text-xl" />
                </div>
 
                <div>
                    <h3 className="registro-colegio m-0 text-900 font-bold">
                        Colegio Silviano Matamoros
                    </h3>
 
                    <p className="registro-subtitulo m-0 text-600 text-sm">
                        Sistema de gestión académica
                    </p>
                </div>
            </header>
 
            <div className="registro-migas text-500 text-xs mb-2">
                Inicio / Estudiantes / Nuevo registro
            </div>
 
            <Divider className="registro-separador my-2" />
 
            <h2 className="registro-extitulo text-xl font-bold text-900 mb-1">
                Registro de estudiante y tutor
            </h2>
 
            <p className="registro-descripcion text-600 text-sm mb-3">
                Complete los datos del estudiante y su tutor
                para realizar el registro.
            </p>
 
            {/* STEPS */}
 
            <div className="registro-steps mb-4">
                <Steps
                    model={pasos}
                    activeIndex={pasoActivo}
                    onSelect={seleccionarPaso}
                    readOnly={false}
                />
            </div>
 
            {/* MENSAJE DE VALIDACIÓN */}
 
            {errorMessage && (
                <Message
                    severity="error"
                    text={errorMessage}
                    className="registro-error w-full mb-3"
                />
            )}
 
            <form onSubmit={guardarRegistro}>
 
                {/* =================================================
                    PASO 1: ESTUDIANTE
                ================================================= */}
 
                {pasoActivo === 0 && (
                    <Card className="shadow-1 border-round-lg p-2 surface-card">
                        <h3 className="registro-paso-titulo text-md font-bold text-primary mb-3">
                            Paso 1. Datos del estudiante
                        </h3>
 
                        <div className="formgrid grid">
 
                            {campoTexto(
                                'Nombres',
                                'nombre_completo',
                                estudianteInfo.nombre_completo,
                                actualizarEstudiante,
                                {
                                    obligatorio: true,
                                    maxLength: 100
                                }
                            )}
 
                            {campoTexto(
                                'Apellidos',
                                'apellido_completo',
                                estudianteInfo.apellido_completo,
                                actualizarEstudiante,
                                {
                                    obligatorio: true,
                                    maxLength: 100
                                }
                            )}
 
                            {campoDropdown(
                                'Sexo *',
                                'sexo',
                                estudianteInfo.sexo,
                                actualizarEstudiante,
                                opcionesSexo,
                                'Seleccione sexo'
                            )}
 
                            {campoTexto(
                                'Cédula',
                                'cedula',
                                estudianteInfo.cedula,
                                manejarCedula(false),
                                {
                                    maxLength: 16,
                                    placeholder: '000-000000-0000X'
                                }
                            )}
 
                            {campoFecha(
                                'Fecha de nacimiento',
                                'fecha_nacimiento',
                                estudianteInfo.fecha_nacimiento,
                                actualizarEstudiante,
                                true
                            )}
 
                            {campoTexto(
                                'Código de estudiante',
                                'codEstudiante',
                                estudianteInfo.codEstudiante,
                                actualizarEstudiante,
                                {
                                    obligatorio: true,
                                    maxLength: 20,
                                    disabled: true,
                                    placeholder: 'Se genera automáticamente'
                                }
                            )}
 
                            {campoDropdown(
                                'Partida de nacimiento',
                                'partida_nacimiento',
                                estudianteInfo.partida_nacimiento,
                                actualizarEstudiante,
                                opcionesPartida
                            )}
 
                            {campoTexto(
                                'Código MINED',
                                'codigoMined',
                                estudianteInfo.codigoMined,
                                actualizarEstudiante,
                                {
                                    maxLength: 30
                                }
                            )}
 
                            {campoDireccion(false)}
 
                        </div>
 
                        {/* ESTADO DEL ESTUDIANTE */}
 
                       
 
                        {/* BOTONES DEL PASO 1 */}
 
                        <div className="registro-acciones flex justify-content-between align-items-center mt-4 pt-3 border-top-1 surface-border">
 
                            <Button
                                type="button"
                                label="Cancelar"
                                className="p-button-outlined p-button-secondary"
                                onClick={() =>
                                    props.setEstudiantedoAdd?.(false)
                                }
                                disabled={loading}
                            />
 
                            <Button
                                type="button"
                                label="Siguiente"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                className="p-button-primary"
                                onClick={siguientePaso}
                                disabled={loading}
                            />
 
                        </div>
                    </Card>
                )}
 
                {/* =================================================
                    PASO 2: TUTOR
                ================================================= */}
 
                {pasoActivo === 1 && (
                    <Card className="shadow-1 border-round-lg p-2 surface-card">
                        <h3 className="registro-paso-titulo text-md font-bold text-primary mb-3">
                            Paso 2. Datos del tutor
                        </h3>
 
                        <p className="registro-paso-descripcion text-600 text-xs mb-3">
                            Complete la información personal,
                            de contacto y el parentesco del tutor.
                        </p>
 
                        <div className="formgrid grid">
 
                            {campoTexto(
                                'Nombres del tutor',
                                'nombre_completo',
                                tutorInfo.nombre_completo,
                                actualizarTutor,
                                {
                                    obligatorio: true,
                                    maxLength: 100
                                }
                            )}
 
                            {campoTexto(
                                'Apellidos del tutor',
                                'apellido_completo',
                                tutorInfo.apellido_completo,
                                actualizarTutor,
                                {
                                    obligatorio: true,
                                    maxLength: 100
                                }
                            )}
 
                            {campoTexto(
                                'Cédula del tutor',
                                'cedula',
                                tutorInfo.cedula,
                                manejarCedula(true),
                                {
                                    maxLength: 16,
                                    placeholder: '000-000000-0000X'
                                }
                            )}
 
                            {campoDropdown(
                                'Sexo del tutor',
                                'sexo',
                                tutorInfo.sexo,
                                actualizarTutor,
                                opcionesSexo,
                                'Seleccione sexo'
                            )}
 
                            {campoFecha(
                                'Fecha de nacimiento del tutor',
                                'fecha_nacimiento',
                                tutorInfo.fecha_nacimiento,
                                actualizarTutor
                            )}
 
                            {campoTexto(
                                'Ocupación',
                                'ocupacion',
                                tutorInfo.ocupacion,
                                actualizarTutor,
                                {
                                    obligatorio: true,
                                    maxLength: 45
                                }
                            )}
 
                            {campoTexto(
                                'Teléfono principal',
                                'telefonoPrincipal',
                                tutorInfo.telefonoPrincipal,
                                actualizarTutor,
                                {
                                    obligatorio: true,
                                    maxLength: 8,
                                    digitos: true,
                                    placeholder: '88881234'
                                }
                            )}
 
                            {campoTexto(
                                'Teléfono secundario',
                                'telefonoSecundario',
                                tutorInfo.telefonoSecundario,
                                actualizarTutor,
                                {
                                    maxLength: 8,
                                    digitos: true,
                                    placeholder: 'Opcional'
                                }
                            )}
 
                            {campoDropdown(
                                'Parentesco *',
                                'parentesco',
                                tutorInfo.parentesco,
                                actualizarTutor,
                                opcionesParentesco
                            )}
 
                            {campoDireccion(true)}
 
                        </div>
 
                        {/* REPRESENTANTE LEGAL */}
 
                        <div className="registro-estado flex align-items-center justify-content-between mt-3 p-2 surface-ground border-round">
                            <span className="registro-estado-texto font-semibold">
                                Representante legal
                            </span>
 
                            <div className="registro-estado-activo flex align-items-center gap-2">
                                <InputSwitch
                                    checked={Boolean(
                                        tutorInfo.activo
                                    )}
                                    onChange={e =>
                                        actualizarTutor(
                                            'activo',
                                            e.value
                                        )
                                    }
                                    disabled={loading}
                                />
 
                                <span className="font-bold">
                                    {tutorInfo.activo
                                        ? 'Sí'
                                        : 'No'}
                                </span>
                            </div>
                        </div>
 
                        {/* BOTONES DEL PASO 2 */}
 
                        <div className="registro-acciones flex justify-content-between align-items-center mt-4 pt-3 border-top-1 surface-border">
 
                            <Button
                                type="button"
                                label="Anterior"
                                icon="pi pi-arrow-left"
                                className="p-button-outlined p-button-secondary"
                                onClick={pasoAnterior}
                                disabled={loading}
                            />
 
                            <Button
                                type="submit"
                                label={
                                    loading
                                        ? 'Guardando...'
                                        : 'Guardar registro'
                                }
                                icon="pi pi-check"
                                className="p-button-success"
                                loading={loading}
                                disabled={loading}
                            />
 
                        </div>
                    </Card>
                )}
 
            </form>
        </div>
    );
}
 
export default AddEstudianteTutor;
 

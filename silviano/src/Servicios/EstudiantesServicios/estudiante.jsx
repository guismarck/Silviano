import React, { useState, useRef } from 'react';
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

import { ServicioValidado } from '../../Servicios/estudianteService.js';
import {
    registrarTutor,
    registrarEstudianteTutor
} from '../../Servicios/tutorService.js';

import '../../estilosCSS/AgregarEstudiantes.css';

function AddEstudianteTutor(props) {
    const toast = useRef(null);

    const [pasoActivo, setPasoActivo] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [estudianteInfo, setEstudianteInfo] = useState({
        idpersona: '',
        nombre_completo: '',
        apellido_completo: '',
        sexo: '',
        partida_nacimiento: 'no',
        direccion: '',
        fecha_nacimiento: null,
        cedula: '',
        codEstudiante: '',
        codigoMined: '',
        estado: true
    });

    const [tutorInfo, setTutorInfo] = useState({
        nombre_completo: '',
        apellido_completo: '',
        cedula: '',
        sexo: '',
        direccion: '',
        fecha_nacimiento: null,
        partida_nacimiento: 'no',
        ocupacion: '',
        telefonoPrincipal: '',
        telefonoSecundario: '',
        parentesco: 'Padre',
        estado: true
    });

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

    const actualizarEstudiante = (campo, valor) => {
        setEstudianteInfo(prev => ({ ...prev, [campo]: valor }));
    };

    const actualizarTutor = (campo, valor) => {
        setTutorInfo(prev => ({ ...prev, [campo]: valor }));
    };

    const validarPasoEstudiante = () => {
        const requeridos = [
            ['nombre_completo', 'Nombres del estudiante'],
            ['apellido_completo', 'Apellidos del estudiante'],
            ['sexo', 'Sexo'],
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
                setErrorMessage(`El campo ${etiqueta} es obligatorio.`);
                return false;
            }
        }

        setErrorMessage('');
        return true;
    };

    const validarPasoTutor = () => {
        const requeridos = [
            ['nombre_completo', 'Nombres del tutor'],
            ['apellido_completo', 'Apellidos del tutor'],
            ['ocupacion', 'Ocupación'],
            ['telefonoPrincipal', 'Teléfono principal'],
            ['telefonoSecundario', 'Teléfono secundario']
        ];

        for (const [campo, etiqueta] of requeridos) {
            if (!String(tutorInfo[campo] ?? '').trim()) {
                setErrorMessage(`El campo ${etiqueta} es obligatorio.`);
                return false;
            }
        }

        if (!/^[0-9]{8}$/.test(tutorInfo.telefonoPrincipal)) {
            setErrorMessage('El teléfono principal debe contener exactamente 8 dígitos.');
            return false;
        }

        if (!/^[0-9]{8}$/.test(tutorInfo.telefonoSecundario)) {
            setErrorMessage('El teléfono secundario debe contener exactamente 8 dígitos.');
            return false;
        }

        if (!tutorInfo.parentesco) {
            setErrorMessage('Seleccione el parentesco del tutor.');
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const siguientePaso = () => {
        if (!validarPasoEstudiante()) return;
        setPasoActivo(1);
        setErrorMessage('');
    };

    const pasoAnterior = () => {
        setPasoActivo(0);
        setErrorMessage('');
    };

    const obtenerIdPersona = respuesta => {
        const datos = respuesta?.data ?? respuesta;
        return datos?.idpersona ?? datos?.idPersona ?? datos?.id;
    };

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
            const payloadEstudiante = {
                ...estudianteInfo,
                nombre_tutor: [
                    tutorInfo.nombre_completo.trim(),
                    tutorInfo.apellido_completo.trim()
                ].filter(Boolean).join(' ')
            };

            const respuestaEstudiante = await ServicioValidado(payloadEstudiante);
            const idEstudiante = obtenerIdPersona(respuestaEstudiante);

            if (!idEstudiante || idEstudiante === 'OK') {
                throw new Error('El servicio de estudiantes debe devolver el estudiante guardado con su idpersona.');
            }

            const respuestaTutor = await registrarTutor(tutorInfo);
            const idTutor = obtenerIdPersona(respuestaTutor);

            if (!idTutor || idTutor === 'OK') {
                throw new Error('El servicio de tutores debe devolver el tutor guardado con su idpersona.');
            }

            await registrarEstudianteTutor({
                idEstudiante,
                idTutor,
                parentesco: tutorInfo.parentesco,
                esRepresentanteLegal: tutorInfo.estado
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Registro completado',
                detail: 'El estudiante y el tutor fueron registrados correctamente.',
                life: 4000
            });

            if (props.cargarEstudiante) {
                await props.cargarEstudiante();
            }

            if (props.setEstudiantedoAdd) {
                props.setEstudiantedoAdd(false);
            }
        } catch (error) {
            console.error('Error al registrar estudiante y tutor:', error);
            const respuestaError = error.response?.data;
            const mensaje =
                typeof respuestaError === 'string'
                    ? respuestaError
                    : respuestaError?.mensaje ||
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

    const campoTexto = (
        etiqueta,
        campo,
        valor,
        actualizar,
        opciones = {}
    ) => (
        <div className="col-12 md:col-6 registro-campo" key={campo}>
            <label htmlFor={campo}>
                {etiqueta}
                {opciones.obligatorio && (
                    <span className="registro-obligatorio"> *</span>
                )}
            </label>
            <InputText
                id={campo}
                value={valor ?? ''}
                onChange={e => actualizar(campo, e.target.value)}
                placeholder={opciones.placeholder || `Ingrese ${etiqueta.toLowerCase()}`}
                className="w-full"
                maxLength={opciones.maxLength}
                disabled={opciones.disabled || false}
                keyfilter={opciones.digitos ? 'int' : undefined}
            />
        </div>
    );

    const campoDropdown = (
        etiqueta,
        campo,
        valor,
        actualizar,
        opciones,
        placeholder = 'Seleccione'
    ) => (
        <div className="col-12 md:col-6 registro-campo" key={campo}>
            <label htmlFor={campo}>{etiqueta}</label>
            <Dropdown
                inputId={campo}
                value={valor}
                options={opciones}
                optionLabel="label"
                optionValue="value"
                onChange={e => actualizar(campo, e.value)}
                placeholder={placeholder}
                className="w-full"
            />
        </div>
    );

    const campoFecha = (
        etiqueta,
        campo,
        valor,
        actualizar,
        obligatorio = false
    ) => (
        <div className="col-12 md:col-6 registro-campo" key={campo}>
            <label htmlFor={campo}>
                {etiqueta}
                {obligatorio && <span className="registro-obligatorio"> *</span>}
            </label>
            <Calendar
                inputId={campo}
                value={valor}
                onChange={e => actualizar(campo, e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                maxDate={new Date()}
                className="w-full"
                inputClassName="w-full"
                placeholder="dd/mm/aaaa"
            />
        </div>
    );

    const campoDireccion = (esTutor = false) => {
        const valor = esTutor ? tutorInfo.direccion : estudianteInfo.direccion;
        const actualizar = esTutor ? actualizarTutor : actualizarEstudiante;

        return (
            <div className="col-12 registro-campo">
                <label>
                    Dirección {esTutor ? 'del tutor' : 'del estudiante'}
                </label>
                <InputTextarea
                    value={valor}
                    onChange={e => actualizar('direccion', e.target.value)}
                    rows={2}
                    autoResize
                    className="w-full"
                    placeholder="Dirección exacta"
                />
            </div>
        );
    };

    return (
        <div className="registro-estudiante p-3">
            <Toast ref={toast} />

            <header className="registro-cabecera flex align-items-center gap-3 mb-3">
                <div className="registro-logo flex align-items-center justify-content-center bg-primary text-white border-round-md" style={{ width: '45px', height: '45px' }}>
                    <i className="pi pi-graduation-cap text-xl" />
                </div>
                <div>
                    <h3 className="registro-colegio m-0 text-900 font-bold">Colegio Silviano Matamoros</h3>
                    <p className="registro-subtitulo m-0 text-600 text-sm">Sistema de gestión académica</p>
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
                Complete los datos solicitados organizados en dos columnas para mayor agilidad.
            </p>

            <div className="registro-steps mb-4">
                <Steps
                    model={pasos}
                    activeIndex={pasoActivo}
                    onSelect={e => {
                        if (e.index === 0) {
                            setPasoActivo(0);
                            setErrorMessage('');
                        } else if (e.index === 1 && validarPasoEstudiante()) {
                            setPasoActivo(1);
                        }
                    }}
                    readOnly={false}
                />
            </div>

            {errorMessage && (
                <Message
                    severity="error"
                    text={errorMessage}
                    className="registro-error w-full mb-3"
                />
            )}

            <form onSubmit={guardarRegistro}>
                {pasoActivo === 0 && (
                    <Card className="shadow-1 border-round-lg p-2 surface-card">
                        <h3 className="registro-paso-titulo text-md font-bold text-primary mb-3">
                            Paso 1. Datos del estudiante
                        </h3>

                        {/* Estructura organizada estrictamente en dos columnas */}
                        <div className="formgrid grid">
                            {campoTexto('Nombres', 'nombre_completo', estudianteInfo.nombre_completo, actualizarEstudiante, { obligatorio: true, maxLength: 100 })}
                            {campoTexto('Apellidos', 'apellido_completo', estudianteInfo.apellido_completo, actualizarEstudiante, { obligatorio: true, maxLength: 100 })}

                            {campoDropdown('Sexo *', 'sexo', estudianteInfo.sexo, actualizarEstudiante, opcionesSexo, 'Seleccione sexo')}
                            {campoFecha('Fecha de nacimiento', 'fecha_nacimiento', estudianteInfo.fecha_nacimiento, actualizarEstudiante, true)}

                            {campoTexto('Cédula', 'cedula', estudianteInfo.cedula, actualizarEstudiante, { maxLength: 20, placeholder: '000-000000-0000X' })}
                            {campoTexto('Código de estudiante', 'codEstudiante', estudianteInfo.codEstudiante, actualizarEstudiante, { obligatorio: true, maxLength: 20 })}

                            {campoDropdown('Partida de nacimiento', 'partida_nacimiento', estudianteInfo.partida_nacimiento, actualizarEstudiante, opcionesPartida)}
                            {campoTexto('Código MINED', 'codigoMined', estudianteInfo.codigoMined, actualizarEstudiante, { maxLength: 30 })}

                            {campoDireccion(false)}
                        </div>

                        <div className="registro-estado flex align-items-center justify-content-between mt-3 p-2 surface-ground border-round">
                            <span className="registro-estado-texto font-semibold">Estado del estudiante</span>
                            <div className="registro-estado-activo flex align-items-center gap-2">
                                <InputSwitch
                                    checked={Boolean(estudianteInfo.estado)}
                                    onChange={e => actualizarEstudiante('estado', e.value)}
                                />
                                <span className="font-bold text-success">
                                    {estudianteInfo.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>

                        <div className="registro-acciones flex justify-content-between align-items-center mt-4 pt-3 border-top-1 surface-border">
                            <Button
                                type="button"
                                label="Cancelar"
                                className="p-button-outlined p-button-secondary"
                                onClick={() => props.setEstudiantedoAdd?.(false)}
                                disabled={loading}
                            />
                            <Button
                                type="button"
                                label="Siguiente"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                className="p-button-primary"
                                onClick={siguientePaso}
                            />
                        </div>
                    </Card>
                )}

                {pasoActivo === 1 && (
                    <Card className="shadow-1 border-round-lg p-2 surface-card">
                        <h3 className="registro-paso-titulo text-md font-bold text-primary mb-3">
                            Paso 2. Datos del tutor
                        </h3>
                        <p className="registro-paso-descripcion text-600 text-xs mb-3">
                            Complete la información de contacto y relación legal con el alumno.
                        </p>

                        {/* Estructura organizada estrictamente en dos columnas */}
                        <div className="formgrid grid">
                            {campoTexto('Nombres del tutor', 'nombre_completo', tutorInfo.nombre_completo, actualizarTutor, { obligatorio: true, maxLength: 100 })}
                            {campoTexto('Apellidos del tutor', 'apellido_completo', tutorInfo.apellido_completo, actualizarTutor, { obligatorio: true, maxLength: 100 })}

                            {campoTexto('Cédula del tutor', 'cedula', tutorInfo.cedula, actualizarTutor, { maxLength: 20 })}
                            {campoDropdown('Sexo del tutor', 'sexo', tutorInfo.sexo, actualizarTutor, opcionesSexo, 'Seleccione sexo')}

                            {campoFecha('Fecha de nacimiento del tutor', 'fecha_nacimiento', tutorInfo.fecha_nacimiento, actualizarTutor)}
                            {campoTexto('Ocupación', 'ocupacion', tutorInfo.ocupacion, actualizarTutor, { obligatorio: true, maxLength: 45 })}

                            {campoTexto('Teléfono principal', 'telefonoPrincipal', tutorInfo.telefonoPrincipal, actualizarTutor, { obligatorio: true, maxLength: 8, digitos: true })}
                            {campoTexto('Teléfono secundario', 'telefonoSecundario', tutorInfo.telefonoSecundario, actualizarTutor, { obligatorio: true, maxLength: 8, digitos: true })}

                            {campoDropdown('Parentesco *', 'parentesco', tutorInfo.parentesco, actualizarTutor, opcionesParentesco)}
                            {campoDireccion(true)}
                        </div>

                        <div className="registro-estado flex align-items-center justify-content-between mt-3 p-2 surface-ground border-round">
                            <span className="registro-estado-texto font-semibold">Representante legal</span>
                            <div className="registro-estado-activo flex align-items-center gap-2">
                                <InputSwitch
                                    checked={Boolean(tutorInfo.estado)}
                                    onChange={e => actualizarTutor('estado', e.value)}
                                />
                                <span className="font-bold">
                                    {tutorInfo.estado ? 'Sí' : 'No'}
                                </span>

                            </div>
                        </div>

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
                                label={loading ? 'Guardando...' : 'Guardar registro'}
                                icon="pi pi-check"
                                className="p-button-success"
                                loading={loading}
                                disabled={loading}
                            />
                        </div>
                    </Card>
                ) }
            </form>
        
        </div>
    );
}

export default AddEstudianteTutor;
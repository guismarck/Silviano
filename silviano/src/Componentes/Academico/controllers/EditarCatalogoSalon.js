import React, { useEffect, useRef, useState } from 'react';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';

import {
    getGrados,
    getCatalogoSalon,
    getSalones,
    updateSalones
} from '../../../Servicios/SalonServicios/salonService';

const valoresVacios = {
    gradoNombre: '',
    salonNombre: '',
    turno: '',
    seccion: '',
    anioLectivo: ''
};

// Normaliza texto para comparar sin distinguir mayúsculas, tildes ni espacios sobrantes.
const normalizar = (texto) =>
    String(texto ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

// El backend puede devolver los ids con distintos nombres; se normalizan aquí.
const idSalonDe = (s) => s.idSalon ?? s.idsalon;

const idGradoDe = (s) =>
    s.grado?.idGrado ?? s.grado?.idgrado ?? s.idGrado ?? s.idgrado;

const idCatalogoDe = (s) =>
    s.catalogoSalon?.idCatalogoSalon ??
    s.catalogoSalon?.idcatalogo_salon ??
    s.catalogoSalon?.idcatalogoSalon ??
    s.idCatalogoSalon ??
    s.idcatalogo_salon;

export default function EditarSalon({
    idSalon,
    onSalonUpdate,
    onCancel
}) {
    const toast = useRef(null);

    // Listas usadas para convertir el nombre escrito en su ID al guardar.
    const [grados, setGrados] = useState([]);
    const [catalogoSalones, setCatalogoSalones] = useState([]);

    const [salonInfo, setSalonInfo] = useState(valoresVacios);
    // Copia de los datos originales para el botón "Restablecer".
    const [original, setOriginal] = useState(valoresVacios);

    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Cargar el salón seleccionado y las listas de grados y catálogo.
    useEffect(() => {
        let activo = true;

        const cargarDatos = async () => {
            if (idSalon === null || idSalon === undefined) {
                setErrorMessage('No se recibió el ID del salón.');
                setCargandoDatos(false);
                return;
            }

            try {
                setCargandoDatos(true);
                setErrorMessage('');

                const [salonesData, gradosData, catalogosData] =
                    await Promise.all([
                        getSalones(),
                        getGrados(),
                        getCatalogoSalon()
                    ]);

                if (!activo) return;

                const listaSalones = Array.isArray(salonesData) ? salonesData : [];
                const listaGrados = Array.isArray(gradosData) ? gradosData : [];
                const listaCatalogos = Array.isArray(catalogosData) ? catalogosData : [];

                const salon = listaSalones.find(
                    (item) => String(idSalonDe(item)) === String(idSalon)
                );

                if (!salon) {
                    throw new Error('No se encontró el salón que deseas editar.');
                }

                const gradosNormalizados = listaGrados.map((grado) => ({
                    idGrado: Number(grado.idGrado ?? grado.idgrado),
                    nombre: grado.nombre ?? ''
                }));

                const catalogosNormalizados = listaCatalogos.map((catalogo) => ({
                    idCatalogoSalon: Number(
                        catalogo.idCatalogoSalon ??
                        catalogo.idcatalogo_salon ??
                        catalogo.idcatalogoSalon
                    ),
                    nombreSalon: catalogo.nombreSalon ?? catalogo.nombre_salon ?? ''
                }));

                setGrados(gradosNormalizados);
                setCatalogoSalones(catalogosNormalizados);

                // Nombre del grado y del salón actuales (del objeto o buscándolos por id).
                const nombreGrado =
                    salon.grado?.nombre ??
                    gradosNormalizados.find(
                        (g) => g.idGrado === Number(idGradoDe(salon))
                    )?.nombre ??
                    '';

                const nombreSalon =
                    salon.catalogoSalon?.nombreSalon ??
                    salon.catalogoSalon?.nombre_salon ??
                    catalogosNormalizados.find(
                        (c) => c.idCatalogoSalon === Number(idCatalogoDe(salon))
                    )?.nombreSalon ??
                    '';

                // Precargar los campos con los valores actuales.
                const datos = {
                    gradoNombre: String(nombreGrado).trim(),
                    salonNombre: String(nombreSalon).trim(),
                    turno: String(salon.turno ?? ''),
                    seccion: String(salon.seccion ?? ''),
                    anioLectivo: String(salon.anioLectivo ?? salon.anio_lectivo ?? '')
                };

                setSalonInfo(datos);
                setOriginal(datos);
            } catch (error) {
                console.error('Error al cargar los datos del salón:', error);

                if (activo) {
                    const mensaje =
                        error.message || 'No se pudieron cargar los datos del salón.';
                    setErrorMessage(mensaje);

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: mensaje,
                        life: 4000
                    });
                }
            } finally {
                if (activo) setCargandoDatos(false);
            }
        };

        cargarDatos();

        return () => {
            activo = false;
        };
    }, [idSalon]);

    const handleChange = (campo, valor) => {
        setSalonInfo((prev) => ({ ...prev, [campo]: valor }));
        setErrorMessage('');
    };

    const restablecer = () => {
        setSalonInfo(original);
        setErrorMessage('');
    };

    // Valida los campos y convierte los nombres escritos en IDs.
    // Devuelve { error } o { idGrado, idCatalogoSalon }.
    const validar = () => {
        const gradoEscrito = salonInfo.gradoNombre.trim();
        const salonEscrito = salonInfo.salonNombre.trim();

        if (!gradoEscrito) return { error: 'El grado es obligatorio.' };
        if (!salonEscrito) return { error: 'El nombre del salón es obligatorio.' };
        if (!salonInfo.turno.trim()) return { error: 'El turno es obligatorio.' };
        if (!salonInfo.seccion.trim()) return { error: 'La sección es obligatoria.' };

        const anio = salonInfo.anioLectivo.trim();
        if (!anio) return { error: 'El año lectivo es obligatorio.' };
        if (!/^\d{4}$/.test(anio)) {
            return { error: 'El año lectivo debe tener 4 dígitos (Ej. 2027).' };
        }

        const grado = grados.find(
            (g) => normalizar(g.nombre) === normalizar(gradoEscrito)
        );

        if (!grado) {
            return {
                error: `El grado "${gradoEscrito}" no existe. Grados disponibles: ${grados
                    .map((g) => g.nombre.trim())
                    .join(', ')}.`
            };
        }

        const catalogo = catalogoSalones.find(
            (c) => normalizar(c.nombreSalon) === normalizar(salonEscrito)
        );

        if (!catalogo) {
            return {
                error: `El salón "${salonEscrito}" no existe en el catálogo. Salones disponibles: ${catalogoSalones
                    .map((c) => c.nombreSalon.trim())
                    .join(', ')}.`
            };
        }

        return {
            idGrado: grado.idGrado,
            idCatalogoSalon: catalogo.idCatalogoSalon
        };
    };

    const guardarCambios = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const resultado = validar();

        if (resultado.error) {
            setErrorMessage(resultado.error);
            return;
        }

        // Mismo formato que usa AgregarSalon al crear.
        const payload = {
            grado: {
                idGrado: resultado.idGrado
            },
            catalogoSalon: {
                idCatalogoSalon: resultado.idCatalogoSalon
            },
            turno: salonInfo.turno.trim(),
            seccion: salonInfo.seccion.trim(),
            anioLectivo: salonInfo.anioLectivo.trim()
        };

        try {
            setGuardando(true);

            await updateSalones(idSalon, payload);

            if (typeof onSalonUpdate === 'function') {
                await onSalonUpdate();
            }
        } catch (error) {
            const errorData = error.response?.data;

            const mensaje =
                errorData?.detail ||
                errorData?.title ||
                errorData?.mensaje ||
                errorData?.message ||
                error.message ||
                'No se pudo actualizar el salón.';

            console.error('Error al actualizar salón:', error.response?.data || error.message);
            setErrorMessage(mensaje);

            toast.current?.show({
                severity: 'error',
                summary: 'No se pudo actualizar',
                detail: mensaje,
                life: 4000
            });
        } finally {
            setGuardando(false);
        }
    };

    const deshabilitado = cargandoDatos || guardando;

    return (
        <div className="p-3">
            <Toast ref={toast} />

            <h2 className="text-xl mb-4">Actualizar salón</h2>

            {errorMessage && (
                <Message
                    severity="error"
                    text={errorMessage}
                    className="w-full mb-3"
                />
            )}

            {cargandoDatos ? (
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-spin pi-spinner" />
                    <span>Cargando los datos del salón...</span>
                </div>
            ) : (
                <form onSubmit={guardarCambios} noValidate>
                    <div className="grid">

                        {/* Grado */}
                        <div className="col-12 md:col-6">
                            <label htmlFor="grado" className="block mb-2">
                                Grado *
                            </label>

                            <InputText
                                id="grado"
                                value={salonInfo.gradoNombre}
                                onChange={(e) => handleChange('gradoNombre', e.target.value)}
                                placeholder="Ej. 1er Grado"
                                className="w-full"
                                maxLength={50}
                                disabled={true}
                            />
                        </div>

                        {/* Nombre del salón */}
                        <div className="col-12 md:col-6">
                            <label htmlFor="nombreSalon" className="block mb-2">
                                Nombre del salón *
                            </label>

                            <InputText
                                id="nombreSalon"
                                value={salonInfo.salonNombre}
                                onChange={(e) => handleChange('salonNombre', e.target.value)}
                                placeholder="Ej. Aula 01 - Pabellón Primaria"
                                className="w-full"
                                maxLength={50}
                                disabled={deshabilitado}
                            />
                        </div>

                        {/* Turno */}
                        <div className="col-12 md:col-6">
                            <label htmlFor="turno" className="block mb-2">
                                Turno *
                            </label>

                            <InputText
                                id="turno"
                                value={salonInfo.turno}
                                onChange={(e) => handleChange('turno', e.target.value)}
                                placeholder="Ej. Matutino"
                                className="w-full"
                                maxLength={30}
                                disabled={deshabilitado}
                            />
                        </div>

                        {/* Sección */}
                        <div className="col-12 md:col-6">
                            <label htmlFor="seccion" className="block mb-2">
                                Sección *
                            </label>

                            <InputText
                                id="seccion"
                                value={salonInfo.seccion}
                                onChange={(e) => handleChange('seccion', e.target.value)}
                                placeholder="Ej. A"
                                className="w-full"
                                maxLength={30}
                                disabled={deshabilitado}
                            />
                        </div>

                        {/* Año lectivo */}
                        <div className="col-12 md:col-6">
                            <label htmlFor="anioLectivo" className="block mb-2">
                                Año lectivo *
                            </label>

                            <InputText
                                id="anioLectivo"
                                value={salonInfo.anioLectivo}
                                onChange={(e) =>
                                    handleChange('anioLectivo', e.target.value.replace(/\D/g, ''))
                                }
                                placeholder="Ej. 2027"
                                className="w-full"
                                maxLength={4}
                                inputMode="numeric"
                                disabled={deshabilitado}
                            />
                        </div>

                        {/* Botones */}
                        <div className="col-12 flex flex-wrap justify-content-end gap-2 mt-3">
                            <Button
                                type="button"
                                label="Cancelar"
                                icon="pi pi-times"
                                severity="secondary"
                                outlined
                                disabled={guardando}
                                onClick={onCancel}
                            />

                            <Button
                                type="button"
                                label="Restablecer"
                                icon="pi pi-refresh"
                                severity="secondary"
                                outlined
                                disabled={deshabilitado}
                                onClick={restablecer}
                            />

                            <Button
                                type="submit"
                                label={guardando ? 'Guardando...' : 'Guardar cambios'}
                                icon="pi pi-save"
                                severity="success"
                                loading={guardando}
                                disabled={deshabilitado}
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
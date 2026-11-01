import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import {
    getSalones,
    deleteSalon,
    getGrados,
    getCatalogoSalon
} from '../../../Servicios/SalonServicios/salonService';

import Addsalon from './AgregarSalon.js';
import EditarSalon from './EditarCatalogoSalon.js';

// Minúsculas y sin tildes: "Mañana" -> "manana", "Sección" -> "seccion".
const normalizar = (texto = '') =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const TURNOS = ['manana', 'tarde'];

/**
 * Reglas de la búsqueda:
 *  1. Una sola letra (ej. "A")  -> solo secciones iguales a esa letra.
 *  2. Empieza como un turno ("ma", "man", "mañana", "ta", "tarde")
 *                               -> solo ese turno.
 *  3. Cualquier otro texto      -> coincide en grado, salón, sección,
 *                                  turno o año lectivo.
 */
const filtrarSalones = (salones, busqueda) => {
    const q = normalizar(busqueda);

    if (!q) return salones;

    // 1. Una sola letra: sección exacta.
    if (q.length === 1 && /[a-z]/.test(q)) {
        return salones.filter(
            salon => normalizar(salon.seccion) === q
        );
    }

    // 2. Turno (mínimo 2 letras para no confundirlo con una sección).
    const esTurno =
        q.length >= 2 && TURNOS.some(turno => turno.startsWith(q));

    if (esTurno) {
        return salones.filter(salon =>
            normalizar(salon.turno).startsWith(q)
        );
    }

    // 3. Búsqueda general.
    return salones.filter(salon =>
        [
            salon.nombreGrado,
            salon.nombreCatalogo,
            salon.seccion,
            salon.turno,
            salon.anioLectivo
        ].some(campo => normalizar(campo).includes(q))
    );
};

export default function ListarCatalogoSalon() {
    const toast = useRef(null);

    const [salones, setSalones] = useState([]);
    const [loading, setLoading] = useState(false);

    const [busqueda, setBusqueda] = useState('');
    const [primeraFila, setPrimeraFila] = useState(0);

    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);
    const [selectedSalonId, setSelectedSalonId] = useState(null);

    // Salones que se muestran según lo escrito en la barra de búsqueda.
    const salonesFiltrados = useMemo(
        () => filtrarSalones(salones, busqueda),
        [salones, busqueda]
    );

    const cambiarBusqueda = valor => {
        setBusqueda(valor);
        setPrimeraFila(0); // vuelve a la página 1 al buscar
    };

    // Cargar salones y relacionarlos con sus nombres
    const cargarSalones = useCallback(async () => {
        try {
            setLoading(true);

            const [
                respuestaSalones,
                respuestaGrados,
                respuestaCatalogos
            ] = await Promise.all([
                getSalones(),
                getGrados(),
                getCatalogoSalon()
            ]);

            const listaSalones = Array.isArray(respuestaSalones)
                ? respuestaSalones
                : [];

            const listaGrados = Array.isArray(respuestaGrados)
                ? respuestaGrados
                : [];

            const listaCatalogos = Array.isArray(respuestaCatalogos)
                ? respuestaCatalogos
                : [];

            const mapaGrados = new Map(
                listaGrados.map(grado => [
                    Number(grado.idGrado ?? grado.idgrado),
                    grado.nombre
                ])
            );

            const mapaCatalogos = new Map(
                listaCatalogos.map(catalogo => [
                    Number(
                        catalogo.idCatalogoSalon ??
                        catalogo.idcatalogo_salon ??
                        catalogo.idcatalogoSalon
                    ),
                    catalogo.nombreSalon ?? catalogo.nombre_salon
                ])
            );

            const salonesCompletos = listaSalones.map(salon => {
                const idGrado =
                    salon.grado?.idGrado ??
                    salon.idGrado ??
                    salon.grado?.idgrado;

                const idCatalogo =
                    salon.catalogoSalon?.idCatalogoSalon ??
                    salon.catalogoSalon?.idcatalogo_salon ??
                    salon.idCatalogoSalon ??
                    salon.idcatalogo_salon;

                return {
                    ...salon,

                    nombreGrado:
                        salon.grado?.nombre ??
                        mapaGrados.get(Number(idGrado)) ??
                        'Grado no encontrado',

                    nombreCatalogo:
                        salon.catalogoSalon?.nombreSalon ??
                        salon.catalogoSalon?.nombre_salon ??
                        mapaCatalogos.get(Number(idCatalogo)) ??
                        'Catálogo no encontrado'
                };
            });

            setSalones(salonesCompletos);

        } catch (error) {
            console.error('Error al cargar los salones:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la lista de salones.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarSalones();
    }, [cargarSalones]);

    // Eliminar salón
    const handleConfirmDelete = (idSalon) => {
        confirmDialog({
            message: '¿Está seguro de eliminar este salón?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',

            accept: async () => {
                try {
                    await deleteSalon(idSalon);

                    toast.current?.show({
                        severity: 'success',
                        summary: 'Registro eliminado',
                        detail: 'El salón se eliminó correctamente.',
                        life: 3000
                    });

                    await cargarSalones();

                } catch (error) {
                    console.error('Error al eliminar salón:', error);

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo eliminar el salón.',
                        life: 4000
                    });
                }
            }
        });
    };

    // Cierra el modal de edición y limpia el salón seleccionado.
    const cerrarEdicion = () => {
        setShowEditMode(false);
        setSelectedSalonId(null);
    };

    // Botones de acciones
    const actionsBodyTemplate = (rowData) => (
        <div className="flex gap-2 justify-content-center">
            <Button
                icon="pi pi-eye"
                severity="info"
                rounded
                outlined
                tooltip="Ver salón"
                tooltipOptions={{ position: 'top' }}
                onClick={() => {
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Detalle del salón',
                        detail: `Grado: ${rowData.nombreGrado} | Salón: ${rowData.nombreCatalogo}`,
                        life: 4000
                    });
                }}
            />

            <Button
                icon="pi pi-pencil"
                severity="warning"
                rounded
                outlined
                tooltip="Editar salón"
                tooltipOptions={{ position: 'top' }}
                onClick={() => {
                    setSelectedSalonId(rowData.idSalon);
                    setShowEditMode(true);
                }}
            />

            <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                outlined
                tooltip="Eliminar salón"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleConfirmDelete(rowData.idSalon)}
            />
        </div>
    );

    // =========================================================
    // BARRA DE BÚSQUEDA GRANDE (centrada, estilo buscador)
    // =========================================================

    const barraBusqueda = (
        <div className="flex flex-column align-items-center mb-4">
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '720px'
                }}
            >
                <i
                    className="pi pi-search"
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        fontSize: '1.1rem',
                        pointerEvents: 'none'
                    }}
                />

                <input
                    type="text"
                    value={busqueda}
                    onChange={e => cambiarBusqueda(e.target.value)}
                    placeholder="Buscar por sección (A), turno (Mañana o Tarde), grado o salón..."
                    aria-label="Buscar salones"
                    style={{
                        width: '100%',
                        height: '3.25rem',
                        padding: '0 3rem 0 2.75rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        outline: 'none',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                        boxSizing: 'border-box'
                    }}
                />

                {busqueda && (
                    <button
                        type="button"
                        onClick={() => cambiarBusqueda('')}
                        aria-label="Limpiar búsqueda"
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '1rem'
                        }}
                    >
                        <i className="pi pi-times" />
                    </button>
                )}
            </div>

            {busqueda.trim() && (
                <small className="mt-2 text-600">
                    {salonesFiltrados.length}{' '}
                    {salonesFiltrados.length === 1
                        ? 'resultado'
                        : 'resultados'}
                </small>
            )}
        </div>
    );

    const header = (
        <div className="flex flex-wrap justify-content-between align-items-center gap-3">
            <span className="text-lg font-semibold">
                Salones registrados
            </span>

            <Button
                label="Agregar salón"
                icon="pi pi-plus"
                severity="primary"
                onClick={() => setShowAddMode(true)}
            />
        </div>
    );

    return (
        <div className="p-3 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Card title="Lista de salones">
                {barraBusqueda}

                <DataTable
                    value={salonesFiltrados}
                    paginator
                    rows={10}
                    first={primeraFila}
                    onPage={e => setPrimeraFila(e.first)}
                    dataKey="idSalon"
                    stripedRows
                    loading={loading}
                    header={header}
                    emptyMessage={
                        busqueda.trim()
                            ? 'No se encontraron salones con esa búsqueda.'
                            : 'No se encontraron salones registrados.'
                    }
                    responsiveLayout="scroll"
                >
                    <Column
                        field="nombreGrado"
                        header="Grado"
                        sortable
                        style={{ minWidth: '10rem' }}
                    />

                    <Column
                        field="nombreCatalogo"
                        header="Nombre del salón"
                        sortable
                        style={{ minWidth: '12rem' }}
                    />

                    <Column
                        field="turno"
                        header="Turno"
                        sortable
                        style={{ minWidth: '9rem' }}
                    />

                    <Column
                        field="seccion"
                        header="Sección"
                        sortable
                        style={{ minWidth: '8rem' }}
                    />

                    <Column
                        field="anioLectivo"
                        header="Año lectivo"
                        sortable
                        style={{ minWidth: '10rem' }}
                    />

                    <Column
                        header="Acciones"
                        body={actionsBodyTemplate}
                        exportable={false}
                        style={{
                            minWidth: '11rem',
                            textAlign: 'center'
                        }}
                    />
                </DataTable>
            </Card>

            {/* Modal Agregar Salón */}
            <Dialog
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                modal
                onHide={() => setShowAddMode(false)}
                closable={!loading}
                closeOnEscape={!loading}
            >
                <Addsalon
                    cargarSalon={cargarSalones}
                    setEstudiantedoAdd={() => setShowAddMode(false)}
                />
            </Dialog>

            {/* Modal Editar Salón */}
            <Dialog
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                modal
                onHide={cerrarEdicion}
            >
                {selectedSalonId !== null && (
                    <EditarSalon
                        idSalon={selectedSalonId}
                        onCancel={cerrarEdicion}
                        onSalonUpdate={async () => {
                            cerrarEdicion();
                            await cargarSalones();

                            toast.current?.show({
                                severity: 'success',
                                summary: 'Salón actualizado',
                                detail: 'Los cambios se guardaron correctamente.',
                                life: 3000
                            });
                        }}
                    />
                )}
            </Dialog>
        </div>
    );
}
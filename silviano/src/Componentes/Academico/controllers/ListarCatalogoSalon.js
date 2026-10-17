
import React, { useState, useEffect, useCallback, useRef } from 'react';

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

export default function ListarCatalogoSalon() {
    const toast = useRef(null);

    const [salones, setSalones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);

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
                <DataTable
                    value={salones}
                    paginator
                    rows={10}
                    dataKey="idSalon"
                    stripedRows
                    loading={loading}
                    header={header}
                    emptyMessage="No se encontraron salones registrados."
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
                            minWidth: '8rem',
                            textAlign: 'center'
                        }}
                    />
                </DataTable>
            </Card>

            <Dialog
                header="Registrar nuevo salón"
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
        </div>
    );
}

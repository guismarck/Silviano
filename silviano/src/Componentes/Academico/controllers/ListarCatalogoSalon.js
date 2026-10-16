import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { getSalones, deleteSalon, getGrados, getCattalogoSalon } from '../../../Servicios/SalonServicios/salonService';
//import VerEstudiante from '../../../Servicios/EstudiantesServicios/VerEstudiantes';
//import AddEstudiante from '../../../Servicios/EstudiantesServicios/AgregarEstudiantes';
//import UpdateEstudiante from '../../../Servicios/EstudiantesServicios/EditarEstudiantes';
//import BuscarEstudiantes from '../../../Servicios/EstudiantesServicios/BuscarEstudiantes';


export default function ListarCatalogoSalon() {

    const toast = useRef(null);

    const [salones, setSalones] = useState([]);
    const [loading, setLoading] = useState(false);



    const [showViewMode, setShowViewMode] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);
    const [selectedSalonesId, setSelectedSalonesId] = useState(null);


    const cargarSalones = async () => {
        try {
            setLoading(true);

            const [respuestaSalones, respuestaGrados, respuestaCatalogos] =
                await Promise.all([
                    getSalones(),
                    getGrados(),
                    getCattalogoSalon()
                ]);

            // Relacionar los grados por su identificador
            const mapaGrados = new Map(
                respuestaGrados.map(grado => [
                    Number(grado.idGrado),
                    grado.nombre
                ])
            );

            // Relacionar el catálogo de salones por su identificador
            const mapaCatalogos = new Map(
                respuestaCatalogos.map(catalogo => [
                    Number(catalogo.idCatalogoSalon),
                    catalogo.nombreSalon
                ])
            );

            // Combinar los tres servicios
            const salonesCompletos = respuestaSalones.map(salon => ({
                ...salon,

                nombreGrado:
                    salon.grado?.nombre ??
                    mapaGrados.get(Number(salon.grado?.idGrado)) ??
                    'Grado no encontrado',

                nombreCatalogo:
                    salon.catalogoSalon?.nombreSalon ??
                    mapaCatalogos.get(
                        Number(salon.catalogoSalon?.idCatalogoSalon)
                    ) ??
                    'Catálogo no encontrado'
            }));

            setSalones(salonesCompletos);

        } catch (error) {
            console.error('Error al cargar los salones:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarSalones();
    }, []);

    const handleConfirmDelete = (idSalon) => {
        confirmDialog({
            message: '¿Está seguro de eliminar el salon?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí, Eliminar',
            rejectLabel: 'Cancelar',
            accept: async () => {
                try {
                    await deleteSalon(idSalon);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Registro Eliminado',
                        detail: 'El estudiante ha sido removido del sistema.',
                        life: 3000
                    });
                    cargarSalones();
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se logró eliminar el registro seleccionado.',
                        life: 4000
                    });
                }
            }
        });
    };

    const nivelBodyTemplate = (rowData) => {

        return rowData.nivelEducativo.nombre;
    };


    const actionsBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-eye"
                    severity="info"
                    rounded
                    outlined
                    //tooltip="Ver Expediente"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedSalonesId(rowData.idSalon);
                        setShowViewMode(true);
                    }}
                />
                <Button
                    icon="pi pi-pencil"
                    severity="warning"
                    rounded
                    outlined
                    //tooltip="Editar Estudiante"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        //setSelectedSalonesId(rowData.idSalon);
                        setShowEditMode(true);
                    }}
                />
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    outlined
                    //tooltip="Eliminar"
                    tooltipOptions={{ position: 'top' }}
                //onClick={() => handleConfirmDelete(rowData.idSalon)}
                />
            </div>
        );
    };

    // Buscador centrado y más amplio
    const header = (
        <div className="flex justify-content-center align-items-center w-full py-2">
            <div className="w-full md:w-8" style={{ minWidth: '320px' }}>

            </div>
        </div>
    );

    return (
        <div className="p-3 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Card title="Lista de Salones">
                <DataTable
                    value={salones}
                    paginator
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    dataKey="idSalon"
                    stripedRows
                    loading={loading}
                    header={header}
                    emptyMessage="No se encontraron salones registrados."
                    responsiveLayout="scroll"
                >
                    <Column field="nombreGrado" header="Grado"  sortable style={{ minWidth: '10rem' }}
                    />

                    <Column field="nombreCatalogo" header="Pabellón" sortable  style={{ minWidth: '12rem' }}
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
                        style={{ minWidth: '10rem', textAlign: 'center' }}
                    />
                </DataTable>

                {/* Sección de acciones inferior dentro del Fieldset */}
                <Fieldset legend="Acciones" className="mt-4">
                    <div className="flex flex-wrap gap-3 align-items-center">
                        <Button
                            label="Nuevo Estudiante"
                            icon="pi pi-plus"
                            severity="primary"
                            onClick={() => setShowAddMode(true)}
                        />

                    </div>
                </Fieldset>
            </Card>

            {/* Modal Ver Estudiante */}
            <Dialog
                header="Detalle del Expediente"
                visible={showViewMode}
                style={{ width: '90vw', maxWidth: '700px' }}
                onHide={() => {
                    setShowViewMode(false);
                    //setSelectedSalonId(null);
                }}
            >
                {/*selectedSalonId && <VerEstudiante idPersona={selectedSalonId}/> */}
            </Dialog>

            {/* Modal Agregar Estudiante */}
            <Dialog
                header="Registrar Nuevo Estudiante"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => setShowAddMode(false)}
            >
            </Dialog>

            {/* Modal Editar Estudiante */}
            <Dialog
                header="Editar Expediente de Estudiante"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => {
                    setShowEditMode(false);

                }}
            >

            </Dialog>
        </div>
    );
}
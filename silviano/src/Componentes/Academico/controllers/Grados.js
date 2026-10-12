import React, { useState, useEffect, useCallback, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';
import { InputText } from 'primereact/inputtext';


import { getGrados, getNivelEducativo, buscarGrados, obtenerNivelesParaBusqueda } from '../../../Servicios/GradoServicios/gradoService';
import Addgrado from '../../../Servicios/GradoServicios/AgregarGrados';
import Updategrado from '../../../Servicios/GradoServicios/EditarGrado';
import VerGrado from '../../../Servicios/GradoServicios/VerGrados';
import EliminarGrado from '../../../Servicios/GradoServicios/eliminarGrados';


export default function ListarGrados() {
    /**
     * declaaracion de variables
     */
    const toast = useRef(null);
    const [grados, setGrados] = useState([]);
    const [niveles, setNiveles] = useState([]);

    const [showViewMode, setShowViewMode] = useState(false);
    const [showAddMode, setShowAddMode,] = useState(false);
    const [showEditMode, setShowEditMode,] = useState(false);
    const [showDeleteMode, setShowDeleteMode] = useState(false);

    const [nombreBusqueda, setNombreBusqueda] = useState('');
    const [nivelBusqueda, setNivelBusqueda] = useState(null);
    const [nivelesBusqueda, setNivelesBusqueda] = useState([]);
    const [buscando, setBuscando] = useState(false);

    const [loading, setLoading] = useState(false);
    const [selectedGradoId, setSelectedGradoId] = useState(null);

    const cargarGrados = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getGrados();
            setGrados(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar la lista de grados.',
                life: 4000
            });
        } finally {
            setLoading(false);
        }


        const data = await getGrados();
        console.log("Grados recibidos:", data);
        setGrados(Array.isArray(data) ? data : []);

    }, []);

    const cargarNivel = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNivelEducativo();
            setNiveles(Array.isArray(data) ? data : []);
            console.log(data)
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de Red',
                detail: 'No se pudo cargar Niveles.',
                life: 4000
            });
            console.log(error)
        } finally {
            setLoading(false);
        }
        const data = await getGrados();
        console.log("Grados recibidos:", data);
        setGrados(Array.isArray(data) ? data : []);
    }, []);

    const nivelBodyTemplate = (rowData) => {
        return rowData.nivelEducativo.nombre;
    };



    useEffect(() => {
        cargarGrados();
        // cargarNivel();
    }, [cargarGrados, cargarNivel]);

    // Cargar niveles educativos para el filtro opcional
    const cargarNivelesBusqueda = async () => {
        try {
            const data = await obtenerNivelesParaBusqueda();

            setNivelesBusqueda(
                data.map((nivel) => ({
                    label: nivel.nombre ?? nivel.descripcion,
                    value: nivel.idnivel ?? nivel.idNivel
                }))
            );
        } catch (error) {
            console.error(
                'Error al cargar los niveles educativos:',
                error
            );
        }
    };

    // Buscar grados por nombre y, opcionalmente, por nivel
    const ejecutarBusqueda = async (nombre = nombreBusqueda) => {
        try {
            setBuscando(true);

            const resultados = await buscarGrados({
                nombre,
                idNivel: nivelBusqueda ?? ''
            });

            setGrados(resultados);
        } catch (error) {
            console.error('Error al buscar grados:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron consultar los grados.',
                life: 3000
            });
        } finally {
            setBuscando(false);
        }
    };

    // Limpiar filtros y volver a cargar todos los grados
    const limpiarBusqueda = async () => {
        setNombreBusqueda('');
        setNivelBusqueda(null);

        try {
            setBuscando(true);

            const resultados = await buscarGrados();

            setGrados(resultados);
        } catch (error) {
            console.error(
                'Error al cargar todos los grados:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar el listado de grados.',
                life: 3000
            });
        } finally {
            setBuscando(false);
        }
    };

    // Cargar niveles al iniciar el componente
    useEffect(() => {
        cargarNivelesBusqueda();
    }, []);



    const actionsBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-eye"
                    severity="info"
                    rounded
                    outlined
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedGradoId(rowData.idGrado);
                        setShowViewMode(true);
                    }}
                />
                <Button
                    icon="pi pi-pencil"
                    severity="warning"
                    rounded
                    outlined
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedGradoId(rowData.idGrado);
                        setShowEditMode(true);
                    }}
                />
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    outlined
                    tooltip="Eliminar grado"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        setSelectedGradoId(rowData.idGrado);
                        setShowDeleteMode(true);
                    }}
                />
            </div>
        );
    };

    return (
        <div className="p-3 md:p-4">



            <Toast ref={toast} />
            <ConfirmDialog />


            <Card title="Grados">
                <div className="flex justify-content-between align-items-center
                flex-wrap gap-3 mb-4 ">

                    <span className="p-input-icon-left w-full md:w-20rem">
                        <i className="pi pi-search" />

                        <InputText 
                            value={nombreBusqueda}
                            onChange={(e) => {
                                const valor = e.target.value;
                                setNombreBusqueda(valor);
                                ejecutarBusqueda(valor);
                            }}
                            placeholder="Buscar grado por nombre..."
                            className="w-full"
                        />
                    </span>

                    {nombreBusqueda && (
                        <Button
                           // icon="pi pi-times"
                            severity="secondary"
                            text
                            rounded
                            tooltip="Limpiar búsqueda"
                            onClick={limpiarBusqueda}
                            disabled={buscando}
                        />
                    )}
                </div>
                <DataTable    emptyMessage="No se encontraron grados."   loading={buscando} value={grados} stripedRows tableStyle={{ minWidth: '50rem' }}>
                    <Column field="idGrado" header="ID-Grado" style={{ width: '25%' }}></Column>
                    <Column header="Nivel educativo" body={nivelBodyTemplate} style={{ width: '25%' }} />
                    <Column field="nombre" header="Nombre" style={{ width: '25%' }}></Column>
                    <Column header="Accion" body={actionsBodyTemplate} ></Column>
                </DataTable>


                {/* Sección de acciones inferior dentro del Fieldset */}
                <Fieldset legend="Acciones" className="mt-4">
                    <div className="flex flex-wrap gap-3 align-items-center">
                        <Button
                            label="Nuevo Grado"
                            icon="pi pi-plus"
                            severity="primary"
                            onClick={() => setShowAddMode(true)}
                        />

                    </div>
                </Fieldset>

            </Card>
            <Dialog
                header="Consultar grado académico"
                visible={showViewMode}
                style={{ width: '90vw', maxWidth: '600px' }}
                onHide={() => {
                    setShowViewMode(false);
                    setSelectedGradoId(null);
                }}
            >
                {selectedGradoId !== null && selectedGradoId !== undefined && (
                    <VerGrado
                        idGrado={selectedGradoId}
                        onCerrar={() => {
                            setShowViewMode(false);
                            setSelectedGradoId(null);
                        }}
                    />
                )}
            </Dialog>

            {/* Modal Agregar Grado */}
            <Dialog
                header="Registrar Nuevo Grado"
                visible={showAddMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => setShowAddMode(false)}
            >
                <Addgrado
                    cargarGrado={cargarGrados}
                    setGradoAdd={() => setShowAddMode(true)}
                />
            </Dialog>



            {/* Modal Editar Grado */}
            <Dialog
                header="Editar Grado"
                visible={showEditMode}
                style={{ width: '90vw', maxWidth: '850px' }}
                onHide={() => {
                    setShowEditMode(false);
                    setSelectedGradoId(null);
                }}

            >
                {selectedGradoId && (
                    <Updategrado
                        idPersona={selectedGradoId}
                        onEstudianteUpdate={() => {
                            setShowEditMode(false);
                            setSelectedGradoId(null);
                            cargarGrados();
                        }}
                    />
                )}
            </Dialog>

            <Dialog
                header="Eliminar grado académico"
                visible={showDeleteMode}
                style={{ width: '90vw', maxWidth: '600px' }}
                modal
                closable={!loading}
                onHide={() => {
                    setShowDeleteMode(false);
                    setSelectedGradoId(null);
                }}
            >
                {selectedGradoId !== null &&
                    selectedGradoId !== undefined && (
                        <EliminarGrado
                            idGrado={selectedGradoId}
                            onCancelar={() => {
                                setShowDeleteMode(false);
                                setSelectedGradoId(null);
                            }}
                            onEliminado={async () => {
                                setShowDeleteMode(false);
                                setSelectedGradoId(null);

                                toast.current?.show({
                                    severity: 'success',
                                    summary: 'Eliminación exitosa',
                                    detail: 'El grado se eliminó correctamente.',
                                    life: 3000
                                });

                                await cargarGrados();
                            }}
                        />
                    )}
            </Dialog>


        </div>

    );
}



import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Fieldset } from 'primereact/fieldset';
import { InputText } from 'primereact/inputtext';

import { getGrados, getNivelEducativo, buscarGrados, obtenerNivelesParaBusqueda,eliminarGradoPorId } from '../../../Servicios/GradoServicios/gradoService';
import Addgrado from '../../../Servicios/GradoServicios/AgregarGrados';
import Updategrado from '../../../Servicios/GradoServicios/EditarGrado';
import VerGrado from '../../../Servicios/GradoServicios/VerGrados';
import EliminarGrado from '../../../Servicios/GradoServicios/eliminarGrados';


export default function ListarGrados() {
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

    // Filtro por nombre del grado y nombre del nivel educativo.
    // Cada palabra escrita debe aparecer en alguno de los dos ("primaria 4to").
    const gradosFiltrados = useMemo(() => {
        const terminos = normalizarNombre(busqueda).split(/\s+/).filter(Boolean);
        if (terminos.length === 0) return grados;

        return grados.filter((g) => {
            const texto = normalizarNombre(`${g.nombre ?? ''} ${g.nivelEducativo?.nombre ?? ''}`);
            return terminos.every((t) => texto.includes(t));
        });
    }, [grados, busqueda]);

    const mostrarToast = useCallback((severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    }, []);

    const cargarGrados = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getGrados();

            setGrados(
                data.map((grado) => ({
                    ...grado,
                    idGrado: grado.idGrado ?? grado.id,
                    nombre: grado.nombre ?? grado.nombreGrado
                }))
            );
        } catch (error) {
            console.error('Error al cargar los grados:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la lista de grados.',
                life: 4000
            });
        } finally {
            setBuscando(false);
        }
    }, []);

    // const nivelBodyTemplate = (rowData) => {
    //     return rowData.nivelEducativo.nombre;
    // };



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



    // Mostrar el nombre del nivel educativo.
    const nivelBodyTemplate = (rowData) => {
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

    const confirmarEliminar = (grado) => {
        confirmDialog({
            message: `¿Desea eliminar el grado "${grado.nombre}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => eliminarGradoPorId(grado.idGrado)
        });
    };

    const actionsBodyTemplate = (rowData) => (
        <div className="flex gap-2 justify-content-center">
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
                tooltipOptions={{ position: 'top' }}
                onClick={() => confirmarEliminar(rowData)}
            />
        </div>
    );

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
                    // Revisa en AgregarGrados.js con qué valor llama a setGradoAdd:
                    // aquí se espera true para mostrar el modal y false para cerrarlo.
                    setGradoAdd={(visible) => setShowAddMode(Boolean(visible))}
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
                        idGrado={selectedGradoId}
                        onGradoUpdate={async () => {
                            cerrarEdicion();
                            await cargarGrados();
                            mostrarToast('success', 'Grado actualizado', 'Los cambios se guardaron correctamente.');
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



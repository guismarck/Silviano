import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../../../context/AuthContext';
import { asignacionDocenteService } from '../../../Servicios/DocenteServicios/asignacionDocenteService';  

export const AsignacionDocente = () => {
  const toast = useRef(null);
  const { user } = useAuth(); // Extracción del usuario en sesión

  // Catálogos
  const [docentes, setDocentes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [salones, setSalones] = useState([]);

  // Formulario
  const [docenteSel, setDocenteSel] = useState(null);
  const [planSel, setPlanSel] = useState(null);
  const [asignaturaSel, setAsignaturaSel] = useState(null);
  const [salonSel, setSalonSel] = useState(null);

  // Tabla
  const [cargaDocente, setCargaDocente] = useState([]);

  // Loaders
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingTabla, setLoadingTabla] = useState(false);
  const [loadingSalones, setLoadingSalones] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const anioLectivoActual = new Date().getFullYear();

  // Carga inicial de catálogos con Promise.allSettled
  useEffect(() => {
    const cargarCatalogosIniciales = async () => {
      setLoadingCatalogos(true);

      const resultados = await Promise.allSettled([
        asignacionDocenteService.obtenerDocentes(),
        asignacionDocenteService.obtenerPlanesDeEstudio(anioLectivoActual),
        asignacionDocenteService.obtenerCatalogoAsignaturas(),
    
      ]);

      if (resultados[0].status === 'fulfilled') setDocentes(resultados[0].value);
      if (resultados[1].status === 'fulfilled') setPlanes(resultados[1].value);
      if (resultados[2].status === 'fulfilled') setAsignaturas(resultados[2].value);

      setLoadingCatalogos(false);
    };

    cargarCatalogosIniciales();
  }, [anioLectivoActual]);

   useEffect(() => {
    let vigente = true;
    setSalonSel(null);
    setSalones([]);

    const cargarSalonesDisponibles = async () => {
      if (!planSel?.idGrado || !planSel?.anioLectivo) {
        setLoadingSalones(false);
        return;
      }

      setLoadingSalones(true);
      try {
        const salonesDisponibles = await asignacionDocenteService.obtenerSalonesDisponiblesPorGrado(
          planSel.idGrado,
          planSel.anioLectivo
        );
        if (vigente) setSalones(salonesDisponibles);
      } catch (error) {
        if (vigente) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error al cargar salones',
            detail: error.message,
            life: 4000,
          });
        }
      } finally {
        if (vigente) setLoadingSalones(false);
      }
    };

    cargarSalonesDisponibles();

    return () => {
      vigente = false;
    };
  }, [planSel]);


  const cargarCargaDocente = useCallback(async (idDocente) => {
    if (!idDocente) {
      setCargaDocente([]);
      return;
    }

    setLoadingTabla(true);
    try {
      const data = await asignacionDocenteService.obtenerCargaAcademicaDocente(idDocente);
      setCargaDocente(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al consultar carga',
        detail: error.message,
        life: 3000,
      });
    } finally {
      setLoadingTabla(false);
    }
  }, []);

  const handleDocenteChange = (e) => {
    const docente = e.value;
    setDocenteSel(docente);
    if (docente) {
      cargarCargaDocente(docente.idpersona);
    } else {
      setCargaDocente([]);
    }
  };

  const handleGuardarAsignacion = async (e) => {
    e.preventDefault();

    if (!docenteSel || !planSel || !asignaturaSel || !salonSel) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor, complete todos los selectores antes de guardar.',
        life: 3000,
      });
      return;
    }

    // Extracción e imposición de casting Integer para cumplir anotaciones @NotNull del DTO
    const idDocenteNum = Number(docenteSel.idpersona);
    const idPlanNum = Number(planSel.idPlanDeEstudio);
    const idAsignaturaNum = Number(asignaturaSel.idAsignatura);
    const idSalonNum = Number(salonSel.idSalon);
    const usuarioCreacion = user?.username || user?.nombreCompleto || 'admin_system';

    // Validación preventiva en cliente para descartar Bad Request (400)
    if (isNaN(idDocenteNum) || isNaN(idPlanNum) || isNaN(idAsignaturaNum) || isNaN(idSalonNum)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Datos',
        detail: 'Uno o más identificadores seleccionados no tienen un formato numérico válido.',
        life: 4000,
      });
      return;
    }

    // Payload idéntico a DocenteAsignacionRequestDTO
    const payload = {
      idDocente: idDocenteNum,
      idPlanDeEstudio: idPlanNum,
      idAsignatura: idAsignaturaNum,
      idSalon: idSalonNum,
      usuarioCreacion: usuarioCreacion,
    };

    setSubmitting(true);
    try {
      await asignacionDocenteService.asignarCargaDocente(payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Asignación Correcta',
        detail: `Materia "${asignaturaSel.nombre}" asignada exitosamente `,
        life: 3000,
      });

      setAsignaturaSel(null);
      setSalonSel(null);
      cargarCargaDocente(docenteSel.idpersona);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error HTTP 400 / Servidor',
        detail: error.message,
        life: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmarEliminacion = (row) => {
    confirmDialog({
      message: '¿Está seguro de eliminar esta asignatura del expediente docente?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await asignacionDocenteService.eliminarAsignacion(
            row.idDetallePlanDeEstudio,
            docenteSel.idpersona
          );
          toast.current?.show({
            severity: 'success',
            summary: 'Asignación Removida',
            detail: 'Registro eliminado correctamente.',
            life: 3000,
          });
          cargarCargaDocente(docenteSel.idpersona);
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error al Eliminar',
            detail: error.message,
            life: 4000,
          });
        }
      },
    });
  };

  const turnoTemplate = (rowData) => {
    const severityMap = {
      MATUTINO: 'info',
      VESPERTINO: 'warning',
      NOCTURNO: 'danger',
    };
    const key = (rowData.turno || '').toUpperCase();
    return <Tag value={rowData.turno || 'MATUTINO'} severity={severityMap[key] || 'success'} />;
  };

  const salonSeccionTemplate = (rowData) => {
    const salonSeccion = [rowData.nombreSalon, rowData.seccion]
      .filter(Boolean)
      .join(' - ');

    return salonSeccion || 'No disponible';
  };

  const accionesTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-text"
        onClick={() => confirmarEliminacion(rowData)}
        tooltip="Desasignar Materia"
        tooltipOptions={{ position: 'bottom' }}
      />
    );
  };

  return (
    <div className="card p-4 shadow-1 border-round bg-white">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="border-bottom-1 surface-border pb-3 mb-4">
        <h2 className="text-xl font-bold text-900 m-0 flex align-items-center gap-2">
          <i className="bx bx-plus-circle text-primary text-2xl"></i>
          Asignación Académica Docente - Año Lectivo {anioLectivoActual}
        </h2>
      </div>

      <form onSubmit={handleGuardarAsignacion} className="p-fluid grid mb-4">
        <div className="col-12 col-md-3 mb-3">
          <label htmlFor="docente" className="font-semibold text-700 block mb-2">
            1. Docente MINED
          </label>
          <Dropdown
            id="docente"
            value={docenteSel}
            options={docentes}
            onChange={handleDocenteChange}
            optionLabel="labelCompleto"
            placeholder="Seleccione Docente"
            filter
            showClear
            disabled={loadingCatalogos}
          />
        </div>

        <div className="col-12 col-md-3 mb-3">
          <label htmlFor="plan" className="font-semibold text-700 block mb-2">
            2. Plan de Estudio
          </label>
          <Dropdown
            id="plan"
            value={planSel}
            options={planes}
            onChange={(e) => setPlanSel(e.value)}
            optionLabel="labelPlan"
            placeholder="Seleccione Plan"
            filter
            disabled={!docenteSel || loadingCatalogos}
          />
        </div>

        <div className="col-12 col-md-3 mb-3">
          <label htmlFor="asignatura" className="font-semibold text-700 block mb-2">
            3. Asignatura
          </label>
          <Dropdown
            id="asignatura"
            value={asignaturaSel}
            options={asignaturas}
            onChange={(e) => setAsignaturaSel(e.value)}
            optionLabel="nombre"
            placeholder="Seleccione Asignatura"
            filter
            disabled={!planSel || loadingCatalogos}
          />
        </div>

          <div className="col-12 col-md-3 mb-3">
          <label htmlFor="salon" className="font-semibold text-700 block mb-2">
            4. Salón / Sección
          </label>
          <Dropdown
            id="salon"
            value={salonSel}
            options={salones}
            onChange={(e) => setSalonSel(e.value)}
            optionLabel="labelSalon"
            placeholder="Seleccione Salón"
            filter
            disabled={!asignaturaSel || loadingCatalogos || loadingSalones}
          />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-2">
          <Button
            type="submit"
            label="Guardar Asignación"
            icon="pi pi-check-circle"
            loading={submitting}
            disabled={!docenteSel || !planSel || !asignaturaSel || !salonSel}
            className="p-button-success font-bold"
            style={{ maxWidth: '240px' }}
          />
        </div>
      </form>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-800 mb-3 flex align-items-center gap-2">
          <i className="bx bx-list-check text-primary text-xl"></i>
          Materias Registradas
          {docenteSel && (
            <span className="text-sm font-normal text-600">
              ({docenteSel.nombreCompleto})
            </span>
          )}
        </h3>

        <DataTable
          value={cargaDocente}
          loading={loadingTabla}
          emptyMessage="No hay asignaciones registradas para el docente seleccionado."
          responsiveLayout="scroll"
          className="p-datatable-sm p-datatable-gridlines"
        >
          <Column field="asignatura_nombre" header="Asignatura" sortable className="font-bold text-800" />
          <Column field="grado_nombre" header="Grado Académico" sortable />
          <Column
            field="nombreSalon"
            header="Salón / Sección"
            body={salonSeccionTemplate}
            sortable
          />
          <Column field="turno" header="Turno" body={turnoTemplate} style={{ width: '130px', textAlign: 'center' }} />
          <Column field="anio_lectivo" header="Año Lectivo" style={{ width: '120px', textAlign: 'center' }} />
          <Column
            body={accionesTemplate}
            exportable={false}
            style={{ width: '90px', textAlign: 'center' }}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default AsignacionDocente;
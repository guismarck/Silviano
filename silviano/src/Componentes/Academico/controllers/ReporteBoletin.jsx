import React, { useState, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { reportesService } from '../../../Servicios/ReporteServicios/reportesService';

export const ReporteBoletin = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    codigoMined: '',
    periodoLectivo: '2026',
    formato: 'pdf',
  });

  const formatosOptions = [
    { label: 'Documento PDF (.pdf)', value: 'pdf' },
    { label: 'Hoja de Cálculo Excel (.xlsx)', value: 'xlsx' },
  ];

  // Handler unificado inmutable para inputs
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleGenerarBoletin = async (e) => {
    e.preventDefault();

    if (!filtros.codigoMined.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingrese un Código MINED válido para generar el boletín.',
      });
      return;
    }

    setLoading(true);
    try {
      await reportesService.descargarBoletin(
        filtros.codigoMined,
        filtros.periodoLectivo,
        filtros.formato
      );
      toast.current?.show({
        severity: 'success',
        summary: 'Reporte Generado',
        detail: 'El archivo se ha descargado correctamente.',
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Reportes',
        detail: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow-1 border-round bg-white">
      <Toast ref={toast} />
      <h3 className="text-xl font-bold mb-4 text-800 flex align-items-center gap-2">
        <i className="bx bx-file text-primary text-2xl"></i>
        Emisión de Boletín Académico MINED
      </h3>

      <form onSubmit={handleGenerarBoletin} className="p-fluid grid">
        <div className="col-12 col-md-4 mb-3">
          <label htmlFor="codigoMined" className="font-semibold block mb-2 text-700">
            Código MINED Estudiante
          </label>
          <InputText
            id="codigoMined"
            name="codigoMined"
            value={filtros.codigoMined}
            onChange={handleInputChange}
            placeholder="Ej. MINED-2026-88"
          />
        </div>

        <div className="col-12 col-md-4 mb-3">
          <label htmlFor="periodoLectivo" className="font-semibold block mb-2 text-700">
            Año Lectivo
          </label>
          <InputText
            id="periodoLectivo"
            name="periodoLectivo"
            value={filtros.periodoLectivo}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-12 col-md-4 mb-3">
          <label htmlFor="formato" className="font-semibold block mb-2 text-700">
            Formato de Exportación
          </label>
          <Dropdown
            id="formato"
            value={filtros.formato}
            options={formatosOptions}
            onChange={(e) => setFiltros((prev) => ({ ...prev, formato: e.value }))}
            placeholder="Seleccione Formato"
          />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-2">
          <Button
            type="submit"
            label="Descargar Reporte"
            icon="pi pi-download"
            loading={loading}
            className="p-button-success font-bold"
          />
        </div>
      </form>
    </div>
  );
};
export default ReporteBoletin;
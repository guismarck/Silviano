import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ListMatriculas from './ListMatriculas';
import RegistroMatricula from './RegistroMatricula';
import VerMatriculas from './VerMatriculas';

export const MatriculaPage = () => {
  // Estados para control de vistas: 'list' | 'registro' | 'ver'
  const [vistaActiva, setVistaActiva] = useState('list');
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const toast = useRef(null);

  // Navegar a la pantalla de Registro
  const handleIrARegistro = () => {
    setMatriculaSeleccionada(null);
    setVistaActiva('registro');
  };

  // Navegar a la pantalla de Detalle/Ver
  const handleIrAVer = (matricula) => {
    setMatriculaSeleccionada(matricula);
    setVistaActiva('ver');
  };

  // Regresar al listado y recargar datos
  const handleVolverAListado = (mensajeExito = null) => {
    setVistaActiva('list');
    if (mensajeExito) {
      toast.current?.show({
        severity: 'success',
        summary: 'Proceso MINED Exitoso',
        detail: mensajeExito,
        life: 3500
      });
      setReloadTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="p-3">
      <Toast ref={toast} />

      {/* Renderizado condicional estricto por pantalla */}
      {vistaActiva === 'list' && (
        <ListMatriculas
          onNuevaMatricula={handleIrARegistro}
          onViewMatricula={handleIrAVer}
          reloadTrigger={reloadTrigger}
        />
      )}

      {vistaActiva === 'registro' && (
        <RegistroMatricula
          onCancelar={() => handleVolverAListado()}
          onGuardadoExitoso={() => handleVolverAListado('Matrícula registrada correctamente en el sistema.')}
        />
      )}

      {vistaActiva === 'ver' && (
        <VerMatriculas
          matricula={matriculaSeleccionada}
          onVolver={() => handleVolverAListado()}
        />
      )}
    </div>
  );
};

export default MatriculaPage;
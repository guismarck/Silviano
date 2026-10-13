import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

import { getGrados } from './gradoService.js';

export default function VerGrado({ idGrado, onCerrar }) {
  const [grado, setGrado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarGrado = async () => {
      setCargando(true);
      setError('');
      setGrado(null);

      try {
        // Consulta los grados mediante el servicio Axios existente.
        const respuesta = await getGrados();

        const lista = Array.isArray(respuesta) ? respuesta : [];

        // Busca únicamente el grado seleccionado.
        const encontrado = lista.find(
          (item) =>
            String(item.idGrado ?? item.id) === String(idGrado)
        );

        if (!encontrado) {
          throw new Error('No se encontró el grado seleccionado.');
        }

        if (activo) {
          setGrado(encontrado);
        }
      } catch (err) {
        if (activo) {
          setError(
            err.message || 'No se pudieron consultar los datos del grado.'
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    if (idGrado !== null && idGrado !== undefined) {
      cargarGrado();
    } else {
      setError('No se ha seleccionado ningún grado.');
      setCargando(false);
    }

    return () => {
      activo = false;
    };
  }, [idGrado]);

  const nombreNivel =
    grado?.nivelEducativo?.nombre ??
    grado?.nivelEducativo?.descripcion ??
    grado?.nivelEducativo?.nivel ??
    'No disponible';

  return (
    <Card title="Información del grado académico">
      {cargando && (
        <div className="flex flex-column align-items-center gap-2 p-4">
          <ProgressSpinner style={{ width: '45px', height: '45px' }} />
          <span>Consultando información...</span>
        </div>
      )}

      {!cargando && error && (
        <Message severity="error" text={error} className="w-full" />
      )}

      {!cargando && grado && !error && (
        <div className="flex flex-column gap-4">
          <div className="field">
            <label className="block font-bold mb-2">
              ID del grado
            </label>
            <div className="p-3 border-round surface-100">
              {grado.idGrado ?? grado.id}
            </div>
          </div>

          <div className="field">
            <label className="block font-bold mb-2">
              Nombre del grado
            </label>
            <div className="p-3 border-round surface-100">
              {grado.nombre ?? grado.nombreGrado ?? 'No disponible'}
            </div>
          </div>

          <div className="field">
            <label className="block font-bold mb-2">
              Nivel educativo
            </label>
            <div className="p-3 border-round surface-100">
              {nombreNivel}
            </div>
          </div>

          <div className="flex justify-content-end">
            <Button
              label="Cerrar"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={onCerrar}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
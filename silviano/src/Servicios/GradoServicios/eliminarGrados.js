
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { getGrados, eliminarGradoPorId  } from './gradoService.js';


const EliminarGrado = ({ idGrado, onCancelar, onEliminado }) => {
  const [grado, setGrado] = useState({
    idGrado: '',
    nombre: '',
    nivelEducativo: ''
  });

  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');

        const datos = await getGrados();
        const lista = Array.isArray(datos) ? datos : [];

        const encontrado = lista.find(
          (item) =>
            String(item.idGrado ?? item.id) === String(idGrado)
        );

        if (!encontrado) {
          setError('No se encontró el grado seleccionado.');
          return;
        }

        setGrado({
          idGrado: encontrado.idGrado ?? encontrado.id ?? '',
          nombre: encontrado.nombre ?? encontrado.nombreGrado ?? '',
          nivelEducativo:
            encontrado.nivelEducativo?.nombre ??
            encontrado.nivelEducativo?.descripcion ??
            encontrado.nivelEducativo?.nivel ??
            ''
        });
      } catch (err) {
        setError('No se pudieron cargar los datos del grado.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [idGrado]);

  const confirmarEliminacion = async () => {
    try {
      setEliminando(true);
      setError('');

      await eliminarGradoPorId(grado.idGrado);

      onEliminado?.();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el grado.');
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center p-4">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Card className="shadow-2">
      <div className="text-center mb-4">
        <i
          className="pi pi-exclamation-triangle text-red-500"
          style={{ fontSize: '3rem' }}
        />
        <h3 className="mt-3 mb-2">Confirmar eliminación</h3>
        <p className="text-600">
          ¿Estás seguro de que deseas eliminar este grado?
        </p>
      </div>

      {error && (
        <Message
          severity="error"
          text={error}
          className="w-full mb-3"
        />
      )}

      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="idGrado">Código del grado</label>
          <InputText
            id="idGrado"
            value={String(grado.idGrado)}
            readOnly
            className="w-full"
            disable
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="nombreGrado">Nombre del grado</label>
          <InputText
            id="nombreGrado"
            value={grado.nombre}
            readOnly
            className="w-full"
            disable
          />
        </div>

        <div className="field mb-4">
          <label htmlFor="nivelEducativo">Nivel educativo</label>
          <InputText
            id="nivelEducativo"
            value={grado.nivelEducativo}
            readOnly
            className="w-full"
            disable
          />
        </div>
      </div>

      <div className="flex justify-content-end gap-2 flex-wrap">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={onCancelar}
          disabled={eliminando}
        />

        <Button
          label={eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          icon="pi pi-trash"
          severity="danger"
          onClick={confirmarEliminacion}
          loading={eliminando}
          disabled={!grado.idGrado || !!error}
        />
      </div>
    </Card>
  );
};

export default EliminarGrado;

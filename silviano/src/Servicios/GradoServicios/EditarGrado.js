
import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import {
   getGrados,
   getNivelEducativo,
   actualizarGrado
} from './gradoService.js';

const valoresIniciales = {
   nombre: '',
   nivelEducativo: {
      idnivel: null
   }
};

const EditarGrado = ({ idGrado, onGradoUpdate }) => {
   const toast = useRef(null);

   const [niveles, setNiveles] = useState([]);
   const [cargandoDatos, setCargandoDatos] = useState(true);
   const [guardando, setGuardando] = useState(false);

   const {
      control,
      handleSubmit,
      reset,
      setError,
      clearErrors,
      formState: { errors }
   } = useForm({
      defaultValues: valoresIniciales
   });

   // Cargar los datos del grado y los niveles educativos.
   useEffect(() => {
      let activo = true;

      const cargarDatos = async () => {
         setCargandoDatos(true);
         clearErrors();

         try {
            const [datosGrados, datosNiveles] = await Promise.all([
               getGrados(),
               getNivelEducativo()
            ]);

            const grado = datosGrados.find(
               (item) =>
                  String(item.idGrado ?? item.id) === String(idGrado)
            );

            if (!grado) {
               throw new Error(
                  'No se encontró el grado que deseas editar.'
               );
            }

            const nivelesNormalizados = datosNiveles.map((nivel) => ({
               label:
                  nivel.nombre ??
                  nivel.descripcion ??
                  nivel.nivel ??
                  'Nivel sin nombre',

               value: Number(
                  nivel.idnivel ??
                  nivel.idNivel ??
                  nivel.id
               )
            }));

            const idNivel =
               grado.nivelEducativo?.idnivel ??
               grado.nivelEducativo?.idNivel ??
               grado.idnivel ??
               grado.idNivel;

            if (activo) {
               setNiveles(nivelesNormalizados);

               // Precargar los campos con los valores actuales.
               reset({
                  nombre: grado.nombre ?? grado.nombreGrado ?? '',
                  nivelEducativo: {
                     idnivel:
                        idNivel === null ||
                           idNivel === undefined ||
                           idNivel === ''
                           ? null
                           : Number(idNivel)
                  }
               });
            }
         } catch (error) {
            console.error(
               'Error al cargar los datos del grado:',
               error
            );

            if (activo) {
               setError('root', {
                  type: 'manual',
                  message:
                     error.message ||
                     'No se pudieron cargar los datos del grado.'
               });

               toast.current?.show({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                     error.message ||
                     'No se pudieron cargar los datos.',
                  life: 4000
               });
            }
         } finally {
            if (activo) {
               setCargandoDatos(false);
            }
         }
      };

      if (idGrado !== null && idGrado !== undefined) {
         cargarDatos();
      } else {
         setError('root', {
            type: 'manual',
            message: 'No se recibió el ID del grado.'
         });
         setCargandoDatos(false);
      }

      return () => {
         activo = false;
      };
   }, [idGrado, reset, setError, clearErrors]);

   // Guardar los cambios.
   const guardarCambios = async (datos) => {
      clearErrors();

      const gradoInfo = {
         nombre: datos.nombre.trim(),
         nivelEducativo: {
            idnivel: Number(datos.nivelEducativo.idnivel)
         }
      };

      setGuardando(true);

      try {
         // Actualizar el grado existente en el backend.
         await actualizarGrado(idGrado, gradoInfo);

         // Avisar al componente padre para actualizar la tabla
         // y cerrar el modal.
         if (onGradoUpdate) {
            await onGradoUpdate();
         }
      } catch (error) {
         console.error(
            'Error al actualizar el grado:',
            error
         );

         const mensaje =
            error.message ||
            'No se pudo actualizar el grado.';

         setError('root', {
            type: 'manual',
            message: mensaje
         });

         toast.current?.show({
            severity: 'error',
            summary: 'No se pudo actualizar',
            detail: mensaje,
            life: 4000
         });
      } finally {
         setGuardando(false);
      }
   };

   // Restaurar los datos actuales consultados desde el servidor.
   const limpiarCambios = async () => {
      clearErrors();

      try {
         const grados = await getGrados();

         const grado = grados.find(
            (item) =>
               String(item.idGrado ?? item.id) === String(idGrado)
         );

         if (grado) {
            const idNivel =
               grado.nivelEducativo?.idnivel ??
               grado.nivelEducativo?.idNivel ??
               grado.idnivel ??
               grado.idNivel;

            reset({
               nombre: grado.nombre ?? grado.nombreGrado ?? '',
               nivelEducativo: {
                  idnivel:
                     idNivel == null || idNivel === ''
                        ? null
                        : Number(idNivel)
               }
            });
         }
      } catch (error) {
         toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron restaurar los datos originales.',
            life: 4000
         });
      }
   };

   return (
      <div className="card p-4">
         <Toast ref={toast} />

         <h2>Actualizar grado académico</h2>

         <p>
            Modifica el nombre o el nivel educativo del grado
            seleccionado.
         </p>

         {cargandoDatos && (
            <Message
               severity="info"
               text="Cargando los datos del grado..."
               className="mb-3"
            />
         )}

         <form onSubmit={handleSubmit(guardarCambios)} noValidate>
            {/* Nombre del grado */}
            <div className="field mb-4">
               <label htmlFor="nombre" className="block mb-2">
                  Nombre del grado *
               </label>

               <Controller
                  name="nombre"
                  control={control}
                  rules={{
                     required: 'El nombre del grado es obligatorio.',

                     validate: (valor) => {
                        const nombre = valor?.trim() ?? '';

                        if (nombre.length < 2) {
                           return 'El nombre debe tener al menos 2 caracteres.';
                        }

                        if (nombre.length > 50) {
                           return 'El nombre no puede superar los 50 caracteres.';
                        }

                        return true;
                     }
                  }}
                  render={({ field }) => (
                     <InputText
                        id="nombre"
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                           field.onChange(e.target.value);
                           clearErrors('root');
                        }}
                        maxLength={50}
                        placeholder="Ej. 1er año"
                        className={`w-full ${errors.nombre ? 'p-invalid' : ''
                           }`}
                        disabled={cargandoDatos || guardando}
                     />
                  )}
               />

               {errors.nombre && (
                  <small className="p-error block">
                     {errors.nombre.message}
                  </small>
               )}
            </div>

            {/* Nivel educativo */}
            <div className="field mb-4">
               <label
                  htmlFor="nivelEducativo"
                  className="block mb-2"
               >
                  Nivel educativo *
               </label>

               <Controller
                  name="nivelEducativo.idnivel"
                  control={control}
                  rules={{
                     validate: (valor) =>
                        valor !== null &&
                           valor !== undefined &&
                           valor !== '' &&
                           Number.isInteger(Number(valor)) &&
                           Number(valor) > 0
                           ? true
                           : 'Debes seleccionar un nivel educativo válido.'
                  }}
                  render={({ field }) => (
                     <Dropdown
                        inputId="nivelEducativo"
                        name={field.name}
                        value={
                           field.value == null ||
                              field.value === ''
                              ? null
                              : Number(field.value)
                        }
                        onBlur={field.onBlur}
                        onChange={(e) => {
                           field.onChange(e.value);
                           clearErrors('root');
                        }}
                        options={niveles}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona un nivel educativo"
                        className={`w-full ${errors.nivelEducativo?.idnivel
                              ? 'p-invalid'
                              : ''
                           }`}
                        disabled={cargandoDatos || guardando}
                     />
                  )}
               />

               {errors.nivelEducativo?.idnivel && (
                  <small className="p-error block">
                     {errors.nivelEducativo.idnivel.message}
                  </small>
               )}
            </div>

            {/* Error general */}
            {errors.root && (
               <Message
                  severity="error"
                  text={errors.root.message}
                  className="mb-3"
               />
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
               <Button
                  type="submit"
                  label={
                     guardando
                        ? 'Guardando cambios...'
                        : 'Guardar cambios'
                  }
                  icon="pi pi-save"
                  loading={guardando}
                  disabled={cargandoDatos || guardando}
               />

               <Button
                  type="button"
                  label="Restablecer"
                  icon="pi pi-refresh"
                  severity="secondary"
                  outlined
                  disabled={cargandoDatos || guardando}
                  onClick={limpiarCambios}
               />
            </div>
         </form>
      </div>
   );
};

export default EditarGrado;

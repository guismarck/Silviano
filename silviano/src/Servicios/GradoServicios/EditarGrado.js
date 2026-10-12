

import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';

import { getGrados, getNivelEducativo, actualizarGrado} from './gradoService.js';


const  Updategrado = () => {
   const toast = useRef(null);

   const [grados, setGrados] = useState([]);
   const [niveles, setNiveles] = useState([]);
   const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
   const [cargando, setCargando] = useState(false);

   const {
      control,
      handleSubmit,
      reset,
      setError,
      clearErrors,
      formState: { errors }
   } = useForm({
      defaultValues: {
         nombre: '',
         nivelEducativo: {
            idnivel: ''
         }
      }
   });

   // Cargar grados y niveles educativos.
   useEffect(() => {
      const cargarDatos = async () => {
         try {
            const [datosGrados, datosNiveles] = await Promise.all([
               getGrados(),
               getNivelEducativo()
            ]);

            const gradosNormalizados = datosGrados.map((grado) => ({
               ...grado,
               idGrado: grado.idGrado ?? grado.id,
               nombre: grado.nombre ?? grado.nombreGrado
            }));

            const nivelesNormalizados = datosNiveles.map((nivel) => ({
               label: nivel.nombre ?? nivel.descripcion ?? nivel.nivel,
               value: Number(nivel.idnivel ?? nivel.idNivel ?? nivel.id)
            }));

            setGrados(gradosNormalizados);
            setNiveles(nivelesNormalizados);
         } catch (error) {
            toast.current?.show({
               severity: 'error',
               summary: 'Error',
               detail: 'No se pudieron cargar los grados y niveles educativos.',
               life: 4000
            });
         }
      };

      cargarDatos();
   }, []);

   // Cargar los datos del grado seleccionado.
   const seleccionarGrado = (grado) => {
      setGradoSeleccionado(grado);
      clearErrors();

      if (!grado) {
         reset({
            nombre: '',
            nivelEducativo: { idnivel: '' }
         });
         return;
      }

      reset({
         nombre: grado.nombre ?? '',
         nivelEducativo: {
            idnivel: Number(
               grado.nivelEducativo?.idnivel ??
               grado.nivelEducativo?.idNivel ??
               ''
            )
         }
      });
   };

   // Guardar actualización.
   const guardarCambios = async (datos) => {
      if (!gradoSeleccionado) {
         toast.current?.show({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Selecciona un grado para actualizar.',
            life: 3000
         });
         return;
      }

      setCargando(true);

      try {
         await actualizarGrado(gradoSeleccionado.idGrado, datos);

         toast.current?.show({
            severity: 'success',
            summary: 'Actualización exitosa',
            detail: 'El grado se actualizó correctamente.',
            life: 3000
         });

         // Refrescar el listado y conservar el grado actualizado.
         const datosGrados = await getGrados();

         const gradosActualizados = datosGrados.map((grado) => ({
            ...grado,
            idGrado: grado.idGrado ?? grado.id,
            nombre: grado.nombre ?? grado.nombreGrado
         }));

         setGrados(gradosActualizados);

         const actualizado = gradosActualizados.find(
            (grado) =>
               String(grado.idGrado) === String(gradoSeleccionado.idGrado)
         );

         if (actualizado) {
            seleccionarGrado(actualizado);
         }
      } catch (error) {
         setError('root', {
            type: 'manual',
            message: error.message || 'No se pudo actualizar el grado.'
         });

         toast.current?.show({
            severity: 'error',
            summary: 'No se pudo actualizar',
            detail: error.message || 'Ocurrió un error inesperado.',
            life: 4000
         });
      } finally {
         setCargando(false);
      }
   };

   return (
      <div className="card p-4">
         <Toast ref={toast} />

         <h2>Actualizar grado académico</h2>
         <p>Selecciona un grado y modifica su nombre o nivel educativo.</p>

         <form onSubmit={handleSubmit(guardarCambios)}>
            {/* Seleccionar el grado que se actualizará */}
            <div className="field mb-4">
               <label htmlFor="gradoSeleccionado" className="block mb-2">
                  Grado registrado
               </label>

               <Dropdown
                  inputId="gradoSeleccionado"
                  value={gradoSeleccionado?.idGrado ?? null}
                  options={grados}
                  optionLabel="nombre"
                  optionValue="idGrado"
                  onChange={(e) => {
                     const grado = grados.find(
                        (item) => String(item.idGrado) === String(e.value)
                     );

                     seleccionarGrado(grado ?? null);
                  }}
                  placeholder="Selecciona un grado"
                  className="w-full"
                  filter
                  showClear
               />
            </div>

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
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                           field.onChange(e.target.value);
                           clearErrors(['nombre', 'root']);
                        }}
                        maxLength={50}
                        placeholder="Ej. Primer Grado"
                        className={`w-full ${errors.nombre ? 'p-invalid' : ''}`}
                        disabled={!gradoSeleccionado || cargando}
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
               <label htmlFor="nivelEducativo" className="block mb-2">
                  Nivel educativo *
               </label>

               <Controller
                  name="nivelEducativo.idnivel"
                  control={control}
                  rules={{
                     required: 'Debes seleccionar un nivel educativo.'
                  }}
                  render={({ field }) => (
                     <Dropdown
                        inputId="nivelEducativo"
                        value={field.value === '' ? null : Number(field.value)}
                        options={niveles}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => {
                           field.onChange(e.value);
                           clearErrors(['nivelEducativo', 'root']);
                        }}
                        placeholder="Selecciona Primaria o Secundaria"
                        className={`w-full ${errors.nivelEducativo?.idnivel ? 'p-invalid' : ''
                           }`}
                        disabled={!gradoSeleccionado || cargando}
                     />
                  )}
               />

               {errors.nivelEducativo?.idnivel && (
                  <small className="p-error block">
                     {errors.nivelEducativo.idnivel.message}
                  </small>
               )}
            </div>

            {errors.root && (
               <Message
                  severity="error"
                  text={errors.root.message}
                  className="mb-3"
               />
            )}

            <div className="flex gap-2">
               <Button
                  type="submit"
                  label="Guardar cambios"
                  icon="pi pi-save"
                  loading={cargando}
                  disabled={!gradoSeleccionado || cargando}
               />

               <Button
                  type="button"
                  label="Limpiar"
                  icon="pi pi-refresh"
                  severity="secondary"
                  outlined
                  disabled={cargando}
                  onClick={() => seleccionarGrado(null)}
               />
            </div>
         </form>
      </div>
   );
};

export default  Updategrado;

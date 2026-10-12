import React, { useEffect, useState, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useForm, Controller } from 'react-hook-form'
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { getNivelEducativo } from './gradoService';
import { validarNivelEducativo,validarNombreGrado} from '../../Util/validaciones/ValidacionGenericas.js';


import { ServicioValidado } from '../../Servicios/GradoServicios/gradoService.js';


function Addgrado(props) {


   const [niveles, setNiveles] = useState([]);
   const [cargandoNiveles, setCargandoNiveles] = useState(false);
   const [guardando, setGuardando] = useState(false);

   const [errorMessage, setErrorMessage] = useState('');
   const [successMessage, setSuccessMessage] = useState('');
   const toast = useRef(null);
   const [loading, setLoading] = useState(false);

   const [gradoInfo, setgradoInfo] = useState({
      idGrado: "",
      nombre: "",
      nivelEducativo: { idnivel: "" }
   })
   

   const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors }
   } = useForm({
      defaultValues: {
         idGrado: '',
         nombre: '',
         nivelEducativo: {
            idnivel: ''
         }
      }
   });

   // Cargar niveles educativos desde la API mediante Axios.
   const cargarNivel = useCallback(async () => {
      setCargandoNiveles(true);

      try {
         const data = await getNivelEducativo();

         setNiveles(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error('Error al cargar niveles:', error);

         setErrorMessage(
            'No fue posible cargar los niveles educativos.'
         );
      } finally {
         setCargandoNiveles(false);
      }
   }, []);

   useEffect(() => {
      cargarNivel();
   }, [cargarNivel]);

   // Ejecutar después de que react-hook-form valide el formulario.
   const AddGradoData = async (data) => {
      setGuardando(true);
      setErrorMessage('');
      setSuccessMessage('');

      const gradoInfo = {
         idGrado: data.idGrado,
         nombre: data.nombre.trim(),
         nivelEducativo: {
            idnivel: data.nivelEducativo.idnivel
         }
      };

      try {
         // Enviar el grado al backend utilizando Axios.
         await ServicioValidado(gradoInfo);

         

         // Actualizar el listado sin invalidar el guardado
         // si ocurre un error al consultar nuevamente.
         if (props.cargarGrado) {
            try {
               await props.cargarGrado();
            } catch (error) {
               console.error(
                  'El grado se guardó, pero no se pudo actualizar el listado:',
                  error
               );

               setErrorMessage(
                  'El grado se guardó, pero no se pudo actualizar el listado.'
               );
            }
         }
      } catch (error) {
         console.error('Error al guardar el grado:', error);

         const mensaje =
            error.response?.data?.mensaje ||
            error.response?.data?.message ||
            'No se pudo guardar el grado. exite considencias con el nombre';

         setErrorMessage(mensaje);
      } finally {
         setGuardando(false);
      }
      // Mostrar confirmación del servidor.
         setSuccessMessage(
            '¡Registro exitoso! El grado se guardó correctamente.'
         );

         // Limpiar el formulario después del guardado.
         reset();
   };
     

   return (
      <div className="grado-gradoInfo input">
         <h1>Nuevo Grado</h1>

         <div className="box">

            {/* Mensaje de éxito */}
            {successMessage && (
               <Message
                  severity="success"
                  text={successMessage}
                  className="mb-3"
               />
            )}

            {/* Mensaje de error */}
            {errorMessage && (
               <Message
                  severity="error"
                  text={errorMessage}
                  className="mb-3"
               />
            )}

            <form
               onSubmit={handleSubmit(AddGradoData)}
               noValidate
            >
               <div className="row">

                  

                  {/* Nivel educativo obligatorio */}
                  <div className="col-sm-12 col-md-6 mb-3">
                     <div className="field">
                        <label htmlFor="nivelEducativo">
                           Nivel educativo *
                        </label>

                        <Controller
                           name="nivelEducativo.idnivel"
                           control={control}
                           rules={{
                              validate: validarNivelEducativo
                           }}
                           render={({ field }) => (
                              <Dropdown
                                 inputId="nivelEducativo"
                                 value={field.value}
                                 onChange={(e) =>
                                    field.onChange(e.value)
                                 }
                                 options={niveles}
                                 optionLabel="nombre"
                                 optionValue="idnivel"
                                 placeholder={
                                    cargandoNiveles
                                       ? 'Cargando niveles...'
                                       : 'Seleccione Primaria o Secundaria'
                                 }
                                 className={`w-full ${errors.nivelEducativo?.idnivel
                                       ? 'p-invalid'
                                       : ''
                                    }`}
                                 loading={cargandoNiveles}
                                 disabled={
                                    cargandoNiveles ||
                                    guardando
                                 }
                                 showClear
                              />
                           )}
                        />

                        {errors.nivelEducativo?.idnivel && (
                           <small className="p-error">
                              {
                                 errors.nivelEducativo.idnivel
                                    .message
                              }
                           </small>
                        )}
                     </div>
                  </div>

                  {/* Nombre del grado obligatorio */}
                  <div className="col-sm-12 col-md-6">
                     <div className="field">
                        <label htmlFor="nombre">
                           Nombre del grado *
                        </label>

                        <InputText
                           id="nombre"
                           className={`form-control ${errors.nombre ? 'p-invalid' : ''
                              }`}
                           placeholder="Ej. Quinto grado"
                           disabled={guardando}
                           {...register('nombre', {
                              validate: validarNombreGrado
                           })}
                        />

                        {errors.nombre && (
                           <small className="p-error">
                              {errors.nombre.message}
                           </small>
                        )}
                     </div>
                  </div>

               </div>

               {/* Botón dentro del formulario */}
               <div className="btn-guardar">
                  <Button
                     type="submit"
                     label={
                        guardando
                           ? 'Guardando...'
                           : 'Guardar grado'
                     }
                     icon="pi pi-save"
                     severity="success"
                     raised
                     loading={guardando}
                     disabled={
                        guardando || cargandoNiveles
                     }
                  />
               </div>
            </form>
         </div>
      </div>
   );
}

export default Addgrado;
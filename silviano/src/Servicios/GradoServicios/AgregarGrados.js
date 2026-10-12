import React, { useEffect, useState, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useForm } from 'react-hook-form'
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { getNivelEducativo } from './gradoService';

import { ServicioValidado } from '../../Servicios/GradoServicios/gradoService.js';


function Addgrado(props) {

   const toast = useRef(null);
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);

   const [gradoInfo, setgradoInfo] = useState({
      idGrado: "",
      nombre: "",
      nivelEducativo: { idnivel: "" }
   })
   const [niveles, setNiveles] = useState([]);


   /// aqui me obtiene los niveles primaria segundaria
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

   }, []);



   const { register, handleSubmit, formState: { errors } } = useForm()//Validando campos 
   const customSubmit = (gradoInfo) => {
      // console.log(gradoInfo)
   }


   const AddGradoData = async (e) => {
      if (e) e.preventDefault();
      setErrorMessage(null);
      setLoading(true);

      try {

         console.log(gradoInfo)
         // Se delega la validación y el envío HTTP al servicio
         await ServicioValidado(gradoInfo);

         toast.current?.show({
            severity: 'success',
            summary: 'Registro Exitoso',
            detail: 'El grado se ha guardado correctamente en la base de datos.',
            life: 3000
         });

         // Reiniciar estado o ejecutar callbacks del padre
         setTimeout(() => {
            if (props.cargarGrado) props.cargarGrado();
            if (props.setGradoAdd) props.setGradoAdd(false);
         }, 1200);

      } catch (error) {
         console.error("Error al registrar estudiante:", error);
         const mensajeError = error.response?.data?.mensaje || error.message || "Error al procesar el registro.";
         setErrorMessage(mensajeError);

         toast.current?.show({
            severity: 'error',
            summary: 'Error en Guardado',
            detail: mensajeError,
            life: 4000
         });
      } finally {
         setLoading(false);
      }
   };


   useEffect(() => {
      cargarNivel();
   }, [cargarNivel]);

   return (
      <div className='grado-gradoInfo input'>
         <h1>Nuevo Grado</h1>
         <div className='box'>

            <form onSubmit={handleSubmit(customSubmit)}>
               <div className='row'>
                  <div className='col-sm-12 col-md-6'>
                     <p>
                        <span>ID: </span>
                        <InputText className='form-control' placeholder='Id'
                           onChange={(e) => setgradoInfo({ ...gradoInfo, idGrado: e.target.value })}

                        />
                     </p>
                  </div>
                  <div className='col-sm-12 col-md-6 mb-3'>
                     <p>
                        <span>Nivel * : </span>
                        <Dropdown
                           value={gradoInfo.nivelEducativo.idnivel}
                           onChange={(e) => setgradoInfo({
                              ...gradoInfo,
                              nivelEducativo: {
                                 ...gradoInfo.nivelEducativo, // Copia las otras propiedades de nivelEducativo si las hay
                                 idnivel: e.value // Actualiza únicamente el id
                              }
                           })}
                           options={niveles.map(e => ({ label: e.nombre, value: e.idnivel }))}
                           optionLabel="label"
                           optionValue="value"
                           className="w-full md:w-14rem"
                           placeholder="Seleccione Nivel"
                        />
                     </p>
                  </div>
                  <div className='col-sm-12 col-md-6'>
                     <p>
                        <span>Nombre: </span>
                        <InputText className='form-control' placeholder='Nombre'
                           onChange={(e) => setgradoInfo({ ...gradoInfo, nombre: e.target.value })}

                        />
                        {errors.nombre && <span>Este campo es requerido</span>}
                     </p>

                  </div>
               </div>
            </form>

         </div>

         <div className='btn-guardar'>
            <Button className='btn-guardar-save'
               label="Guardar"
               severity="success"
               raised onClick={AddGradoData}

            />

         </div>

      </div>

   );
}
export default Addgrado

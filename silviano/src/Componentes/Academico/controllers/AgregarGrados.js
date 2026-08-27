import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useForm } from 'react-hook-form'

function Addgrado(props) {

   const [gradoInfo, setgradoInfo] = useState({
      idGrado: "",
      categoria: "",
      nombre: ""
   })

   const { register, handleSubmit, formState: { errors } } = useForm()//Validando campos 
   const customSubmit = (gradoInfo) => {
      // console.log(gradoInfo)
   }

   const AddgradoData = async (e) => {
      try {
         console.log(gradoInfo)
         const respuesta = await axios
            .post('http://localhost:8080/estudiante-app/grados/create', gradoInfo);
         if (respuesta) {
            console.log(respuesta.data)
            //gradoInfo(respuesta.data)
            props.setGradoAdd();

         }
      } catch (error) {
         console.log(error)

      }
   }

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
                  <div className='col-sm-12 col-md-6'>
                     <p>
                        <span>Nivel: </span>
                        <InputText className='form-control' placeholder='Nivel'
                           onChange={(e) => setgradoInfo({ ...gradoInfo, categoria: e.target.value })}
                        //...register('categoria')
                        />

                     </p>

                  </div>
                  <div className='col-sm-12 col-md-6'>
                     <p>
                        <span>Nombre: </span>
                        <InputText className='form-control' placeholder='Nombre'
                           onChange={(e) => setgradoInfo({ ...gradoInfo, categoria: e.target.value })}

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
               raised onClick={AddgradoData}

            />

         </div>

      </div>

   );
}
export default Addgrado

import React from 'react';

import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';

function Updategrado(props) {

   const [gradoInfo, setgradoInfo] = useState({
      idGrado: "",
      categoria: "",
      nombre: ""
   })

   useEffect(() => {
      findById(props.gradoID)
      console.log(gradoInfo)
  }, []);

  const findById = async (id) => {
      try {
          const respuesta = await axios
              .get(`http://localhost:8080/estudiante-app/grados/${id}`);
          if (respuesta) {
              console.log(respuesta.data)
              setgradoInfo(respuesta.data)
          }
      } catch (error) {
          // console.log(error)
      }
  }

   //const [setGradoAdd] = useState()
   /*const OnInputChage = (e) => {
      // spred operador ...para expadir atributos
       console.log(e.target.value)
      setgradoInfo({ ...gradoInfo, [e.target.name]: e.target.value })
       
   }*/


   const UpdategradoData = async (e) => {
      try {
         console.log(gradoInfo)
         const respuesta = await axios
            .put(`http://localhost:8080/estudiante-app/grados/${gradoInfo.idGrado}`, gradoInfo);

         if (respuesta) {
            console.log(respuesta.data)
            //gradoInfo(respuesta.data)o
            props.setGradoUpdate();
         }
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <div className='grado-gradoInfo input'>
         <h1>Editar Grado</h1>
         <div className='box'>
            <div className='row'>
               <div className='col-sm-12 col-md-6'>
                  <p>
                     <span>ID: </span>
                     <InputText className='form-control'
                     value={gradoInfo.idGrado}
                     disabled/>

                  </p>
               </div>
               <div className='col-sm-12 col-md-6'>
                  <p>
                     <span>Nivel: </span>
                     <InputText className='form-control' placeholder='Nivel' name='categoria' required={true}
                        value={gradoInfo.categoria}
                        onChange={(e) => setgradoInfo({ ...gradoInfo, categoria: e.target.value })}

                     />

                  </p>
               </div>
               <div className='col-sm-12 col-md-6'>
                  <p>
                     <span>Nombre: </span>
                     <InputText className='form-control' placeholder='Nombre' name='nombre' required={true}
                        value={gradoInfo.nombre}
                        onChange={(e) => setgradoInfo({ ...gradoInfo, nombre: e.target.value })}
                     />
                  </p>
               </div>
            </div>
         </div>
         <div className='btn-guardar'>
            <Button className='btn-guardar-save'
               label="Editar"
               severity="success"
               raised onClick={UpdategradoData} />
         </div>

      </div>

   );
}
export default Updategrado

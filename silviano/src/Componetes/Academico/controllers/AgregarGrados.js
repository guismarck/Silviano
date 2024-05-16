import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

function Addgrado(props) {

   const [gradoInfo, setgradoInfo] = useState({
      idGrado: "",
      categoria: "",
      nombre: ""
   })
 

   //const [setGradoAdd] = useState()
   /*const OnInputChage = (e) => {
      // spred operador ...para expadir atributos
       console.log(e.target.value)
      setgradoInfo({ ...gradoInfo, [e.target.name]: e.target.value })
       
   }*/

   // useEffect(() => {
   //    console.log(gradoInfo)
   // }, []);

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
                     <InputText className='form-control' placeholder='Nivel' name='categoria'
                        onChange={(e) => setgradoInfo({ ...gradoInfo, categoria: e.target.value })}
                      
                     />
                  </p>
               </div>
               <div className='col-sm-12 col-md-6'>
                  <p>
                     <span>Nombre: </span>
                     <InputText className='form-control' placeholder='Nombre' name='nombre'
                        onChange={(e) => setgradoInfo({ ...gradoInfo, nombre: e.target.value })}
                        />
                  </p>
               </div>
            </div>
         </div>
         <div className='btn-guardar'>
            <Button className='btn-guardar-save'
               label="Guardar"
               severity="success"
               raised onClick={AddgradoData} />
         </div>

      </div>

   );
}
export default Addgrado

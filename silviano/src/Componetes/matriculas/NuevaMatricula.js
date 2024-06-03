import React, { useEffect, useState } from 'react';
import axios from 'axios';
import settings from '../../settings.json'
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
function VerMatricula(props) {

  const urlBase = `${settings.api.baseUrl}/matriculas/create`;

  const inicialMatriculaInfo = {

    idmatricula: '',
    estudiante: {
      idpersona: '',
      nombre_completo: '',
    },
    grado: {
      idGrado: '',
      categoria: '',
      nombre: ''
    },
    turno: '',
    costo_matricula: ''
  }

  const TurnoOption = [
    { label: 'Matutino', value: 'M' },
    { label: 'Vespertino', value: 'V' },
  ]

  const [matriculaInfo, setmatriculaInfo] = useState(inicialMatriculaInfo)

  useEffect(() => {
    matriculaData()
    console.log(matriculaInfo)
  }, []);

  const matriculaData = async () => {
    try {
      const respuesta = await axios
        .get(urlBase + props.idmatricula);
      if (respuesta) {
        console.log(respuesta.data)
        setmatriculaInfo(respuesta.data)
      }
    } catch (error) {
      // console.log(error)
    }
  }

  return (

    <div className='grado-gradoInfo'>
      <h1>Infomacion de la Matricula</h1>
      <div className='box'>
        <div className='row'>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>ID Matricula : </span>
              <span>{matriculaInfo.idmatricula} </span>
              <InputText className='form-control' placeholder='ID' disabled
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, idmatricula: e.target.value })}
              />
            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Nombre  : </span>
              <span>{matriculaInfo.estudiante.nombre_completo} </span>
            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Grado : </span>
              <span>{matriculaInfo.grado.nombre} </span>
            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Turno : </span>
              <Dropdown value={matriculaInfo.turno}
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, turno: e.target.value })}
                options={TurnoOption} optionLabel="label"
                className="w-full md:w-14rem" placeholder="" />

            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Costo de Matricula : </span>
              <span>{matriculaInfo.costo_matricula} </span>
              <InputText className='form-control' placeholder='nombres'
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, costo_matricula: e.target.value })}
              />
               <InputNumber inputId="currency-us" 
               onValueChange={(e) => 
                setmatriculaInfo({ ...matriculaInfo, costo_matricula: e.target.value })} mode="currency" currency="NIO" locale="es-NI" />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerMatricula
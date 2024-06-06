import React, { useState, useEffect } from 'react';
import axios from 'axios';
import settings from '../../settings.json'
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

function NuevaMatricula(props) {

  const urlBase = `${settings.api.baseUrl}/matriculas/create`
  const urlBaseM = `${settings.api.baseUrl}/estudiantes`;
  const urlBasG = `${settings.api.baseUrl}/grados`;
  const urlBasePlandeEstudio = `${settings.api.baseUrl}/plandeEstudio`;
  const urlBasePago = `${settings.api.baseUrl}/pago`;

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
    plan_de_estudio: {
      idPlan_de_estudio: '',
      año_electivo: ''
    },
    turno: '',
    costo_matricula: ''
  }

  const TurnoOption = [
    { label: 'Matutino', value: 'M' },
    { label: 'Vespertino', value: 'V' },
  ]

  const [matriculaInfo, setmatriculaInfo] = useState(inicialMatriculaInfo)
  const [listEstudiante, setlistEstudiante] = useState([])
  const [listGrados, setlistGrados] = useState([])
  const [listPlandeEstudio, setPlandeEstudio] = useState([])
  const [listPago, setPago] = useState([])

  const AddmatriculaData = async (e) => {
    try {
      const toSent = matriculaInfo
      toSent['turno'] = toSent['turno'].value
      console.log(toSent)
      const respuesta = await axios
        .post(urlBase, toSent).catch(function (error) {
          console.log(error)
        })

      if (respuesta) {
        console.log(respuesta.data)
        props.setMatriculaAdd();
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    estudianteData()
    GradoData()
    PlandeEstudioData()
    PagoData()
  }, []);

  const estudianteData = async () => {
    try {
      const respuesta = await axios.get(urlBaseM);
      if (respuesta) {
        console.log(respuesta.data)

        setlistEstudiante(respuesta.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const GradoData = async () => {
    try {
      const respuestaG = await axios.get(urlBasG);
      if (respuestaG) {
        console.log(respuestaG.data)

        setlistGrados(respuestaG.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const PlandeEstudioData = async () => {
    try {
      const respuestaPlan = await axios.get(urlBasePlandeEstudio);
      if (respuestaPlan) {
        console.log(respuestaPlan.data)

        setPlandeEstudio(respuestaPlan.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const PagoData = async () => {
    try {
      const respuestaPago = await axios.get(urlBasePago );
      if (respuestaPago) {
        console.log(respuestaPago.data)

        setPlandeEstudio(respuestaPago.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (

    <div className='grado-gradoInfo'>
      <h1>Nueva Matricula</h1>
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
              <span>Nombre : </span>
              <Dropdown value={matriculaInfo.estudiante} checkmark={true} editable
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, estudiante: e.target.value })}
                options={listEstudiante} optionLabel="nombre_completo"
                className="w-full md:w-14rem" placeholder="" />

            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Grado : </span>
              <Dropdown value={matriculaInfo.grado} checkmark={true}
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, grado: e.target.vslue })}
                options={listGrados} optionLabel="nombre"
                className="w-full md:w-14rem" placeholder="" />
            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Plan de Estudio : </span>
              <Dropdown value={matriculaInfo.plan_de_estudio} checkmark={true}
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, plan_de_estudio: e.target.vslue })}
                optionLabel="año_electivo" options={listEstudiante}
                className="w-full md:w-14rem" placeholder="" />
            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>ID Pago : </span>
              <Dropdown value={matriculaInfo.pago} checkmark={true}
                onChange={(e) => setmatriculaInfo({ ...matriculaInfo, pago: e.target.vslue })}
                optionLabel="idpago" options={listEstudiante}
                className="w-full md:w-14rem" placeholder="" />
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
              <InputNumber inputId="currency-us"
                onValueChange={(e) =>
                  setmatriculaInfo({ ...matriculaInfo, costo_matricula: e.target.value })}
                mode="currency" currency="NIO" locale="es-NI" />
            </p>
          </div>
          <div className='col-sm-12 col-md-6'>
            <p>
              <span>Monto de Matricula : </span>
              <InputNumber inputId="currency-us"
                onValueChange={(e) =>
                  setmatriculaInfo({ ...matriculaInfo, costo_matricula: e.target.value })}
                mode="currency" currency="NIO" locale="es-NI" />
            </p>
          </div>
        </div>
      </div>
      <div className='btn-guardar'>
        <Button className='btn-guardar-save'
          label="Guardar"
          severity="success"
          raised onClick={AddmatriculaData}
        />
      </div>

    </div>
  )
}

export default NuevaMatricula
import React, { useState } from 'react';
import axios from 'axios';
import settings from '../../settings.json'
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from "primereact/inputswitch";
function AddEstudiante(props) {

    const urlBase = `${settings.api.baseUrl}/estudiantes/create`;

    const [estudianteInfo, setEstudianteInfo] = useState({
        idpersona: '',
        nombre_completo: '',
        apellido_completo: '',
        direccion: '',
        fecha_nacimiento: '',
        cedula: '',
        cod_estudiante: '',
        codigo_MINED: '',
        nombre_tutor: '',
        estado: '',
        sexo: ''
    })

    const options = [
        { label: 'Femenino ', value: 'F' },
        { label: 'Masculino ', value: 'M' },

    ];

    const optionsAdd = [
        { label: 'Si', value: 'si' },
        { label: 'No ', value: 'no' },
    ]

    const AddEstudianteData = async (e) => {

        try {
            console.log(estudianteInfo)
            const toSent = estudianteInfo
            toSent['sexo'] = toSent['sexo'].value
            toSent['partidad_nacimiento'] = toSent['partidad_nacimiento'].value
            console.log(toSent)
            const respuesta = await axios
                .post(urlBase, toSent).catch(function (error) {
                    console.log(error)
                })

            if (respuesta) {
                console.log(respuesta.data)
                props.setEstudiantedoAdd();
            }
        } catch (error) {
            console.log(error)

        }
    }

    return (

        <div className='grado-gradoInfo'>
            <h1>Nuevo Estudiane</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombres : </span>
                            <InputText className='form-control' placeholder='nombres'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, nombre_completo: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Apellidos : </span>
                            <InputText className='form-control' placeholder='apellidos'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, apellido_completo: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Sexo : </span>
                            <Dropdown value={estudianteInfo.sexo}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, sexo: e.target.value.code })}
                                options={options} optionLabel="name"
                                className="w-full md:w-14rem"    placeholder=""  />

                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Partida de Nacimiento : </span>
                            <Dropdown value={estudianteInfo.partidad_nacimiento}
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, partidad_nacimiento: e.target.value })}
                                options={optionsAdd} optionLabel="label"
                                className="w-full md:w-14rem" />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Direcion : </span>
                            <InputText className='form-control' placeholder='Direccion'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, direccion: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <span>Fecha de Nacimiento : </span>
                        <Calendar className='control-form' value={estudianteInfo.fecha_nacimiento}
                            onChange={(e) => setEstudianteInfo({ ...estudianteInfo, fecha_nacimiento: e.target.value })} />
                    </div>

                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Cedula : </span>
                            <InputText className='form-control' placeholder='Cedula'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, cedula: e.target.value })}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Nombre tutor : </span>
                            <InputText className='form-control' placeholder='Nobre del Tutor'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, nombre_tutor: e.target.value })}
                            />
                        </p>
                    </div>

                </div>

            </div>
            <h1>Infomacion del Estudinate</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>ID :  </span>
                            <InputText className='form-control' placeholder='ID' disabled
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, idpersona: e.target.value })}
                            />

                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Codigo Estudiante : </span>
                            <InputText className='form-control' placeholder='Codigo Estudinate'
                                onChange={(e) => setEstudianteInfo({ ...estudianteInfo, cod_estudiante: e.target.value })}
                            />
                        </p>
                    </div>
                </div>
                <div className='col-sm-12 col-md-6'>
                    <p>
                        <span>Codigo MINED : </span>
                        <InputText className='form-control' placeholder='Codigo MINED'
                            onChange={(e) => setEstudianteInfo({ ...estudianteInfo, codigo_MINED: e.target.value })}
                        />
                    </p>
                </div>
                <div className='col-sm-12 col-md-6'>
                    <span>Estado  : </span>
                    <InputSwitch checked={estudianteInfo.estado}
                        onChange={e => setEstudianteInfo({ ...estudianteInfo, estado: e.target.value })} />

                </div>
            </div>
            <div className='btn-guardar'>
                <Button className='btn-guardar-save'
                    label="Guardar"
                    severity="success"
                    raised onClick={AddEstudianteData}
                />

            </div>

        </div>
    )

}
export default AddEstudiante
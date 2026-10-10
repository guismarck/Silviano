
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from "primereact/inputswitch";
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';


import { updateDocenteService, getDocenteById} from '../../Servicios/DocenteServicios/docenteService';

const SEXO_OPTIONS = [
    { label: 'Femenino ', value: 'F' },
    { label: 'Masculino ', value: 'M' },
];

const UpdateDocente = ({ idPersona, onDocenteUpdate }) => {

      const toast = useRef(null);
      const [loading, setLoading] = useState(false);
      const [fetching, setFetching] = useState(true);

    const [formValues, setFormValues] = useState({

        nombre_completo: '',
        apellido_completo: '',
        direccion: '',
        fecha_nacimiento: '',
        cedula: '',
        codDocente: '',
        espacialidad: '',
        estado: '',
        sexo: ''
    })
     
    // Convierte string de BD a objeto Date de JavaScript
      const parseDateFromDB = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
      };
    
      // Formatea Date de JavaScript a formato ISO de BD (YYYY-MM-DD)
      const formatDateToDB = (dateObj) => {
        if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    
      const fetchDocenteData = useCallback(async () => {
        if (!idPersona) return;
        setFetching(true);
        try {
          const data = await getDocenteById(idPersona);
          setFormValues({
            ...data,
            fecha_nacimiento: data.fecha_nacimiento ? parseDateFromDB(data.fecha_nacimiento) : null,
            estado: Boolean(data.estado),
            partida_nacimiento: Boolean(data.partida_nacimiento)
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error de carga',
            detail: 'No se pudo obtener la información del docente.',
            life: 4000
          });
        } finally {
          setFetching(false);
        }
      }, [idPersona]);

       useEffect(() => {
          fetchDocenteData();
        }, [fetchDocenteData]);
      

    const handleChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };
   
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const payload = { 
          ...formValues,
          fecha_nacimiento: formatDateToDB(formValues.fecha_nacimiento)
        };
  
        await updateDocenteService(formValues.idpersona, payload);
  
        toast.current?.show({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Expediente del docente actualizado correctamente.',
          life: 3000
        });
  
        if (typeof onDocenteUpdate === 'function') {
          onDocenteUpdate();
        }
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error al Guardar',
          detail: 'Ocurrió un error al intentar actualizar los datos.',
          life: 4000
        });
      } finally {
        setLoading(false);
      }
    };
    


    return (
       <div className="surface-ground p-3 md:p-4 border-round shadow-1">
         <Toast ref={toast} />
   
         <form onSubmit={handleSubmit} className="p-fluid">
           <Card title="Actualizar Datos Personales" className="mb-4 shadow-1">
             <div className="row g-3">
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="nombre_completo" className="font-semibold text-700">
                     Nombres
                   </label>
                   <InputText
                     id="nombre_completo"
                     placeholder="Ingrese los nombres"
                     value={formValues.nombre_completo}
                     onChange={(e) => handleChange('nombre_completo', e.target.value)}
                     disabled={fetching}
                     required
                   />
                 </div>
               </div>
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="apellido_completo" className="font-semibold text-700">
                     Apellidos
                   </label>
                   <InputText
                     id="apellido_completo"
                     placeholder="Ingrese los apellidos"
                     value={formValues.apellido_completo}
                     onChange={(e) => handleChange('apellido_completo', e.target.value)}
                     disabled={fetching}
                     required
                   />
                 </div>
               </div>
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="sexo" className="font-semibold text-700">
                     Sexo
                   </label>
                   <Dropdown
                     id="sexo"
                     options={SEXO_OPTIONS}
                     optionLabel="label"
                     optionValue="value"
                     placeholder="Seleccione sexo"
                     value={formValues.sexo}
                     onChange={(e) => handleChange('sexo', e.value)}
                     disabled={fetching}
                   />
                 </div>
               </div>
   
              
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="fecha_nacimiento" className="font-semibold text-700">
                     Fecha de Nacimiento
                   </label>
                   <Calendar
                     id="fecha_nacimiento"
                     value={formValues.fecha_nacimiento}
                     onChange={(e) => handleChange('fecha_nacimiento', e.value)}
                     dateFormat="dd/mm/yy"
                     showIcon
                     placeholder="dd/mm/aaaa"
                     disabled={fetching}
                   />
                 </div>
               </div>
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="cedula" className="font-semibold text-700">
                     Cédula / Identificación
                   </label>
                   <InputText
                     id="cedula"
                     placeholder="000-000000-0000X"
                     value={formValues.cedula}
                     onChange={(e) => handleChange('cedula', e.target.value)}
                     disabled={fetching}
                   />
                 </div>
               </div>
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="nombre_tutor" className="font-semibold text-700">
                     Especialidad
                   </label>
                   <InputText
                     id="especialidad"
                     placeholder="Especialidad del docente"
                     value={formValues.especialidad}
                     onChange={(e) => handleChange('especialidad', e.target.value)}
                     disabled={fetching}
                   />
                 </div>
               </div>
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="direccion" className="font-semibold text-700">
                     Dirección Domiciliar
                   </label>
                   <InputText
                     id="direccion"
                     placeholder="Dirección del estudiante"
                     value={formValues.direccion}
                     onChange={(e) => handleChange('direccion', e.target.value)}
                     disabled={fetching}
                   />
                 </div>
               </div>
             </div>
           </Card>
   
           <Card title="Informacion de Docente" className="mb-4 shadow-1">
             <div className="row g-3">
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="idpersona" className="font-semibold text-700">
                     ID Sistema (Persona)
                   </label>
                   <InputText id="idpersona" value={formValues.idpersona} disabled />
                 </div>
               </div>
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="codDocente" className="font-semibold text-700">
                     Código de Docente
                   </label>
                   <InputText
                     id="codDocente"
                     placeholder="Código interno"
                     value={formValues.codDocente}
                     //onChange={(e) => handleChange('cod_estudiante', e.target.value)}
                     disabled//={fetching}/
                   />
                 </div>
               </div>
   
               
   
               <div className="col-12 col-md-6">
                 <div className="flex flex-column gap-2 mb-3">
                   <label htmlFor="estado" className="font-semibold text-700">
                     Estado  (Activo / Inactivo)
                   </label>
                   <div className="flex align-items-center gap-3 pt-2">
                     <InputSwitch
                       id="estado"
                       checked={formValues.estado}
                       onChange={(e) => handleChange('estado', e.value)}
                       disabled={fetching}
                     />
                     <span className="font-medium text-600">
                       {formValues.estado ? 'Matrícula Activa' : 'Matrícula Inactiva'}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           </Card>
   
           <Divider />
   
           <div className="flex justify-content-end gap-2 mt-4">
             <Button
               type="submit"
               label="Guardar Cambios"
               icon="pi pi-check"
               severity="success"
               loading={loading}
               disabled={fetching}
               className="px-4 py-2"
             />
           </div>
         </form>
       </div>
     );
}
export default UpdateDocente





import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
//import { REGEX_CEDULA_NICARAGUA } from '../../Util/validaciones/ValidacionGenericas';


export  function CedulaInput({ value = '', onChange , onValidChage}) {
  const [error, setError] = useState('');
   const REGEX_CEDULA_NICARAGUA = /^(\d{3})-?(\d{2})(\d{2})(\d{2})-?(\d{4})([A-Za-zA-Z])$/;

  const formatearEInsertarGuiones = (val) => {
    // 1. Extraer solo números y letras (convertir la letra a mayúscula)
    const limpio = val.replace(/[^0-9A-Za-z]/g, '').toUpperCase();

    
    // Separar en partes: 3 dígitos - 6 dígitos - 4 dígitos + 1 letra
    const parte1 = limpio.substring(0, 3).replace(/[^0-9]/g, '');
    const parte2 = limpio.substring(3, 9).replace(/[^0-9]/g, '');
    const parte3Num = limpio.substring(9, 13).replace(/[^0-9]/g, '');
    const parte3Letra = limpio.substring(13, 14).replace(/[^A-Za-z]/g, '');

    let resultado = parte1;
    if (limpio.length > 3) {
      resultado += '-' + parte2;
    }
    if (limpio.length > 9) {
      resultado += '-' + parte3Num + parte3Letra;
    }

    return resultado;
  };

  const validarCedulaNicaragua = (cedula) => {
    // Expresión regular para verificar la estructura 000-000000-0000X
    const regex = REGEX_CEDULA_NICARAGUA;
    return regex.test(cedula);
  };

  const handleChange = (e) => {
    const valorRaw = e.target.value;
    const valorFormateado = formatearEInsertarGuiones(valorRaw);
    let isValido = false;
    
    // Validar cuando la cédula esté completa (16 caracteres incluyendo guiones)
    if (valorFormateado.length === 16) {
      if (!validarCedulaNicaragua(valorFormateado)) {
        setError('El formato de la cédula no es válido');
      } else {
        setError('')
            
            isValido = true;
      }
    } else {
      setError('');
    }
    if(onValidChage){
        onValidChage(isValido,valorFormateado)
    }
    
    if (onChange) {
      onChange({
        target: {
          name: 'cedula',
          value: valorFormateado
        }
      });
    }
  };

  return (
    <div className="field">
      <InputText
        className={`form-control ${error ? 'p-invalid' : ''}`}
        placeholder="000-000000-0000X"
        value={value}
        onChange={handleChange}
        maxLength={16}
      />
      {error && <small className="p-error block">{error}</small>}
    </div>
  );
}
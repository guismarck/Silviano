import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

/**
 * Normaliza un texto para comparar: minúsculas y sin tildes.
 * "Nuñez" -> "nunez", "José" -> "jose"
 */
const normalizar = (texto = '') =>
    String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

/**
 * Texto en el que se busca de cada estudiante: nombres, apellidos,
 * código y cédula. Acepta los nombres de campo en snake_case o camelCase.
 */
const textoBuscable = (e) =>
    normalizar(
        [
            e.nombre_completo ?? e.nombreCompleto,
            e.apellido_completo ?? e.apellidoCompleto,
            e.codEstudiante,
            e.cedula
        ]
            .filter(Boolean)
            .join(' ')
    );

/**
 * Cada palabra escrita debe aparecer en algún lugar del texto del estudiante,
 * sin importar el orden: "josefa salguero", "salguero josefa" o "jos sal".
 */
const filtrarEstudiantes = (estudiantes, consulta) => {
    const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);

    if (terminos.length === 0) return estudiantes;

    return estudiantes.filter((e) => {
        const texto = textoBuscable(e);
        return terminos.every((termino) => texto.includes(termino));
    });
};

export default function BuscarEstudiantes({
    estudiantes,
    onFilter,
    placeholder = 'Buscar por nombre, apellido, código o cédula...'
}) {
    const [searchTerm, setSearchTerm] = useState('');

    // Guarda la última versión de onFilter sin volver a disparar el efecto
    // si el componente padre pasa una función nueva en cada render.
    const onFilterRef = useRef(onFilter);
    onFilterRef.current = onFilter;

    // Filtra al escribir y también cuando la lista se recarga
    // (por ejemplo, después de registrar un estudiante nuevo).
    useEffect(() => {
        onFilterRef.current(filtrarEstudiantes(estudiantes ?? [], searchTerm));
    }, [searchTerm, estudiantes]);

    const handleClear = () => setSearchTerm('');

    return (
        <div className="p-fluid w-full">
            <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-search" />
                <InputText
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pr-5 text-lg py-3"
                />
                {searchTerm && (
                    <i
                        className="pi pi-times cursor-pointer text-500 hover:text-700 absolute"
                        style={{
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                        }}
                        onClick={handleClear}
                        title="Limpiar búsqueda"
                    />
                )}
            </IconField>
        </div>
    );
}

BuscarEstudiantes.propTypes = {
    estudiantes: PropTypes.array.isRequired,
    onFilter: PropTypes.func.isRequired,
    placeholder: PropTypes.string
};
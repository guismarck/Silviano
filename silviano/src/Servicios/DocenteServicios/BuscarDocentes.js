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
 * Texto en el que se busca de cada docente: nombres, apellidos, código,
 * especialidad y cédula. Acepta los nombres de campo en snake_case o camelCase.
 */
const textoBuscable = (d) =>
    normalizar(
        [
            d.nombre_completo ?? d.nombreCompleto,
            d.apellido_completo ?? d.apellidoCompleto,
            d.codDocente,
            d.especialidad,
            d.cedula
        ]
            .filter(Boolean)
            .join(' ')
    );

/**
 * Cada palabra escrita debe aparecer en algún lugar del texto del docente,
 * sin importar el orden: "sandra gomez", "gomez sandra" o "san gom".
 */
const filtrarDocentes = (docentes, consulta) => {
    const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);

    if (terminos.length === 0) return docentes;

    return docentes.filter((d) => {
        const texto = textoBuscable(d);
        return terminos.every((termino) => texto.includes(termino));
    });
};

export default function BuscarDocente({
    docentes,
    onFilter,
    placeholder = 'Buscar por nombre, apellido, código o especialidad...'
}) {
    const [searchTerm, setSearchTerm] = useState('');

    // Guarda la última versión de onFilter sin volver a disparar el efecto
    // si el componente padre pasa una función nueva en cada render.
    const onFilterRef = useRef(onFilter);
    onFilterRef.current = onFilter;

    // Filtra al escribir y también cuando la lista se recarga
    // (por ejemplo, después de registrar, editar o eliminar un docente).
    useEffect(() => {
        onFilterRef.current(filtrarDocentes(docentes ?? [], searchTerm));
    }, [searchTerm, docentes]);

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

BuscarDocente.propTypes = {
    docentes: PropTypes.array.isRequired,
    onFilter: PropTypes.func.isRequired,
    placeholder: PropTypes.string
};
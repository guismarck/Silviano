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
 * Texto en el que se busca de cada tutor: nombres, apellidos, cédula,
 * ocupación y teléfono. Acepta los nombres de campo en snake_case o camelCase.
 */
const textoBuscable = (t) =>
    normalizar(
        [
            t.nombre_completo ?? t.nombreCompleto,
            t.apellido_completo ?? t.apellidoCompleto,
            t.cedula,
            t.ocupacion,
            t.telefonoPrincipal
        ]
            .filter(Boolean)
            .join(' ')
    );

/**
 * Cada palabra escrita debe aparecer en algún lugar del texto del tutor,
 * sin importar el orden: "miguel lopez", "lopez miguel" o "mig lop".
 */
const filtrarTutores = (tutores, consulta) => {
    const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);

    if (terminos.length === 0) return tutores;

    return tutores.filter((t) => {
        const texto = textoBuscable(t);
        return terminos.every((termino) => texto.includes(termino));
    });
};

export default function BuscarTutor({
    tutores,
    onFilter,
    placeholder = 'Buscar por nombre, apellido, cédula, ocupación o teléfono...'
}) {
    const [searchTerm, setSearchTerm] = useState('');

    // Guarda la última versión de onFilter sin volver a disparar el efecto
    // si el componente padre pasa una función nueva en cada render.
    const onFilterRef = useRef(onFilter);
    onFilterRef.current = onFilter;

    // Filtra al escribir y también cuando la lista se recarga
    // (por ejemplo, después de editar o eliminar un tutor).
    useEffect(() => {
        onFilterRef.current(filtrarTutores(tutores ?? [], searchTerm));
    }, [searchTerm, tutores]);

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

BuscarTutor.propTypes = {
    tutores: PropTypes.array.isRequired,
    onFilter: PropTypes.func.isRequired,
    placeholder: PropTypes.string
};
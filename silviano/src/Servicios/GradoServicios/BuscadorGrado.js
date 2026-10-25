
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const BuscadorGrados = ({ value, onChange }) => {
    const limpiarBusqueda = () => {
        onChange('');
    };

    return (
        <div
            className="flex justify-content-center align-items-center gap-2 w-full"
            style={{ padding: '1rem 0' }}
        >
            <span
                className="p-input-icon-left"
                style={{ width: '100%', maxWidth: '500px' }}
            >
                <i className="pi pi-search" />

                <InputText
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar por nombre o nivel educativo..."
                    aria-label="Buscar grados por nombre o nivel educativo"
                    className="w-full"
                />
            </span>

            {value && (
                <Button
                    type="button"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    rounded
                    aria-label="Limpiar búsqueda"
                    tooltip="Limpiar búsqueda"
                    onClick={limpiarBusqueda}
                />
            )}
        </div>
    );
};

export default BuscadorGrados;

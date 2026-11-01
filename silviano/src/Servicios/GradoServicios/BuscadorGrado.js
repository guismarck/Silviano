import React from 'react';

/**
 * Barra de búsqueda grande y centrada para los grados.
 * Mismo estilo que la de salones y asignaturas.
 *
 * Props:
 *  - value:    texto actual de la búsqueda
 *  - onChange: función que recibe el nuevo texto
 */
const BuscadorGrados = ({ value, onChange }) => {
    return (
        <div className="flex justify-content-center w-full mb-2">
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '720px'
                }}
            >
                <i
                    className="pi pi-search"
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        fontSize: '1.1rem',
                        pointerEvents: 'none'
                    }}
                />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar por nombre o nivel educativo..."
                    aria-label="Buscar grados por nombre o nivel educativo"
                    style={{
                        width: '100%',
                        height: '3.25rem',
                        padding: '0 3rem 0 2.75rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        outline: 'none',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                        boxSizing: 'border-box'
                    }}
                />

                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        aria-label="Limpiar búsqueda"
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '1rem'
                        }}
                    >
                        <i className="pi pi-times" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BuscadorGrados;
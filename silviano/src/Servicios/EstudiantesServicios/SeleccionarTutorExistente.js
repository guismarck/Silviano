import React from 'react';

import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

/**
 * Dropdown con búsqueda para elegir un tutor ya registrado.
 * Ubicación: src/Servicios/EstudiantesServicios/SeleccionarTutorExistente.js
 *
 * Busca por nombre, apellido (en cualquier orden), cédula o teléfono
 * (el texto de búsqueda lo prepara aTutorExistente en tutorExistente.js).
 *
 * Props:
 *  - tutores:      lista ya adaptada (useTutoresExistentes)
 *  - cargando:     true mientras se consulta la API
 *  - error:        mensaje si la consulta falló (null si todo bien)
 *  - onRecargar:   reintenta la consulta
 *  - valor:        idpersona del tutor seleccionado (o null)
 *  - onSeleccionar(tutor|null): se llama al elegir o al limpiar
 *  - disabled:     deshabilita el control
 */
export default function SeleccionarTutorExistente({
    tutores = [],
    cargando = false,
    error = null,
    onRecargar,
    valor = null,
    onSeleccionar,
    disabled = false
}) {
    const itemTemplate = (tutor) => (
        <div className="flex flex-column">
            <span className="font-semibold">{tutor.etiqueta}</span>
            <small className="text-600">
                {[
                    tutor.cedula && `Cédula: ${tutor.cedula}`,
                    tutor.telefonoPrincipal && `Tel: ${tutor.telefonoPrincipal}`,
                    tutor.ocupacion
                ]
                    .filter(Boolean)
                    .join(' · ')}
            </small>
        </div>
    );

    const valueTemplate = (tutor, props) =>
        tutor ? (
            <span>
                {tutor.etiqueta}
                {tutor.cedula ? ` · ${tutor.cedula}` : ''}
            </span>
        ) : (
            <span>{props?.placeholder}</span>
        );

    return (
        <div className="w-full">
            {error && (
                <div className="flex flex-wrap align-items-center gap-2 mb-2">
                    <Message severity="warn" text={error} />

                    <Button
                        type="button"
                        size="small"
                        outlined
                        icon="pi pi-refresh"
                        label="Reintentar"
                        onClick={onRecargar}
                    />
                </div>
            )}

            <Dropdown
                inputId="buscarTutorExistente"
                value={valor}
                options={tutores}
                optionLabel="etiqueta"
                optionValue="idpersona"
                filter
                filterBy="textoBusqueda"
                filterPlaceholder="Nombre, apellido, cédula o teléfono"
                placeholder={
                    cargando
                        ? 'Cargando tutores registrados...'
                        : 'Buscar tutor ya registrado (nombre, apellido, cédula o teléfono)'
                }
                emptyFilterMessage="No se encontró ningún tutor con ese dato."
                emptyMessage="No hay tutores registrados."
                showClear
                itemTemplate={itemTemplate}
                valueTemplate={valueTemplate}
                onChange={(e) => {
                    const elegido =
                        tutores.find((t) => t.idpersona === e.value) ?? null;

                    if (typeof onSeleccionar === 'function') {
                        onSeleccionar(elegido);
                    }
                }}
                disabled={disabled || cargando}
                className="w-full"
            />
        </div>
    );
}
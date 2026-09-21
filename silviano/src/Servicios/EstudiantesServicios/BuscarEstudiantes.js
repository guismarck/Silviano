import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { searchEstudiantes } from '../estudianteService';

export default function BuscarEstudiantes({ onFilter, loadAll, placeholder = 'Buscar por nombre, código, cédula o tutor...' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Evita la ejecución automática al montar la vista inicial
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      const trimmedQuery = searchTerm.trim();

      if (!trimmedQuery) {
        loadAll();
        return;
      }

      setLoading(true);
      try {
        const data = await searchEstudiantes(trimmedQuery);
        onFilter(Array.isArray(data) ? data : []);
      } catch (error) {
        onFilter([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]); // Depende únicamente del texto del input

  const handleClear = () => {
    setSearchTerm('');
    loadAll();
  };

  return (
    <div className="p-fluid w-full">
      <IconField iconPosition="left" className="w-full">
        <InputIcon className={loading ? 'pi pi-spin pi-spinner text-primary' : 'pi pi-search'} />
        <InputText
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pr-5 text-lg py-3"
        />
        {searchTerm && (
          <i
            className="pi pi-times cursor-pointer text-500 hover:text-700 absolute"
            style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
            onClick={handleClear}
            title="Limpiar búsqueda"
          />
        )}
      </IconField>
    </div>
  );
}

BuscarEstudiantes.propTypes = {
  onFilter: PropTypes.func.isRequired,
  loadAll: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};
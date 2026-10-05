import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import { useAuth } from '../context/AuthContext';

export const MainLayout = ({ modulos = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mapeador recursivo de ModuloMenuDTO a la estructura Model de PrimeReact PanelMenu
  const mapearAMenuModel = (items) => {
    return items.map((m) => {
      const tieneHijos = m.submodulos && m.submodulos.length > 0;
      return {
        label: m.nombre,
        icon: m.pathImg || (tieneHijos ? 'pi pi-fw pi-folder' : 'pi pi-fw pi-file'),
        command: () => {
          if (m.recurso && !tieneHijos) {
            navigate(m.recurso);
          }
        },
        items: tieneHijos ? mapearAMenuModel(m.submodulos) : null
      };
    });
  };

  const menuItems = mapearAMenuModel(modulos);

  return (
    <div className="layout-wrapper flex flex-column min-screen-height">
      {/* Topbar */}
      <header className="flex justify-content-between align-items-center bg-primary text-white p-3 shadow-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-building text-2xl"></i>
          <span className="font-bold text-xl">Sistema SIGE</span>
        </div>
        <div className="flex align-items-center gap-3">
          <span>Bienvenido, <strong>{user?.username}</strong></span>
          <Button icon="pi pi-power-off" className="p-button-danger p-button-rounded" onClick={logout} title="Cerrar Sesión" />
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Sidebar Dinámico */}
        <aside className="w-18rem bg-surface-0 p-3 border-right-1 border-300">
          <h4 className="text-secondary mb-3">Navegación</h4>
          <PanelMenu model={menuItems} className="w-full" />
        </aside>

        {/* Dynamic Viewport */}
        <main className="flex-1 p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
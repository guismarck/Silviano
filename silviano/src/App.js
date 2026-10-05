import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { COMPONENT_REGISTRY } from './config/componentRegistry';
import { menuService } from './Servicios/MenuService/menuService';
import { MainLayout } from './Componentes/MainLayout';
import { Login } from './Componentes/Academico/controllers/Login';
import { useAuth, AuthProvider } from './context/AuthContext';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './index.css';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const [modulosMenu, setModulosMenu] = useState([]);
  const [rutasPlanas, setRutasPlanas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarRutasPermitidas = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Peticiones paralelas: Árbol para UI y Lista Plana para Rutas
      const [menuData, rutasData] = await Promise.all([
        menuService.getModulosUsuario(),
        menuService.getRutasPlanasUsuario()
      ]);
      setModulosMenu(menuData);
      setRutasPlanas(rutasData);
    } catch (error) {
      console.error('Error al cargar estructura dinámicas de seguridad:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    cargarRutasPermitidas();
  }, [cargarRutasPermitidas]);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-screen-height">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />

      {isAuthenticated ? (
        <Route element={<MainLayout modulos={modulosMenu} />}>
          <Route path="/" element={<h2 className="text-center mt-5">Bienvenido al Portal SIGE</h2>} />

          {/* Mapeo dinámico de rutas registradas */}
          {rutasPlanas.map((modulo) => {
            const ComponenteLazy = COMPONENT_REGISTRY[modulo.componentKey];

            if (!ComponenteLazy) {
              console.warn(`Componente no registrado en COMPONENT_REGISTRY: ${modulo.componentKey}`);
              return null;
            }

            return (
              <Route
                key={modulo.id || modulo.recurso}
                path={modulo.recurso}
                element={
                  <Suspense fallback={<ProgressSpinner style={{ width: '50px', height: '50px' }} />}>
                    <ComponenteLazy permisos={modulo.permisos} />
                  </Suspense>
                }
              />
            );
          })}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
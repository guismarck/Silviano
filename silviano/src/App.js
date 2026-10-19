import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './Componentes/Academico/controllers/ProtectedRoute';
import { MainLayout } from './Componentes/Academico/MainLayout';
import { Login } from './Componentes/Login/Login'; // Verifica esta ruta de archivo

// Controladores del Sistema SIGE
//import ListarGrados from './Componentes/Academico/controllers/ListarGrados';
import Estudiantes from './Componentes/Academico/controllers/Estudiantes';
//import AgregarGrados from './Componentes/Academico/controllers/AgregarGrados';
import ListarCatalogoSalon from './Componentes/Academico/controllers/ListarCatalogoSalon';
import ListMatriculas from './Servicios/MatriculasServicios/ListMatriculas';
import GestionCobroForm from './Componentes/ReciboPago';
import RegistroMatricula from './Componentes/matriculas/MatriculaPantallaUnica';
import Calificaciones from './Componentes/Academico/controllers/GestionCalificaciones';
import { ReporteBoletin } from './Componentes/Academico/controllers/ReporteBoletin';
// Nuevo Componente de Asignación Académica
import { AsignacionDocente } from './Componentes/Academico/controllers/AsignacionDocente';

import './estilosCSS/flags.css';
import './index.css';

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Login por defecto al entrar a la app */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<RootRedirect />} />

      {/* 2. Área Privada del Sistema */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <div className="card p-4">
                <h2>Bienvenido al Sistema SIGE - Colegio Silviano Matamoros</h2>
              </div>
            }
          />

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'SECRETARIA']} />}>
            <Route path="/estudiantes" element={<Estudiantes />} />
            {/* <Route path="/grados" element={<ListarGrados />} /> */}
            {/* <Route path="/agregargrados" element={<AgregarGrados />} /> */}
            <Route path="/salon" element={<ListarCatalogoSalon />} />
            <Route path="/asignacionDocente" element={<AsignacionDocente />} />
            <Route path="/matriculas" element={<ListMatriculas />} />
            <Route path="/registroMatricula" element={<RegistroMatricula />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'DOCENTE']} />}>
            <Route path="/calificaciones" element={<Calificaciones />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'CAJERO']} />}>
            <Route path="/gestionCobro" element={<GestionCobroForm />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR']} />}>
            <Route path="/reportes" element={<ReporteBoletin />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="/unauthorized"
        element={
          <div className="p-5 text-center text-danger">
            <h2>Acceso Restringido</h2>
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
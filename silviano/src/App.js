import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './Componentes/Academico/controllers/ProtectedRoute';
import { MainLayout } from './Componentes/Academico/MainLayout';
import { Login } from './Componentes/Login/Login'; // Verifica esta ruta de archivo
import Dashboard from './Servicios/DashboarService/Dashboard';

// Controladores del Sistema SIGE
import ListarGrados from './Componentes/Academico/controllers/Grados';
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
import Asignaturas from './Componentes/Academico/controllers/Asignaturas';
import './estilosCSS/flags.css';
import './index.css';

import  Docentes  from './Componentes/Academico/controllers/Docentes';
import  Tutores  from './Componentes/Academico/controllers/Tutores';
import {GestionPeriodos} from './Componentes/Academico/controllers/GestionPeriodo'



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
            element={<Dashboard />}
          />

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'SECRETARIA']} />}>
            <Route path="/periodos" element={<GestionPeriodos />} />
            <Route path="/estudiantes" element={<Estudiantes />} />
            <Route path="/tutores" element={<Tutores />} />
            <Route path="/docentes" element={<Docentes />} />
            <Route path="/grados" element={<ListarGrados />} />
            <Route path="/asignaturas" element={<Asignaturas />} />
            <Route path="/salon" element={<ListarCatalogoSalon />} />
            <Route path="/asignacionDocente" element={<AsignacionDocente />} />
            <Route path="/matriculas" element={<ListMatriculas />} />
            <Route path="/registroMatricula" element={<RegistroMatricula />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DOCENTE']} />}>
            <Route path="/calificaciones" element={<Calificaciones />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'CAJERO']} />}>
            <Route path="/gestionCobro" element={<GestionCobroForm />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'SECRETARIA']} />}>
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
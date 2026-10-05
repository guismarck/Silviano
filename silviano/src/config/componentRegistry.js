import { lazy } from 'react';

/**
 * Registro centralizado de componentes para enrutamiento dinámico.
 * Mapea 'component_key' de la BD con las cargas perezosas (Code Splitting).
 */
export const COMPONENT_REGISTRY = {
  ListarGrados: lazy(() => import('../Componentes/Academico/controllers/ListarGrados')),
  AgregarGrados: lazy(() => import('../Componentes/Academico/controllers/AgregarGrados')),
  ListarCatalogoSalon: lazy(() => import('../Componentes/Academico/controllers/ListarCatalogoSalon')),
  Estudiantes: lazy(() => import('../Componentes/Academico/controllers/Estudiantes')),
  ListMatriculas: lazy(() => import('../Servicios/MatriculasServicios/ListMatriculas')),
  RegistroMatricula: lazy(() => import('../Servicios/MatriculasServicios/RegistroMatricula')),
  GestionCobroForm: lazy(() => import('../Servicios/PagosServicios/gestionCobro')),
  RegistroCalificaciones: lazy(() => import('../Componentes/Academico/controllers/RegistroCalificaciones'))
};
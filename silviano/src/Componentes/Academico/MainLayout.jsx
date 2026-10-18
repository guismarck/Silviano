import React, { useState, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MainLayout = () => {
  const { user, logout, hasAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarClosed, setSidebarClosed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSidebar = useCallback(() => {
    setSidebarClosed((prev) => {
      const nextState = !prev;
      if (nextState) {
        setOpenSubmenu(null);
      }
      return nextState;
    });
  }, []);

  const toggleSubmenu = useCallback((title) => {
    setSidebarClosed(false);
    setOpenSubmenu((prev) => (prev === title ? null : title));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuConfig = [
    {
      title: 'Inicio',
      icon: 'bx bx-home',
      path: '/dashboard',
      roles: ['*'],
    },
    {
      title: 'Académico',
      icon: 'bx bxs-school',
      roles: ['DIRECTOR', 'SECRETARIA'],
      subMenu: [
        { label: 'Estudiantes', path: '/estudiantes' },
        { label: 'Salón', path: '/salon' },
        { label: 'Grados', path: '/grados' },
        { label: 'Agregar Grados', path: '/agregargrados' },
      ],
    },
    {
      title: 'Matrículas',
      icon: 'bx bx-edit-alt',
      roles: ['DIRECTOR', 'SECRETARIA'],
      subMenu: [
        { label: 'Nueva Matrícula', path: '/registroMatricula' },
        { label: 'Listar Matrículas', path: '/matriculas' },
      ],
    },
    {
      title: 'Notas',
      icon: 'bx bx-notepad',
      roles: ['DIRECTOR', 'DOCENTE'],
      subMenu: [{ label: 'Gestión Calificaciones', path: '/calificaciones' }],
    },
    {
      title: 'Pago',
      icon: 'bx bx-dollar-circle',
      roles: ['DIRECTOR', 'CAJERO'],
      subMenu: [{ label: 'Gestión de Cobro', path: '/gestionCobro' }],
    },
    {
      title: 'Reportes',
      icon: 'bx bx-line-chart',
      path: '/reportes',
      roles: ['DIRECTOR'],
    },
  ];

  return (
    <div className="body">
      <div className={`sidebar ${sidebarClosed ? 'close' : ''}`}>
        <div className="logo-details">
          <i className="bx bx-shield-alt-2"></i>
          <span className="logo_name">Silviano Matamoros</span>
        </div>

        <ul className="nav-links">
          {menuConfig
            .filter((item) => hasAccess(item.roles))
            .map((item) => {
              const hasSubMenu = Array.isArray(item.subMenu) && item.subMenu.length > 0;
              const isOpen = openSubmenu === item.title;

              return (
                <li key={item.title} className={hasSubMenu && isOpen && !sidebarClosed ? 'showMenu' : ''}>
                  {hasSubMenu ? (
                    <>
                      <div className="icon-link" onClick={() => toggleSubmenu(item.title)}>
                        <i className={item.icon}></i>
                        <span className="link_name">{item.title}</span>
                        <i className={`bx bxs-chevron-down arrow ${isOpen ? 'rotate' : ''}`}></i>
                      </div>

                      <ul className="sub-menu">
                        {item.subMenu.map((sub) => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              className={location.pathname === sub.path ? 'active-sublink' : ''}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link to={item.path} className={location.pathname === item.path ? 'active-sublink' : ''}>
                      <i className={item.icon}></i>
                      <span className="link_name">{item.title}</span>
                    </Link>
                  )}
                </li>
              );
            })}

          <li>
            <div className="profile-details">
              <div className="profile-content">
                <img src="/img/user.png" alt="Perfil" />
              </div>
              <div className="name-job">
                <div className="profile_name">
                  {user?.nombreCompleto || user?.username || 'William Guzman'}
                </div>
                <div className="job">{user?.roles?.join(', ') || 'DIRECTOR'}</div>
              </div>
              <i
                className="bx bx-log-out"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
                title="Cerrar Sesión"
              ></i>
            </div>
          </li>
        </ul>
      </div>

      <section className="home-section">
        <div className="home-content">
          <i className="bx bx-menu" onClick={toggleSidebar} style={{ cursor: 'pointer' }}></i>
          <span className="text">SISTEMA DE GESTIÓN ESCOLAR (SIGE)</span>
        </div>

        <div className="home-panel p-4">
          <Outlet />
        </div>
      </section>
    </div>
  );
};
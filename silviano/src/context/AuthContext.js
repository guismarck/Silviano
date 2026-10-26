import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sige_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback((userData) => {
    // Normalizar roles eliminando prefijos "ROLE_" si provienen de Spring Security
    const normalizedRoles = (userData.roles || []).map((role) =>
      typeof role === 'string' ? role.toUpperCase().replace('ROLE_', '') : ''
    );

    const activeUser = { ...userData, roles: normalizedRoles };

    localStorage.setItem('sige_user', JSON.stringify(activeUser));
    setUser(activeUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sige_user');
    setUser(null);
  }, []);

  // Control de permisos RBAC para vistas y menú lateral
  const hasAccess = useCallback(
    (allowedRoles = []) => {
      if (!user || !user.roles) return false;
      if (allowedRoles.includes('*')) return true;

      // El administrador conserva acceso total; los demás roles respetan cada permiso declarado.
      if (user.roles.includes('ADMIN')) return true;

      return user.roles.some((role) => allowedRoles.includes(role));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hasAccess,
    }),
    [user, login, logout, hasAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
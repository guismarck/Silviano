import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, hasAccess } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasAccess(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
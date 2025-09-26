import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/auth/AuthContext';
import { CenteredSpinner } from '../shared/components/CenteredSpinner';

type ProtectedRouteProps = {
  roles?: string[];
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const {
    state: { initialized, authenticated },
    hasRole
  } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <CenteredSpinner label="Initializing session" />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

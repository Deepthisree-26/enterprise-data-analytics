import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../utils/auth';

type Props = {
  allowedRoles: string[];
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const auth = isAuthenticated();
  const role = getUserRole();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />; // redirect to dashboard if role insufficient
  }
  return <>{children}</>;
};

export default ProtectedRoute;

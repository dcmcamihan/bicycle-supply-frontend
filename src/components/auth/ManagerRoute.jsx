import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ManagerRoute = ({ element }) => {
  const { user, userRole } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect to dashboard if not a manager
  if (userRole !== 'Manager') {
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default ManagerRoute;
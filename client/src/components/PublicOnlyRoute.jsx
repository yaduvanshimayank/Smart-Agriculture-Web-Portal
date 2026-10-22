import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingScreen } from './ProtectedRoute.jsx';

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Checking agricultural access session..." />;
  }

  if (user) {
    // If user is already authenticated, redirect away from public auth pages
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

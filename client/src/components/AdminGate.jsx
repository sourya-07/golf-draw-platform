import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminGate = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminGate;

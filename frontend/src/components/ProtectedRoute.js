import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Lock, AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  adminOnly = false,
  redirectTo = '/login',
  fallbackComponent = null 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cinema-darker">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 text-cinema-blue animate-spin" />
          <p className="text-white">Loading...</p>
          <div className="w-48 h-1 mx-auto mt-4 bg-gray-700 rounded-full">
            <div className="h-1 rounded-full bg-cinema-blue animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (adminOnly) {
    return fallbackComponent || (
      <div className="flex items-center justify-center min-h-screen bg-cinema-darker">
        <div className="max-w-md p-8 mx-auto text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-4 text-2xl font-bold text-white">Access Denied</h2>
          <p className="mb-6 text-gray-300">
            You don't have permission to access this page. Admin privileges required.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 text-white transition-colors rounded-lg bg-cinema-blue hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (requiredRole) {
    return fallbackComponent || (
      <div className="flex items-center justify-center min-h-screen bg-cinema-darker">
        <div className="max-w-md p-8 mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="mb-4 text-2xl font-bold text-white">Insufficient Permissions</h2>
          <p className="mb-6 text-gray-300">
            This page requires {requiredRole} access level.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 text-white transition-colors rounded-lg bg-cinema-blue hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute adminOnly={true} {...props}>
    {children}
  </ProtectedRoute>
);

export const ModeratorRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="moderator" {...props}>
    {children}
  </ProtectedRoute>
);

export const PremiumRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="premium" {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
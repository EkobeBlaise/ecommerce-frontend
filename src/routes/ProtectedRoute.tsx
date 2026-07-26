import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    // Check authentication state from localStorage
    const checkAuth = () => {
      try {
        // Check both auth-storage and user in localStorage
        const authData = localStorage.getItem('auth-storage');
        const userData = localStorage.getItem('user');
        
        if (authData && userData) {
          const parsedAuth = JSON.parse(authData);
          const parsedUser = JSON.parse(userData);
          
          // If both exist and isAuthenticated is true
          if (parsedAuth.state?.isAuthenticated && parsedUser) {
            setAuth(true);
          } else {
            setAuth(false);
          }
        } else {
          setAuth(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuth(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Use both Zustand state and localStorage check
  const isAuth = isAuthenticated || auth;

  if (!isAuth) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

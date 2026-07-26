import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication state from localStorage
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('auth-storage');
        const userData = localStorage.getItem('user');
        
        if (authData && userData) {
          const parsedAuth = JSON.parse(authData);
          const parsedUser = JSON.parse(userData);
          
          if (parsedAuth.state?.isAuthenticated && parsedUser) {
            setAuth(true);
            setRole(parsedUser.role || 'user');
          } else {
            setAuth(false);
            setRole(null);
          }
        } else {
          setAuth(false);
          setRole(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuth(false);
        setRole(null);
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

  // Check if user is authenticated
  const isAuth = isAuthenticated || auth;

  if (!isAuth) {
    toast.error('Please login to access admin panel');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || role === 'admin';

  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

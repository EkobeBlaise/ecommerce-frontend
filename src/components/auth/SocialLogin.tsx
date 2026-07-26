import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface SocialLoginProps {
  onSuccess?: () => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      toast.loading('Connecting to Google...', { id: 'social-login' });
      
      setTimeout(async () => {
        const email = 'google.user@gmail.com';
        const password = 'google_oauth_token';
        
        const authData = JSON.parse(localStorage.getItem('auth-storage') || '{"state":{"users":[]}}');
        const users = authData.state.users || [];
        let user = users.find((u: any) => u.email === email);
        
        if (!user) {
          user = {
            id: 'google_' + Date.now(),
            email: email,
            password: password,
            first_name: 'Google',
            last_name: 'User',
            role: 'user',
            emailVerified: true,
            provider: 'google',
            created_at: new Date().toISOString()
          };
          users.push(user);
          authData.state.users = users;
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          toast.success('Google account linked!', { id: 'social-login' });
        } else {
          toast.success('Welcome back!', { id: 'social-login' });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        authData.state.user = userWithoutPassword;
        authData.state.isAuthenticated = true;
        localStorage.setItem('auth-storage', JSON.stringify(authData));
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        toast.success('Login successful!', { id: 'social-login' });
        
        if (onSuccess) {
          onSuccess();
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed', { id: 'social-login' });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      toast.loading('Connecting to Facebook...', { id: 'social-login' });
      
      setTimeout(async () => {
        const email = 'facebook.user@gmail.com';
        const password = 'facebook_oauth_token';
        
        const authData = JSON.parse(localStorage.getItem('auth-storage') || '{"state":{"users":[]}}');
        const users = authData.state.users || [];
        let user = users.find((u: any) => u.email === email);
        
        if (!user) {
          user = {
            id: 'facebook_' + Date.now(),
            email: email,
            password: password,
            first_name: 'Facebook',
            last_name: 'User',
            role: 'user',
            emailVerified: true,
            provider: 'facebook',
            created_at: new Date().toISOString()
          };
          users.push(user);
          authData.state.users = users;
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          toast.success('Facebook account linked!', { id: 'social-login' });
        } else {
          toast.success('Welcome back!', { id: 'social-login' });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        authData.state.user = userWithoutPassword;
        authData.state.isAuthenticated = true;
        localStorage.setItem('auth-storage', JSON.stringify(authData));
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        toast.success('Login successful!', { id: 'social-login' });
        
        if (onSuccess) {
          onSuccess();
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Facebook login failed', { id: 'social-login' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <button
          onClick={handleFacebookLogin}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
        >
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;

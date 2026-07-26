import { create } from 'zustand';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  avatar?: string;
  createdAt?: string;
  phone?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData?: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });

      try {
        const response = await authApi.login({ email, password });
        const data = response.data;

        if (data.success) {
          const userData = data.data;
          localStorage.setItem('token', userData.token);
          localStorage.setItem('user', JSON.stringify(userData));
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      } catch (error: any) {
        console.error('Login error:', error);
        set({ isLoading: false });
        return false;
      }
    },

    register: async (email: string, password: string, userData?: Partial<User>) => {
      set({ isLoading: true });

      try {
        const response = await authApi.register({
          email,
          password,
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
        });
        const data = response.data;

        if (data.success) {
          const userData = data.data;
          localStorage.setItem('token', userData.token);
          localStorage.setItem('user', JSON.stringify(userData));
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        set({ isLoading: false });
        return false;
      }
    },

    logout: () => {
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // ✅ Updated: Async profile update via API
    updateUser: async (data: Partial<User>): Promise<boolean> => {
      const { user } = get();
      if (!user) return false;

      try {
        const response = await authApi.updateProfile({
          firstName: data.firstName || user.firstName,
          lastName: data.lastName || user.lastName,
          phone: data.phone || '',
        });

        if (response.data.success) {
          const updatedUser = { ...user, ...data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('Update user error:', error);
        return false;
      }
    },

    // ✅ New: Password update via API
    updatePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
      try {
        const response = await authApi.updatePassword({ currentPassword, newPassword });
        return response.data.success || false;
      } catch (error: any) {
        console.error('Update password error:', error);
        return false;
      }
    },

    checkAuth: async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Auth restore error:', error);
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    },
  })
);

// Auto‑restore session on app load
useAuthStore.getState().checkAuth();

export default useAuthStore;
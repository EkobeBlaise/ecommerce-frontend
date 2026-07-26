import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - ✅ Don't show toast for every error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Handle 401 Unauthorized - redirect to login without toast
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // ✅ Handle 403 Forbidden - log but don't show toast (let components handle it)
    if (error.response?.status === 403) {
      console.warn('⚠️ Forbidden request:', error.config?.url);
      return Promise.reject(error);
    }

    // ✅ Only show toast for user-facing errors (400, 500)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const message = error.response?.data?.message || 'Something went wrong';
      // Don't show toast for 404s on non-critical endpoints
      if (error.response?.status !== 404) {
        toast.error(message);
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ============================================================
// API Endpoints
// ============================================================

// Auth
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: any) => api.put('/auth/password', data),
};

// Products
export const productApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  deleteMany: (ids: string[]) => api.post('/products/delete-many', { ids }),
};

// Categories
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  getGroups: (categoryId?: string) => api.get('/categories/groups', { params: { categoryId } }),
  createGroup: (data: any) => api.post('/categories/groups', data),
  updateGroup: (id: string, data: any) => api.put(`/categories/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/categories/groups/${id}`),
  getSubCategories: (groupId?: string) => api.get('/categories/subcategories', { params: { groupId } }),
  createSubCategory: (data: any) => api.post('/categories/subcategories', data),
  updateSubCategory: (id: string, data: any) => api.put(`/categories/subcategories/${id}`, data),
  deleteSubCategory: (id: string) => api.delete(`/categories/subcategories/${id}`),
};

// AI
export const aiApi = {
  generateDescription: (data: any) => api.post('/ai/generate-description', data),
};

export default api;
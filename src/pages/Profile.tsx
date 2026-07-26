import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Edit2, Save, X, Camera, Shield,
  Package, Heart, Settings, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUser, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    });
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center">
              <Package className="w-6 h-6 mx-auto text-pink-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center">
              <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wishlist Items</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center">
              <Shield className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.emailVerified ? '✅' : '⏳'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email Status</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-60"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/orders"
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition"
            >
              <Package className="w-6 h-6 mx-auto text-pink-600 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">My Orders</p>
            </Link>
            <Link
              to="/wishlist"
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition"
            >
              <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Wishlist</p>
            </Link>
            <Link
              to="/addresses"
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition"
            >
              <MapPin className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Addresses</p>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition hover:border-red-300"
            >
              <LogOut className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-sm font-medium text-red-500">Logout</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

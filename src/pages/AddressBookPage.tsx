import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import AddressBook, { Address } from '../components/AddressBook';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Home, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AddressBookPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your addresses');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    toast.success(`Selected ${address.firstName} ${address.lastName}'s address`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-pink-600" />
                Address Book
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your saved addresses for faster checkout
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            👤 {user.first_name} {user.last_name}
          </div>
        </div>

        {/* Address Book Component */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
          <AddressBook 
            userId={user.id} 
            onAddressSelect={handleAddressSelect}
            selectable={true}
          />
        </div>

        {/* Selected Address Preview */}
        {selectedAddress && (
          <div className="mt-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Selected Address:
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {selectedAddress.firstName} {selectedAddress.lastName}<br />
                  {selectedAddress.addressLine1}
                  {selectedAddress.addressLine2 && <>, {selectedAddress.addressLine2}</>}<br />
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}<br />
                  {selectedAddress.country}
                </p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-green-600 dark:text-green-400 capitalize">
                    📦 {selectedAddress.type}
                  </span>
                  {selectedAddress.isDefault && (
                    <span className="text-pink-600 dark:text-pink-400">
                      ⭐ Default
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 text-center">
            <h3 className="font-semibold text-2xl text-pink-600">📝</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add Address</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Click "Add New Address"</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 text-center">
            <h3 className="font-semibold text-2xl text-blue-600">✏️</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Edit Address</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Click edit icon on any card</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 text-center">
            <h3 className="font-semibold text-2xl text-green-600">✅</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set Default</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Click check icon on any card</p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Storage Info
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 font-mono">
            <p>User ID: <span className="text-pink-600 dark:text-pink-400">{user.id}</span></p>
            <p>Storage Key: <span className="text-pink-600 dark:text-pink-400">addresses_{user.id}</span></p>
            <p className="text-green-600 dark:text-green-400">✅ Data persists in localStorage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressBookPage;

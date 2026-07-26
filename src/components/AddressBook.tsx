import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Home, Building, Check, X, Truck, CreditCard } from 'lucide-react';
import { addressService } from '../services/addressService';
import toast from 'react-hot-toast';

export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
  createdAt?: string;
  updatedAt?: string;
}

interface AddressBookProps {
  userId: string;
  onAddressSelect?: (address: Address) => void;
  selectable?: boolean;
}

const AddressBook: React.FC<AddressBookProps> = ({ 
  userId, 
  onAddressSelect, 
  selectable = false 
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Address>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
    isDefault: false,
    type: 'both',
    userId: userId,
  });

  // Load addresses from API
  useEffect(() => {
    if (userId) {
      loadAddresses();
    }
  }, [userId]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getByUserId(userId);
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || 
        !formData.email?.trim() || !formData.addressLine1?.trim() || 
        !formData.city?.trim() || !formData.postalCode?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const addressData = {
        userId: userId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2?.trim() || '',
        city: formData.city.trim(),
        state: formData.state?.trim() || '',
        postalCode: formData.postalCode.trim(),
        country: formData.country || 'United Kingdom',
        isDefault: formData.isDefault || false,
        type: (formData.type as 'shipping' | 'billing' | 'both') || 'both',
      };

      if (editingId) {
        // Update existing address
        await addressService.update(editingId, addressData);
        toast.success('Address updated successfully!');
      } else {
        // Add new address
        await addressService.create(addressData);
        toast.success('Address added successfully!');
      }

      resetForm();
      await loadAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United Kingdom',
      isDefault: false,
      type: 'both',
      userId: userId,
    });
  };

  const handleEdit = (address: Address) => {
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state || '',
      postalCode: address.postalCode,
      country: address.country || 'United Kingdom',
      isDefault: address.isDefault || false,
      type: address.type || 'both',
      userId: userId,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await addressService.delete(id);
      toast.success('Address deleted successfully!');
      await loadAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefault(id);
      toast.success('Default address updated!');
      await loadAddresses();
    } catch (error: any) {
      console.error('Error setting default:', error);
      toast.error(error.response?.data?.message || 'Failed to set default address');
    }
  };

  const handleSelect = (address: Address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'shipping':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'both':
        return <Home className="w-4 h-4 text-purple-500" />;
      default:
        return <Home className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                address.isDefault 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
              } ${selectable ? 'cursor-pointer hover:border-pink-400' : ''}`}
              onClick={() => selectable && handleSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getAddressTypeIcon(address.type)}
                    <span className="font-medium dark:text-white">
                      {address.firstName} {address.lastName}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full font-medium">
                        Default
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize">
                      {address.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.country}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 flex flex-wrap gap-3">
                    <span>📧 {address.email}</span>
                    {address.phone && <span>📱 {address.phone}</span>}
                  </div>
                </div>
                
                {!selectable && (
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-pink-600 transition rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/20"
                      title="Set as default"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(address);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(address.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium">No saved addresses yet</p>
          <p className="text-sm mt-1">Add your first address for faster checkout</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Address Line 1 *"
                  value={formData.addressLine1 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="md:col-span-2 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={formData.addressLine2 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="md:col-span-2 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Postal Code *"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
                <select
                  value={formData.country || 'United Kingdom'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="France">🇫🇷 France</option>
                  <option value="Spain">🇪🇸 Spain</option>
                  <option value="Italy">🇮🇹 Italy</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault || false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm dark:text-gray-300">Set as default address</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm dark:text-gray-300">Type:</span>
                  <select
                    value={formData.type || 'both'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'shipping' | 'billing' | 'both' })}
                    className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="shipping">Shipping Only</option>
                    <option value="billing">Billing Only</option>
                    <option value="both">Both</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!selectable && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition flex items-center justify-center gap-2 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition" />
          <span>Add New Address</span>
        </button>
      )}
    </div>
  );
};

export default AddressBook;
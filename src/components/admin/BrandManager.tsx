import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Edit, Trash2, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const BrandManager: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isActive: true,
  });

  const brands = settings.brands || [];

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }
    if (!formData.logo.trim()) {
      toast.error('Brand logo URL is required');
      return;
    }

    let updatedBrands;
    if (editingBrand) {
      updatedBrands = brands.map(b =>
        b.id === editingBrand.id
          ? { ...b, name: formData.name, logo: formData.logo, isActive: formData.isActive }
          : b
      );
      toast.success('Brand updated successfully');
    } else {
      const newId = Math.max(...brands.map(b => b.id), 0) + 1;
      updatedBrands = [...brands, {
        id: newId,
        name: formData.name,
        logo: formData.logo,
        isActive: formData.isActive,
        order: brands.length + 1,
      }];
      toast.success('Brand added successfully');
    }

    updateSettings({ ...settings, brands: updatedBrands });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', logo: '', isActive: true });
    setEditingBrand(null);
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo,
      isActive: brand.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (brand: any) => {
    if (window.confirm(`Delete brand "${brand.name}"?`)) {
      const updatedBrands = brands.filter(b => b.id !== brand.id);
      updateSettings({ ...settings, brands: updatedBrands });
      toast.success('Brand deleted');
    }
  };

  const toggleStatus = (brand: any) => {
    const updatedBrands = brands.map(b =>
      b.id === brand.id ? { ...b, isActive: !b.isActive } : b
    );
    updateSettings({ ...settings, brands: updatedBrands });
    toast.success(`${brand.name} ${!brand.isActive ? 'activated' : 'deactivated'}`);
  };

  const moveBrand = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= brands.length) return;
    
    const updatedBrands = [...brands];
    [updatedBrands[index], updatedBrands[newIndex]] = [updatedBrands[newIndex], updatedBrands[index]];
    updateSettings({ ...settings, brands: updatedBrands });
  };

  const activeBrands = brands.filter(b => b.isActive);
  const inactiveBrands = brands.filter(b => !b.isActive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">Brand Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage brands shown on homepage carousel</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Active Brands */}
      <div className="border rounded-lg p-4 dark:border-gray-700">
        <h4 className="font-semibold mb-3 dark:text-white">Active Brands ({activeBrands.length})</h4>
        <div className="space-y-2">
          {activeBrands.map((brand, idx) => (
            <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                <span className="font-medium dark:text-white">{brand.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moveBrand(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveBrand(idx, 'down')}
                  disabled={idx === activeBrands.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  ↓
                </button>
                <button onClick={() => handleEdit(brand)} className="p-1 text-blue-600 hover:text-blue-700">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => toggleStatus(brand)} className="p-1 text-yellow-600 hover:text-yellow-700">
                  <EyeOff className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(brand)} className="p-1 text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {activeBrands.length === 0 && (
            <p className="text-gray-500 text-center py-4">No active brands. Add some!</p>
          )}
        </div>
      </div>

      {/* Inactive Brands */}
      {inactiveBrands.length > 0 && (
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <h4 className="font-semibold mb-3 dark:text-white">Inactive Brands ({inactiveBrands.length})</h4>
          <div className="space-y-2">
            {inactiveBrands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain grayscale" />
                  <span className="font-medium dark:text-white">{brand.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(brand)} className="p-1 text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleStatus(brand)} className="p-1 text-green-600 hover:text-green-700">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(brand)} className="p-1 text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Nike, Adidas, Apple"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Logo URL *</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {formData.logo && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <img src={formData.logo} alt="Preview" className="h-12 object-contain" />
                  </div>
                )}
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="dark:text-gray-300">Active (show on homepage)</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingBrand ? 'Update Brand' : 'Add Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManager;

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X,
  ChevronDown, ChevronUp, RefreshCw,
  Download, Upload, Image, Globe,
  Star, StarOff, CheckCircle, AlertCircle
} from 'lucide-react';
import { brandService } from '../../services/brandService';
import { Brand } from '../../types/brand';
import toast from 'react-hot-toast';

const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    slug: '',
    logo: '',
    description: '',
    website: '',
    featured: false,
    status: 'active',
  });

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const allBrands = await brandService.getWithCount(); // assume async
      setBrands(allBrands);
      setFilteredBrands(allBrands);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Failed to load brands');
      // If no brands, initialize with sample
      try {
        await brandService.initializeWithSample();
        const refreshed = await brandService.getWithCount();
        setBrands(refreshed);
        setFilteredBrands(refreshed);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter brands
  useEffect(() => {
    let result = [...brands];
    if (filterStatus !== 'all') {
      result = result.filter(b => b.status === filterStatus);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
      );
    }
    setFilteredBrands(result);
  }, [brands, searchTerm, filterStatus]);

  // --- CRUD Handlers (async) ---
  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Brand name is required');
      return;
    }

    try {
      if (editingBrand) {
        const updated = await brandService.update(editingBrand.id, formData);
        if (updated) {
          toast.success('Brand updated successfully!');
        }
      } else {
        await brandService.create(formData as Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Brand created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      await loadBrands();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save brand');
    }
  };

  const handleDelete = async (id: string) => {
    const brand = await brandService.getById(id);
    if (brand && brand.productsCount && brand.productsCount > 0) {
      toast.error(`Cannot delete "${brand.name}" - It has ${brand.productsCount} products`);
      return;
    }
    if (window.confirm('Are you sure you want to delete this brand?')) {
      const success = await brandService.delete(id);
      if (success) {
        toast.success('Brand deleted successfully');
        await loadBrands();
      } else {
        toast.error('Failed to delete brand');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      website: '',
      featured: false,
      status: 'active',
    });
    setEditingBrand(null);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      website: brand.website || '',
      featured: brand.featured,
      status: brand.status,
    });
    setIsModalOpen(true);
  };

  const toggleFeatured = async (id: string) => {
    const brand = await brandService.getById(id);
    if (brand) {
      await brandService.update(id, { featured: !brand.featured });
      await loadBrands();
      toast.success(`Brand ${!brand.featured ? 'featured' : 'unfeatured'}`);
    }
  };

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      active: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      inactive: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', icon: AlertCircle },
    };
    const { color, icon: Icon } = config[status] || config.active;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getBrandColor = (name: string) => {
    const colors = [
      'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-violet-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your product brands ({filteredBrands.length} brands)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadBrands}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(brands, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `brands_export_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Brands exported!');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{brands.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-green-600">{brands.filter(b => b.status === 'active').length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-yellow-600">{brands.filter(b => b.featured).length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-blue-600">
              {brands.reduce((sum, b) => sum + (b.productsCount || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Products</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBrands.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No brands found</p>
              <p className="text-sm mt-1">Add your first brand to get started</p>
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = `w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${getBrandColor(brand.name)}`;
                            fallback.textContent = brand.name.charAt(0).toUpperCase();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${getBrandColor(brand.name)}`}>
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{brand.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {brand.productsCount || 0} products
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleFeatured(brand.id)}
                      className={`p-1 rounded-lg transition ${
                        brand.featured
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                      title={brand.featured ? 'Unfeature' : 'Feature'}
                    >
                      {brand.featured ? (
                        <Star className="w-4 h-4 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                      disabled={brand.productsCount && brand.productsCount > 0}
                    >
                      <Trash2 className={`w-4 h-4 ${brand.productsCount && brand.productsCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {brand.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {brand.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(brand.status)}
                    {brand.featured && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Visit
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({ 
                          ...formData, 
                          name,
                          slug: formData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                        });
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="e.g. nike"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave blank to auto-generate
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={formData.logo || ''}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.logo && (
                      <div className="mt-2">
                        <img src={formData.logo} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                      placeholder="Enter brand description..."
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                    />
                    <span className="text-sm dark:text-gray-300">Featured Brand</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm dark:text-gray-300">Status:</span>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition font-medium"
                >
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBrands;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, Eye, 
  Package, AlertCircle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Download, Upload,
  Filter, X
} from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import { useSettings } from '../../context/SettingsContext';
import QuickAddProduct from '../../components/admin/QuickAddProduct';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'women' | 'men' | 'kids' | 'unisex'>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Product>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    try {
      const allProducts = productService.getAll();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  useEffect(() => {
    let result = [...products];
    
    if (filterGender !== 'all') {
      result = result.filter(p => p.gender === filterGender);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    
    setFilteredProducts(result);
  }, [products, searchTerm, filterGender, sortField, sortDirection]);

  const handleDelete = () => {
    if (!productToDelete) return;
    
    const success = productService.deleteProduct(productToDelete);
    if (success) {
      toast.success('Product deleted successfully');
      loadProducts();
    } else {
      toast.error('Failed to delete product');
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      let count = 0;
      selectedProducts.forEach(id => {
        if (productService.deleteProduct(id)) count++;
      });
      toast.success(`${count} products deleted`);
      setSelectedProducts([]);
      loadProducts();
    }
  };

  const toggleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.isNew) {
      return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> New</span>;
    }
    if (product.isSale) {
      return <span className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full text-xs"><AlertCircle className="w-3 h-3" /> Sale</span>;
    }
    if (product.isTrending) {
      return <span className="flex items-center gap-1 text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full text-xs">🔥 Trending</span>;
    }
    if (product.isBestseller) {
      return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full text-xs">⭐ Bestseller</span>;
    }
    return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Active</span>;
  };

  const getGenderBadge = (gender: string) => {
    const colors: Record<string, string> = {
      women: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
      men: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      kids: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      unisex: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    };
    const color = colors[gender] || colors.unisex;
    return <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{gender || 'unisex'}</span>;
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your product catalog ({filteredProducts.length} products)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
            <Link
              to="/admin/products/new"
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Quick Add Panel */}
        {showQuickAdd && (
          <div className="mb-6">
            <QuickAddProduct onProductAdded={() => {
              loadProducts();
              setShowQuickAdd(false);
              toast.success('Product added successfully!');
            }} />
          </div>
        )}

        {/* Filters */}
        {(showFilters || searchTerm || filterGender !== 'all') && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="all">All Gender</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Selected ({selectedProducts.length})
                </button>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterGender('all');
                  setSelectedProducts([]);
                  setShowFilters(false);
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('name')}>
                    Product {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('price')}>
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm mt-1">Add your first product to get started</p>
                      <button
                        onClick={() => setShowQuickAdd(true)}
                        className="inline-block mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
                      >
                        Quick Add Product
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image || 'https://via.placeholder.com/40'} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{product.brand || 'No Brand'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">{getGenderBadge(product.gender || 'unisex')}</td>
                      <td className="px-4 py-3">{getStatusBadge(product)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.tags && product.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                              {tag}
                            </span>
                          ))}
                          {product.tags && product.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{product.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/product/${product.id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setProductToDelete(product.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with count */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {products.length > 0 && (
              <button
                onClick={() => {
                  const data = JSON.stringify(products, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `products_export_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Products exported!');
                }}
                className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Delete</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, Eye, ChevronDown } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} products?`)) return;
    try {
      await productService.deleteMany(selectedIds);
      setProducts(products.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success('Products deleted');
    } catch (error) {
      toast.error('Failed to delete products');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search and bulk actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No products found</p>
          <Link to="/admin/products/new" className="text-pink-600 hover:underline mt-2 inline-block">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, product.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== product.id));
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || 'https://picsum.photos/40'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="font-medium dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 dark:text-white">${product.price}</td>
                  <td className="px-4 py-3 dark:text-white">{product.sku || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {product.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product.id}`}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                      >
                        <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </Link>
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Tag, Star, TrendingUp, Clock,
  Plus, Edit, Trash2, Search, RefreshCw
} from 'lucide-react';
import { getAllProducts, type Product } from '../../../services/productService';
import { womensFashionProducts } from '../../../services/womensFashionData';
import toast from 'react-hot-toast';

const WomensFashionAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = getAllProducts();
    const womensProducts = allProducts.filter(p =>
      p.category === "Women's Wear" || p.categoryId === 5
    );
    setProducts(womensProducts.length > 0 ? womensProducts : womensFashionProducts);
    setLoading(false);
  };

  const stats = [
    { title: 'Total Products', value: products.length, icon: <Package className="w-5 h-5" />, color: 'bg-blue-500' },
    { title: 'Active', value: products.filter(p => p.stock > 0).length, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-green-500' },
    { title: 'On Sale', value: products.filter(p => p.oldPrice).length, icon: <Tag className="w-5 h-5" />, color: 'bg-red-500' },
    { title: 'Designer', value: products.filter(p => p.badge === 'Designer').length, icon: <Star className="w-5 h-5" />, color: 'bg-purple-500' },
  ];

  const quickLinks = [
    { title: 'Add Product', icon: <Plus className="w-5 h-5" />, color: 'bg-pink-500', link: '/admin/womens-fashion/products/new' },
    { title: 'Designer', icon: <Star className="w-5 h-5" />, color: 'bg-purple-500', link: '/admin/womens-fashion/designer' },
    { title: 'Sale', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-red-500', link: '/admin/womens-fashion/sale' },
    { title: 'New', icon: <Clock className="w-5 h-5" />, color: 'bg-green-500', link: '/admin/womens-fashion/new-arrivals' },
  ];

  const deleteProduct = (id: number) => {
    if (window.confirm('Delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      toast.success('Product deleted');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Women's Fashion</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your women's fashion collection</p>
            </div>
            <Link to="/admin/womens-fashion/products/new" className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickLinks.map((link, idx) => (
              <Link key={idx} to={link.link} className={`${link.color} rounded-lg p-3 text-white text-center hover:shadow-lg transition`}>
                <div className="flex flex-col items-center">
                  {link.icon}
                  <span className="text-sm font-medium mt-1">{link.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your products</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button onClick={loadProducts} className="p-1.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.slice(0, 10).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                        <span className="font-medium dark:text-white line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold dark:text-white">${product.price}</td>
                    <td className="px-4 py-3">
                      {product.isNew && <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs mr-1">New</span>}
                      {product.oldPrice && <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Sale</span>}
                      {product.badge === 'Designer' && <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">Designer</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{product.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/womens-fashion/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomensFashionAdmin;

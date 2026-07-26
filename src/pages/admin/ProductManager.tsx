import React, { useState, useEffect } from 'react';
import QuickAddProduct from '../../components/admin/QuickAddProduct';
import { QuickAddSamples } from '../../components/admin/QuickAddSamples';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import toast from 'react-hot-toast';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'women' | 'men' | 'kids'>('women');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getAll();
      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => p.gender === selectedGender || p.gender === 'unisex');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const success = await productService.delete(id);
      if (success) {
        toast.success('Product deleted successfully');
        await loadProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      draft: 'bg-yellow-500',
      archived: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold dark:text-white">Product Manager</h1>
            <QuickAddSamples />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Form - takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold dark:text-white mb-3">Quick Add Product</h2>
              <QuickAddProduct onProductAdded={loadProducts} />
            </div>
          </div>

          {/* Right: Product List - takes 8 columns */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                <h2 className="text-lg font-bold dark:text-white">Products</h2>
                <div className="flex gap-1">
                  {['women', 'men', 'kids'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        selectedGender === gender
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>No products found for {selectedGender}</p>
                  <p className="text-sm mt-1">
                    Use the form or click <span className="text-green-500 font-medium">"Quick Add Sample Products"</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold dark:text-white text-sm">{product.name}</h3>
                            <span
                              className={`text-xs px-2 py-0.5 ${getStatusBadge(
                                product.status
                              )} text-white rounded-full`}
                            >
                              {product.status || 'active'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {product.brand || 'No brand'} • {product.category || 'Uncategorized'}
                            {product.subcategory && ` • ${product.subcategory}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.isNew && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">New</span>
                            )}
                            {product.isSale && (
                              <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">Sale</span>
                            )}
                            {product.isTrending && (
                              <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">Trending</span>
                            )}
                            {product.isBestseller && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-500 text-white rounded-full">Bestseller</span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            SKU: {product.sku || 'N/A'} • Stock: {product.stock_quantity || 0}
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="text-lg font-bold text-pink-600">${product.price}</p>
                          {product.oldPrice && (
                            <p className="text-xs text-gray-400 line-through">${product.oldPrice}</p>
                          )}
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="mt-1 text-xs text-red-500 hover:text-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredProducts.length} products for {selectedGender}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
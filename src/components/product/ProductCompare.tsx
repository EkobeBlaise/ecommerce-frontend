import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllProducts, type Product } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { getProductImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

interface ProductCompareProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCompare: React.FC<ProductCompareProps> = ({ isOpen, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let allProducts = getAllProducts();
        
        if (allProducts instanceof Promise) {
          allProducts = await allProducts;
        }
        
        // ✅ Ensure it's always an array and filter out invalid products
        const productsArray = Array.isArray(allProducts) ? allProducts : [];
        
        // ✅ Filter out reviews or invalid objects (ensure they have an id and name)
        const validProducts = productsArray.filter(p => 
          p && 
          typeof p === 'object' && 
          p.id && 
          p.name && 
          !p.userId && // ✅ Exclude review objects (they have userId)
          !p.comment    // ✅ Exclude review objects (they have comment)
        );
        
        setAvailableProducts(validProducts);
        console.log(`✅ Loaded ${validProducts.length} valid products for comparison`);
        
        // Load compared products from localStorage
        const saved = localStorage.getItem('compareProducts');
        if (saved) {
          const ids = JSON.parse(saved);
          // ✅ Only select valid products
          const selected = validProducts.filter(p => ids.includes(p.id));
          setSelectedProducts(selected);
        }
      } catch (error) {
        console.error('Error loading products for comparison:', error);
        setAvailableProducts([]);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const addToCompare = (product: Product) => {
    if (!product || !product.id) return;
    
    if (selectedProducts.length >= 4) {
      toast.error('You can compare up to 4 products');
      return;
    }
    if (selectedProducts.some(p => p.id === product.id)) {
      toast.error('Product already in comparison');
      return;
    }
    const updated = [...selectedProducts, product];
    setSelectedProducts(updated);
    localStorage.setItem('compareProducts', JSON.stringify(updated.map(p => p.id)));
    toast.success(`${product.name} added to comparison`);
  };

  const removeFromCompare = (productId: string | number) => {
    const updated = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(updated);
    localStorage.setItem('compareProducts', JSON.stringify(updated.map(p => p.id)));
  };

  const handleAddToCart = (product: Product) => {
    if (!product || !product.id) return;
    
    const imageUrl = getProductImage(product);
    addToCart({
      id: product.id,
      name: product.name || 'Product',
      price: product.price || 0,
      quantity: 1,
      image: imageUrl
    });
    toast.success(`Added ${product.name || 'Product'} to cart!`);
  };

  // ✅ Helper to safely get image URL
  const getProductImageUrl = (product: any): string => {
    if (!product) return 'https://via.placeholder.com/300x300?text=No+Image';
    
    // Try using the helper
    const image = getProductImage(product);
    if (image && image !== 'https://via.placeholder.com/300x300?text=No+Image') {
      return image;
    }
    
    // Fallbacks
    if (product.image) return product.image;
    if (product.images) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
      }
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {
          // Not JSON
        }
      }
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  // ✅ Helper to safely get product price
  const getProductPrice = (product: any): number => {
    if (!product) return 0;
    return typeof product.price === 'number' ? product.price : 0;
  };

  // ✅ Helper to safely get product rating
  const getProductRating = (product: any): number => {
    if (!product) return 0;
    return typeof product.rating === 'number' ? product.rating : 0;
  };

  // ✅ Helper to safely get product reviews count
  const getProductReviews = (product: any): number => {
    if (!product) return 0;
    return typeof product.reviews === 'number' ? product.reviews : 0;
  };

  // ✅ Helper to safely get product stock
  const getProductStock = (product: any): number => {
    if (!product) return 0;
    return product.stock_quantity || product.stockQuantity || product.stock || 0;
  };

  // ✅ Helper to safely get product category
  const getProductCategory = (product: any): string => {
    if (!product) return 'Uncategorized';
    return product.category || product.category_group || 'Uncategorized';
  };

  // ✅ Helper to safely get product old price
  const getProductOldPrice = (product: any): number | null => {
    if (!product) return null;
    return product.oldPrice || product.comparePrice || null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Compare Products</h2>
              <p className="text-gray-500 dark:text-gray-400">Compare up to 4 products side by side</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
            </div>
          ) : (
            <>
              {/* Add More Products */}
              {selectedProducts.length < 4 && availableProducts.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Add products to compare</span>
                  </div>
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {availableProducts
                      .filter(p => !selectedProducts.some(sp => sp.id === p.id))
                      .slice(0, 8)
                      .map(product => (
                        <button
                          key={product.id}
                          onClick={() => addToCompare(product)}
                          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm transition"
                        >
                          <img 
                            src={getProductImageUrl(product)} 
                            alt={product.name || 'Product'} 
                            className="w-6 h-6 object-cover rounded" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24x24?text=+';
                            }}
                          />
                          <span className="dark:text-white">{product.name || 'Product'}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* No Products Available Message */}
              {availableProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No products available to compare</p>
                </div>
              )}

              {/* Comparison Table */}
              {selectedProducts.length > 0 ? (
                <div className="overflow-x-auto p-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-4 bg-gray-50 dark:bg-gray-800/50 w-48 dark:text-white">Feature</th>
                        {selectedProducts.map(product => (
                          <th key={product.id} className="text-center p-4 min-w-[250px]">
                            <div className="relative">
                              <button
                                onClick={() => removeFromCompare(product.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <img 
                                src={getProductImageUrl(product)} 
                                alt={product.name || 'Product'} 
                                className="w-32 h-32 object-cover mx-auto rounded-lg mb-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=No+Image';
                                }}
                              />
                              <h3 className="font-semibold dark:text-white">{product.name || 'Product'}</h3>
                              <Link 
                                to={`/product/${product.id}`} 
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Details
                              </Link>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-semibold bg-gray-50 dark:bg-gray-800/50 dark:text-white">Price</td>
                        {selectedProducts.map(product => (
                          <td key={product.id} className="text-center p-4">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ${getProductPrice(product).toFixed(2)}
                            </span>
                            {getProductOldPrice(product) && (
                              <span className="text-gray-400 line-through text-sm ml-2">
                                ${getProductOldPrice(product)}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-semibold bg-gray-50 dark:bg-gray-800/50 dark:text-white">Rating</td>
                        {selectedProducts.map(product => (
                          <td key={product.id} className="text-center p-4">
                            <div className="flex justify-center items-center gap-1">
                              <span className="font-bold dark:text-white">{getProductRating(product).toFixed(1)}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < Math.floor(getProductRating(product)) 
                                        ? 'text-yellow-400 fill-yellow-400' 
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-gray-500 text-sm">({getProductReviews(product)})</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-semibold bg-gray-50 dark:bg-gray-800/50 dark:text-white">Category</td>
                        {selectedProducts.map(product => (
                          <td key={product.id} className="text-center p-4">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm dark:text-white">
                              {getProductCategory(product)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-semibold bg-gray-50 dark:bg-gray-800/50 dark:text-white">Stock Status</td>
                        {selectedProducts.map(product => (
                          <td key={product.id} className="text-center p-4">
                            {getProductStock(product) > 0 ? (
                              <span className="text-green-600 dark:text-green-400">In Stock ({getProductStock(product)})</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-semibold bg-gray-50 dark:bg-gray-800/50 dark:text-white">Action</td>
                        {selectedProducts.map(product => (
                          <td key={product.id} className="text-center p-4">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={getProductStock(product) === 0}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Select products to compare</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCompare;
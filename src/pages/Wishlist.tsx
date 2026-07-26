import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Trash2, 
  Star, Eye, X, ArrowLeft,
  Truck, Shield, Gift, Clock
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { productService } from '../services/productService';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: string;
  product?: any;
}

const Wishlist: React.FC = () => {
  const { formatPrice } = useSettings();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      // Get wishlist from localStorage (or API in the future)
      const stored = localStorage.getItem(`wishlist_${user?.id || 'guest'}`);
      const wishlistItems = stored ? JSON.parse(stored) : [];
      
      // Get product details for each wishlist item
      const allProducts = await productService.getAll();
      const productsArray = Array.isArray(allProducts) ? allProducts : [];
      
      const itemsWithProducts = wishlistItems.map((item: any) => {
        const product = productsArray.find(p => p.id === item.productId);
        return { ...item, product };
      }).filter((item: any) => item.product);
      
      setItems(itemsWithProducts);
      setProducts(itemsWithProducts.map((item: any) => item.product));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updated = items.filter(item => item.productId !== productId);
    setItems(updated);
    localStorage.setItem(`wishlist_${user?.id || 'guest'}`, JSON.stringify(updated.map(item => ({ 
      id: item.id, 
      productId: item.productId, 
      userId: item.userId, 
      addedAt: item.addedAt 
    }))));
    toast.success('Removed from wishlist');
  };

  const addToCart = (product: any) => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || '',
      quantity: 1,
    });
    toast.success(`✨ ${product.name} added to cart!`);
  };

  const renderStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= safeRating) {
        stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= safeRating) {
        stars.push(<Star key={`star-half-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={`star-empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SEO title="Wishlist - ShopHub" description="Your saved items at ShopHub." />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please Log In</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to view and manage your wishlist.</p>
              <Link 
                to="/login" 
                className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const wishlistProducts = products || [];

  return (
    <>
      <SEO
        title="My Wishlist - ShopHub"
        description="View and manage your saved items at ShopHub."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold dark:text-white">My Wishlist</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
              <Heart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Start adding items you love to your wishlist.</p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map((product: any) => {
                const item = items.find(i => i.productId === product.id);
                const discount = product.oldPrice 
                  ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
                  : 0;
                const imageUrl = product.images?.[0] || product.image || 'https://picsum.photos/seed/' + product.id + '/400/500';

                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 group relative"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/500';
                          }}
                        />
                      </Link>
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
                          -{discount}%
                        </span>
                      )}
                      {product.isNew && (
                        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-2">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {renderStars(product.rating || 0)}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({product.reviews || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-pink-600 dark:text-pink-400">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="text-xs">
                        {product.stock_quantity > 0 ? (
                          <span className="text-green-600 dark:text-green-400">✔ In Stock</span>
                        ) : (
                          <span className="text-red-500">✗ Out of Stock</span>
                        )}
                      </div>

                      {/* Added Date */}
                      {item && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Added: {formatDate(item.addedAt)}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity <= 0}
                          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Benefits Footer */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-pink-600" />
              <p className="font-semibold dark:text-white text-sm">Free Delivery*</p>
              <p className="text-xs text-gray-500">On orders over £39</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="font-semibold dark:text-white text-sm">Secure Payment</p>
              <p className="text-xs text-gray-500">100% secure</p>
            </div>
            <div className="text-center">
              <Gift className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold dark:text-white text-sm">Gift Cards</p>
              <p className="text-xs text-gray-500">Perfect gift</p>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="font-semibold dark:text-white text-sm">30-day Returns</p>
              <p className="text-xs text-gray-500">Easy returns</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
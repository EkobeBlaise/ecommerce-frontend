// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Truck,
  Shield,
  Gift,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { BrandCarousel } from '../components/home/BrandCarousel';
import AIProductFinder from '../components/home/AIProductFinder';
import { PersonalizedRow } from '../components/home/PersonalizedRow';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { getAllProducts, type Product } from '../services/productService';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../components/home/hooks/useAuth';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

const gradientStyles = [
  'from-blue-600 via-purple-600 to-pink-600',
  'from-green-600 via-teal-600 to-blue-600',
  'from-red-600 via-orange-600 to-yellow-600',
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-emerald-600 via-green-600 to-teal-600',
  'from-rose-600 via-red-600 to-orange-600',
  'from-cyan-600 via-blue-600 to-indigo-600',
  'from-amber-600 via-yellow-600 to-orange-600',
  'from-pink-500 via-rose-500 to-red-500',
  'from-pink-600 via-fuchsia-600 to-purple-600',
  'from-pink-400 via-pink-500 to-rose-600',
  'from-purple-600 via-violet-600 to-indigo-600',
  'from-purple-500 via-indigo-500 to-blue-500',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-gray-700 via-gray-600 to-gray-500',
  'from-gray-800 via-gray-700 to-gray-600',
  'from-zinc-700 via-neutral-600 to-stone-500',
  'from-sky-600 via-blue-600 to-cyan-600',
  'from-sky-500 via-blue-500 to-indigo-500',
  'from-cyan-600 via-sky-600 to-blue-600',
  'from-pink-600 via-purple-600 to-sky-600',
  'from-rose-600 via-pink-600 to-purple-600',
  'from-sky-500 via-blue-500 to-purple-500',
  'from-fuchsia-600 via-pink-600 to-rose-600',
];

const Home: React.FC = () => {
  const addToCart = useCartStore((state) => state.addItem);
  const { formatPrice, settings } = useSettings();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const products = await getAllProducts();
        const productsArray = Array.isArray(products) ? products : [];
        setAllProducts(productsArray);
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [allProducts.length]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`✨ ${product.name} added!`);
  };

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
  };

  const showHeroSlider = settings?.appearance?.showHeroSlider !== false;
  const showBrandCarousel = settings?.appearance?.showBrandCarousel !== false;

  const renderStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
        )}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star
            key={i + fullStars}
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600"
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No products found. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const currentProduct = allProducts[currentSlide];
  const discount = currentProduct.oldPrice
    ? Math.round(
        ((currentProduct.oldPrice - currentProduct.price) /
          currentProduct.oldPrice) *
          100
      )
    : 0;

  const currentGradient = gradientStyles[currentSlide % gradientStyles.length];

  // Helper ProductCard used only in hero (kept untouched)
  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => handleAddToCart(product)}
            className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 hover:text-white transition"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 hover:text-white transition">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 hover:text-white transition"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
        {product.badge && (
          <span
            className={`absolute top-2 left-2 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-${product.badgeColor}-500 text-white`}
          >
            {product.badge}
          </span>
        )}
        {product.oldPrice && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">
            -
            {Math.round(
              ((product.oldPrice - product.price) / product.oldPrice) * 100
            )}
            %
          </span>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-xs sm:text-sm mb-1 hover:text-blue-600 line-clamp-1 dark:text-white">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-1 sm:mb-2">
          {renderStars(product.rating)}
          <span className="text-[10px] sm:text-xs text-gray-500">
            ({product.reviews})
          </span>
        </div>
        <div className="flex items-baseline gap-1 sm:gap-2">
          <span className="text-sm sm:text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-[10px] sm:text-xs">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="Welcome to ShopHub"
        description="Shop the latest fashion trends in clothing, shoes, and accessories. Free shipping on orders over £39. Discover exclusive deals and new arrivals."
        type="website"
        keywords={[
          'fashion',
          'clothing',
          'shoes',
          'accessories',
          'shop',
          'trendy',
          'style',
        ]}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Slider - KEPT UNTOUCHED */}
        {showHeroSlider && (
          <div className="relative h-[500px] sm:h-[550px] md:h-[600px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {!isMobile && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${currentGradient}`}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                )}

                {isMobile && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${currentProduct.image})`,
                    }}
                  />
                )}

                <div className="container mx-auto px-4 h-full relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-6 lg:gap-12">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex-1 text-white text-center lg:text-left px-4"
                    >
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-semibold">
                          {currentProduct.badge ||
                            (currentProduct.isNew
                              ? 'NEW ARRIVAL'
                              : 'EXCLUSIVE')}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                        {currentProduct.name}
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90 max-w-lg mx-auto lg:mx-0 line-clamp-3">
                        {currentProduct.description ||
                          'Experience premium quality and style with our latest collection.'}
                      </p>

                      <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                        {renderStars(currentProduct.rating)}
                        <span className="text-xs sm:text-sm">
                          ({currentProduct.reviews} reviews)
                        </span>
                        <span className="text-xs sm:text-sm">
                          • {currentProduct.sold || 0}+ sold
                        </span>
                      </div>

                      <div className="mb-4 sm:mb-6">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                          {formatPrice(currentProduct.price)}
                        </span>
                        {currentProduct.oldPrice && (
                          <>
                            <span className="text-gray-300 line-through ml-2 text-sm sm:text-lg">
                              {formatPrice(currentProduct.oldPrice)}
                            </span>
                            <span className="ml-2 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold">
                              Save {discount}%
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                        <Link
                          to={`/product/${currentProduct.id}`}
                          className="bg-white text-gray-900 px-5 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                        >
                          Shop Now{' '}
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition" />
                        </Link>
                        <button
                          onClick={() => handleAddToCart(currentProduct)}
                          className="border-2 border-white text-white px-5 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold hover:bg-white hover:text-gray-900 transition backdrop-blur-sm flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>

                    {!isMobile && (
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="hidden md:flex flex-1 justify-center"
                      >
                        <div className="relative w-64 h-64 md:w-80 md:h-80">
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
                          <img
                            src={currentProduct.image}
                            alt={currentProduct.name}
                            className="relative w-full h-full object-contain drop-shadow-2xl"
                          />
                          {discount > 0 && (
                            <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg animate-pulse">
                              <span className="text-xs font-semibold">
                                -{discount}%
                              </span>
                              <span className="text-[10px]">OFF</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {allProducts.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentSlide(
                      (prev) => (prev - 1 + allProducts.length) % allProducts.length
                    )
                  }
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-black/50 transition z-10"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev + 1) % allProducts.length)
                  }
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-black/50 transition z-10"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
              {allProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 sm:h-1.5 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-4 sm:w-8 bg-white'
                      : 'w-1.5 sm:w-2 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Summer Update Banner – FIXED TEXT VISIBILITY */}
        <div className="relative mx-4 sm:mx-8 my-6 overflow-hidden rounded-2xl bg-white/60 dark:bg-white/20 backdrop-blur-2xl border border-white/60 dark:border-white/30 shadow-2xl">
  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/20"></div>
  
  <div className="relative z-10 py-10 sm:py-14 px-6 text-center">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ color: '#000000' }}>
      Does your wardrobe need a{' '}
      <span style={{ color: '#000000' }}>Summer update</span>?
    </h2>
    <p className="text-base sm:text-lg mb-6" style={{ color: '#000000' }}>
      Save up to <span className="font-bold" style={{ color: '#000000' }}>50%</span> on thousands of styles
    </p>
    <Link
      to="/products?season=summer"
      className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity duration-200 shadow-lg group"
    >
      Shop now
      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  </div>
</div>
        {/* AI Product Finder – FIXED TEXT VISIBILITY */}
        <div className="container mx-auto px-3 sm:px-4 mt-6 sm:mt-10">
  <div className="relative rounded-2xl bg-white/60 dark:bg-white/20 backdrop-blur-2xl border border-white/60 dark:border-white/30 shadow-2xl p-6 sm:p-8 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/20"></div>

    <div className="relative z-10">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#000000' }}>
          AI Product Finder
        </h3>
        <p className="text-sm" style={{ color: '#000000' }}>
          Describe what you're looking for and let AI find the perfect products
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="e.g., 'summer dress for women under $50', 'formal shoes for men'"
          className="flex-1 px-5 py-3 rounded-full bg-white dark:bg-white/30 border border-gray-300 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-black/40 dark:focus:ring-white/40 text-sm"
          style={{ color: '#000000', backgroundColor: '#ffffff' }}
          onFocus={(e) => e.target.style.backgroundColor = '#ffffff'}
          onBlur={(e) => e.target.style.backgroundColor = '#ffffff'}
        />
        <button className="px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-80 transition-opacity duration-200 shadow-lg text-sm whitespace-nowrap flex items-center gap-2 group">
          Find Now
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      <p className="text-xs text-center mt-4" style={{ color: '#000000' }}>
        Try describing the style, occasion, features, or price range you want
      </p>
    </div>
  </div>
</div>

        {/* Brand Carousel */}
        {showBrandCarousel && <BrandCarousel />}

        {/* ============================================================ */}
        {/* 🚀 AI-POWERED PERSONALIZED RECOMMENDATIONS */}
        {/* ============================================================ */}

        {/* 1. Trending Products – scrollable on mobile */}
        <PersonalizedRow
          title="Trending Now"
          description="Most popular items this week"
          type="trending"
          limit={8}
          scrollable={true}
          viewAllLink="/products?trending=true"
          onQuickView={handleQuickView}
        />

        {/* 2. New Arrivals – scrollable on mobile */}
        <PersonalizedRow
          title="New Arrivals"
          description="Fresh styles just added"
          type="new"
          limit={8}
          scrollable={true}
          viewAllLink="/products?new=true"
          onQuickView={handleQuickView}
        />

        {/* 3. Best Offers – scrollable on mobile */}
        <PersonalizedRow
          title="Best Offers"
          description="Great deals on selected items"
          type="sale"
          limit={8}
          scrollable={true}
          viewAllLink="/products?sale=true"
          onQuickView={handleQuickView}
        />

        {/* 4. Women's Fashion – grid (not scrollable) */}
        <PersonalizedRow
          title="Women's Fashion Picks"
          description="Top styles in women's fashion"
          type="category"
          category="women"
          limit={8}
          scrollable={false}
          viewAllLink="/products?gender=women"
          onQuickView={handleQuickView}
        />

        {/* 5. Men's Essentials – grid */}
        <PersonalizedRow
          title="Men's Style Essentials"
          description="Must-have pieces for men"
          type="category"
          category="men"
          limit={8}
          scrollable={false}
          viewAllLink="/products?gender=men"
          onQuickView={handleQuickView}
        />

        {/* 6. Kids' Fashion – grid */}
        <PersonalizedRow
          title="Kids' Fashion"
          description="Cute styles for little ones"
          type="category"
          category="kids"
          limit={8}
          scrollable={false}
          viewAllLink="/products?gender=kids"
          onQuickView={handleQuickView}
        />

        {/* 7. Recommended For You – grid (only if user logged in) */}
        {user && (
          <PersonalizedRow
            title="Recommended For You"
            description="Based on your browsing history"
            type="all"
            limit={8}
            scrollable={false}
            viewAllLink="/products?recommended=true"
            onQuickView={handleQuickView}
          />
        )}

        {/* Benefits Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 py-6 sm:py-8 mt-6 sm:mt-12">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 text-center">
              <div>
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <p className="font-semibold text-xs sm:text-base">
                  Free Shipping
                </p>
                <p className="text-[10px] sm:text-sm text-gray-500">
                  On orders $50+
                </p>
              </div>
              <div>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-green-600" />
                <p className="font-semibold text-xs sm:text-base">
                  Secure Payment
                </p>
                <p className="text-[10px] sm:text-sm text-gray-500">
                  100% secure
                </p>
              </div>
              <div>
                <Gift className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-purple-600" />
                <p className="font-semibold text-xs sm:text-base">Gift Cards</p>
                <p className="text-[10px] sm:text-sm text-gray-500">
                  Perfect gift
                </p>
              </div>
              <div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-orange-600" />
                <p className="font-semibold text-xs sm:text-base">
                  Easy Returns
                </p>
                <p className="text-[10px] sm:text-sm text-gray-500">
                  30-day policy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ❌ Newsletter – REMOVED */}

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </>
  );
};

export default Home;
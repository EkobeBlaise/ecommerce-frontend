import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Filter, Grid, List, X,
  ChevronDown, ChevronUp, Heart, Star, ShoppingBag,
  Award, Package, Users, Globe, Clock, Verified
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useSettings } from '../context/SettingsContext';
import { ProductFilters } from '../components/product/ProductFilters';
import toast from 'react-hot-toast';

// Filter interface matching ProductFilters component
interface FilterState {
  gender: string;
  category: string;
  brand: string;
  priceRange: [number, number];
  discount: number;
  sortBy: string;
  rating?: number;
}

const ProductListing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCartStore();
  const { formatPrice } = useSettings();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state - matches what ProductFilters expects
  const [filters, setFilters] = useState<FilterState>({
    gender: 'all',
    category: 'all',
    brand: 'all',
    priceRange: [0, 1000],
    discount: 0,
    sortBy: 'newest',
    rating: 0
  });

  // ✅ Read URL parameters on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const gender = params.get('gender') || 'all';
    const category = params.get('category') || 'all';
    const subcategory = params.get('subcategory') || 'all';
    const minPrice = params.get('minPrice') ? parseFloat(params.get('minPrice')!) : 0;
    const maxPrice = params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : 1000;
    const ai = params.get('ai') === 'true';

    setSearchTerm(search);
    setFilters({
      ...filters,
      gender: gender !== 'all' ? gender : 'all',
      category: category !== 'all' ? category : 'all',
      priceRange: [minPrice, maxPrice],
    });

    // If AI search, maybe set sort to relevance or keep default
    if (ai) {
      // Could set sort to 'relevance' if you have it
    }
  }, [location.search]);

  // Load products once
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters whenever filters, searchTerm, or allProducts change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [filters, searchTerm, allProducts]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const products = await productService.getAll();
      const productsArray = Array.isArray(products) ? products : [];
      setAllProducts(productsArray);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let result = [...allProducts];
    
    // 1. Search filter (if searchTerm from URL or user input)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }
    
    // 2. Gender filter
    if (filters.gender && filters.gender !== 'all') {
      result = result.filter(p => 
        p.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }
    
    // 3. Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => 
        p.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // 4. Brand filter
    if (filters.brand && filters.brand !== 'all') {
      result = result.filter(p => 
        p.brand?.toLowerCase() === filters.brand.toLowerCase()
      );
    }
    
    // 5. Price range filter
    if (filters.priceRange) {
      result = result.filter(p => 
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }
    
    // 6. Discount filter
    if (filters.discount && filters.discount > 0) {
      result = result.filter(p => {
        if (!p.oldPrice) return false;
        const discount = ((p.oldPrice - p.price) / p.oldPrice) * 100;
        return discount >= filters.discount;
      });
    }
    
    // 7. Rating filter
    if (filters.rating && filters.rating > 0) {
      result = result.filter(p => (p.rating || 0) >= filters.rating);
    }
    
    // 8. Sort
    switch (filters.sortBy || 'newest') {
      case 'price-asc':
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
    
    console.log('🔍 Filtered products:', result.length);
    setFilteredProducts(result);
  };

  const clearAllFilters = () => {
    setFilters({
      gender: 'all',
      category: 'all',
      brand: 'all',
      priceRange: [0, 1000],
      discount: 0,
      sortBy: 'newest',
      rating: 0
    });
    setSearchTerm('');
    // Also remove URL params (optional)
    navigate('/products', { replace: true });
  };

  const handleAddToCart = (product: any) => {
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

  const handleFilterChange = (newFilters: FilterState) => {
    console.log('📋 Filter changed:', newFilters);
    setFilters(newFilters);
  };

  const renderStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-gray-300 dark:text-gray-600" />
        );
      }
    }
    return stars;
  };

  const formatMOQ = (moq: number) => {
    if (!moq) return '0';
    if (moq >= 1000) return `${(moq / 1000).toFixed(1)}K`;
    if (moq >= 1000000) return `${(moq / 1000000).toFixed(1)}M`;
    return moq.toString();
  };

  const formatUnitsSold = (units: number) => {
    if (!units) return '0';
    if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`;
    if (units >= 1000) return `${(units / 1000).toFixed(1)}K`;
    return units.toString();
  };

  const getDiscountPercentage = (product: any) => {
    if (product?.oldPrice && product?.price) {
      return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    }
    return 0;
  };

  // ProductCard Component
  const ProductCard = ({ product }: { product: any }) => {
    const discountPercentage = getDiscountPercentage(product);
    const imageUrl = product.images?.[0] || product.image || 'https://picsum.photos/seed/' + product.id + '/400/500';

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 group">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Link to={`/product/${product.id}`}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/500';
              }}
            />
          </Link>
          
          {discountPercentage > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
              -{discountPercentage}%
            </span>
          )}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
              NEW
            </span>
          )}
          {product.isTrending && (
            <span className="absolute top-12 left-2 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
              TRENDING
            </span>
          )}
          {product.isBestseller && (
            <span className="absolute top-12 left-2 bg-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
              BESTSELLER
            </span>
          )}
          <button
            onClick={() => toast.success('Added to wishlist')}
            className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition z-10"
          >
            <Heart className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        <div className="p-3 space-y-1.5">
          <div className="flex items-center flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400">
            {product.brand && (
              <span className="font-medium text-pink-600 dark:text-pink-400">
                {product.brand}
              </span>
            )}
            {product.verified && (
              <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                <Verified className="w-3 h-3" />
              </span>
            )}
            {(product.country || product.yearsInBusiness) && (
              <span className="text-gray-400 dark:text-gray-500">
                {product.country && <span> {product.country}</span>}
                {product.country && product.yearsInBusiness && <span> • </span>}
                {product.yearsInBusiness && <span>{product.yearsInBusiness}+ years</span>}
              </span>
            )}
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">({product.reviews || 0})</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                Save {formatPrice(product.oldPrice - product.price)}
              </span>
            )}
          </div>

          {product.reorderRate && product.reorderRate > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-medium">
              <Award className="w-3 h-3" />
              {product.reorderRate}% Reorder Rate
            </div>
          )}

          <div className="text-xs font-medium text-green-600 dark:text-green-400">
            {product.stock_quantity > 0 ? '✔ In Stock' : '✗ Out of Stock'}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
            {product.moq && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                MOQ: {formatMOQ(product.moq)} {product.moqUnit || 'units'}
              </span>
            )}
            {product.sold && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatUnitsSold(product.sold)} sold
              </span>
            )}
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            disabled={product.stock_quantity <= 0}
            className="mt-2 w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    );
  };

  const ProductListItem = ({ product }: { product: any }) => {
    const discountPercentage = getDiscountPercentage(product);

    return (
      <div className="flex gap-4 bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-200 dark:border-gray-800">
        <Link to={`/product/${product.id}`} className="w-32 h-32 flex-shrink-0">
          <img 
            src={product.images?.[0] || product.image || 'https://picsum.photos/seed/' + product.id + '/400/500'} 
            alt={product.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/500';
            }}
          />
        </Link>
        <div className="flex-1 p-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-lg mb-1 dark:text-white">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-medium text-pink-600 dark:text-pink-400">{product.brand}</span>
            {product.verified && (
              <span className="text-blue-600 dark:text-blue-400">
                <Verified className="w-3 h-3 inline" />
              </span>
            )}
            {product.country && <span>{product.country}</span>}
            {product.yearsInBusiness && <span>• {product.yearsInBusiness}+ years</span>}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-sm text-gray-500">({product.reviews || 0})</span>
          </div>
          {product.reorderRate && product.reorderRate > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium mb-2">
              <Award className="w-3 h-3" />
              {product.reorderRate}% Reorder Rate
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
              )}
              {discountPercentage > 0 && (
                <span className="text-xs font-semibold text-green-600">-{discountPercentage}%</span>
              )}
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock_quantity <= 0}
              className="px-4 py-2 bg-pink-600 text-white rounded-full text-sm font-semibold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            {product.moq && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                MOQ: {formatMOQ(product.moq)} {product.moqUnit || 'units'}
              </span>
            )}
            {product.sold && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatUnitsSold(product.sold)} sold
              </span>
            )}
            <span className="text-green-600">✔ {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>
      </div>
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.gender && filters.gender !== 'all') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.brand && filters.brand !== 'all') count++;
    if (filters.discount && filters.discount > 0) count++;
    if (filters.rating && filters.rating > 0) count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">All Products</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProducts.length} products found
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white relative"
              >
                <Filter className="w-5 h-5" />
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-600 text-white text-[10px] rounded-full flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-pink-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-pink-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <ProductFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
              />
              <button
                onClick={clearAllFilters}
                className="mt-4 w-full text-sm text-pink-600 hover:underline text-center"
              >
                Clear All Filters
              </button>
            </div>

            {/* Products Content */}
            <div className="flex-1">
              {/* Search & Sort */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={filters.sortBy || 'newest'}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Tags */}
              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.gender !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm rounded-full">
                      {filters.gender}
                      <button onClick={() => setFilters({ ...filters, gender: 'all' })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm rounded-full">
                      {filters.category}
                      <button onClick={() => setFilters({ ...filters, category: 'all' })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.brand !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm rounded-full">
                      {filters.brand}
                      <button onClick={() => setFilters({ ...filters, brand: 'all' })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.discount > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm rounded-full">
                      {filters.discount}%+ off
                      <button onClick={() => setFilters({ ...filters, discount: 0 })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-pink-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Products Grid/List */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500 dark:text-gray-400">No products found matching your filters</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 text-pink-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <ProductListItem key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold dark:text-white">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ProductFilters 
                filters={filters} 
                onFilterChange={(newFilters) => {
                  handleFilterChange(newFilters);
                  setShowFilters(false);
                }} 
              />
              <button
                onClick={() => {
                  clearAllFilters();
                  setShowFilters(false);
                }}
                className="mt-4 w-full text-sm text-pink-600 hover:underline text-center"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, Eye, Star, ArrowUp,
  Truck, Shield, Gift, Clock, Zap, TrendingUp,
  Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSettings } from '../context/SettingsContext';
import { getAllProducts, getProductById } from '../services/productService';
import { categoryManagementNewService } from '../services/categoryManagementNewService';
import { CategoryNav } from '../components/home/CategoryNav';
import { MenCategoryNav } from '../components/home/MenCategoryNav';
import { KidsCategoryNav } from '../components/home/KidsCategoryNav';
import { MobileHeader } from '../components/layout/MobileSidebar';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

// ============================================================
// HELPERS
// ============================================================

const slugify = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const stripGenderSuffix = (slug: string): string => {
  if (!slug) return slug;
  const suffixes = ['-women', '-men', '-kids'];
  let stripped = slug;
  for (const suffix of suffixes) {
    if (stripped.endsWith(suffix)) {
      stripped = stripped.slice(0, -suffix.length);
      break;
    }
  }
  return stripped;
};

const isValidProduct = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.userId && data.comment && !data.name) return false;
  if (!data.name || typeof data.price === 'undefined') return false;
  return true;
};

const isProductId = (id: string): boolean => {
  return id && id.length > 10 && id.startsWith('c') && !id.includes('-');
};

const getProductImage = (product: Product): string => {
  if (product.image) return product.image;
  if (product.images && product.images.length > 0) return product.images[0];
  return 'https://picsum.photos/seed/' + (product.id || 'fallback') + '/400/500';
};

// ============================================================
// INTERFACES
// ============================================================

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  categoryGroups?: CategoryGroup[];
}

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
  icon?: string;
  image?: string;
  subCategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryGroupId: string;
  categoryId: string;
  isActive: boolean;
  displayOrder: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  description?: string;
  category?: string;
  categoryGroup?: string;
  subcategory?: string;
  gender?: string;
  stock_quantity?: number;
  stockQuantity?: number;
  isNew?: boolean;
  isSale?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  sold?: number;
  createdAt?: string;
  brand?: string;
  verified?: boolean;
  tags?: string[];
  category_id?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const CategoryPage: React.FC = () => {
  const params = useParams<{
    categorySlug?: string;
    groupSlug?: string;
    subSlug?: string;
    subcategorySlug?: string;
  }>();

  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addItem);
  const { formatPrice } = useSettings();

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [showDiscounted, setShowDiscounted] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // ---------- Determine the page context from params ----------
  const isThreeLevel = !!(params.categorySlug && params.groupSlug && params.subSlug);
  const isTwoLevel = !!(params.categorySlug && params.subcategorySlug && !params.groupSlug);
  const isOneLevel = !!(params.categorySlug && !params.groupSlug && !params.subcategorySlug);

  const categorySlug = params.categorySlug || '';
  const groupSlug = params.groupSlug || params.subcategorySlug || '';
  const subSlug = params.subSlug || '';

  // Known genders
  const knownGenders = ['women', 'men', 'kids'];
  const isGender = knownGenders.includes(categorySlug.toLowerCase());

  // For filtering: if it's a known gender, use that; otherwise use the categorySlug itself as the gender.
  const filterGender = categorySlug; // This is the key: use the first segment as the gender filter

  console.log('🔍 Params:', params);
  console.log('🔍 isGender:', isGender, 'filterGender:', filterGender);
  console.log('🔍 isThreeLevel:', isThreeLevel, 'isTwoLevel:', isTwoLevel, 'isOneLevel:', isOneLevel);

  // Redirect if slug is a product ID
  useEffect(() => {
    const checkIfProductId = async () => {
      if (categorySlug && isProductId(categorySlug)) {
        try {
          const product = await getProductById(categorySlug);
          if (product && isValidProduct(product)) {
            const productUrl = '/product/' + product.id;
            navigate(productUrl, { replace: true });
            return;
          }
        } catch (error) {
          console.warn('Not a product ID, continuing as category');
        }
      }
    };
    checkIfProductId();
  }, [categorySlug, navigate]);

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!categorySlug) {
        setLoading(false);
        setError('No category specified');
        return;
      }

      if (isProductId(categorySlug)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const categories = await categoryManagementNewService.getCategories();
        let foundCategory: Category | null = null;

        // Try to find category by slug (case insensitive)
        foundCategory = categories.find((c: Category) =>
          c.slug?.toLowerCase() === categorySlug?.toLowerCase()
        ) || null;

        if (foundCategory) {
          setCategory(foundCategory);
          let groups = [];
          try {
            groups = await categoryManagementNewService.getCategoryGroups(foundCategory.id);
          } catch (err) {
            groups = foundCategory.categoryGroups || [];
          }
          const activeGroups = groups.filter((g: CategoryGroup) =>
            g.categoryId === foundCategory.id && g.isActive !== false
          );
          setCategoryGroups(activeGroups);
        } else {
          // Virtual category (for non‑DB categories like kitchen‑utensil)
          const displayName = categorySlug.replace(/-/g, ' ');
          const virtualCategory: Category = {
            id: 'virtual',
            name: displayName,
            slug: categorySlug,
            gender: categorySlug,
            description: 'Browse our collection of ' + displayName,
          };
          setCategory(virtualCategory);
          setCategoryGroups([]);
        }

        const products = await getAllProducts();
        const productsArray = Array.isArray(products) ? products : [];
        console.log('📦 ' + productsArray.length + ' products loaded');

        // ---------- FILTER LOGIC ----------
        let filtered = productsArray.filter((p: Product) => {
          if (!p || !isValidProduct(p)) return false;

          const productGender = p.gender?.toLowerCase() || '';
          const productGroupSlug = p.categoryGroup ? slugify(p.categoryGroup) : '';
          const productSubSlug = p.subcategory ? slugify(p.subcategory) : '';

          // 1) Gender / category match (always required) – use filterGender as the gender
          if (filterGender && productGender !== filterGender.toLowerCase()) {
            return false;
          }

          // 2) Three‑level: gender + group + sub
          if (isThreeLevel) {
            const urlGroup = stripGenderSuffix(groupSlug);
            const urlSub = stripGenderSuffix(subSlug);
            const match = productGroupSlug === urlGroup && productSubSlug === urlSub;
            return match;
          }

          // 3) Two‑level: 
          //    - If it's a gender page (women/men/kids), treat second as group.
          //    - If it's a non‑gender category, treat second as subcategory.
          if (isTwoLevel) {
            const urlSecond = stripGenderSuffix(params.subcategorySlug || '');
            if (isGender) {
              return productGroupSlug === urlSecond;
            } else {
              return productSubSlug === urlSecond;
            }
          }

          // 4) One‑level: only gender/category filter applied
          return true;
        });

        console.log('✅ ' + filtered.length + ' products filtered for ' + categorySlug);
        setAllProducts(filtered);
        setFilteredProducts(filtered);

        const brands = [...new Set(filtered.map(p => p.brand).filter(Boolean))] as string[];
        setAvailableBrands(brands);
        if (brands.length > 0) setBrandFilter('all');

      } catch (error) {
        console.error('❌ Error loading category data:', error);
        setError('Failed to load category data. Please try again.');
        toast.error('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    if (!isProductId(categorySlug)) {
      loadData();
    }
  }, [categorySlug, groupSlug, subSlug, isThreeLevel, isTwoLevel, isOneLevel, isGender, filterGender]);

  // Apply additional filters (group, subcategory, price, discount, rating, brand, sort)
  useEffect(() => {
    let result = [...allProducts];

    if (selectedGroup !== 'all') {
      const group = categoryGroups.find(g => g.id === selectedGroup);
      if (group) {
        const groupSlug = slugify(group.name);
        result = result.filter(p => {
          const pGroupSlug = p.categoryGroup ? slugify(p.categoryGroup) : '';
          return pGroupSlug === groupSlug;
        });
      }
    }

    if (selectedSubCategory !== 'all') {
      const sub = categoryGroups
        .flatMap(g => g.subCategories || [])
        .find(s => s.id === selectedSubCategory);
      if (sub) {
        const subSlug = slugify(sub.name);
        result = result.filter(p => {
          const pSubSlug = p.subcategory ? slugify(p.subcategory) : '';
          return pSubSlug === subSlug;
        });
      }
    }

    result = result.filter(p => {
      const price = p.price || 0;
      return price >= priceMin && price <= priceMax;
    });

    if (showDiscounted) {
      result = result.filter(p => p.oldPrice && p.oldPrice > p.price);
    }

    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    if (brandFilter !== 'all') {
      result = result.filter(p => p.brand === brandFilter);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [
    allProducts,
    selectedGroup, selectedSubCategory,
    priceMin, priceMax, showDiscounted, minRating, brandFilter,
    sortBy, categoryGroups
  ]);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    if (!product || !product.id) return;
    addToCart({
      id: product.id,
      name: product.name || 'Product',
      price: product.price || 0,
      quantity: 1,
      image: getProductImage(product)
    });
    toast.success('✨ ' + (product.name?.substring(0, 30) || 'Product') + ' added!');
  };

  // Render stars
  const renderStars = (rating: number = 0) => {
    const safeRating = Math.min(Math.max(rating, 0), 5);
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
        )}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
    );
  };

  // Product Card
  const ProductCard = ({ product }: { product: Product }) => {
    if (!product || !product.id) return null;

    const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    const imageUrl = getProductImage(product);
    const stock = product.stock_quantity ?? product.stockQuantity ?? 0;
    const productSlug = product.slug || product.id;

    const gender = product.gender || 'unisex';
    const groupSlug = product.categoryGroup ? slugify(product.categoryGroup) : '';
    const subSlug = product.subcategory ? slugify(product.subcategory) : '';
    const productUrl = groupSlug && subSlug
      ? '/' + gender + '/' + groupSlug + '/' + subSlug + '/' + productSlug
      : '/product/' + productSlug;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Link to={productUrl}>
            <img
              src={imageUrl}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/500';
              }}
            />
          </Link>
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {discount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded shadow-lg">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="px-2.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                <Zap className="w-3 h-3" />
                NEW
              </span>
            )}
            {product.isTrending && (
              <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                TRENDING
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button onClick={() => handleAddToCart(product)} className="bg-white p-2 rounded-full hover:bg-blue-600 hover:text-white transition">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button className="bg-white p-2 rounded-full hover:bg-blue-600 hover:text-white transition">
              <Heart className="w-4 h-4" />
            </button>
            <Link to={productUrl} className="bg-white p-2 rounded-full hover:bg-blue-600 hover:text-white transition">
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] dark:text-white">
            {product.name || 'Product'}
          </h3>
          <div className="flex items-center gap-1">
            {renderStars(product.rating || 0)}
            <span className="text-xs text-gray-500">({product.reviews || 0})</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price || 0)}</span>
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-sm">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={() => handleAddToCart(product)}
            disabled={stock <= 0}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    );
  };

  // Render category navigation
  const renderCategoryNav = () => {
    if (!category) return null;
    if (category.gender === 'men' || category.slug === 'men') {
      return <MenCategoryNav />;
    }
    if (category.gender === 'kids' || category.slug === 'kids') {
      return <KidsCategoryNav />;
    }
    return <CategoryNav gender={category.gender || 'unisex'} categoryId={category.id} categorySlug={category.slug} />;
  };

  // Get relevant subcategories for the current group (for filter bar)
  const getRelevantSubcategories = (): SubCategory[] => {
    const currentGroupSlug = params.groupSlug || params.subcategorySlug;
    if (currentGroupSlug) {
      const strippedUrl = stripGenderSuffix(currentGroupSlug);
      const group = categoryGroups.find(g => stripGenderSuffix(g.slug) === strippedUrl);
      if (group) {
        return group.subCategories || [];
      }
    }
    return categoryGroups.flatMap(g => g.subCategories || []);
  };

  const relevantSubs = getRelevantSubcategories();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">{error || 'Category Not Found'}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The category "{categorySlug}" doesn't exist or there was an error loading it.
          </p>
          <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Display name
  let displayName = category.name;
  if (isThreeLevel && params.subSlug) {
    displayName = params.subSlug.replace(/-/g, ' ');
  } else if (isTwoLevel && params.subcategorySlug) {
    displayName = params.subcategorySlug.replace(/-/g, ' ');
  } else if (isOneLevel) {
    displayName = categorySlug.replace(/-/g, ' ');
  }

  return (
    <>
      <SEO
        title={displayName + ' | ShopHub'}
        description={category.description || 'Shop the latest ' + displayName + ' products'}
        keywords={[displayName, category.gender, 'shop']}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="lg:hidden"><MobileHeader /></div>

        <div className="hidden lg:block">
          {renderCategoryNav()}
        </div>

        {/* Hero Banner */}
        <div className="relative h-[200px] md:h-[280px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">{displayName}</h1>
                <p className="text-base md:text-lg mb-3 opacity-90">
                  {category.description || 'Discover our collection of ' + displayName}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {filteredProducts.length} Products
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full capitalize">
                    {category.gender || 'Unisex'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold dark:text-white capitalize">{displayName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Rating</option>
                <option value="popular">Popular</option>
              </select>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium dark:text-white flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                More
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                    placeholder="Min"
                    min="0"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value) || 1000)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              {/* Discount Toggle */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={showDiscounted}
                    onChange={(e) => setShowDiscounted(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  On Sale Only
                </label>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="0">Any</option>
                  <option value="1">★ 1+</option>
                  <option value="2">★ 2+</option>
                  <option value="3">★ 3+</option>
                  <option value="4">★ 4+</option>
                  <option value="5">★ 5</option>
                </select>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Brand</label>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="all">All Brands</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="md:hidden mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            {categoryGroups.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Groups</option>
                  {categoryGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Rating</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>
        )}

        {/* Sub-category Navigation – only relevant subs */}
        {relevantSubs.length > 0 && (
          <div className="container mx-auto px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubCategory('all')}
                className={'px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ' + (
                  selectedSubCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                All
              </button>
              {relevantSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub.id)}
                  className={'px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ' + (
                    selectedSubCategory === sub.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="container mx-auto px-4 pb-12">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Products Found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                No products match your filters. Try adjusting your filters or add products to this category.
              </p>
              <button
                onClick={() => {
                  setSelectedGroup('all');
                  setSelectedSubCategory('all');
                  setSortBy('newest');
                  setPriceMin(0);
                  setPriceMax(1000);
                  setShowDiscounted(false);
                  setMinRating(0);
                  setBrandFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Benefits Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><Truck className="w-6 h-6 mx-auto mb-1 text-blue-600" /><p className="font-semibold text-sm dark:text-white">Free Delivery*</p><p className="text-xs text-gray-500">On orders over £39</p></div>
              <div><Shield className="w-6 h-6 mx-auto mb-1 text-green-600" /><p className="font-semibold text-sm dark:text-white">Secure Payment</p><p className="text-xs text-gray-500">100% secure</p></div>
              <div><Gift className="w-6 h-6 mx-auto mb-1 text-purple-600" /><p className="font-semibold text-sm dark:text-white">Gift Cards</p><p className="text-xs text-gray-500">Perfect gift</p></div>
              <div><Clock className="w-6 h-6 mx-auto mb-1 text-orange-600" /><p className="font-semibold text-sm dark:text-white">30-day Returns</p><p className="text-xs text-gray-500">Easy returns</p></div>
            </div>
          </div>
        </div>

        {/* Scroll to Top */}
        {showGoToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
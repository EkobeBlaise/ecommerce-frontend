import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Eye, Star, ArrowRight, ArrowLeft,
  Truck, Shield, Gift, Clock, ArrowUp, Flame, Sparkles, TrendingUp,
  Award, Package, Users, Verified, Zap
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSettings } from '../context/SettingsContext';
import { getAllProducts, type Product, getProductsByIds } from '../services/productService';
import { brandService } from '../services/brandService';
import { merchandisingService } from '../services/merchandisingService';
import { categoryManagementNewService } from '../services/categoryManagementNewService';
import { CategoryNav } from '../components/home/CategoryNav';
import { MobileHeader } from '../components/layout/MobileSidebar';
import { PersonalizedRow } from '../components/home/PersonalizedRow';
import SEO from '../components/common/SEO';
import { getProductImage } from '../utils/imageUtils';
import toast from 'react-hot-toast';

// Helper: slugify (to keep consistent)
const slugify = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface MerchandisingSection {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  icon?: string;
  enabled: boolean;
  displayOrder: number;
  maxProducts: number;
  layout: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WomensFashion: React.FC = () => {
  const addToCart = useCartStore(state => state.addItem);
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [brandFeatures, setBrandFeatures] = useState<any[]>([]);
  const [sections, setSections] = useState<MerchandisingSection[]>([]);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  
  const [moreBrands, setMoreBrands] = useState<string[]>([]);
  const [moreInspiration, setMoreInspiration] = useState<string[]>([]);

  // Hero Slides
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=1920&h=500&fit=crop",
      title: "Pack light, look great:",
      subtitle: "vacation styles for beach days, city strolls and outdoor getaways",
      cta: "Shop now",
      link: "/collections/vacation"
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=500&fit=crop",
      title: "Summer Essentials",
      subtitle: "Discover the latest trends for the sunny season",
      cta: "Explore now",
      link: "/collections/summer"
    },
    {
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=500&fit=crop",
      title: "Designer Edit",
      subtitle: "Luxury pieces at exclusive prices",
      cta: "Shop designer",
      link: "/collections/designer"
    }
  ];

  const stories = [
    { title: "The Perfect Kitten Heel", brand: "VANS", description: "Crazy for kitten heels! How to shop for this season's chicest shoe", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop" },
    { title: "Vans x METAGIRL", description: "The Knu Skool gets a dazzling restyle", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=300&fit=crop" }
  ];

  // Load sections
  const loadSections = async () => {
    try {
      const allSections = await merchandisingService.getSections();
      if (allSections && allSections.length > 0) {
        setSections(allSections);
      } else {
        const defaultSections: MerchandisingSection[] = [
          { id: 'hot_drops', title: '🔥 Hot Drops', subtitle: 'Limited time offers', type: 'hot_drops', icon: '🔥', enabled: false, displayOrder: 1, maxProducts: 4, layout: 'grid' },
          { id: 'new_in', title: '✨ New In', subtitle: 'Latest arrivals', type: 'new_in', icon: '✨', enabled: false, displayOrder: 2, maxProducts: 4, layout: 'grid' },
          { id: 'trending', title: '🌟 Trending Now', subtitle: 'Most popular this week', type: 'trending', icon: '🌟', enabled: false, displayOrder: 3, maxProducts: 4, layout: 'grid' },
          { id: 'seasonal', title: '☀️ Summer Collection', subtitle: 'Sun-ready styles', type: 'seasonal', icon: '☀️', enabled: false, displayOrder: 4, maxProducts: 4, layout: 'grid' },
          { id: 'bestsellers', title: '🏆 Bestsellers', subtitle: 'Customer favorites', type: 'bestsellers', icon: '🏆', enabled: false, displayOrder: 5, maxProducts: 4, layout: 'grid' },
        ];
        setSections(defaultSections);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      const fallbackSections: MerchandisingSection[] = [
        { id: 'hot_drops', title: '🔥 Hot Drops', subtitle: 'Limited time offers', type: 'hot_drops', icon: '🔥', enabled: false, displayOrder: 1, maxProducts: 4, layout: 'grid' },
        { id: 'new_in', title: '✨ New In', subtitle: 'Latest arrivals', type: 'new_in', icon: '✨', enabled: false, displayOrder: 2, maxProducts: 4, layout: 'grid' },
        { id: 'trending', title: '🌟 Trending Now', subtitle: 'Most popular this week', type: 'trending', icon: '🌟', enabled: false, displayOrder: 3, maxProducts: 4, layout: 'grid' },
        { id: 'seasonal', title: '☀️ Summer Collection', subtitle: 'Sun-ready styles', type: 'seasonal', icon: '☀️', enabled: false, displayOrder: 4, maxProducts: 4, layout: 'grid' },
        { id: 'bestsellers', title: '🏆 Bestsellers', subtitle: 'Customer favorites', type: 'bestsellers', icon: '🏆', enabled: false, displayOrder: 5, maxProducts: 4, layout: 'grid' },
      ];
      setSections(fallbackSections);
    } finally {
      setSectionsLoaded(true);
    }
  };

  // Load products (filtered by gender = women)
  const loadProducts = async () => {
    try {
      const allProducts = await getAllProducts();
      const productsArray = Array.isArray(allProducts) ? allProducts : [];
      
      const womensProducts = productsArray.filter(p => {
        if (!p) return false;
        if (p.gender) {
          return p.gender === 'women' || p.gender === 'unisex';
        }
        if (p.category) {
          const categoryLower = p.category.toLowerCase();
          return categoryLower.includes('women') || 
                 categoryLower.includes('female') ||
                 categoryLower.includes('dress') ||
                 categoryLower.includes('skirt') ||
                 categoryLower.includes('blouse') ||
                 categoryLower.includes('handbag');
        }
        return false;
      });
      
      setProducts(womensProducts.length > 0 ? womensProducts : productsArray.slice(0, 12));
      
      if (womensProducts.length > 0) {
        await loadBrandFeatures(womensProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  // Load brand features
  const loadBrandFeatures = async (productList: Product[]) => {
    try {
      const featuredBrands = await brandService.getFeatured();
      const features = featuredBrands.slice(0, 4).map(brand => {
        const brandProducts = productList.filter(p => p.brand_id === brand.id);
        return {
          name: brand.name,
          tagline: brand.description || 'Premium collection',
          image: brand.logo || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
          products: brandProducts.slice(0, 4),
          brandId: brand.id,
        };
      });
      
      if (features.length === 0 || features.every(f => f.products.length === 0)) {
        setBrandFeatures(getFallbackBrandFeatures(productList));
      } else {
        setBrandFeatures(features);
      }
    } catch (error) {
      console.error('Error loading brand features:', error);
      setBrandFeatures(getFallbackBrandFeatures(productList));
    }
  };

  const getFallbackBrandFeatures = (productList: Product[]) => {
    return [
      { name: "KAFFE", tagline: "Comfort looks good", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop", products: productList.slice(0, 2) },
      { name: "adidas", tagline: "The Original Handball Spezial", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", products: productList.slice(2, 4) },
      { name: "HUGO", tagline: "Dresses", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop", products: productList.slice(4, 6) },
      { name: "LeGer", tagline: "Wedding Guest Looks", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop", products: productList.slice(6, 8) }
    ];
  };

  // Load recently viewed
  const loadRecentlyViewed = async () => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      if (!saved) {
        setRecentlyViewed([]);
        return;
      }

      const ids = JSON.parse(saved);
      if (!Array.isArray(ids) || ids.length === 0) {
        setRecentlyViewed([]);
        return;
      }

      const validIds = ids.filter((id: string) => 
        id && typeof id === 'string' && id.length > 5 && id !== 'undefined'
      );

      if (validIds.length === 0) {
        localStorage.removeItem('recentlyViewed');
        setRecentlyViewed([]);
        return;
      }

      const products = await getProductsByIds(validIds);
      
      const filteredProducts = products.filter(p => 
        p && (p.gender === 'women' || p.gender === 'unisex')
      );

      setRecentlyViewed(filteredProducts.slice(0, 4));

      if (filteredProducts.length < validIds.length) {
        const validProductIds = filteredProducts.map(p => p.id);
        const cleanedIds = validIds.filter((id: string) => validProductIds.includes(id));
        localStorage.setItem('recentlyViewed', JSON.stringify(cleanedIds));
        console.log(`🧹 Cleaned recently viewed: ${validIds.length - cleanedIds.length} invalid entries removed`);
      }

    } catch (error) {
      console.error('Error loading recently viewed:', error);
      localStorage.removeItem('recentlyViewed');
      setRecentlyViewed([]);
    }
  };

  // Load more data (brands, inspiration)
  const loadMoreData = async () => {
    try {
      const brands = await brandService.getAll();
      const brandNames = brands.map((b: any) => b.name);
      setMoreBrands(brandNames);
      console.log('🏷️ Loaded brands:', brandNames.length);

      const allCategories = await categoryManagementNewService.getCategories();
      const womenCategory = allCategories.find((c: any) => c.gender === 'women' || c.slug === 'women');
      
      if (womenCategory) {
        const allSubCategories: string[] = [];
        const groups = womenCategory.categoryGroups || [];
        
        groups.forEach((group: any) => {
          if (group.name && !allSubCategories.includes(group.name)) {
            allSubCategories.push(group.name);
          }
          const subCategories = group.subCategories || [];
          subCategories.forEach((sub: any) => {
            if (sub.name && !allSubCategories.includes(sub.name)) {
              allSubCategories.push(sub.name);
            }
          });
        });
        
        const uniqueInspiration = [...new Set(allSubCategories)];
        setMoreInspiration(uniqueInspiration);
        console.log('💡 Loaded inspiration:', uniqueInspiration.length);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
      setMoreBrands([
        "adidas", "Converse", "Mango", "AllSaints", "Crocs", "Massimo Dutti",
        "ASICS", "Diesel", "Michael Kors", "Banana Republic", "Dr Martens", "Missguided",
        "Birkenstock", "Fossil", "New Balance", "Calvin Klein Underwear", "GAP", "Nike",
        "Clarks", "Lacoste", "Puma", "River Island", "Skechers", "Superdry",
        "Ted Baker", "The North Face", "Tommy Hilfiger", "Vans"
      ]);
      setMoreInspiration([
        "Bikinis", "Handbags", "Polka Dot Dresses", "Block Heels", "Jeans", "Purses",
        "Bum Bags", "Lace Tops", "Ripped Jeans", "Cagoules", "Low Rise Jeans", "Rucksacks",
        "Cigarette Trousers", "Necklaces", "Running Shoes", "Clutch Bags", "Nude Shoes", "Sandals",
        "Cocktail Dresses", "Over the Knee Boots", "Sequin Dresses", "Dresses", "Playsuits & Jumpsuits", "Shirt Dresses",
        "Dresses for Special Occasions", "Pleated Skirts", "Trainers", "Wedding Dresses", "Women's Ankle Boots", "Women's Boots",
        "Women's Clothing", "Women's Coats", "Women's Shirts", "Women's Shoes"
      ]);
    }
  };

  // Initialize all data
  useEffect(() => {
    const init = async () => {
      console.log('🚀 WomensFashion component mounted');
      setLoading(true);
      try {
        await loadSections();
        await loadProducts();
        await loadRecentlyViewed();
        await loadMoreData();
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

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
    toast.success(`✨ ${product.name?.substring(0, 30) || 'Product'} added!`);
  };

  const handleViewProduct = async (product: Product) => {
    if (!product || !product.id) return;
    
    try {
      const saved = localStorage.getItem('recentlyViewed');
      let ids = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(ids)) ids = [];
      
      ids = [product.id, ...ids.filter((id: string) => id !== product.id)].slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(ids));
      await loadRecentlyViewed();
    } catch (error) {
      console.error('Error updating recently viewed:', error);
    }
  };

  const getDiscountPercentage = (product: Product) => {
    if (product?.oldPrice && product?.price) {
      return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    }
    return 0;
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

  // Product Card Component
  const ProductCard = ({ product, showRating = true }: { product: Product; showRating?: boolean }) => {
    if (!product || !product.id) return null;
    
    const discountPercentage = getDiscountPercentage(product);
    const imageUrl = getProductImage(product);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Link to={`/product/${product.id}`} onClick={() => handleViewProduct(product)}>
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
            {discountPercentage > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded shadow-lg">
                -{discountPercentage}%
              </span>
            )}
            {product.isNew && !product.oldPrice && (
              <span className="px-2.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                <Zap className="w-3 h-3" />
                NEW
              </span>
            )}
            {product.isTrending && !product.oldPrice && (
              <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                TRENDING
              </span>
            )}
            {product.isBestseller && !product.oldPrice && (
              <span className="px-2.5 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                <Award className="w-3 h-3" />
                BESTSELLER
              </span>
            )}
            {product.badge && !product.oldPrice && (
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded shadow-lg bg-${product.badgeColor || 'pink'}-500 text-white`}>
                {product.badge}
              </span>
            )}
          </div>
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button onClick={() => handleAddToCart(product)} className="bg-white p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button className="bg-white p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
              <Heart className="w-4 h-4" />
            </button>
            <Link to={`/product/${product.id}`} onClick={() => handleViewProduct(product)} className="bg-white p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        <div className="p-3 space-y-1.5">
          <div className="flex items-center flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400">
            {product.brand && (
              <span className="font-medium text-pink-600 dark:text-pink-400">
                {product.brand}
              </span>
            )}
            {product.verified && (
              <span className="inline-flex items-center text-blue-600 dark:text-blue-400">
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

          <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] dark:text-white">
            {product.name || 'Product'}
          </h3>

          {showRating && (
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400 text-xs">
                {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </div>
              <span className="text-xs text-gray-500">({product.reviews || 0})</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-pink-600">{formatPrice(product.price || 0)}</span>
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-sm">{formatPrice(product.oldPrice)}</span>
            )}
            {discountPercentage > 0 && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                Save {formatPrice((product.oldPrice || 0) - (product.price || 0))}
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
            {(product.stock_quantity || product.stockQuantity || 0) > 0 ? '✔ In Stock' : '✗ Out of Stock'}
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
            disabled={(product.stock_quantity || product.stockQuantity || 0) <= 0}
            className="mt-2 w-full bg-pink-600 hover:bg-pink-700 text-white py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {(product.stock_quantity || product.stockQuantity || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    );
  };

  // Horizontal Product Card
  const HorizontalProductCard = ({ product }: { product: Product }) => {
    if (!product || !product.id) return null;
    
    const imageUrl = getProductImage(product);
    
    return (
      <div className="flex gap-3 bg-white dark:bg-gray-800 rounded-lg p-2 hover:shadow-md transition">
        <Link to={`/product/${product.id}`} onClick={() => handleViewProduct(product)}>
          <img 
            src={imageUrl} 
            alt={product.name || 'Product'} 
            className="w-20 h-24 object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/80/80';
            }}
          />
        </Link>
        <div className="flex-1">
          <h3 className="text-sm font-medium line-clamp-2 dark:text-white">{product.name || 'Product'}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-md font-bold text-pink-600">{formatPrice(product.price || 0)}</span>
            {product.oldPrice && <span className="text-gray-400 line-through text-xs">{formatPrice(product.oldPrice)}</span>}
          </div>
          <button onClick={() => handleAddToCart(product)} className="mt-2 text-xs text-pink-600 hover:underline">
            Add to cart
          </button>
        </div>
      </div>
    );
  };

  // Helper to render a product section
  const renderProductSection = (title: string, subtitle: string, productList: Product[], maxItems: number = 4, linkText?: string, linkTo?: string) => {
    const displayItems = productList.slice(0, maxItems);
    if (displayItems.length === 0) return null;
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          {linkText && linkTo && (
            <Link to={linkTo} className="text-sm text-pink-600 hover:underline">View all →</Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  };

  // Filter products for sections
  const displayProducts = products.length > 0 ? products : [];
  const displaySaleProducts = displayProducts.filter(p => p && p.oldPrice);
  const displayNewProducts = displayProducts.filter(p => p && p.isNew);
  const displayTrendingProducts = displayProducts.filter(p => p && p.isTrending);
  const displayHotDrops = displayProducts.filter(p => p && p.isSale && p.oldPrice);
  const summerCollection = displayProducts.slice(0, 8);
  const bestsellers = displayProducts.slice(4, 12);

  const isSectionEnabled = (sectionId: string): boolean => {
    if (!sectionsLoaded) return false;
    const section = sections.find(s => s.id === sectionId);
    return section?.enabled === true;
  };

  const getSectionConfig = (sectionId: string): MerchandisingSection | null => {
    return sections.find(s => s.id === sectionId) || null;
  };

  const getSectionTitle = (sectionId: string, defaultTitle: string): string => {
    const config = getSectionConfig(sectionId);
    return config?.title || defaultTitle;
  };

  const getSectionSubtitle = (sectionId: string, defaultSubtitle: string): string => {
    const config = getSectionConfig(sectionId);
    return config?.subtitle || defaultSubtitle;
  };

  const getMaxProducts = (sectionId: string, defaultMax: number = 4): number => {
    const config = getSectionConfig(sectionId);
    return config?.maxProducts || defaultMax;
  };

  const getBackgroundColor = (sectionId: string): string => {
    const config = getSectionConfig(sectionId);
    return config?.backgroundColor || '';
  };

  const getTextColor = (sectionId: string): string => {
    const config = getSectionConfig(sectionId);
    return config?.textColor || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Women's Fashion"
        description="Discover the latest women's fashion trends. Shop stylish clothing, shoes, and accessories for every occasion."
        keywords={['women fashion', 'women clothing', 'dresses', 'shoes', 'accessories']}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="lg:hidden">
          <MobileHeader />
        </div>
        
        <div className="hidden lg:block">
          <CategoryNav gender="women" />
        </div>

        {/* Hero Banner */}
        <div className="relative h-[400px] md:h-[450px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-xl text-white">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h1>
                    <p className="text-sm md:text-lg mb-4">{slide.subtitle}</p>
                    <Link to={slide.link} className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:shadow-lg transition text-sm md:text-base">
                      {slide.cta} <ArrowRight className="inline w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm p-1.5 rounded-full transition">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm p-1.5 rounded-full transition">
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all ${
                  currentSlide === index ? 'w-6 bg-white' : 'w-3 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 py-2 text-xs md:text-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-gray-600 dark:text-gray-400">
              <span>🚚 Free standard delivery over £39.00 & free returns*</span>
              <span>🔄 30-day return policy</span>
              <span>🎁 Gift Cards</span>
            </div>
          </div>
        </div>

        {/* ============================================================
          REPLACED PersonalizedRow WITH CUSTOM SECTIONS USING FILTERED PRODUCTS
        ============================================================ */}
        
        {/* Trending in Women's Fashion */}
        {renderProductSection(
          'Trending in Women\'s Fashion',
          'Most popular women\'s items this week',
          displayTrendingProducts.length > 0 ? displayTrendingProducts : displayProducts,
          8,
          'View all',
          '/products?sort=trending'
        )}

        {/* New Arrivals */}
        {renderProductSection(
          'New Arrivals',
          'Latest women\'s styles just added',
          displayNewProducts.length > 0 ? displayNewProducts : displayProducts.slice(0, 8),
          8,
          'View all',
          '/products?sort=newest'
        )}

        {/* Best Offers */}
        {renderProductSection(
          'Best Offers',
          'Great deals on women\'s fashion',
          displaySaleProducts.length > 0 ? displaySaleProducts : displayProducts.slice(0, 8),
          8,
          'View all',
          '/sale'
        )}

        {/* Summer Collection */}
        {renderProductSection(
          'Summer Collection',
          'Sun-ready styles for women',
          summerCollection.length > 0 ? summerCollection : displayProducts.slice(0, 8),
          8,
          'Shop collection',
          '/products?season=summer'
        )}

        {/* Section: Hot Drops (if enabled) */}
        {isSectionEnabled('hot_drops') && displayHotDrops.length > 0 && (
          <div 
            className="container mx-auto px-4 py-8"
            style={{ 
              backgroundColor: getBackgroundColor('hot_drops') || 'transparent',
              color: getTextColor('hot_drops') || 'inherit'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-xl font-bold dark:text-white">
                    {getSectionTitle('hot_drops', '🔥 Hot Drops')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {getSectionSubtitle('hot_drops', 'Limited time offers')}
                  </p>
                </div>
              </div>
              <Link to="/sale" className="text-sm text-pink-600 hover:underline">View all →</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayHotDrops.slice(0, getMaxProducts('hot_drops', 4)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Section: New In (if enabled) */}
        {isSectionEnabled('new_in') && displayNewProducts.length > 0 && (
          <div 
            className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700"
            style={{ 
              backgroundColor: getBackgroundColor('new_in') || 'transparent',
              color: getTextColor('new_in') || 'inherit'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-500" />
                <div>
                  <h2 className="text-xl font-bold dark:text-white">
                    {getSectionTitle('new_in', '✨ New In')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {getSectionSubtitle('new_in', 'Latest arrivals')}
                  </p>
                </div>
              </div>
              <Link to="/products?sort=newest" className="text-sm text-pink-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayNewProducts.slice(0, getMaxProducts('new_in', 4)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Section: Trending (if enabled) */}
        {isSectionEnabled('trending') && displayTrendingProducts.length > 0 && (
          <div 
            className="py-8 my-4"
            style={{ 
              backgroundColor: getBackgroundColor('trending') || '#fdf2f8',
              color: getTextColor('trending') || 'inherit'
            }}
          >
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">
                      {getSectionTitle('trending', '🌟 Trending Now')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getSectionSubtitle('trending', 'Most popular this week')}
                    </p>
                  </div>
                </div>
                <Link to="/products?sort=trending" className="text-sm text-pink-600 hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {displayTrendingProducts.slice(0, getMaxProducts('trending', 4)).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section: Seasonal (if enabled) */}
        {isSectionEnabled('seasonal') && summerCollection.length > 0 && (
          <div 
            className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700"
            style={{ 
              backgroundColor: getBackgroundColor('seasonal') || 'transparent',
              color: getTextColor('seasonal') || 'inherit'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☀️</span>
                <div>
                  <h2 className="text-xl font-bold dark:text-white">
                    {getSectionTitle('seasonal', 'Summer Collection')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {getSectionSubtitle('seasonal', 'Sun-ready styles')}
                  </p>
                </div>
              </div>
              <Link to="/products?season=summer" className="text-sm text-pink-600 hover:underline">Shop collection →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {summerCollection.slice(0, getMaxProducts('seasonal', 4)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* We think you'll like these */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold dark:text-white">We think you'll like these</h2>
              <p className="text-sm text-gray-500">Recommended for you</p>
            </div>
            <Link to="/recommended" className="text-sm text-pink-600 hover:underline">See more →</Link>
          </div>
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
              <Link to="/products" className="text-pink-600 hover:underline mt-2 inline-block">
                Browse all products
              </Link>
            </div>
          )}
        </div>

        {/* Outfit inspiration */}
        <div className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Outfit inspiration</h2>
          <p className="text-sm text-gray-500 mb-4">Snag their style</p>
          {displayProducts.length > 4 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayProducts.slice(4, 8).map((product) => (
                <ProductCard key={product.id} product={product} showRating={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-gray-500">More styles coming soon</p>
              <Link to="/products" className="text-pink-600 hover:underline text-sm mt-2 inline-block">
                Browse all products
              </Link>
            </div>
          )}
        </div>

        {/* Stories that inspire */}
        <div className="bg-gray-50 dark:bg-gray-800 py-8 my-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Stories that inspire</h2>
              <Link to="/stories" className="text-sm text-pink-600 hover:underline">Explore all Stories →</Link>
            </div>
            <p className="text-sm text-gray-500 mb-4">Curated weekly</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.map((story, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
                  <img src={story.image} alt={story.title} className="w-full md:w-40 h-40 object-cover" />
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg mb-1">{story.title}</h3>
                    {story.brand && <p className="text-sm text-pink-600 mb-2">{story.brand}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{story.description}</p>
                    <Link to="/stories" className="inline-block mt-3 text-pink-600 text-sm">Read more →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Pick up where you left off</h2>
            <p className="text-sm text-gray-500 mb-4">Recently viewed</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recentlyViewed.filter(p => p && p.id).map((product) => (
                <HorizontalProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Brand Features */}
        {brandFeatures.map((brand, idx) => (
          <div key={idx} className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{brand.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{brand.tagline}</p>
                <Link to={`/brands/${brand.name.toLowerCase()}`} className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm hover:opacity-80 transition">
                  Shop now →
                </Link>
              </div>
              <div className="flex-1">
                <img src={brand.image} alt={brand.name} className="rounded-xl w-full h-64 object-cover" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {brand.products.length > 0 ? (
                brand.products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="text-gray-500 col-span-4 text-center py-4">No products available for this brand</p>
              )}
            </div>
          </div>
        ))}

        {/* More Brands - DYNAMIC from database */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-6 dark:text-white">More Brands</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {moreBrands.slice(0, 24).map((brand) => (
              <Link 
                key={brand} 
                to={`/brands/${brand.toLowerCase().replace(/ /g, '-')}`} 
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-600 hover:text-white transition text-center"
              >
                {brand}
              </Link>
            ))}
          </div>
          {moreBrands.length > 24 && (
            <div className="text-center mt-4">
              <Link to="/brands" className="text-sm text-pink-600 hover:underline">
                View All Brands →
              </Link>
            </div>
          )}
        </div>

        {/* More Inspiration - DYNAMIC from database */}
        <div className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 dark:text-white">More Inspiration</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {moreInspiration.slice(0, 20).map((category) => (
              <Link 
                key={category} 
                to={`/${slugify(category)}`}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-600 hover:text-white transition text-center"
              >
                {category}
              </Link>
            ))}
          </div>
          {moreInspiration.length > 20 && (
            <div className="text-center mt-4">
              <Link to="/inspiration" className="text-sm text-pink-600 hover:underline">
                View All Inspiration →
              </Link>
            </div>
          )}
        </div>

        {/* Benefits Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 py-8 mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <Truck className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <p className="font-semibold dark:text-white">Free Delivery*</p>
                <p className="text-sm text-gray-500">On orders over £39</p>
              </div>
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="font-semibold dark:text-white">Secure Payment</p>
                <p className="text-sm text-gray-500">100% secure</p>
              </div>
              <div>
                <Gift className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="font-semibold dark:text-white">Gift Cards</p>
                <p className="text-sm text-gray-500">Perfect gift</p>
              </div>
              <div>
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="font-semibold dark:text-white">30-day Returns</p>
                <p className="text-sm text-gray-500">Easy returns</p>
              </div>
            </div>
          </div>
        </div>

        {showGoToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-pink-600 text-white p-3 rounded-full shadow-lg hover:bg-pink-700 transition-all duration-300 hover:scale-110"
            aria-label="Go to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  );
};

export default WomensFashion;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, User, Menu, X, 
  Search, ChevronDown, Sun, Moon,
  LogOut, Settings, Package, CreditCard,
  Zap, Gift, Bell, BarChart2, Mail,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
  isActive: boolean;
  displayOrder: number;
  description?: string;
  image?: string;
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

// Helper: slugify
const slugify = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { settings, toggleTheme } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [location.pathname]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const cats = await categoryManagementNewService.getCategories();
        const activeCats = cats.filter((c: Category) => c.isActive !== false);
        setCategories(activeCats);
      } catch (error) {
        console.error('Error loading categories:', error);
        try {
          const stored = localStorage.getItem('categories');
          if (stored) {
            const parsed = JSON.parse(stored);
            setCategories(parsed.filter((c: any) => c.isActive !== false));
          }
        } catch (e) {
          console.error('Fallback failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const openCompare = () => {
    window.dispatchEvent(new CustomEvent('openCompare'));
    setIsMenuOpen(false);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ CLEAN URL: link to /{slug} for ALL categories (no /category/ prefix)
  const getCategoryLink = (category: Category): string => {
    return `/${category.slug}`;
  };

  const getGroupLink = (category: Category, group: CategoryGroup): string => {
    return `/${category.slug}/${group.slug}`;
  };

  const getSubLink = (category: Category, group: CategoryGroup, sub: SubCategory): string => {
    let subSlug = sub.slug;
    const suffixes = ['-women', '-men', '-kids'];
    for (const suffix of suffixes) {
      if (subSlug.endsWith(suffix)) {
        subSlug = subSlug.slice(0, -suffix.length);
        break;
      }
    }
    return `/${category.slug}/${group.slug}/${subSlug}`;
  };

  // Gender-specific color (for active state)
  const getCategoryColor = (category: Category): string => {
    if (category.gender === 'women' || category.slug === 'women') return 'text-pink-600 hover:text-pink-700';
    if (category.gender === 'men' || category.slug === 'men') return 'text-blue-600 hover:text-blue-700';
    if (category.gender === 'kids' || category.slug === 'kids') return 'text-green-600 hover:text-green-700';
    return 'text-purple-600 hover:text-purple-700';
  };

  const getCategoryIcon = (category: Category): string => {
    if (category.gender === 'women' || category.slug === 'women') return '👩';
    if (category.gender === 'men' || category.slug === 'men') return '👨';
    if (category.gender === 'kids' || category.slug === 'kids') return '🧒';
    return '📦';
  };

  const mainNavLinks = categories.filter(c => 
    c.slug === 'women' || c.slug === 'men' || c.slug === 'kids'
  );

  const otherCategories = categories.filter(c => 
    c.slug !== 'women' && c.slug !== 'men' && c.slug !== 'kids'
  );

  const isActive = (path: string) => location.pathname === path;

  const handleMouseEnter = (categoryId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
    setHoverTimeout(timeout);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Free Shipping $50+</span>
              <span className="hidden sm:flex items-center gap-1"><Gift className="w-3 h-3" /> 30-Day Returns</span>
              <span className="hidden md:flex items-center gap-1"><Package className="w-3 h-3" /> Gift Cards</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/track-order" className="hover:underline text-xs">Track Order</Link>
              <Link to="/help" className="hover:underline text-xs hidden sm:inline">Help</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-sm' 
          : 'bg-white dark:bg-gray-900 shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">S</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                hopHub
              </span>
            </Link>

            {/* Desktop Navigation with Mega Menu */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {mainNavLinks.map((category) => {
                const groups = category.categoryGroups || [];
                const hasSub = groups.length > 0;
                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(category.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to={getCategoryLink(category)}
                      className={`font-medium transition whitespace-nowrap flex items-center gap-1 ${
                        isActive(getCategoryLink(category)) 
                          ? getCategoryColor(category)
                          : 'text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400'
                      }`}
                    >
                      {category.name}
                      {hasSub && <ChevronDown className="w-4 h-4" />}
                    </Link>

                    {hasSub && hoveredCategory === category.id && (
                      <div className="absolute left-0 top-full pt-1 min-w-[220px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {groups.map((group) => {
                          const subCategories = group.subCategories || [];
                          return (
                            <div key={group.id} className="relative group/sub">
                              <Link
                                to={getGroupLink(category, group)}
                                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition"
                              >
                                <span>{group.name}</span>
                                {subCategories.length > 0 && (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Link>
                              {subCategories.length > 0 && (
                                <div className="absolute left-full top-0 ml-1 min-w-[200px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all">
                                  {subCategories.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      to={getSubLink(category, group, sub)}
                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                          <Link
                            to={getCategoryLink(category)}
                            className="block px-4 py-2 text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition"
                          >
                            View All {category.name} →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Other Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredCategory('other')}
                onMouseLeave={handleMouseLeave}
              >
                <button className="font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition whitespace-nowrap flex items-center gap-1">
                  More Categories <ChevronDown className="w-4 h-4" />
                </button>
                
                {hoveredCategory === 'other' && (
                  <div className="absolute left-0 top-full pt-1 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {loading ? (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
                    ) : (
                      otherCategories.map((category) => (
                        <Link
                          key={category.id}
                          to={getCategoryLink(category)}
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition"
                        >
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {getCategoryIcon(category)}
                          </span>
                        </Link>
                      ))
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <Link
                        to="/products"
                        className="block px-4 py-2 text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition"
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={openCompare} 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 font-medium transition flex items-center gap-1 whitespace-nowrap"
              >
                <BarChart2 className="w-4 h-4" /> Compare
              </button>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:block flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ThemeSwitcher />
              
              <button className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              
              <Link to="/wishlist" className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              
              <Link to="/cart" className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Wishlist</Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-pink-600 dark:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 mt-1">Admin Dashboard</Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 mt-1">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-full text-sm font-semibold transition">
                  Sign In
                </Link>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSearch} className="relative mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 pl-10 border rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </form>
                
                {loading ? (
                  <div className="py-2 px-3 text-gray-500 dark:text-gray-400">Loading categories...</div>
                ) : (
                  categories.map((category) => {
                    const groups = category.categoryGroups || [];
                    return (
                      <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 py-1">
                        <Link
                          to={getCategoryLink(category)}
                          className={`block py-2 px-3 rounded-lg transition flex items-center justify-between ${
                            isActive(getCategoryLink(category)) 
                              ? `${getCategoryColor(category)} bg-pink-50 dark:bg-pink-900/20` 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{getCategoryIcon(category)}</span>
                        </Link>
                        {groups.length > 0 && (
                          <div className="ml-4 space-y-1 mt-1">
                            {groups.map((group) => (
                              <div key={group.id}>
                                <Link
                                  to={getGroupLink(category, group)}
                                  className="block py-1.5 px-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {group.name}
                                </Link>
                                {(group.subCategories || []).length > 0 && (
                                  <div className="ml-4 space-y-0.5">
                                    {group.subCategories!.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={getSubLink(category, group, sub)}
                                        className="block py-1 px-3 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                        onClick={() => setIsMenuOpen(false)}
                                      >
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                <button 
                  onClick={openCompare} 
                  className="block w-full text-left py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  Compare Products
                </button>
                
                <Link to="/wishlist" className="block py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                  Wishlist
                </Link>
                
                <Link to="/cart" className="block py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                  Cart ({cartCount})
                </Link>
                
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block py-2 px-3 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  {isAuthenticated ? (
                    <button onClick={handleLogout} className="block w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                      Logout
                    </button>
                  ) : (
                    <Link to="/login" className="block py-2 px-3 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
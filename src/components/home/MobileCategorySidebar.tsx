import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown, Home, User, Heart, ShoppingBag, LogOut } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import { Category, CategoryGroup, SubCategory } from '../../types/categoryTypes';
import { useAuthStore } from '../../store/authStore';

interface CategoryWithGroups {
  id: string;
  name: string;
  slug: string;
  gender: string;
  icon?: string;
  groups: CategoryGroup[];
  subs: Record<string, SubCategory[]>;
}

const genderCategories = [
  { name: 'Women', href: '/women' },
  { name: 'Men', href: '/men' },
  { name: 'Kids', href: '/kids' }
];

const categoryIcons: Record<string, string> = {
  'NEW IN': '✨',
  'Clothing': '👕',
  'Shoes': '👟',
  'Accessories': '👜',
  'Designer': '👑',
  'Streetwear': '🔥',
  'Sports': '⚡',
  'Brands': '🏷️',
  'Sale': '💰',
  'Girls': '👧',
  'Boys': '👦',
  'Baby': '🍼',
};

interface MobileCategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileCategorySidebar: React.FC<MobileCategorySidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryWithGroups[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allCategories = await categoryManagementNewService.getCategories();
      
      const menuCategories: CategoryWithGroups[] = [];
      
      for (const cat of allCategories) {
        const groups = await categoryManagementNewService.getCategoryGroups(cat.id);
        const subsMap: Record<string, SubCategory[]> = {};
        
        for (const group of groups) {
          const subs = await categoryManagementNewService.getSubCategoriesByGroup(group.id);
          subsMap[group.id] = subs;
        }
        
        menuCategories.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          gender: cat.gender,
          icon: getCategoryIcon(cat.name),
          groups: groups,
          subs: subsMap,
        });
      }
      
      setCategories(menuCategories);
    } catch (error) {
      console.error('Error loading mobile menu categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name: string): string => {
    return categoryIcons[name] || '📌';
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto lg:hidden animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Browse by category
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* User section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              {isAuthenticated && user ? (
                <>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.firstName || user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-900 dark:text-white">Guest User</p>
                  <Link to="/login" className="text-xs text-pink-600 hover:underline" onClick={onClose}>
                    Sign in or register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/wishlist" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 transition" onClick={onClose}>
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>
            <Link to="/cart" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 transition" onClick={onClose}>
              <ShoppingBag className="w-4 h-4" />
              Cart
            </Link>
            {isAuthenticated && (
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 transition" onClick={onClose}>
                <User className="w-4 h-4" />
                Profile
              </Link>
            )}
          </div>
        </div>

        {/* Gender categories */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {genderCategories.map((gender) => (
              <Link
                key={gender.name}
                to={gender.href}
                className="flex-1 text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 border-b-2 border-transparent hover:border-pink-600 transition"
                onClick={onClose}
              >
                {gender.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Categories list - Dynamic from API */}
        <div className="py-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No categories available</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="border-b border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon || '📌'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-400">({category.groups.length})</span>
                  </div>
                  {expandedCategory === category.name ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {/* Groups and Sub-categories - expandable */}
                {expandedCategory === category.name && (
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 pl-12">
                    <div className="space-y-3">
                      <Link
                        to={`/${category.slug}`}
                        className="block py-2 text-sm font-medium text-pink-600 hover:underline"
                        onClick={onClose}
                      >
                        Shop All {category.name}
                      </Link>
                      
                      {category.groups.map((group) => {
                        const subs = category.subs[group.id] || [];
                        return (
                          <div key={group.id} className="space-y-1">
                            <Link
                              to={`/${category.slug}/${group.slug}`}
                              className="block py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 transition"
                              onClick={onClose}
                            >
                              {group.name}
                            </Link>
                            {subs.slice(0, 3).map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/${category.slug}/${group.slug}/${sub.slug}`}
                                className="block py-1.5 pl-4 text-sm text-gray-500 dark:text-gray-400 hover:text-pink-600 transition"
                                onClick={onClose}
                              >
                                {sub.name}
                              </Link>
                            ))}
                            {subs.length > 3 && (
                              <Link
                                to={`/${category.slug}/${group.slug}`}
                                className="block py-1.5 pl-4 text-xs text-pink-600 hover:underline"
                                onClick={onClose}
                              >
                                +{subs.length - 3} more...
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Promotional image at bottom */}
        <div className="p-4 mt-4">
          <div className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=300&fit=crop"
              alt="Summer sale"
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            <div className="p-3 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Summer Sale</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Up to 50% off</p>
              <Link 
                to="/sale" 
                className="inline-block mt-2 text-xs text-pink-600 font-medium hover:underline"
                onClick={onClose}
              >
                Shop now →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link to="/help" className="text-xs text-gray-500 hover:text-pink-600 transition" onClick={onClose}>Help & Contact</Link>
          <span className="text-xs text-gray-300 mx-2">|</span>
          <Link to="/returns" className="text-xs text-gray-500 hover:text-pink-600 transition" onClick={onClose}>Returns</Link>
          <span className="text-xs text-gray-300 mx-2">|</span>
          <Link to="/gift-cards" className="text-xs text-gray-500 hover:text-pink-600 transition" onClick={onClose}>Gift Cards</Link>
        </div>
      </div>
    </>
  );
};

// Main mobile navigation component with hamburger menu
export const MobileCategoryNav: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            shopHub
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/search" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition" aria-label="Search">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link to="/cart" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <MobileCategorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, User, Heart, ShoppingBag } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import { Category, CategoryGroup, SubCategory } from '../../types/categoryTypes';
import { useAuthStore } from '../../store/authStore';

interface CategoryWithGroups {
  id: string;
  name: string;
  slug: string;
  gender: string;
  groups: CategoryGroup[];
  subs: Record<string, SubCategory[]>;
}

const genderCategories = [
  { name: 'Women', href: '/women' },
  { name: 'Men', href: '/men' },
  { name: 'Kids', href: '/kids' }
];

const categoryImages: Record<string, string> = {
  'NEW IN': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=150&h=150&fit=crop',
  'Clothing': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=150&h=150&fit=crop',
  'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=150&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=150&h=150&fit=crop',
  'Designer': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=150&fit=crop',
  'Streetwear': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=150&h=150&fit=crop',
  'Sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop',
  'Brands': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
  'Sale': 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=150&h=150&fit=crop',
  'Girls': 'https://images.unsplash.com/photo-1519457431-44ccd64d5790?w=150&h=150&fit=crop',
  'Boys': 'https://images.unsplash.com/photo-1503917988258-0d06b4e1bc17?w=150&h=150&fit=crop',
  'Baby': 'https://images.unsplash.com/photo-1515459969601-3e6c63e3a6d8?w=150&h=150&fit=crop',
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuthStore();
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
          groups: groups,
          subs: subsMap,
        });
      }
      
      setCategories(menuCategories);
    } catch (error) {
      console.error('Error loading mobile sidebar categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (name: string): string => {
    return categoryImages[name] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=150&h=150&fit=crop';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto lg:hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Browse by category</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Gender categories - horizontal line */}
          <div className="flex gap-6">
            {genderCategories.map((gender) => (
              <Link
                key={gender.name}
                to={gender.href}
                className="text-base font-medium text-gray-900 dark:text-white hover:text-pink-600 transition"
                onClick={onClose}
              >
                {gender.name}
              </Link>
            ))}
          </div>
        </div>

        {/* User section */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Link to={isAuthenticated ? '/profile' : '/login'} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 transition" onClick={onClose}>
            <User className="w-4 h-4" />
            {isAuthenticated ? user?.email || 'My Profile' : 'Sign In'}
          </Link>
          <div className="flex gap-4 mt-2">
            <Link to="/wishlist" className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-pink-600 transition" onClick={onClose}>
              <Heart className="w-3 h-3" /> Wishlist
            </Link>
            <Link to="/cart" className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-pink-600 transition" onClick={onClose}>
              <ShoppingBag className="w-3 h-3" /> Cart
            </Link>
          </div>
        </div>

        {/* Categories - 2 column grid with image on top, text below */}
        <div className="p-4">
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
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/${category.slug}`}
                  className="flex flex-col items-center text-center hover:opacity-80 transition group"
                  onClick={onClose}
                >
                  <img 
                    src={getCategoryImage(category.name)} 
                    alt={category.name} 
                    className="w-full aspect-square rounded-xl object-cover mb-2 group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=150&h=150&fit=crop';
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400">{category.groups.length} groups</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link to="/help" className="text-xs text-gray-500 hover:text-pink-600 transition" onClick={onClose}>Help & Contact</Link>
          <span className="text-xs text-gray-300 mx-2">|</span>
          <Link to="/returns" className="text-xs text-gray-500 hover:text-pink-600 transition" onClick={onClose}>Returns</Link>
        </div>
      </div>
    </>
  );
};

export const MobileHeader: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <Link to="/" className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
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
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
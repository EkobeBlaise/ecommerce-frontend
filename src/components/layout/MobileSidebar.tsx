import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown, Plus, Minus, ArrowLeft } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';

// ✅ Helper for placeholder images
const getPlaceholderImage = (seed: string = 'fallback'): string => {
  return `https://picsum.photos/seed/${seed}/150/150`;
};

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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const allCategories = await categoryManagementNewService.getCategories();
      console.log('📱 MobileSidebar - All categories:', allCategories);
      
      const activeCategories = allCategories.filter((c: Category) => c.isActive !== false);
      setCategories(activeCategories);
      
      const currentPath = location.pathname;
      const matchedCategory = activeCategories.find((c: Category) => {
        const link = getCategoryLink(c);
        return currentPath === link || currentPath.startsWith(link + '/');
      });
      
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.id);
      }
      
      console.log('📱 MobileSidebar - Active categories:', activeCategories);
    } catch (error) {
      console.error('Error loading categories for mobile sidebar:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get the correct link for each category
  const getCategoryLink = (category: Category): string => {
    if (category.slug === 'women' || category.gender === 'women') {
      return '/women';
    }
    if (category.slug === 'men' || category.gender === 'men') {
      return '/men';
    }
    if (category.slug === 'kids' || category.gender === 'kids') {
      return '/kids';
    }
    return `/category/${category.slug}`;
  };

  // ✅ Get CATEGORY image - PRIORITIZES DATABASE
  const getCategoryImage = (category: Category): string => {
    if (category.image) return category.image;
    
    const fallbackImages: Record<string, string> = {
      women: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=150&h=150&fit=crop',
      men: 'https://images.unsplash.com/photo-1617137968427-85924c800c5e?w=150&h=150&fit=crop',
      kids: 'https://images.unsplash.com/photo-1519457431-44ccd64d5790?w=150&h=150&fit=crop',
      unisex: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&h=150&fit=crop',
    };
    return fallbackImages[category.gender || 'unisex'] || fallbackImages.unisex;
  };

  // ✅ Get GROUP image - PRIORITIZES DATABASE
  const getGroupImage = (group: CategoryGroup): string => {
    if (group.image) return group.image;
    
    const fallbackImages: Record<string, string> = {
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
      'Babies': 'https://images.unsplash.com/photo-1515459969601-3e6c63e3a6d8?w=150&h=150&fit=crop',
      'Sandal': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=150&fit=crop',
      'Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
      'Slippers': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&h=150&fit=crop',
      'Designer shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&h=150&fit=crop',
      'Sport shoes': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop',
      'Computers': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&h=150&fit=crop',
      'Phones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop',
      'Gaming': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=150&h=150&fit=crop',
      'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
      'Summer': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=150&fit=crop',
      'Smart Prices': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    };
    return fallbackImages[group.name] || getPlaceholderImage(group.name);
  };

  // ✅ Get group emoji
  const getGroupEmoji = (groupName: string): string => {
    const emojis: Record<string, string> = {
      'NEW IN': '✨',
      'Clothing': '👕',
      'Shoes': '👟',
      'Accessories': '👜',
      'Designer': '👗',
      'Streetwear': '🔥',
      'Sports': '⚽',
      'Brands': '🏷️',
      'Sale': '💰',
      'Girls': '👧',
      'Boys': '👦',
      'Baby': '🍼',
      'Babies': '🍼',
      'Sandal': '🩴',
      'Sneakers': '👟',
      'Slippers': '🩴',
      'Designer shoes': '👠',
      'Sport shoes': '👟',
      'Computers': '💻',
      'Phones': '📱',
      'Gaming': '🎮',
      'Audio': '🎧',
      'Summer': '☀️',
      'Smart Prices': '💡',
    };
    return emojis[groupName] || '📌';
  };

  // ✅ Get gender-specific color
  const getCategoryColor = (category: Category): string => {
    if (category.gender === 'women' || category.slug === 'women') return 'text-pink-600';
    if (category.gender === 'men' || category.slug === 'men') return 'text-blue-600';
    if (category.gender === 'kids' || category.slug === 'kids') return 'text-green-600';
    return 'text-purple-600';
  };

  // ✅ Get gender-specific emoji
  const getCategoryEmoji = (category: Category): string => {
    if (category.gender === 'women' || category.slug === 'women') return '👩';
    if (category.gender === 'men' || category.slug === 'men') return '👨';
    if (category.gender === 'kids' || category.slug === 'kids') return '🧒';
    return '📦';
  };

  // ✅ Get the currently selected category object
  const getSelectedCategory = (): Category | null => {
    if (!selectedCategory) return null;
    return categories.find(c => c.id === selectedCategory) || null;
  };

  // ✅ Get the expanded group object
  const getExpandedGroup = (): CategoryGroup | null => {
    if (!expandedGroup) return null;
    const category = getSelectedCategory();
    return category?.categoryGroups?.find(g => g.id === expandedGroup) || null;
  };

  // ✅ Open group expansion (overlay)
  const openGroup = (groupId: string) => {
    setExpandedGroup(groupId);
  };

  // ✅ Close group expansion
  const closeGroup = () => {
    setExpandedGroup(null);
  };

  // ✅ Go back to category selection
  const goToCategories = () => {
    setSelectedCategory(null);
    setExpandedGroup(null);
  };

  // ✅ Check if a category is active
  const isActiveCategory = (category: Category): boolean => {
    const link = getCategoryLink(category);
    return location.pathname === link || location.pathname.startsWith(link + '/');
  };

  if (!isOpen) return null;

  // ============================================================
  // VIEW 1: Categories Grid (shows all categories with images)
  // ============================================================
  if (selectedCategory === null) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose} />
        <div className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto lg:hidden">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Browse by category</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Gender Tabs */}
            <div className="flex gap-4">
              {categories.filter(c => c.slug === 'women' || c.slug === 'men' || c.slug === 'kids').map((gender) => (
                <Link
                  key={gender.id}
                  to={getCategoryLink(gender)}
                  className={`text-base font-medium hover:${getCategoryColor(gender)} transition ${
                    isActiveCategory(gender) 
                      ? getCategoryColor(gender) 
                      : 'text-gray-900 dark:text-white'
                  }`}
                  onClick={onClose}
                >
                  {gender.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No categories available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                  const image = getCategoryImage(category);
                  const textColor = getCategoryColor(category);
                  const emoji = getCategoryEmoji(category);
                  const isActive = isActiveCategory(category);
                  const hasGroups = category.categoryGroups && category.categoryGroups.length > 0;

                  return (
                    <div
                      key={category.id}
                      className="flex flex-col items-center text-center"
                    >
                      <div 
                        className={`relative w-full aspect-square rounded-xl overflow-hidden mb-2 cursor-pointer hover:opacity-80 transition ${
                          hasGroups ? '' : 'cursor-pointer'
                        }`}
                        onClick={() => {
                          if (hasGroups) {
                            setSelectedCategory(category.id);
                          } else {
                            window.location.href = getCategoryLink(category);
                          }
                        }}
                      >
                        <img 
                          src={image} 
                          alt={category.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlaceholderImage(category.slug || 'category');
                          }}
                        />
                        {isActive && (
                          <div className="absolute inset-0 border-2 border-pink-500 rounded-xl"></div>
                        )}
                        {hasGroups && (
                          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? textColor : 'text-gray-900 dark:text-white'}`}>
                        {category.name}
                        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                          {emoji}
                        </span>
                      </span>
                      {hasGroups && (
                        <span className="text-xs text-gray-400">
                          {category.categoryGroups?.length} categories
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* View All Products */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-2">
            <Link
              to="/products"
              className="block w-full text-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
              onClick={onClose}
            >
              View All Products →
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // VIEW 2: Category Groups (2-Column Grid with Click to Open Overlay)
  // ============================================================
  const selectedCategoryObj = getSelectedCategory();
  const groups = selectedCategoryObj?.categoryGroups || [];
  const expandedGroupObj = getExpandedGroup();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto lg:hidden">
        {/* Header with back button */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={goToCategories}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCategoryObj?.name}
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
            {groups.length} categories
          </p>
        </div>

        {/* Groups - 2 Column Grid */}
        <div className="p-4">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {groups.map((group) => {
                const groupImage = getGroupImage(group);
                const emoji = getGroupEmoji(group.name);
                const subCount = group.subCategories?.length || 0;
                const hasSubCategories = subCount > 0;

                return (
                  <div key={group.id} className="flex flex-col">
                    {/* Group Card - Click to Open Overlay */}
                    <div 
                      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer ${
                        expandedGroup === group.id ? 'ring-2 ring-pink-500 ring-offset-1' : ''
                      }`}
                      onClick={() => hasSubCategories && openGroup(group.id)}
                    >
                      {/* Image */}
                      <div className="relative w-full aspect-square overflow-hidden">
                        <img 
                          src={groupImage} 
                          alt={group.name} 
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlaceholderImage(group.slug || 'group');
                          }}
                        />
                        {hasSubCategories && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {subCount}
                          </div>
                        )}
                        {hasSubCategories && (
                          <div className="absolute bottom-2 right-2 bg-pink-500 rounded-full p-1">
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Name */}
                      <div className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-gray-400">{emoji}</span>
                          <span className="text-xs font-medium text-gray-800 dark:text-white truncate">
                            {group.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All link for the category */}
          <Link
            to={getCategoryLink(selectedCategoryObj!)}
            className="block mt-4 text-center text-sm text-pink-600 hover:underline font-medium"
            onClick={onClose}
          >
            All {selectedCategoryObj?.name} →
          </Link>
        </div>
      </div>

      {/* ============================================================
          OVERLAY: Group Expansion (Full Screen Overlay)
          ============================================================ */}
      {expandedGroup && expandedGroupObj && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={closeGroup}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {expandedGroupObj.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {expandedGroupObj.subCategories?.length || 0} items
                </p>
              </div>
            </div>
            <button 
              onClick={closeGroup}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Sub-Categories Grid */}
            <div className="grid grid-cols-2 gap-3">
              {expandedGroupObj.subCategories?.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/${selectedCategoryObj?.slug}/${expandedGroupObj.slug}/${sub.slug}`}
                  className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition border border-gray-100 dark:border-gray-700"
                  onClick={() => {
                    closeGroup();
                    onClose();
                  }}
                >
                  <span className="text-2xl mb-1">📌</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* View All link */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={`/${selectedCategoryObj?.slug}/${expandedGroupObj.slug}`}
                className="block w-full text-center px-4 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition font-medium"
                onClick={() => {
                  closeGroup();
                  onClose();
                }}
              >
                View All {expandedGroupObj.name} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const MobileHeader: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <Link to="/" className="text-lg font-bold text-gray-900 dark:text-white">
            ShopHub
          </Link>
          <div className="w-8"></div>
        </div>
      </div>
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default MobileHeader;
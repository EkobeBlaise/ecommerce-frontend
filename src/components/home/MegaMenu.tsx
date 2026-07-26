import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Grid, Package } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import { Category, CategoryGroup, SubCategory } from '../../types/categoryTypes';

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  gender: string;
  icon?: string;
  groups: CategoryGroup[];
  subs: Record<string, SubCategory[]>;
}

export const MegaMenu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allCategories = await categoryManagementNewService.getCategories();
      console.log('📋 MegaMenu - All categories:', allCategories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        gender: c.gender,
        groupCount: c.categoryGroups?.length || 0
      })));
      
      const menuCategories: MenuCategory[] = [];
      
      for (const cat of allCategories) {
        const groups = cat.categoryGroups || [];
        const filteredGroups = groups.filter((g: CategoryGroup) => 
          g.categoryId === cat.id && g.isActive !== false
        );
        
        console.log(`📋 ${cat.name} - ${filteredGroups.length} groups:`, 
          filteredGroups.map(g => g.name)
        );
        
        const subsMap: Record<string, SubCategory[]> = {};
        
        for (const group of filteredGroups) {
          subsMap[group.id] = group.subCategories || [];
          console.log(`  📄 ${group.name} - ${subsMap[group.id].length} sub-categories:`, 
            subsMap[group.id].map(s => s.name)
          );
        }
        
        menuCategories.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          gender: cat.gender,
          icon: getCategoryIcon(cat.name),
          groups: filteredGroups,
          subs: subsMap,
        });
      }
      
      setCategories(menuCategories);
      console.log('✅ MegaMenu loaded:', menuCategories.length, 'categories');
    } catch (error) {
      console.error('Error loading mega menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLEAN URLs: no /category/ prefix for any category
  const getCategoryLink = (category: MenuCategory): string => {
    return `/${category.slug}`;
  };

  const getGroupLink = (category: MenuCategory, group: CategoryGroup): string => {
    return `/${category.slug}/${group.slug}`;
  };

  const getSubCategoryLink = (category: MenuCategory, group: CategoryGroup, sub: SubCategory): string => {
    return `/${category.slug}/${group.slug}/${sub.slug}`;
  };

  const getCategoryIcon = (name: string): string => {
    const icons: Record<string, string> = {
      'Women': '👩',
      'Men': '👨',
      'Kids': '🧒',
      'Electronics': '💻',
      'Kitchen Utensil': '🍳',
      'Sports': '⚽',
      'Accessories': '👜',
      'Beauty': '💄',
      'Home': '🏠',
      'Garden': '🌿',
      'Toys': '🧸',
      'Books': '📚',
    };
    return icons[name] || '📦';
  };

  const getGroupIcon = (name: string): string => {
    const icons: Record<string, string> = {
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
      'Computers': '💻',
      'Phones': '📱',
      'Gaming': '🎮',
      'Audio': '🎧',
      'Cameras': '📷',
      'Wearables': '⌚',
      'Cooking Utensils': '🍳',
      'Bakeware': '🧁',
      'Cutlery': '🔪',
      'Cookware': '🍲',
      'Kitchen Tools': '🔧',
    };
    return icons[name] || '📌';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12 overflow-x-auto">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12 overflow-x-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400">No categories available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative group"
              onMouseEnter={() => {
                setActiveCategory(category.id);
                if (category.groups.length > 0) {
                  setActiveGroup(category.groups[0].id);
                }
              }}
              onMouseLeave={() => {
                setActiveCategory(null);
                setActiveGroup(null);
              }}
            >
              <Link
                to={getCategoryLink(category)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 whitespace-nowrap transition"
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
                <ChevronDown className="w-3 h-3" />
              </Link>

              {/* Mega Menu Dropdown */}
              {activeCategory === category.id && (
                <div className="absolute left-0 top-full mt-0 w-screen max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-b-xl border dark:border-gray-700 z-50">
                  <div className="flex">
                    {/* Groups List */}
                    <div className="w-1/3 border-r dark:border-gray-700 p-4">
                      {category.groups.length > 0 ? (
                        <>
                          {category.groups.map((group) => (
                            <button
                              key={group.id}
                              onMouseEnter={() => setActiveGroup(group.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between group-btn ${
                                activeGroup === group.id
                                  ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{getGroupIcon(group.name)}</span>
                                {group.name}
                              </span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-btn-hover:opacity-100 transition" />
                            </button>
                          ))}
                          <div className="mt-3 pt-3 border-t dark:border-gray-700">
                            <Link
                              to={getCategoryLink(category)}
                              className="text-sm text-pink-600 hover:underline font-medium block px-3 py-1"
                              onClick={() => {
                                setActiveCategory(null);
                                setActiveGroup(null);
                              }}
                            >
                              View All {category.name} →
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No groups available</p>
                          <Link
                            to={getCategoryLink(category)}
                            className="text-pink-600 hover:underline mt-2 inline-block"
                            onClick={() => {
                              setActiveCategory(null);
                              setActiveGroup(null);
                            }}
                          >
                            Browse all {category.name} products
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Sub-Categories Content */}
                    <div className="flex-1 p-6">
                      {category.groups.length > 0 ? (
                        <>
                          {category.groups.map((group) => {
                            const subs = category.subs[group.id] || [];
                            const isActive = activeGroup === group.id;
                            
                            return (
                              <div key={group.id} className={isActive ? 'block' : 'hidden'}>
                                <h3 className="font-semibold text-lg mb-4 dark:text-white flex items-center gap-2">
                                  <span>{getGroupIcon(group.name)}</span>
                                  {group.name}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                  {subs.length > 0 ? (
                                    subs.slice(0, 6).map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={getSubCategoryLink(category, group, sub)}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                        onClick={() => {
                                          setActiveCategory(null);
                                          setActiveGroup(null);
                                        }}
                                      >
                                        {sub.name}
                                      </Link>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-400 col-span-3 text-center py-4">
                                      No sub-categories available
                                    </p>
                                  )}
                                  {subs.length > 6 && (
                                    <Link
                                      to={getGroupLink(category, group)}
                                      className="text-sm text-pink-600 hover:underline font-medium p-2"
                                      onClick={() => {
                                        setActiveCategory(null);
                                        setActiveGroup(null);
                                      }}
                                    >
                                      +{subs.length - 6} more...
                                    </Link>
                                  )}
                                </div>
                                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                                  <Link
                                    to={getGroupLink(category, group)}
                                    className="text-sm text-pink-600 hover:underline font-medium"
                                    onClick={() => {
                                      setActiveCategory(null);
                                      setActiveGroup(null);
                                    }}
                                  >
                                    Shop All {group.name} →
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No groups available for {category.name}</p>
                          <Link
                            to={getCategoryLink(category)}
                            className="text-pink-600 hover:underline mt-2 inline-block"
                            onClick={() => {
                              setActiveCategory(null);
                              setActiveGroup(null);
                            }}
                          >
                            Browse all {category.name} products
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
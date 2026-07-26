import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Package, Grid, Sparkles, Flame, TrendingUp, Tag } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
  isActive: boolean;
  displayOrder: number;
}

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryGroupId: string;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
}

export const DynamicMegaMenu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Record<string, CategoryGroup[]>>({});
  const [subs, setSubs] = useState<Record<string, SubCategory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // ✅ Get all categories from API
      const allCategories = await categoryManagementNewService.getCategories();
      setCategories(allCategories);

      const groupsMap: Record<string, CategoryGroup[]> = {};
      const subsMap: Record<string, SubCategory[]> = {};

      // ✅ Load groups and sub-categories for each category
      for (const category of allCategories) {
        const categoryGroups = await categoryManagementNewService.getCategoryGroups(category.id);
        groupsMap[category.id] = categoryGroups;

        for (const group of categoryGroups) {
          const subCategories = await categoryManagementNewService.getSubCategoriesByGroup(group.id);
          subsMap[group.id] = subCategories;
        }
      }

      setGroups(groupsMap);
      setSubs(subsMap);
    } catch (error) {
      console.error('Error loading mega menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      'Women': '👩',
      'Men': '👨',
      'Kids': '🧒',
    };
    return icons[name] || <Grid className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="hidden md:block bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no categories, don't render the mega menu
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12 gap-6">
          {/* ✅ Categories Dropdown */}
          <div 
            className="relative h-full"
            onMouseEnter={() => setActiveCategory('all')}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <button className="flex items-center gap-2 h-full px-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-t-lg hover:shadow-lg transition text-sm font-semibold">
              <Package className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {activeCategory === 'all' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full w-[800px] bg-white dark:bg-gray-800 shadow-xl rounded-b-lg border border-gray-200 dark:border-gray-700 z-50 p-6 max-h-[70vh] overflow-y-auto"
                >
                  <div className="grid grid-cols-3 gap-8">
                    {categories.filter(c => c.isActive).map((category) => (
                      <div key={category.id}>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(category.name)}</span>
                          {category.name}
                        </h3>
                        <ul className="space-y-2">
                          {groups[category.id]?.filter(g => g.isActive).map((group) => (
                            <li key={group.id}>
                              <Link
                                to={`/${category.slug}/${group.slug}`}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition block"
                              >
                                {group.name}
                              </Link>
                              {/* ✅ Show sub-categories under each group */}
                              {subs[group.id]?.filter(s => s.isActive).length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1">
                                  {subs[group.id]?.filter(s => s.isActive).slice(0, 4).map((sub) => (
                                    <li key={sub.id}>
                                      <Link
                                        to={`/${category.slug}/${group.slug}/${sub.slug}`}
                                        className="text-xs text-gray-500 dark:text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition block"
                                      >
                                        {sub.name}
                                      </Link>
                                    </li>
                                  ))}
                                  {subs[group.id]?.filter(s => s.isActive).length > 4 && (
                                    <li>
                                      <Link
                                        to={`/${category.slug}/${group.slug}`}
                                        className="text-xs text-pink-600 hover:underline font-medium"
                                      >
                                        +{subs[group.id]?.filter(s => s.isActive).length - 4} more...
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </li>
                          ))}
                          <li>
                            <Link
                              to={`/${category.slug}`}
                              className="text-xs text-pink-600 hover:underline font-medium"
                            >
                              View All {category.name} →
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/flash-sale" className="flex items-center gap-1 text-red-500 hover:text-red-600 transition">
              <Flame className="w-4 h-4" />
              Flash Sale
            </Link>
            <Link to="/new-arrivals" className="flex items-center gap-1 hover:text-pink-600 transition">
              <Sparkles className="w-4 h-4" />
              New Arrivals
            </Link>
            <Link to="/best-sellers" className="flex items-center gap-1 hover:text-pink-600 transition">
              <TrendingUp className="w-4 h-4" />
              Best Sellers
            </Link>
            <Link to="/deals" className="flex items-center gap-1 hover:text-pink-600 transition">
              <Tag className="w-4 h-4" />
              Today's Deals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicMegaMenu;
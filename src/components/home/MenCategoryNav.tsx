import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import { Category, CategoryGroup, SubCategory } from '../../types/categoryTypes';

export const MenCategoryNav: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, SubCategory[]>>({});
  const [loading, setLoading] = useState(true);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allCategories = await categoryManagementNewService.getCategories();
      const menCategory = allCategories.find((c: Category) => c.gender === 'men');
      console.log('👔 Men category found:', menCategory);
      
      if (menCategory) {
        const menGroups = await categoryManagementNewService.getCategoryGroups(menCategory.id);
        setGroups(menGroups);
        
        const subsMap: Record<string, SubCategory[]> = {};
        for (const group of menGroups) {
          const subs = await categoryManagementNewService.getSubCategoriesByGroup(group.id);
          subsMap[group.id] = subs;
        }
        setSubCategories(subsMap);
        
        console.log('👔 Men groups loaded:', menGroups.map(g => g.name));
      } else {
        console.warn('⚠️ No men\'s category found');
        setGroups([]);
        setSubCategories({});
      }
    } catch (error) {
      console.error('Error loading men\'s category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLink = (group: CategoryGroup, sub?: SubCategory): string => {
    if (sub) {
      const subSlug = sub.slug || sub.name.toLowerCase().replace(/ /g, '-');
      return `/men/${group.slug}/${subSlug}`;
    }
    return `/men/${group.slug}`;
  };

  const handleMouseEnter = (groupName: string) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setActiveCategory(groupName);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  const getCategoryIcon = (groupName: string): string => {
    const icons: Record<string, string> = {
      'NEW IN': '✨',
      'Clothing': '👕',
      'Shoes': '👟',
      'Accessories': '👜',
      'Designer': '👑',
      'Streetwear': '🔥',
      'Sports': '⚽',
      'Brands': '🏷️',
      'Sale': '💰',
    };
    return icons[groupName] || '📌';
  };

  const getMegaMenuImage = (groupName: string): string => {
    const images: Record<string, string> = {
      'NEW IN': 'https://images.unsplash.com/photo-1617137968427-85924c800c5e?w=400&h=300&fit=crop',
      'Clothing': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop',
      'Shoes': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=300&fit=crop',
      'Accessories': 'https://images.unsplash.com/photo-1584917865445-de89df76afd3?w=400&h=300&fit=crop',
      'Designer': 'https://images.unsplash.com/photo-1617137968427-85924c800c5e?w=400&h=300&fit=crop',
      'Streetwear': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
      'Brands': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      'Sale': 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
    };
    return images[groupName] || 'https://images.unsplash.com/photo-1617137968427-85924c800c5e?w=400&h=300&fit=crop';
  };

  const getMegaMenuImageAlt = (groupName: string): string => {
    return `Men ${groupName} collection`;
  };

  const getMegaMenuImageGradient = (groupName: string): string => {
    const gradients: Record<string, string> = {
      'NEW IN': 'from-blue-100 to-indigo-100',
      'Clothing': 'from-blue-100 to-cyan-100',
      'Shoes': 'from-gray-100 to-slate-100',
      'Accessories': 'from-gray-100 to-stone-100',
      'Designer': 'from-black to-gray-800',
      'Streetwear': 'from-gray-900 to-black',
      'Sports': 'from-red-100 to-orange-100',
      'Brands': 'from-indigo-100 to-purple-100',
      'Sale': 'from-red-100 to-pink-100',
    };
    return gradients[groupName] || 'from-blue-100 to-indigo-100';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Loading men's categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">No men's categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Nav bar */}
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-start gap-6 py-4">
          {groups.map((group) => {
            const icon = getCategoryIcon(group.name);
            return (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.name)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={getLink(group)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 whitespace-nowrap py-2 transition"
                >
                  <span className="text-base">{icon}</span>
                  {group.name}
                  <ChevronDown className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full‑width dropdown */}
      {activeCategory && (
        <div
          className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-gray-800 shadow-xl border-t border-gray-200 dark:border-gray-700"
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
          onMouseEnter={() => handleMouseEnter(activeCategory)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-3 grid grid-cols-3 gap-6">
                {(() => {
                  const activeGroup = groups.find(g => g.name === activeCategory);
                  const subs = activeGroup ? subCategories[activeGroup.id] || [] : [];
                  if (subs.length === 0) {
                    return (
                      <div className="col-span-3 text-center text-gray-500 py-4">
                        No sub‑categories available
                      </div>
                    );
                  }
                  const third = Math.ceil(subs.length / 3);
                  const firstCol = subs.slice(0, third);
                  const secondCol = subs.slice(third, third * 2);
                  const thirdCol = subs.slice(third * 2);
                  const group = activeGroup || groups[0];
                  return (
                    <>
                      <div className="space-y-2">
                        {firstCol.map((sub) => (
                          <Link
                            key={sub.id}
                            to={getLink(group, sub)}
                            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                            onClick={() => setActiveCategory(null)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {secondCol.map((sub) => (
                          <Link
                            key={sub.id}
                            to={getLink(group, sub)}
                            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                            onClick={() => setActiveCategory(null)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {thirdCol.map((sub) => (
                          <Link
                            key={sub.id}
                            to={getLink(group, sub)}
                            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                            onClick={() => setActiveCategory(null)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="col-span-1">
                <div
                  className={`bg-gradient-to-br ${getMegaMenuImageGradient(activeCategory)} dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden shadow-sm`}
                >
                  <img
                    src={getMegaMenuImage(activeCategory)}
                    alt={getMegaMenuImageAlt(activeCategory)}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1617137968427-85924c800c5e?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="p-3 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                      Men's collection
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Shop now →
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={getLink(groups.find((g) => g.name === activeCategory) || groups[0])}
                className="text-sm text-blue-600 hover:underline font-medium"
                onClick={() => setActiveCategory(null)}
              >
                Shop All {activeCategory} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenCategoryNav;
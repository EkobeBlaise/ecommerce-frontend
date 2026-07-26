import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';

const categoryImages: Record<string, string> = {
  women: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
  men: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop',
  kids: 'https://images.unsplash.com/photo-1519457431-44ccd64d5790?w=400&h=300&fit=crop',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
  home: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc502348?w=400&h=300&fit=crop',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1584917865445-de89df76afd3?w=400&h=300&fit=crop',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
};

const fallbackCategories = [
  { id: 'fallback-women', name: 'Women', slug: 'women', gender: 'women' },
  { id: 'fallback-men', name: 'Men', slug: 'men', gender: 'men' },
  { id: 'fallback-kids', name: 'Kids', slug: 'kids', gender: 'kids' },
];

export const CategoryGrid: React.FC = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryManagementNewService.getCategories(),
    staleTime: 5 * 60 * 1000,
    placeholderData: fallbackCategories,
  });

  const displayCategories = (categories && categories.length > 0) ? categories : fallbackCategories;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {displayCategories.map((category: any) => {
        const imageKey = category.slug?.toLowerCase() || category.name?.toLowerCase() || '';
        const imageUrl = categoryImages[imageKey] || category.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop';
        // ✅ Clean URL: use the category slug directly (no /category/ prefix)
        const linkUrl = `/${category.slug}`;

        return (
          <Link key={category.id} to={linkUrl} className="group">
            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <img
                src={imageUrl}
                alt={category.name}
                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                <h3 className="text-white font-semibold text-sm md:text-base text-center px-2">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
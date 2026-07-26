import React from 'react';
import { Product } from '../../types/product';
import ProductCard from '../common/ProductCard';

interface ProductGridProps {
  products: Product[];
  showRating?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  showRating = true,
  showActions = true,
  emptyMessage = 'No products found',
  className = '',
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try browsing our other categories</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          showRating={showRating}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ProductGrid;

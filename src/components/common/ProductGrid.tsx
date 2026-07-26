// src/components/common/ProductGrid.tsx
import React from 'react';
import { ProductCard } from '../product/ProductCard';
import { Loader } from 'lucide-react';

interface ProductGridProps {
  products: any[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading = false,
  columns = 4 
}) => {
  const columnsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }
  
  return (
    <div className={`grid ${columnsClass[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
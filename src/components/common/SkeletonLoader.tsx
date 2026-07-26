import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
    <Skeleton className="w-full aspect-[3/4]" />
    <div className="p-3">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <div className="flex items-center gap-1 mb-2">
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-1/3" />
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative h-[400px] md:h-[450px] overflow-hidden bg-gray-200 dark:bg-gray-800 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
  </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array(count).fill(0).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CartItemSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 border-b animate-pulse">
    <Skeleton className="w-24 h-24 rounded" />
    <div className="flex-1">
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-20" />
    </div>
    <Skeleton className="w-20 h-6" />
  </div>
);

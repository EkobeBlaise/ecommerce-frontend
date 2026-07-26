// src/components/common/Rating.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const Rating: React.FC<RatingProps> = ({ 
  value, 
  count, 
  size = 'md',
  showValue = true 
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(value);
  
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className={`${sizes[size]} fill-yellow-400 text-yellow-400`} />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizes[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizes[size]} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i + fullStars} className={`${sizes[size]} text-gray-300`} />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {value.toFixed(1)}
          {count !== undefined && ` (${count} reviews)`}
        </span>
      )}
    </div>
  );
};
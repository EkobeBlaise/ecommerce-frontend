// src/components/common/ProductImage.tsx

import React, { useState } from 'react';
import { getProductImage } from '../../utils/imageUtils';

interface ProductImageProps {
  product: any;
  className?: string;
  fallback?: string;
  alt?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  className = 'w-full h-full object-cover',
  fallback = 'https://picsum.photos/seed/fallback/300/300',
  alt = 'Product',
  onClick,
  loading = 'lazy',
}) => {
  const [imgError, setImgError] = useState(false);

  const imageUrl = imgError ? fallback : getProductImage(product);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      loading={loading}
      onError={() => setImgError(true)}
    />
  );
};

export default ProductImage;
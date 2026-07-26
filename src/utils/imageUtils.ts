// src/utils/imageUtils.ts

/**
 * Get the first image URL from a product's images field
 * Handles both JSON string and array formats
 */
export const getProductImage = (product: any): string => {
  if (!product) return 'https://picsum.photos/seed/fallback/300/300?text=No+Image';

  // If product has direct image field and it's a valid URL
  if (product.image && typeof product.image === 'string') {
    // Check if it's a JSON string
    if (product.image.startsWith('[')) {
      try {
        const parsed = JSON.parse(product.image);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {
        // Not JSON, use as is
        return product.image;
      }
    }
    return product.image;
  }

  // If images is a string (JSON array)
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch (e) {
      console.warn('Failed to parse images JSON:', product.images);
      // If it's a URL string, use it
      if (product.images.startsWith('http')) {
        return product.images;
      }
    }
  }

  // If images is an array
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  // Fallback
  return `https://picsum.photos/seed/${product.id || 'fallback'}/300/300`;
};

/**
 * Get all images from a product
 */
export const getProductImages = (product: any): string[] => {
  if (!product) return [];

  // If images is a string (JSON array)
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse images JSON:', product.images);
      // If it's a single URL, return as array
      if (product.images.startsWith('http')) {
        return [product.images];
      }
    }
  }

  // If images is an array
  if (Array.isArray(product.images)) {
    return product.images;
  }

  // If there's a single image
  if (product.image) {
    // Check if image is a JSON string
    if (typeof product.image === 'string' && product.image.startsWith('[')) {
      try {
        const parsed = JSON.parse(product.image);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        return [product.image];
      }
    }
    return [product.image];
  }

  return [];
};

/**
 * Parse product images from database
 */
export const parseProductImages = (product: any): any => {
  if (!product) return product;

  let images: string[] = [];
  
  if (typeof product.images === 'string') {
    try {
      images = JSON.parse(product.images);
    } catch (e) {
      images = product.images ? [product.images] : [];
    }
  } else if (Array.isArray(product.images)) {
    images = product.images;
  }

  // Also check if image field has JSON
  let image = product.image || '';
  if (typeof product.image === 'string' && product.image.startsWith('[')) {
    try {
      const parsed = JSON.parse(product.image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        image = parsed[0];
      }
    } catch (e) {
      image = product.image;
    }
  }

  return {
    ...product,
    images: images,
    image: images.length > 0 ? images[0] : image || 'https://picsum.photos/seed/fallback/300/300',
  };
};
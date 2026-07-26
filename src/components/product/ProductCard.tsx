// src/components/product/ProductCard.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Star, 
  Award, Package, Users, Verified,
  TrendingUp, Zap 
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useSettings } from '../../context/SettingsContext';
import { getProductImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

// ✅ Generate hierarchical product URL from product data
const getProductUrl = (product: any): string => {
  if (!product || !product.id) return '#';

  // 1. If product already has categorySlug, groupSlug, subSlug (populated from categories)
  if (product.categorySlug && product.groupSlug && product.subSlug) {
    return `/${product.categorySlug}/${product.groupSlug}/${product.subSlug}/${product.id}`;
  }

  // 2. Gender-based URL (for women/men/kids)
  if (product.gender && product.categoryGroup && product.subcategory) {
    const genderSlug = product.gender === 'women' ? 'women' : 
                       product.gender === 'men' ? 'men' : 
                       product.gender === 'kids' ? 'kids' : 
                       product.gender === 'unisex' ? 'unisex' : product.gender;
    const groupSlug = product.categoryGroup.toLowerCase().replace(/ /g, '-');
    const subSlug = product.subcategory.toLowerCase().replace(/ /g, '-');
    return `/${genderSlug}/${groupSlug}/${subSlug}/${product.id}`;
  }

  // 3. Category-based URL (using category, categoryGroup, subcategory)
  if (product.category && product.categoryGroup && product.subcategory) {
    const categorySlug = product.category.toLowerCase().replace(/ /g, '-');
    const groupSlug = product.categoryGroup.toLowerCase().replace(/ /g, '-');
    const subSlug = product.subcategory.toLowerCase().replace(/ /g, '-');
    return `/${categorySlug}/${groupSlug}/${subSlug}/${product.id}`;
  }

  // 4. If product has gender and category
  if (product.gender && product.category) {
    const genderSlug = product.gender === 'women' ? 'women' : 
                       product.gender === 'men' ? 'men' : 
                       product.gender === 'kids' ? 'kids' : 
                       product.gender === 'unisex' ? 'unisex' : product.gender;
    const categorySlug = product.category.toLowerCase().replace(/ /g, '-');
    return `/${genderSlug}/${categorySlug}/${product.id}`;
  }

  // 5. If product has category and subcategory
  if (product.category && product.subcategory) {
    const categorySlug = product.category.toLowerCase().replace(/ /g, '-');
    const subSlug = product.subcategory.toLowerCase().replace(/ /g, '-');
    return `/${categorySlug}/${subSlug}/${product.id}`;
  }

  // 6. If product has just category
  if (product.category) {
    const categorySlug = product.category.toLowerCase().replace(/ /g, '-');
    return `/${categorySlug}/${product.id}`;
  }

  // 7. Final fallback to product ID route
  return `/product/${product.id}`;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { formatPrice } = useSettings();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getDiscountPercentage = () => {
    if (product?.oldPrice && product?.price) {
      return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    }
    return 0;
  };

  const formatMOQ = (moq: number) => {
    if (moq >= 1000) return `${(moq / 1000).toFixed(1)}K`;
    if (moq >= 1000000) return `${(moq / 1000000).toFixed(1)}M`;
    return moq.toString();
  };

  const formatUnitsSold = (units: number) => {
    if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`;
    if (units >= 1000) return `${(units / 1000).toFixed(1)}K`;
    return units.toString();
  };

  const discountPercentage = getDiscountPercentage();
  const imageUrl = getProductImage(product);
  const productUrl = getProductUrl(product);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
      {/* Image Section */}
      <div className="relative group">
        <Link to={productUrl}>
          <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={imageUrl}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/300';
              }}
            />
          </div>
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercentage > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded shadow-lg">
              -{discountPercentage}%
            </span>
          )}
          {product.isNew && !product.oldPrice && (
            <span className="px-2.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" />
              NEW
            </span>
          )}
          {product.isTrending && !product.oldPrice && (
            <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              TRENDING
            </span>
          )}
          {product.isBestseller && !product.oldPrice && (
            <span className="px-2.5 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
              <Award className="w-3 h-3" />
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
            toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition z-10"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted
                ? 'fill-pink-600 text-pink-600'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-1.5">
        {/* Brand + Country + Years + Verified */}
        <div className="flex items-center flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400">
          {product.brand && (
            <span className="font-medium text-pink-600 dark:text-pink-400">
              {product.brand}
            </span>
          )}
          {product.verified && (
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400">
              <Verified className="w-3 h-3" />
            </span>
          )}
          {(product.country || product.yearsInBusiness) && (
            <span className="text-gray-400 dark:text-gray-500">
              {product.country && <span> {product.country}</span>}
              {product.country && product.yearsInBusiness && <span> • </span>}
              {product.yearsInBusiness && <span>{product.yearsInBusiness}+ years</span>}
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link to={productUrl}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition line-clamp-2 min-h-[40px]">
            {product.name || 'Product Name'}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${
                  i < Math.floor(Number(product.rating) || 0) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                }`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">({Number(product.reviews) || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              Save {formatPrice(product.oldPrice - product.price)}
            </span>
          )}
        </div>

        {/* Reorder Rate */}
        {product.reorderRate && product.reorderRate > 0 && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-medium">
            <Award className="w-3 h-3" />
            {product.reorderRate}% Reorder Rate
          </div>
        )}

        {/* In Stock */}
        <div className="text-xs font-medium text-green-600 dark:text-green-400">
          {product.stock_quantity > 0 ? '✔ In Stock' : '✗ Out of Stock'}
        </div>

        {/* MOQ + Units Sold */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
          {product.moq && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              MOQ: {formatMOQ(product.moq)} {product.moqUnit || 'units'}
            </span>
          )}
          {product.sold && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatUnitsSold(product.sold)} sold
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => {
            if (product.stock_quantity <= 0) {
              toast.error('Out of stock');
              return;
            }
            addItem({
              id: product.id,
              name: product.name || 'Product',
              price: product.price,
              image: imageUrl,
              quantity: 1,
            });
            toast.success(`Added to cart!`);
          }}
          disabled={product.stock_quantity <= 0}
          className="mt-2 w-full bg-pink-600 hover:bg-pink-700 text-white py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
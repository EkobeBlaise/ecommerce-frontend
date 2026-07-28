// src/components/product/ProductCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useSettings } from '../../context/SettingsContext';
import { getProductImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
  onQuickView?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCartStore();
  const { formatPrice } = useSettings();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const imageUrl = getProductImage(product);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:border-pink-500/50 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link to={`/product/${product.id}`}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercentage > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{discountPercentage}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
              NEW
            </span>
          )}
          {product.isTrending && (
            <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              TRENDING
            </span>
          )}
        </div>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-600 transition z-10"
          >
            <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
            toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
          }}
          className="absolute bottom-2 right-2 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-600 transition z-10"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-pink-600 text-pink-600' : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white hover:text-pink-600 transition line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            ({product.reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.oldPrice)}
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
              name: product.name,
              price: product.price,
              image: imageUrl,
              quantity: 1,
            });
            toast.success('Added to cart!');
          }}
          disabled={product.stock_quantity <= 0}
          className="w-full mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
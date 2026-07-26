import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star, MessageCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useSettings } from '../../context/SettingsContext';
import { Product } from '../../types/product';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  showActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showRating = true, 
  showActions = true,
  className = ''
}) => {
  const addToCart = useCartStore(state => state.addItem);
  const { formatPrice } = useSettings();

  if (!product) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    toast.success(`✨ ${product.name?.substring(0, 30) || 'Product'} added!`);
  };

  const discount = product.oldPrice && product.price 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : i <= Math.ceil(rating) && rating % 1 !== 0
              ? 'fill-yellow-400 text-yellow-400 opacity-50'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image || 'https://via.placeholder.com/400'} 
            alt={product.name || 'Product'} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
            }}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-medium">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-md font-medium">
              {product.badge}
            </span>
          )}
          {product.isNew && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md font-medium">
              NEW
            </span>
          )}
        </div>

        {/* Reorder Rate */}
        {product.reorderRate && product.reorderRate > 0 && (
          <span className="absolute bottom-2 left-2 bg-green-500/90 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>✔</span> Reorder rate {product.reorderRate}%
          </span>
        )}

        {/* Verified Badge */}
        {product.verified && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>✓</span> Verified
          </span>
        )}
        
        {/* Hover Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button 
              onClick={handleAddToCart} 
              className="bg-white p-2.5 rounded-full hover:bg-pink-600 hover:text-white transition shadow-lg"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button 
              className="bg-white p-2.5 rounded-full hover:bg-pink-600 hover:text-white transition shadow-lg"
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>
            <Link 
              to={`/product/${product.id}`} 
              className="bg-white p-2.5 rounded-full hover:bg-pink-600 hover:text-white transition shadow-lg"
              aria-label="View product"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-3 space-y-1.5">
        {/* Product Name */}
        <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] dark:text-white">
          <Link to={`/product/${product.id}`} className="hover:text-pink-600 transition">
            {product.name || 'Product'}
          </Link>
        </h3>
        
        {/* Brand & Verified */}
        {product.brand && (
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span>
            {product.verified && (
              <span className="text-green-600 dark:text-green-400 text-[10px]">✓ Verified</span>
            )}
            {product.yearsInBusiness && product.yearsInBusiness > 0 && (
              <span className="text-gray-400 dark:text-gray-500 text-[10px]">· {product.yearsInBusiness} yrs</span>
            )}
            {product.country && (
              <span className="text-gray-400 dark:text-gray-500 text-[10px]">· {product.country}</span>
            )}
          </div>
        )}
        
        {/* Rating */}
        {showRating && product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.reviews || 0})
            </span>
          </div>
        )}
        
        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-pink-600 dark:text-pink-500">
            {formatPrice(product.price || 0)}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        
        {/* MOQ & Sales Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
          {product.moq && (
            <span>MOQ: {product.moq} {product.moqUnit || 'piece(s)'}</span>
          )}
          {product.sold && product.sold > 0 && (
            <span className="text-gray-400 dark:text-gray-500">· {product.sold} sold</span>
          )}
        </div>
        
        {/* Subcategory Tag */}
        {product.subcategory && (
          <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate pt-0.5">
            {product.category} {product.subcategory ? `/ ${product.subcategory}` : ''}
          </div>
        )}
        
        {/* Action Buttons - Mobile friendly */}
        <div className="flex gap-2 mt-2 pt-1 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Add to Cart
          </button>
          <button 
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-400"
            aria-label="Chat with seller"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

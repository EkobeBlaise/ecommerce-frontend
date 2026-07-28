// src/components/product/QuickViewModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, Truck, Shield, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: any;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCartStore();
  const { formatPrice } = useSettings();

  if (!product) return null;

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {discount > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              {product.brand && (
                <span className="text-sm text-pink-600 dark:text-pink-400 font-semibold">
                  {product.brand}
                </span>
              )}
              <h2 className="text-2xl font-bold dark:text-white">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-black dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={() => {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      quantity: 1,
                    });
                    toast.success(`✨ ${product.name} added to cart!`);
                    onClose();
                  }}
                  disabled={product.stock_quantity <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button className="flex items-center gap-2 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600
                 hover:bg-gray-100 
                 dark:bg-white text-white-
                 dark:hover:bg-white-800 transition">
                  <Heart className="w-4 h-4" /> Wishlist
                </button>
              </div>

              {/* Perks */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-white-500 dark:text-gray-400">
                  <Truck className="w-4 h-4" /> Free Shipping
                </div>
                <div className="flex items-center gap-2 text-xs text-white-500 dark:text-gray-400">
                  <Shield className="w-4 h-4" /> Secure Payment
                </div>
              </div>

              {/* View full details */}
              <Link
                to={`/product/${product.id}`}
                className="text-sm text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                onClick={onClose}
              >
                View full details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
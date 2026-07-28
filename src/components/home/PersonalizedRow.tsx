// src/components/home/PersonalizedRow.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import {
  getAllProducts,
  getProductsByCategory,
  getTrendingProducts,
  getSaleProducts,
  getNewProducts,
  getProductsByGender,
} from '../../services/productService';

interface PersonalizedRowProps {
  title: string;
  description?: string;
  type?: 'trending' | 'new' | 'sale' | 'category' | 'gender' | 'all';
  limit?: number;
  category?: string;
  gender?: string;
  excludeId?: string;
  scrollable?: boolean;
  viewAllLink?: string;
  onQuickView?: (product: any) => void;
}

export const PersonalizedRow: React.FC<PersonalizedRowProps> = ({
  title,
  description,
  type = 'trending',
  limit = 8,
  category,
  gender,
  excludeId,
  scrollable = false,
  viewAllLink = '/products',
  onQuickView,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let fetchedProducts: any[] = [];

        switch (type) {
          case 'trending':
            fetchedProducts = await getTrendingProducts(limit);
            break;
          case 'new':
            fetchedProducts = await getNewProducts(limit);
            break;
          case 'sale':
            fetchedProducts = await getSaleProducts(limit);
            break;
          case 'gender':
            if (gender) fetchedProducts = await getProductsByGender(gender);
            else fetchedProducts = await getAllProducts();
            break;
          case 'category':
            if (category) {
              fetchedProducts = await getProductsByCategory(category);
              if (gender) {
                fetchedProducts = fetchedProducts.filter(
                  (p) =>
                    p.gender?.toLowerCase() === gender.toLowerCase() ||
                    p.gender === 'unisex'
                );
              }
            } else {
              fetchedProducts = await getAllProducts();
            }
            break;
          case 'all':
          default:
            fetchedProducts = await getAllProducts();
            break;
        }

        if (excludeId) {
          fetchedProducts = fetchedProducts.filter((p) => p.id !== excludeId);
        }

        setProducts(fetchedProducts.slice(0, limit));
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, limit, category, gender, excludeId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-black/60 dark:text-white/60 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || products.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative rounded-2xl bg-white/60 dark:bg-white/20 backdrop-blur-2xl border border-white/60 dark:border-white/30 shadow-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/20"></div>

        <div className="relative z-10">
          {/* Header – forced text colors */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2
                className="text-2xl font-bold flex items-center gap-2"
                style={{ color: '#000000' }}
              >
                <Sparkles className="w-5 h-5 text-black/60 dark:text-white/60" />
                {title}
              </h2>
              {description && (
                <p className="text-sm" style={{ color: '#000000' }}>
                  {description}
                </p>
              )}
            </div>
            <Link
              to={viewAllLink}
              className="text-sm font-medium flex items-center gap-1 group transition-colors"
              style={{ color: '#000000' }}
            >
              View All
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Products */}
          <div
            className={
              scrollable
                ? 'flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide'
                : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
            }
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={
                  scrollable
                    ? 'min-w-[160px] sm:min-w-[200px] max-w-[200px] snap-start'
                    : ''
                }
              >
                <ProductCard product={product} onQuickView={onQuickView} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRow;
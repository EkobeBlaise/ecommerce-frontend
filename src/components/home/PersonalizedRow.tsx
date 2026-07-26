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
  getProductsByGender
} from '../../services/productService';

interface PersonalizedRowProps {
  title: string;
  description?: string;
  type?: 'trending' | 'new' | 'sale' | 'category' | 'gender' | 'all';
  limit?: number;
  category?: string;
  gender?: string;
  excludeId?: string; // For "similar" products
}

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  badgeColor?: string;
  sold?: number;
  category?: string;
  subcategory?: string;
  gender?: string;
  stock_quantity?: number;
  stockQuantity?: number;
  brand?: string;
  brandName?: string;
  verified?: boolean;
  country?: string;
  yearsInBusiness?: number;
  reorderRate?: number;
  isNew?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  isSale?: boolean;
  slug?: string;
  description?: string;
}

export const PersonalizedRow: React.FC<PersonalizedRowProps> = ({ 
  title, 
  description,
  type = 'trending',
  limit = 8,
  category,
  gender,
  excludeId
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let fetchedProducts: Product[] = [];

        // Use existing product service functions
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
            if (gender) {
              fetchedProducts = await getProductsByGender(gender);
            } else {
              fetchedProducts = await getAllProducts();
            }
            break;
          case 'category':
            if (category) {
              fetchedProducts = await getProductsByCategory(category);
              // Filter by gender if provided
              if (gender) {
                fetchedProducts = fetchedProducts.filter(p => 
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

        // Filter out excluded product
        if (excludeId) {
          fetchedProducts = fetchedProducts.filter(p => p.id !== excludeId);
        }

        // Ensure we have valid products
        const validProducts = fetchedProducts.filter(p => p && p.id && p.name);
        
        // Limit the results
        setProducts(validProducts.slice(0, limit));
        
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, limit, category, gender, excludeId]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(Math.min(4, limit))].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-12 my-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl md:text-3xl font-bold dark:text-white">
                {title}
              </h2>
            </div>
            {description && (
              <p className="text-gray-600 dark:text-gray-300">{description}</p>
            )}
          </div>
          <Link 
            to="/products" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 group"
          >
            View All 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="cursor-pointer">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRow;
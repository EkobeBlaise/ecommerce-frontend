import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Eye, Star, ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryManagementNewService } from '../services/categoryManagementNewService';
import { useCartStore } from '../store/cartStore';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

const CategoryGroupPage: React.FC = () => {
  const { gender, categoryGroup } = useParams<{
    gender: string;
    categoryGroup: string;
  }>();
  
  const { addItem } = useCartStore();
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    if (gender && categoryGroup) {
      loadCategoryGroup();
    }
  }, [gender, categoryGroup]);

  const loadCategoryGroup = () => {
    setLoading(true);
    try {
      // Get category ID from gender slug
      const allCategories = categoryManagementNewService.getCategories();
      const category = allCategories.find(c => c.slug === gender);
      
      if (category) {
        // Get groups for this category
        const allGroups = categoryManagementNewService.getCategoryGroups(category.id);
        const group = allGroups.find(g => g.slug === categoryGroup);
        setGroupInfo(group);
        
        if (group) {
          // Get sub-categories for this group
          const subs = categoryManagementNewService.getSubCategoriesByGroup(group.id);
          setSubCategories(subs);
          
          // Get all products for this category group
          const allProducts = productService.getAll();
          
          // Filter products by gender and category group
          const filtered = allProducts.filter(p => {
            const genderMatch = p.gender === gender || p.gender === 'unisex';
            const groupMatch = p.category_group === group.name || 
                             p.category_group === categoryGroup ||
                             p.category === group.name ||
                             p.category_group_id === group.id;
            return genderMatch && groupMatch;
          });
          
          console.log(`📋 Found ${filtered.length} products for ${group.name}`);
          setProducts(filtered);
        }
      }
    } catch (error) {
      console.error('Error loading category group:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    toast.success(`✨ ${product.name} added to cart!`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  const ProductCard = ({ product }: { product: any }) => {
    const productUrl = product.path || `/product/${product.id}`;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Link to={productUrl}>
            <img 
              src={product.image || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
              }}
            />
          </Link>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button onClick={() => handleAddToCart(product)} className="bg-white p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button className="bg-white p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
              <Heart className="w-4 h-4" />
            </button>
            <Link to={productUrl} className="bg-white p-2 rounded-full hover:bg-pink-600 hover:text-white transition">
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          {product.badge && (
            <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-pink-500 text-white">
              {product.badge}
            </span>
          )}
          {product.oldPrice && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm mb-1 line-clamp-2 dark:text-white">
            <Link to={productUrl} className="hover:text-pink-600">
              {product.name}
            </Link>
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400 text-xs">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-xs text-gray-500">({product.reviews || 0})</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-pink-600">{formatPrice(product.price || 0)}</span>
            {product.oldPrice && <span className="text-gray-400 line-through text-sm">{formatPrice(product.oldPrice)}</span>}
          </div>
          <div className="mt-1 text-xs text-gray-400 truncate">
            {product.gender} / {product.category} / {product.subcategory}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const displayName = groupInfo?.name || categoryGroup?.replace(/-/g, ' ') || 'Category';
  const genderDisplay = gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '';

  return (
    <>
      <SEO
        title={`${displayName} - ${genderDisplay} Fashion`}
        description={`Shop the latest ${displayName} collection for ${genderDisplay}. Find stylish ${displayName} at great prices.`}
        keywords={[displayName, gender || '', 'fashion', 'clothing', 'shoes', 'accessories']}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <Link to="/" className="hover:text-pink-600">Home</Link>
              <span>/</span>
              <Link to={`/${gender}`} className="hover:text-pink-600 capitalize">
                {gender}
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium capitalize">
                {displayName}
              </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link 
                to={`/${gender}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold dark:text-white capitalize">
                  {displayName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subCategories.length} sub-categories • {products.length} products
                </p>
              </div>
            </div>

            {/* Sub-Category Navigation */}
            {subCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {subCategories.map((sub: any) => (
                  <Link
                    key={sub.id}
                    to={`/${gender}/${categoryGroup}/${sub.slug}`}
                    className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:border-pink-600 hover:text-pink-600 transition flex items-center gap-1"
                  >
                    {sub.name}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No products found in this category</p>
                <Link to={`/${gender}`} className="text-pink-600 hover:underline mt-2 inline-block">
                  Browse all {gender} products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryGroupPage;

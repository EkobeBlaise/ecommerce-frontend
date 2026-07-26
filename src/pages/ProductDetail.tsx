import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Star, StarHalf, 
  Minus, Plus, Truck, Shield, ArrowLeft,
  Check, X, Share2, Eye, Verified, 
  TrendingUp, Zap, Award, Globe, Package,
  Users, Clock
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useSettings } from '../context/SettingsContext';
import ProductReviews from '../components/product/ProductReviews';
import SEO from '../components/common/SEO';
import { getProductImages, getProductImage } from '../utils/imageUtils';
import toast from 'react-hot-toast';

// ✅ Helper to parse tags
const parseTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
  }
  return [];
};

// ✅ Helper to parse images
const parseImages = (images: any): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      if (images.startsWith('http')) {
        return [images];
      }
    }
  }
  return [];
};

// ✅ Helper to validate product
const isValidProduct = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.userId && data.comment && !data.name) return false;
  if (!data.name || typeof data.price === 'undefined') return false;
  return true;
};

// ✅ Helper to safely get string value
const safeString = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    if (value.name) return String(value.name);
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

// ✅ Helper to safely get number value
const safeNumber = (value: any, fallback: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
};

// ✅ Helper to generate product breadcrumb path
const getBreadcrumbPath = (product: any): string => {
  if (product.gender && product.categoryGroup && product.subcategory) {
    const genderSlug = product.gender === 'women' ? 'women' : 
                       product.gender === 'men' ? 'men' : 
                       product.gender === 'kids' ? 'kids' : 
                       product.gender === 'unisex' ? 'unisex' : product.gender;
    return `/${genderSlug}/${product.categoryGroup}/${product.subcategory}`;
  }
  if (product.category && product.categoryGroup && product.subcategory) {
    const categorySlug = product.category.toLowerCase().replace(/ /g, '-');
    const groupSlug = product.categoryGroup.toLowerCase().replace(/ /g, '-');
    const subSlug = product.subcategory.toLowerCase().replace(/ /g, '-');
    return `/${categorySlug}/${groupSlug}/${subSlug}`;
  }
  if (product.category && product.subcategory) {
    const categorySlug = product.category.toLowerCase().replace(/ /g, '-');
    const subSlug = product.subcategory.toLowerCase().replace(/ /g, '-');
    return `/${categorySlug}/${subSlug}`;
  }
  return product.gender ? `/${product.gender}` : '/products';
};

const ProductDetail: React.FC = () => {
  // ✅ SUPPORT BOTH ROUTE PATTERNS:
  // 1. Hierarchical: /:categorySlug/:groupSlug/:subSlug/:productId
  // 2. Simple: /product/:id
  const params = useParams<{
    productId?: string;    // For hierarchical route
    id?: string;           // For simple /product/:id route
    categorySlug?: string;
    groupSlug?: string;
    subSlug?: string;
    gender?: string;
    categoryGroup?: string;
    subCategory?: string;
  }>();

  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { formatPrice } = useSettings();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ FIX: Only use productId or id — NO fallback to subCategory/categoryGroup/gender
  // This prevents accidentally fetching a product by subcategory name
  const actualProductId = params.productId || params.id;

  console.log('🔍 ProductDetail - Params:', params);
  console.log('🔍 ProductDetail - Actual Product ID/Slug:', actualProductId);

  // ✅ If no product ID is present, redirect to products page
  useEffect(() => {
    if (!actualProductId) {
      toast.error('Product ID not found');
      navigate('/products');
      return;
    }
    loadProduct(actualProductId);
  }, [actualProductId]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      let productData = await productService.getById(productId);
      
      if (!productData) {
        const allProducts = await productService.getAll();
        const productsArray = Array.isArray(allProducts) ? allProducts : [];
        productData = productsArray.find(p => 
          p.path?.includes(productId) || 
          p.slug === productId ||
          p.id === productId
        );
      }
      
      if (productData && isValidProduct(productData)) {
        const parsedProduct = {
          ...productData,
          images: parseImages(productData.images),
          tags: parseTags(productData.tags),
          variants: Array.isArray(productData.variants) ? productData.variants : [],
        };
        setProduct(parsedProduct);
        
        const images = getProductImages(parsedProduct);
        if (images.length > 0) {
          setSelectedImage(0);
        }
        if (parsedProduct.variants && parsedProduct.variants.length > 0) {
          const firstVariant = parsedProduct.variants[0];
          setSelectedSize(firstVariant.size || '');
          setSelectedColor(firstVariant.color || '');
        }
      } else {
        console.warn('⚠️ Invalid product data received:', productData);
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock_quantity <= 0) {
      toast.error('Sorry, this product is out of stock');
      return;
    }

    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      );
      if (variant && variant.stock <= 0) {
        toast.error('Selected variant is out of stock');
        return;
      }
      if (variant && quantity > variant.stock) {
        toast.error(`Only ${variant.stock} items available in this variant`);
        return;
      }
    }

    const imageUrl = getProductImage(product);

    addItem({
      id: product.id,
      name: product.name || 'Product',
      price: product.price || 0,
      image: imageUrl,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
    });

    toast.success(`Added ${product.name} to cart!`);
  };

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity < 1) return;
    if (product.stock_quantity && newQuantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  const renderStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= safeRating) {
        stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= safeRating) {
        stars.push(<StarHalf key={`star-half-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={`star-empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  const getDiscountPercentage = () => {
    if (product?.oldPrice && product?.price) {
      return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    }
    return 0;
  };

  const formatMOQ = (moq: number) => {
    if (!moq) return '0';
    if (moq >= 1000) return `${(moq / 1000).toFixed(1)}K`;
    if (moq >= 1000000) return `${(moq / 1000000).toFixed(1)}M`;
    return moq.toString();
  };

  const formatUnitsSold = (units: number) => {
    if (!units) return '0';
    if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`;
    if (units >= 1000) return `${(units / 1000).toFixed(1)}K`;
    return units.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!product || !isValidProduct(product)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const productName = safeString(product.name, 'Product');
  const productPrice = safeNumber(product.price, 0);
  const productRating = safeNumber(product.rating, 0);
  const productReviews = safeNumber(product.reviews, 0);
  const productStock = safeNumber(product.stock_quantity, 0);

  const allImages = getProductImages(product);
  const primaryImage = getProductImage(product);
  const currentImage = allImages.length > 0 ? allImages[selectedImage] : primaryImage;

  const breadcrumbPath = getBreadcrumbPath(product);
  const discountPercentage = getDiscountPercentage();

  return (
    <>
      <SEO
        title={productName}
        description={product.description?.slice(0, 160)}
        image={primaryImage}
        url={`/product/${product.id}`}
        type="product"
        keywords={product.tags}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Breadcrumb - Hierarchical */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <Link to="/" className="hover:text-pink-600">Home</Link>
              <span>/</span>
              
              {product.gender && (
                <>
                  <Link to={`/${product.gender}`} className="hover:text-pink-600 capitalize">
                    {safeString(product.gender)}
                  </Link>
                  <span>/</span>
                </>
              )}
              
              {product.categoryGroup && (
                <>
                  <Link to={breadcrumbPath} className="hover:text-pink-600">
                    {safeString(product.categoryGroup)}
                  </Link>
                  <span>/</span>
                </>
              )}
              
              {product.subcategory && (
                <>
                  <Link to={breadcrumbPath} className="hover:text-pink-600">
                    {safeString(product.subcategory)}
                  </Link>
                  <span>/</span>
                </>
              )}
              
              <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{productName}</span>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                {/* Images */}
                <div>
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative">
                    {/* Badges Overlay on Image */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {product.isNew && (
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          NEW
                        </span>
                      )}
                      {product.isTrending && (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          TRENDING
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          BESTSELLER
                        </span>
                      )}
                      {discountPercentage > 0 && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>

                    <img
                      src={currentImage}
                      alt={productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/600/600';
                      }}
                    />
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {allImages.map((img: string, index: number) => (
                        <button
                          key={`thumb-${index}`}
                          onClick={() => setSelectedImage(index)}
                          className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                            selectedImage === index
                              ? 'border-pink-600'
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/thumb/80/80';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      {product.brand && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                            {safeString(product.brand)}
                          </p>
                          {product.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                              <Verified className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      )}
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {productName}
                      </h1>
                      
                      {(product.country || product.yearsInBusiness) && (
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {product.country && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {safeString(product.country)}
                            </span>
                          )}
                          {product.yearsInBusiness && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {safeNumber(product.yearsInBusiness)}+ years
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {renderStars(productRating)}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({productReviews} reviews)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          isWishlisted
                            ? 'fill-pink-600 text-pink-600'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(productPrice)}
                      </span>
                      {product.oldPrice && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(safeNumber(product.oldPrice))}
                          </span>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Save {formatPrice(safeNumber(product.oldPrice) - productPrice)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {product.reorderRate && safeNumber(product.reorderRate) > 0 && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        {safeNumber(product.reorderRate)}% Reorder Rate
                      </div>
                    )}

                    <div className="mt-2">
                      <span className={`text-sm font-medium ${
                        productStock > 10
                          ? 'text-green-600 dark:text-green-400'
                          : productStock > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {productStock > 10
                          ? '✓ In Stock'
                          : productStock > 0
                          ? `⚠ Only ${productStock} left`
                          : '✗ Out of Stock'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.moq && (
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          MOQ: {formatMOQ(safeNumber(product.moq))} {safeString(product.moqUnit, 'units')}
                        </span>
                      )}
                      {product.sold && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {formatUnitsSold(safeNumber(product.sold))} sold
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Size
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(product.variants.map((v: any) => safeString(v.size)))).map((size: string, index: number) => (
                            <button
                              key={`size-${size}-${index}`}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 rounded-lg border transition ${
                                selectedSize === size
                                  ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-400'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(product.variants.map((v: any) => safeString(v.color)))).map((color: string, index: number) => (
                            <button
                              key={`color-${color}-${index}`}
                              onClick={() => setSelectedColor(color)}
                              className={`px-4 py-2 rounded-lg border transition ${
                                selectedColor === color
                                  ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-400'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Quantity */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={productStock <= 0}
                      className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>

                  {/* Features */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Truck className="w-4 h-4 text-green-600" />
                      Free shipping on orders over £39
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4 text-green-600" />
                      Secure checkout
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Product Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {safeString(product.description, 'No description available.')}
                </p>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {parseTags(product.tags).map((tag: string, index: number) => (
                      <span
                        key={`tag-${tag}-${index}`}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <ProductReviews productId={product.id} productName={productName} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
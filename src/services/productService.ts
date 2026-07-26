// src/services/productService.ts

import api from './api';
import { Product } from '../types/product';
import { parseProductImages } from '../utils/imageUtils';

// ============================================================
// Mock Products for Fallback
// ============================================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Smart Watch',
    price: 299.99,
    oldPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    rating: 5,
    reviews: 2345,
    badge: 'BESTSELLER',
    badgeColor: 'orange',
    sold: 890,
    category: 'electronics',
    stockQuantity: 50,
    stock_quantity: 50,
    slug: 'premium-smart-watch',
    gender: 'unisex',
    brand: 'Apple',
    verified: true,
    country: 'USA',
    yearsInBusiness: 15,
    reorderRate: 92,
    isBestseller: true,
    isTrending: true,
    isNew: false
  },
  {
    id: '2',
    name: 'Designer Handbag',
    price: 199.99,
    oldPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'],
    rating: 5,
    reviews: 1234,
    badge: 'TRENDING',
    badgeColor: 'purple',
    sold: 567,
    category: 'fashion',
    stockQuantity: 30,
    stock_quantity: 30,
    slug: 'designer-handbag',
    gender: 'women',
    brand: 'Gucci',
    verified: true,
    country: 'Italy',
    yearsInBusiness: 20,
    reorderRate: 88,
    isBestseller: false,
    isTrending: true,
    isNew: false
  },
  {
    id: '3',
    name: 'Smart Home Speaker',
    price: 89.99,
    oldPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',
    images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400'],
    rating: 4,
    reviews: 3456,
    badge: 'NEW',
    badgeColor: 'green',
    sold: 1234,
    category: 'electronics',
    stockQuantity: 100,
    stock_quantity: 100,
    slug: 'smart-home-speaker',
    gender: 'unisex',
    brand: 'Sony',
    verified: true,
    country: 'Japan',
    yearsInBusiness: 10,
    reorderRate: 85,
    isBestseller: false,
    isTrending: false,
    isNew: true
  },
  {
    id: '4',
    name: 'Running Shoes',
    price: 129.99,
    oldPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    rating: 5,
    reviews: 4567,
    badge: 'HOT',
    badgeColor: 'red',
    sold: 2345,
    category: 'sports',
    stockQuantity: 75,
    stock_quantity: 75,
    slug: 'running-shoes',
    gender: 'unisex',
    brand: 'Nike',
    verified: true,
    country: 'USA',
    yearsInBusiness: 25,
    reorderRate: 95,
    isBestseller: false,
    isTrending: true,
    isNew: false
  },
  {
    id: '5',
    name: 'Leather Jacket',
    price: 249.99,
    oldPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
    rating: 4.5,
    reviews: 789,
    badge: 'SALE',
    badgeColor: 'red',
    sold: 456,
    category: 'fashion',
    stockQuantity: 25,
    stock_quantity: 25,
    slug: 'leather-jacket',
    gender: 'men',
    brand: 'Zara',
    verified: true,
    country: 'Spain',
    yearsInBusiness: 8,
    reorderRate: 80,
    isBestseller: false,
    isTrending: false,
    isNew: false
  }
];

// ============================================================
// Global categories store
// ============================================================

let globalCategories: any[] = [];

export const setGlobalCategories = (categories: any[]) => {
  globalCategories = categories;
  console.log('✅ Global categories set:', categories.length);
};

// ============================================================
// Helpers
// ============================================================

const isValidProduct = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.userId && data.comment && !data.name) {
    console.warn('⚠️ Object is a review, not a product:', data);
    return false;
  }
  if (!data.name || typeof data.price === 'undefined') {
    console.warn('⚠️ Object is missing product properties:', data);
    return false;
  }
  return true;
};

const populateCategoryHierarchy = (product: any): any => {
  if (!product) return product;
  if (product.categorySlug && product.groupSlug && product.subSlug) {
    return product;
  }

  let categorySlug = '';
  let groupSlug = '';
  let subSlug = '';

  if (product.category && globalCategories.length > 0) {
    const category = globalCategories.find(c => 
      c.name?.toLowerCase() === product.category?.toLowerCase() ||
      c.slug === product.category?.toLowerCase().replace(/ /g, '-')
    );
    if (category) {
      categorySlug = category.slug;
      if (product.categoryGroup && category.categoryGroups) {
        const group = category.categoryGroups.find(g => 
          g.name?.toLowerCase() === product.categoryGroup?.toLowerCase() ||
          g.slug === product.categoryGroup?.toLowerCase().replace(/ /g, '-')
        );
        if (group) {
          groupSlug = group.slug;
          if (product.subcategory && group.subCategories) {
            const sub = group.subCategories.find(s => 
              s.name?.toLowerCase() === product.subcategory?.toLowerCase() ||
              s.slug === product.subcategory?.toLowerCase().replace(/ /g, '-')
            );
            if (sub) {
              subSlug = sub.slug;
            }
          }
        }
      }
    }
  }

  if (!categorySlug && product.category) {
    categorySlug = product.category.toLowerCase().replace(/ /g, '-');
  }
  if (!groupSlug && product.categoryGroup) {
    groupSlug = product.categoryGroup.toLowerCase().replace(/ /g, '-');
  }
  if (!subSlug && product.subcategory) {
    subSlug = product.subcategory.toLowerCase().replace(/ /g, '-');
  }
  if (product.gender && !categorySlug) {
    categorySlug = product.gender === 'women' ? 'women' : 
                   product.gender === 'men' ? 'men' : 
                   product.gender === 'kids' ? 'kids' : 
                   product.gender === 'unisex' ? 'unisex' : product.gender;
  }

  return {
    ...product,
    categorySlug: categorySlug || product.categorySlug,
    groupSlug: groupSlug || product.groupSlug,
    subSlug: subSlug || product.subSlug,
  };
};

// ============================================================
// API Calls
// ============================================================

export const getAllProducts = async (params?: any): Promise<Product[]> => {
  try {
    const res = await api.get('/products', { params });
    if (res.data && res.data.data && res.data.data.length > 0) {
      const validProducts = res.data.data
        .filter((p: any) => isValidProduct(p))
        .map((p: any) => {
          const parsed = parseProductImages(p);
          return populateCategoryHierarchy(parsed);
        });
      if (validProducts.length > 0) {
        console.log(`✅ Fetched ${validProducts.length} valid products from API`);
        return validProducts;
      }
      console.log('⚠️ No valid products found in API response');
    }
    console.log('Using mock products (API returned empty or invalid)');
    return MOCK_PRODUCTS;
  } catch (error) {
    console.error('Error fetching products:', error);
    return MOCK_PRODUCTS;
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!id || typeof id !== 'string' || id.length < 5) {
    console.warn(`⚠️ Invalid product ID: "${id}"`);
    return undefined;
  }

  try {
    const res = await api.get(`/products/${id}`, {
      timeout: 5000
    });
    if (res.data && res.data.data) {
      if (!isValidProduct(res.data.data)) {
        console.warn(`⚠️ API returned invalid product data for ID: ${id}`);
        return undefined;
      }
      const parsed = parseProductImages(res.data.data);
      return populateCategoryHierarchy(parsed);
    }
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    if (mockProduct) {
      return populateCategoryHierarchy(mockProduct);
    }
    console.warn(`⚠️ Product ${id} not found`);
    return undefined;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`⚠️ Product ${id} not found (404)`);
      return undefined;
    }
    console.error(`Error fetching product ${id}:`, error);
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    return mockProduct ? populateCategoryHierarchy(mockProduct) : undefined;
  }
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  if (!ids || ids.length === 0) return [];
  const validIds = ids.filter(id => id && typeof id === 'string' && id.length > 5);
  if (validIds.length === 0) {
    console.warn('⚠️ No valid product IDs provided');
    return [];
  }

  try {
    const productPromises = validIds.map(async (id) => {
      try {
        const product = await getProductById(id);
        return product;
      } catch (error) {
        console.warn(`Failed to fetch product ${id}:`, error);
        return undefined;
      }
    });
    const products = await Promise.all(productPromises);
    const validProducts = products.filter((p): p is Product => p !== undefined);
    if (validProducts.length < validIds.length) {
      console.log(`🧹 Filtered out ${validIds.length - validProducts.length} invalid products`);
    }
    return validProducts;
  } catch (error) {
    console.error('Error fetching multiple products:', error);
    return [];
  }
};

export const getProductsByGender = async (gender: string): Promise<Product[]> => {
  return getAllProducts({ gender });
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return getAllProducts({ category });
};

export const getProductsBySubCategory = async (subcategory: string): Promise<Product[]> => {
  return getAllProducts({ subcategory });
};

export const getProductsByCategoryGroup = async (categoryGroup: string): Promise<Product[]> => {
  return getAllProducts({ categoryGroup });
};

// ============================================================
// ✅ FIXED: searchProducts accepts string OR params object
// ============================================================

export const searchProducts = async (queryOrParams: string | any): Promise<Product[]> => {
  let params: any = {};
  if (typeof queryOrParams === 'string') {
    params.search = queryOrParams;
  } else {
    // Flat object – no nesting
    params = { ...queryOrParams };
  }

  try {
    const products = await getAllProducts(params);
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    // Fallback: filter mock products locally
    let filtered = MOCK_PRODUCTS;
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      );
    }
    if (params.gender) {
      filtered = filtered.filter(p => p.gender === params.gender);
    }
    if (params.category) {
      filtered = filtered.filter(p => p.category === params.category);
    }
    if (params.subcategory) {
      filtered = filtered.filter(p => p.subcategory === params.subcategory);
    }
    if (params.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= params.maxPrice);
    }
    return filtered;
  }
};

// ============================================================
// CRUD operations
// ============================================================

export const addProduct = async (productData: any): Promise<Product> => {
  try {
    const res = await api.post('/products', productData);
    return res.data.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, updates: any): Promise<Product | null> => {
  try {
    const res = await api.put(`/products/${id}`, updates);
    return res.data.data;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/products/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

export const deleteManyProducts = async (ids: string[]): Promise<number> => {
  try {
    const res = await api.post('/products/delete-many', { ids });
    return res.data.deletedCount || 0;
  } catch (error) {
    console.error('Error deleting products:', error);
    return 0;
  }
};

export const getTrendingProducts = async (limit = 8): Promise<Product[]> => {
  try {
    const products = await getAllProducts({ limit, trending: true });
    return products.slice(0, limit);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return MOCK_PRODUCTS.filter(p => p.isTrending).slice(0, limit);
  }
};

export const getSaleProducts = async (limit = 8): Promise<Product[]> => {
  try {
    const products = await getAllProducts({ limit, sale: true });
    return products.slice(0, limit);
  } catch (error) {
    console.error('Error fetching sale products:', error);
    return MOCK_PRODUCTS.filter(p => p.oldPrice).slice(0, limit);
  }
};

export const getNewProducts = async (limit = 8): Promise<Product[]> => {
  try {
    const products = await getAllProducts({ limit, new: true });
    return products.slice(0, limit);
  } catch (error) {
    console.error('Error fetching new products:', error);
    return MOCK_PRODUCTS.filter(p => p.isNew).slice(0, limit);
  }
};

// ============================================================
// Legacy/compat object
// ============================================================

export const productService = {
  getAll: getAllProducts,
  getById: getProductById,
  getByIds: getProductsByIds,
  getByGender: getProductsByGender,
  getByCategory: getProductsByCategory,
  getBySubCategory: getProductsBySubCategory,
  getByCategoryGroup: getProductsByCategoryGroup,
  search: searchProducts,
  add: addProduct,
  addProduct,
  update: updateProduct,
  delete: deleteProduct,
  deleteMany: deleteManyProducts,
  getTrending: getTrendingProducts,
  getSale: getSaleProducts,
  getNew: getNewProducts,
};

export default productService;
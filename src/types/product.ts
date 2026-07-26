export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  category_id: string;
  category_group?: string;
  category_group_id?: string;
  sub_category_id?: string;
  subcategory?: string;
  gender: 'women' | 'men' | 'kids' | 'unisex';
  brand: string;
  brand_id: string;
  rating: number;
  reviews: number;
  badge?: string;
  badgeColor?: string;
  isNew: boolean;
  isTrending: boolean;
  isSale: boolean;
  isBestseller?: boolean;
  description: string;
  variants?: ProductVariant[];
  tags?: string[];
  slug?: string;
  path?: string;
  category_slug?: string;
  subcategory_slug?: string;
  stock_quantity?: number;
  sku?: string;
  status?: 'active' | 'draft' | 'archived';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  createdAt: Date;
  updatedAt: Date;

  // 🆕 NEW FIELDS - Match your form field names!
  verified?: boolean;           // ✅ Verified badge
  country?: string;             // ✅ Country
  yearsInBusiness?: number;     // ✅ Years in business
  moq?: number;                 // ✅ Minimum Order Quantity
  moqUnit?: string;             // ✅ MOQ Unit
  sold?: number;                // ✅ Units Sold
  reorderRate?: number;         // ✅ Reorder Rate
  
  // Additional badge fields from your form
  isSizeInclusive?: boolean;
  isMaternity?: boolean;
  isAdaptive?: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender?: 'women' | 'men' | 'kids' | 'unisex';
  parentId?: string;
  order?: number;
  image?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  order?: number;
  image?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

// Helper functions
export const getSubCategories = (subcategories: Subcategory[], categoryId: string): Subcategory[] => {
  return subcategories.filter(sub => sub.category_id === categoryId);
};

export const getCategoryBySlug = (categories: Category[], slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};

export const getSubcategoryBySlug = (subcategories: Subcategory[], slug: string): Subcategory | undefined => {
  return subcategories.find(sub => sub.slug === slug);
};

// Helper function to calculate discount percentage
export const getDiscountPercentage = (product: Product): number => {
  if (product.oldPrice && product.price) {
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }
  return 0;
};

// Helper function to format MOQ
export const formatMOQ = (moq: number): string => {
  if (moq >= 1000) return `${(moq / 1000).toFixed(1)}K`;
  if (moq >= 1000000) return `${(moq / 1000000).toFixed(1)}M`;
  return moq.toString();
};

// Helper function to format units sold
export const formatUnitsSold = (units: number): string => {
  if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`;
  if (units >= 1000) return `${(units / 1000).toFixed(1)}K`;
  return units.toString();
};
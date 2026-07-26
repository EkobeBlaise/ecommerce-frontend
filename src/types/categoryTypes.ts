// Category Types - New Structure
export interface Category {
  id: string;
  name: string;           // Women, Men, Kids
  slug: string;           // women, men, kids
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryGroup {
  id: string;
  name: string;           // NEW IN, Clothing, Shoes, etc.
  slug: string;           // new-in, clothing, shoes, etc.
  categoryId: string;     // References Category.id (women, men, kids)
  icon: string;           // Icon name for display
  image?: string;         // Image for mega menu
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: string;
  name: string;           // Dresses, T-Shirts, Sneakers, etc.
  slug: string;           // dresses, t-shirts, sneakers, etc.
  categoryGroupId: string; // References CategoryGroup.id
  categoryId: string;     // References Category.id (for quick filtering)
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  description: string;
  category_id: string;         // References Category.id
  category_group_id: string;   // References CategoryGroup.id
  sub_category_id: string;     // References SubCategory.id
  gender: 'women' | 'men' | 'kids';
  brand: string;
  brand_id?: string;
  sku: string;
  stock_quantity: number;
  // ... rest of product fields
}

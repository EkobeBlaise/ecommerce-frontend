import { Product } from './productService';

let products: Product[] = [
  {
    id: '1',
    name: 'Floral Summer Dress',
    price: 49.99,
    oldPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop',
    category: 'Clothing',
    categoryId: 1,
    gender: 'women',
    brand: 'Zara',
    brandId: 3,
    rating: 4.5,
    reviews: 128,
    badge: 'SALE',
    badgeColor: 'red',
    isNew: false,
    isTrending: true,
    isSale: true,
    description: 'Beautiful floral dress perfect for summer days',
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '2',
    name: 'Classic White Sneakers',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
    category: 'Shoes',
    categoryId: 2,
    gender: 'unisex',
    brand: 'Nike',
    brandId: 1,
    rating: 4.8,
    reviews: 245,
    badge: 'TRENDING',
    badgeColor: 'orange',
    isNew: true,
    isTrending: true,
    isSale: false,
    description: 'Classic white sneakers, versatile and comfortable',
    createdAt: new Date('2024-06-01'),
  },
];

export const getAllProducts = (): Product[] => {
  return products;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const addProduct = (product: Product): void => {
  products.push(product);
};

export const updateProduct = (id: string, updatedProduct: Product): void => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = updatedProduct;
  }
};

export const deleteProduct = (id: string): void => {
  products = products.filter(p => p.id !== id);
};

export const getFilteredProducts = (filters: any): Product[] => {
  let filtered = [...products];
  
  if (filters.gender && filters.gender !== 'all') {
    filtered = filtered.filter(p => p.gender === filters.gender || p.gender === 'unisex');
  }
  
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
  }
  
  if (filters.brand && filters.brand !== 'all') {
    filtered = filtered.filter(p => p.brand.toLowerCase() === filters.brand?.toLowerCase());
  }
  
  if (filters.minPrice) {
    filtered = filtered.filter(p => p.price >= filters.minPrice);
  }
  
  if (filters.maxPrice) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice);
  }
  
  if (filters.minDiscount) {
    filtered = filtered.filter(p => p.oldPrice && ((p.oldPrice - p.price) / p.oldPrice * 100) >= filters.minDiscount);
  }
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }
  }
  
  return filtered;
};

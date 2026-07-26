import { getAllProducts } from './productService';
import { Category, Subcategory } from '../types/product';

// Get all unique categories from products (async)
export const getCategories = async (): Promise<string[]> => {
  const products = await getAllProducts(); // ✅ await the Promise
  const categories = new Set<string>();
  // Ensure products is an array (safety)
  if (!Array.isArray(products)) return [];
  products.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories);
};

// Get all unique subcategories (async)
export const getAllSubCategories = async (): Promise<string[]> => {
  const products = await getAllProducts();
  if (!Array.isArray(products)) return [];
  const subcategories = new Set<string>();
  products.forEach(p => {
    if (p.subcategory) subcategories.add(p.subcategory);
  });
  return Array.from(subcategories);
};

// Get subcategories for a specific category (async)
export const getSubCategories = async (category: string): Promise<string[]> => {
  const products = await getAllProducts();
  if (!Array.isArray(products)) return [];
  const subcategories = new Set<string>();
  products.forEach(p => {
    if (p.category === category && p.subcategory) {
      subcategories.add(p.subcategory);
    }
  });
  return Array.from(subcategories);
};

// Get products by category (async)
export const getProductsByCategory = async (category: string): Promise<any[]> => {
  const products = await getAllProducts();
  if (!Array.isArray(products)) return [];
  return products.filter(p => p.category === category);
};

// Get products by subcategory (async)
export const getProductsBySubCategory = async (subcategory: string): Promise<any[]> => {
  const products = await getAllProducts();
  if (!Array.isArray(products)) return [];
  return products.filter(p => p.subcategory === subcategory);
};

// Get category by subcategory (async)
export const getCategoryBySubCategory = async (subcategory: string): Promise<string | null> => {
  const products = await getAllProducts();
  if (!Array.isArray(products)) return null;
  for (const p of products) {
    if (p.subcategory === subcategory && p.category) {
      return p.category;
    }
  }
  return null;
};

// Save categories to localStorage (async)
export const saveCategoriesToLocalStorage = async (): Promise<void> => {
  const categories = await getCategories();
  try {
    localStorage.setItem('categories', JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

// Load categories from localStorage (sync)
export const loadCategoriesFromLocalStorage = (): string[] => {
  try {
    const saved = localStorage.getItem('categories');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

export default {
  getCategories,
  getAllSubCategories,
  getSubCategories,
  getProductsByCategory,
  getProductsBySubCategory,
  getCategoryBySubCategory,
  saveCategoriesToLocalStorage,
  loadCategoriesFromLocalStorage
};
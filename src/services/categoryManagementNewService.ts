import { Category, CategoryGroup, SubCategory } from '../types/categoryTypes';
import api from './api';

class CategoryManagementNewService {
  // ==================== CATEGORIES ====================
  async getCategories(): Promise<Category[]> {
    try {
      const res = await api.get('/categories');
      // ✅ Ensure we always return an array
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    try {
      const res = await api.get(`/categories/${id}`);
      return res.data?.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      return undefined;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    // ✅ Case insensitive search
    return categories.find(c => c.slug?.toLowerCase() === slug?.toLowerCase());
  }

  async addCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const res = await api.post('/categories', data);
    return res.data.data;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    try {
      const res = await api.put(`/categories/${id}`, data);
      return res.data.data;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await api.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // ==================== CATEGORY GROUPS ====================
  async getCategoryGroups(categoryId?: string): Promise<CategoryGroup[]> {
    try {
      // If categoryId is provided, get groups for that category only
      if (categoryId) {
        const res = await api.get(`/categories/${categoryId}/groups`);
        return res.data?.data || [];
      }
      
      // Otherwise get all groups
      const res = await api.get('/categories/groups');
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching category groups:', error);
      return [];
    }
  }

  async getCategoryGroupsBySlug(slug: string): Promise<CategoryGroup[]> {
    try {
      const res = await api.get(`/categories/slug/${slug}/groups`);
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching category groups by slug:', error);
      return [];
    }
  }

  async getCategoryGroupById(id: string): Promise<CategoryGroup | undefined> {
    try {
      const res = await api.get(`/categories/groups/${id}`);
      return res.data?.data;
    } catch (error) {
      console.error('Error fetching category group:', error);
      return undefined;
    }
  }

  async addCategoryGroup(data: Omit<CategoryGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryGroup> {
    const res = await api.post('/categories/groups', data);
    return res.data.data;
  }

  async updateCategoryGroup(id: string, data: Partial<CategoryGroup>): Promise<CategoryGroup | null> {
    try {
      const res = await api.put(`/categories/groups/${id}`, data);
      return res.data.data;
    } catch (error) {
      console.error('Error updating category group:', error);
      return null;
    }
  }

  async deleteCategoryGroup(id: string): Promise<boolean> {
    try {
      await api.delete(`/categories/groups/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting category group:', error);
      return false;
    }
  }

  // ==================== SUB-CATEGORIES ====================
  // ✅ FIXED: Correct endpoint path
  async getSubCategoriesByGroup(categoryGroupId: string): Promise<SubCategory[]> {
    try {
      const res = await api.get(`/categories/groups/${categoryGroupId}/subcategories`);
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      return [];
    }
  }

  async getSubCategoryById(id: string): Promise<SubCategory | undefined> {
    try {
      const res = await api.get(`/categories/subcategories/${id}`);
      return res.data?.data;
    } catch (error) {
      console.error('Error fetching sub-category:', error);
      return undefined;
    }
  }

  async addSubCategory(data: Omit<SubCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubCategory> {
    const res = await api.post('/categories/subcategories', data);
    return res.data.data;
  }

  async updateSubCategory(id: string, data: Partial<SubCategory>): Promise<SubCategory | null> {
    try {
      const res = await api.put(`/categories/subcategories/${id}`, data);
      return res.data.data;
    } catch (error) {
      console.error('Error updating sub-category:', error);
      return null;
    }
  }

  async deleteSubCategory(id: string): Promise<boolean> {
    try {
      await api.delete(`/categories/subcategories/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      return false;
    }
  }

  // ==================== HELPER ====================
  async resetToDefaults() {
    console.warn('resetToDefaults is not implemented for API mode. Use backend seeding.');
  }
}

export const categoryManagementNewService = new CategoryManagementNewService();
export default categoryManagementNewService;
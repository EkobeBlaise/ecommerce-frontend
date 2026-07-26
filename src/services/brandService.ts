import api from './api';
import { Brand } from '../types/brand';

// Helper to generate slug (kept for frontend use, though backend can also generate)
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const brandService = {
  // Get all brands
  getAll: async (): Promise<Brand[]> => {
    try {
      const res = await api.get('/brands');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  },

  // Get active brands
  getActive: async (): Promise<Brand[]> => {
    const brands = await brandService.getAll();
    return brands.filter(b => b.status === 'active');
  },

  // Get featured brands
  getFeatured: async (): Promise<Brand[]> => {
    const brands = await brandService.getAll();
    return brands.filter(b => b.featured && b.status === 'active');
  },

  // Get brand by ID
  getById: async (id: string): Promise<Brand | null> => {
    try {
      const res = await api.get(`/brands/${id}`);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching brand:', error);
      return null;
    }
  },

  // Get brand by slug
  getBySlug: async (slug: string): Promise<Brand | null> => {
    const brands = await brandService.getAll();
    return brands.find(b => b.slug === slug) || null;
  },

  // Create new brand
  create: async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> => {
    try {
      const res = await api.post('/brands', brandData);
      return res.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create brand');
    }
  },

  // Update brand
  update: async (id: string, updates: Partial<Brand>): Promise<Brand | null> => {
    try {
      const res = await api.put(`/brands/${id}`, updates);
      return res.data.data;
    } catch (error: any) {
      console.error('Error updating brand:', error);
      throw new Error(error.response?.data?.message || 'Failed to update brand');
    }
  },

  // Delete brand
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/brands/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete brand');
    }
  },

  // Get products by brand (requires productService, but we can call the API directly)
  getProducts: async (brandId: string) => {
    const res = await api.get('/products', { params: { brand_id: brandId } });
    return res.data.data;
  },

  // Get brand statistics (returns brands with product count)
  getStats: async () => {
    const brands = await brandService.getAll();
    // We could fetch product counts per brand via API, but for simplicity we'll use getWithCount
    return brandService.getWithCount();
  },

  // Get brands with product count
  getWithCount: async (): Promise<(Brand & { productsCount: number })[]> => {
    try {
      const res = await api.get('/brands/with-count');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching brands with count:', error);
      // Fallback: get all brands and count products manually (less efficient)
      const brands = await brandService.getAll();
      const products = await api.get('/products').then(r => r.data.data);
      return brands.map(brand => ({
        ...brand,
        productsCount: products.filter((p: any) => p.brand_id === brand.id).length,
      }));
    }
  },

  // Search brands
  search: async (query: string): Promise<Brand[]> => {
    const brands = await brandService.getAll();
    const lowerQuery = query.toLowerCase();
    return brands.filter(b => 
      b.name.toLowerCase().includes(lowerQuery) ||
      (b.description && b.description.toLowerCase().includes(lowerQuery))
    );
  },

  // Initialize with sample brands (only if no brands exist)
  initializeWithSample: async (): Promise<void> => {
    try {
      const existing = await brandService.getAll();
      if (existing.length > 0) return;

      const sampleBrands: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', description: 'Just Do It. Leading sports brand.', featured: true, status: 'active' },
        { name: 'Adidas', slug: 'adidas', logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=100&h=100&fit=crop', description: 'Impossible is Nothing.', featured: true, status: 'active' },
        { name: 'Zara', slug: 'zara', logo: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100&h=100&fit=crop', description: 'Fast fashion for everyone.', featured: true, status: 'active' },
        { name: 'H&M', slug: 'hm', logo: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=100&fit=crop', description: 'Fashion and quality at the best price.', featured: false, status: 'active' },
        { name: 'Gucci', slug: 'gucci', logo: 'https://images.unsplash.com/photo-1584917865445-de89df76afd3?w=100&h=100&fit=crop', description: 'Luxury fashion house.', featured: true, status: 'active' },
        { name: "Levi's", slug: 'levis', logo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop', description: 'Original denim jeans.', featured: false, status: 'active' },
        { name: 'BOSS', slug: 'boss', logo: 'https://images.unsplash.com/photo-1617137968427-85924c800c5e?w=100&h=100&fit=crop', description: 'Tailored fashion for men.', featured: false, status: 'active' },
        { name: 'Tommy Hilfiger', slug: 'tommy-hilfiger', logo: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=100&h=100&fit=crop', description: 'American classic style.', featured: false, status: 'active' },
      ];
      
      for (const b of sampleBrands) {
        await brandService.create(b);
      }
    } catch (error) {
      console.error('Error initializing sample brands:', error);
    }
  },
};

export default brandService;
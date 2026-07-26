import api from './api';
import { Coupon, CouponUsage, CouponStats } from '../types/coupon';

export const couponService = {
  // Get all coupons
  async getAll(): Promise<Coupon[]> {
    try {
      const res = await api.get('/coupons');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }
  },

  // Get coupon by ID
  async getById(id: string): Promise<Coupon | null> {
    try {
      const res = await api.get(`/coupons/${id}`);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Get coupon by code
  async getByCode(code: string): Promise<Coupon | null> {
    try {
      const res = await api.get(`/coupons/code/${code}`);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Create new coupon
  async create(couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<Coupon> {
    const res = await api.post('/coupons', couponData);
    return res.data.data;
  },

  // Update coupon
  async update(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    try {
      const res = await api.put(`/coupons/${id}`, updates);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Delete coupon
  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/coupons/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  // Validate coupon
  async validate(code: string, subtotal: number, userId?: string): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
    try {
      const res = await api.post('/coupons/validate', { code, subtotal, userId });
      return res.data.data;
    } catch (error: any) {
      return { valid: false, message: error.response?.data?.message || 'Invalid coupon' };
    }
  },

  // Apply coupon
  async apply(code: string, subtotal: number, userId?: string): Promise<{ discount: number; message?: string }> {
    try {
      const res = await api.post('/coupons/apply', { code, subtotal, userId });
      return res.data.data;
    } catch (error: any) {
      return { discount: 0, message: error.response?.data?.message || 'Failed to apply coupon' };
    }
  },

  // Record coupon usage
  async recordUsage(couponId: string, userId: string, orderId: string, discountAmount: number): Promise<void> {
    await api.post('/coupons/usage', { couponId, userId, orderId, discountAmount });
  },

  // Get coupon usages
  async getUsages(): Promise<CouponUsage[]> {
    try {
      const res = await api.get('/coupons/usages');
      return res.data.data;
    } catch {
      return [];
    }
  },

  // Get user's coupon usage
  async getUserUsage(couponId: string, userId: string): Promise<CouponUsage[]> {
    try {
      const res = await api.get(`/coupons/usages/${couponId}/user/${userId}`);
      return res.data.data;
    } catch {
      return [];
    }
  },

  // Get coupon stats
  async getStats(): Promise<CouponStats> {
    try {
      const res = await api.get('/coupons/stats');
      return res.data.data;
    } catch {
      return {
        totalCoupons: 0,
        activeCoupons: 0,
        expiredCoupons: 0,
        disabledCoupons: 0,
        totalUsage: 0,
        totalDiscount: 0,
      };
    }
  },

  // Generate random coupon code
  generateCode: (prefix?: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}_${code}` : code;
  },

  // Get coupons by status
  async getByStatus(status: Coupon['status']): Promise<Coupon[]> {
    try {
      const res = await api.get(`/coupons/status/${status}`);
      return res.data.data;
    } catch {
      return [];
    }
  },

  // Get active coupons
  async getActive(): Promise<Coupon[]> {
    try {
      const res = await api.get('/coupons/active');
      return res.data.data;
    } catch {
      return [];
    }
  },

  // Delete expired coupons
  async deleteExpired(): Promise<number> {
    try {
      const res = await api.delete('/coupons/expired');
      return res.data.deletedCount || 0;
    } catch {
      return 0;
    }
  },
};

export default couponService;
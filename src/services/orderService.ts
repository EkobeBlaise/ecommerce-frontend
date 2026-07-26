import api from './api';
import { Order, OrderAddress, OrderItem, OrderStatusHistory } from '../types/order';

export const orderService = {
  // Get all orders
  async getAll(params?: any): Promise<Order[]> {
    try {
      const res = await api.get('/orders', { params });
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Get order by ID
  async getById(id: string): Promise<Order | null> {
    try {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Get orders by user ID
  async getByUserId(userId: string): Promise<Order[]> {
    try {
      const res = await api.get(`/orders/user/${userId}`);
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching orders by user:', error);
      return [];
    }
  },

  // Get orders by status
  async getByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const res = await api.get('/orders', { params: { status } });
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  },

  // Create new order
  async create(orderData: any): Promise<Order> {
    try {
      const res = await api.post('/orders', orderData);
      return res.data.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      // Re-throw with a user-friendly message
      const message = error.response?.data?.message || 'Failed to create order';
      throw new Error(message);
    }
  },

  // Update order status
  async updateStatus(id: string, status: Order['status'], note?: string): Promise<Order | null> {
    try {
      const res = await api.put(`/orders/${id}/status`, { status, note });
      return res.data.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  },

  // Update payment status
  async updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Promise<Order | null> {
    try {
      const res = await api.put(`/orders/${id}/payment`, { paymentStatus });
      return res.data.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return null;
    }
  },

  // Add tracking number
  async addTracking(id: string, trackingNumber: string): Promise<Order | null> {
    try {
      const res = await api.put(`/orders/${id}/tracking`, { trackingNumber });
      return res.data.data;
    } catch (error) {
      console.error('Error adding tracking:', error);
      return null;
    }
  },

  // Get status history
  getStatusHistory(orderId: string): OrderStatusHistory[] {
    // For now return empty; can implement if needed
    return [];
  },

  // Get statistics
  async getStatistics(): Promise<any> {
    try {
      const res = await api.get('/orders/stats');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {};
    }
  },

  // Get recent orders
  async getRecent(limit: number = 10): Promise<Order[]> {
    try {
      const res = await api.get('/orders/recent', { params: { limit } });
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  },

  // Search orders
  async search(query: string): Promise<Order[]> {
    try {
      const res = await api.get('/orders', { params: { search: query } });
      return res.data.data || [];
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  },

  // Delete order
  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/orders/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  },

  // Get orders by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const res = await api.get('/orders/date-range', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching orders by date range:', error);
      return [];
    }
  },

  // Get monthly revenue
  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    try {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      const orders = await this.getByDateRange(start, end);
      return orders.reduce((sum, o) => sum + o.total, 0);
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return 0;
    }
  },

  // Get dashboard stats
  async getDashboardStats(): Promise<any> {
    try {
      const res = await api.get('/orders/dashboard');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {};
    }
  },

  // Migrate old orders
  migrateOldOrders: (): void => {
    console.log('Migration not needed with API');
  },
};

export default orderService;
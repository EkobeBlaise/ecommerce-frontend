import api from './api';
import { Customer, CustomerActivity, CustomerGroup } from '../types/customer';
import { orderService } from './orderService'; // might not be needed for API version

export const customerService = {
  // Get all customers
  async getAll(): Promise<Customer[]> {
    try {
      const res = await api.get('/customers');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  // Get customer by ID
  async getById(id: string): Promise<Customer | null> {
    try {
      const res = await api.get(`/customers/${id}`);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Get customer by email (we can implement a search endpoint, but for now we fetch all and filter)
  async getByEmail(email: string): Promise<Customer | null> {
    const customers = await this.getAll();
    return customers.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Create new customer (registration is handled via auth/register, but we keep for admin creation)
  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalOrders' | 'totalSpent'>): Promise<Customer> {
    const res = await api.post('/customers', customerData);
    return res.data.data;
  },

  // Update customer
  async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    try {
      const res = await api.put(`/customers/${id}`, updates);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Delete customer
  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/customers/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  // Get customer statistics
  async getStats() {
    const res = await api.get('/customers/stats');
    return res.data.data;
  },

  // Get customer activity (we may need a separate model; for now return empty)
  async getCustomerActivity(customerId: string): Promise<CustomerActivity[]> {
    // Could be implemented separately; return empty array for now
    return [];
  },

  // Add customer activity (not implemented on backend, no-op)
  addActivity: (customerId: string, action: string, details: any): void => {
    // Not implemented; you can add a backend later
  },

  // Get top customers
  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    const res = await api.get('/customers/top', { params: { limit } });
    return res.data.data;
  },

  // Get recent customers
  async getRecent(limit: number = 10): Promise<Customer[]> {
    const res = await api.get('/customers/recent', { params: { limit } });
    return res.data.data;
  },

  // Search customers
  async search(query: string): Promise<Customer[]> {
    const customers = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return customers.filter(c =>
      c.first_name?.toLowerCase().includes(lowerQuery) ||
      c.last_name?.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery)
    );
  },

  // Update customer status
  async updateStatus(id: string, status: Customer['status']): Promise<Customer | null> {
    const res = await api.put(`/customers/${id}/status`, { status });
    return res.data.data;
  },

  // Customer groups - if needed, you can create separate endpoints
  async getGroups(): Promise<CustomerGroup[]> {
    // Not implemented; return empty
    return [];
  },
  async createGroup(groupData: any): Promise<CustomerGroup> {
    throw new Error('Not implemented');
  },
  async addToGroup(groupId: string, customerId: string): Promise<boolean> {
    return false;
  },
  async removeFromGroup(groupId: string, customerId: string): Promise<boolean> {
    return false;
  },
};

export default customerService;
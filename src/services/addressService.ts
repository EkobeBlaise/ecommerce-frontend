import api from './api';
import { Address } from '../components/AddressBook';

export const addressService = {
  // Get all addresses for a user
  async getByUserId(userId: string): Promise<Address[]> {
    try {
      const res = await api.get(`/addresses/user/${userId}`);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  },

  // Get address by ID
  async getById(id: string): Promise<Address | null> {
    try {
      const res = await api.get(`/addresses/${id}`);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  },

  // Create new address
  async create(data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const res = await api.post('/addresses', data);
    return res.data.data;
  },

  // Update address
  async update(id: string, data: Partial<Address>): Promise<Address> {
    const res = await api.put(`/addresses/${id}`, data);
    return res.data.data;
  },

  // Delete address
  async delete(id: string): Promise<boolean> {
    await api.delete(`/addresses/${id}`);
    return true;
  },

  // Set address as default
  async setDefault(id: string): Promise<Address> {
    const res = await api.put(`/addresses/${id}/default`);
    return res.data.data;
  },
};

export default addressService;
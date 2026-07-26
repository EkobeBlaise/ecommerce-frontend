import api from './api';

export interface FlashSale {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  soldCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  limitPerCustomer: number;
}

export const flashSaleService = {
  async getAll(): Promise<FlashSale[]> {
    const res = await api.get('/flash-sales');
    return res.data.data;
  },

  async getById(id: string): Promise<FlashSale | null> {
    const res = await api.get(`/flash-sales/${id}`);
    return res.data.data;
  },

  async create(data: Omit<FlashSale, 'id' | 'soldCount' | 'discount'>): Promise<FlashSale> {
    const res = await api.post('/flash-sales', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<FlashSale>): Promise<FlashSale | null> {
    const res = await api.put(`/flash-sales/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/flash-sales/${id}`);
    return true;
  },
};

export default flashSaleService;
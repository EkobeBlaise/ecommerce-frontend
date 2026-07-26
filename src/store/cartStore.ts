import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  brand?: string;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  clearCart: () => void;
  
  // Calculations
  getSubtotal: () => number;
  getItemCount: () => number;
  getSavedCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      
      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: item.quantity || 1 }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map(i =>
              i.id === id ? { ...i, quantity } : i
            )
          });
        }
      },
      
      saveForLater: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) {
          set({
            items: get().items.filter(i => i.id !== id),
            savedForLater: [...get().savedForLater, item]
          });
        }
      },
      
      moveToCart: (id) => {
        const item = get().savedForLater.find(i => i.id === id);
        if (item) {
          set({
            savedForLater: get().savedForLater.filter(i => i.id !== id),
            items: [...get().items, item]
          });
        }
      },
      
      clearCart: () => set({ items: [], savedForLater: [] }),
      
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getSavedCount: () => {
        return get().savedForLater.length;
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: false,
    }
  )
);

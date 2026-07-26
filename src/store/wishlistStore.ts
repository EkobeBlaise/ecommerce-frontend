import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  getTotalItems: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items;
        const exists = items.some(i => i.id === item.id);
        
        if (!exists) {
          set({ items: [...items, item] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      
      isInWishlist: (id) => {
        return get().items.some(i => i.id === id);
      },
      
      getTotalItems: () => {
        return get().items.length;
      },
      
      clearWishlist: () => {
        set({ items: [] });
      }
    }),
    {
      name: 'wishlist-storage'
    }
  )
);

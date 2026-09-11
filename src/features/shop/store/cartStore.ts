import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { featureFlags } from '../../../core/feature-flags/featureFlags';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const maxItems = featureFlags.get().maxCartItems;
        const current = get().items;
        const existing = current.find((i) => i.productId === item.productId);

        if (existing) {
          const newQty = existing.quantity + quantity;
          if (newQty > maxItems) return;
          set({
            items: current.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQty } : i,
            ),
          });
        } else {
          if (current.length >= maxItems) return;
          set({ items: [...current, { ...item, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'ayurvedic-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

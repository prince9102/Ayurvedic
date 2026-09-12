import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ item: Omit<CartItem, 'quantity'>; quantity?: number }>) {
      const { item, quantity = 1 } = action.payload;
      const maxItems = featureFlags.get().maxCartItems;
      const existing = state.items.find((i) => i.productId === item.productId);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > maxItems) return;
        existing.quantity = newQty;
      } else {
        if (state.items.length >= maxItems) return;
        state.items.push({ ...item, quantity });
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
        return;
      }
      const item = state.items.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

type State = { cart: CartState };

export const selectCartItems = (state: State) => state.cart.items;
export const selectCartTotal = (state: State) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartItemCount = (state: State) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  productIds: string[];
}

const initialState: WishlistState = {
  productIds: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.productIds.indexOf(id);
      if (idx >= 0) {
        state.productIds.splice(idx, 1);
      } else {
        state.productIds.push(id);
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

type State = { wishlist: WishlistState };

export const selectWishlistIds = (state: State) => state.wishlist.productIds;
export const selectIsWishlisted = (state: State, productId: string) =>
  state.wishlist.productIds.includes(productId);

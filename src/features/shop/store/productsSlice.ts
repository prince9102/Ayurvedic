import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { shopApi, ProductFilters } from '../api/shopApi';
import { Product } from '../../../mocks/generators/products';

interface ProductsState {
  items: Product[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;

  selectedProduct: Product | null;
  selectedProductLoading: boolean;
}

const initialState: ProductsState = {
  items: [],
  page: 0,
  hasMore: true,
  loading: false,
  error: null,
  filters: {},

  selectedProduct: null,
  selectedProductLoading: false,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ filters, page }: { filters: ProductFilters; page: number }) =>
    shopApi.getProducts({ ...filters, page, pageSize: 20 }),
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id: string) => shopApi.getProduct(id),
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
      state.items = [];
      state.page = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.meta.arg.page === 0
          ? action.payload.data
          : [...state.items, ...action.payload.data];
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch products';
      })

      .addCase(fetchProduct.pending, (state) => { state.selectedProductLoading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.selectedProductLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state) => { state.selectedProductLoading = false; });
  },
});

export const { setFilters } = productsSlice.actions;
export default productsSlice.reducer;

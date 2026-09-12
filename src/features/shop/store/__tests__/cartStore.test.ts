import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  selectCartTotal,
  selectCartItemCount,
  CartItem,
} from '../cartSlice';

type CartState = { items: CartItem[] };

const emptyState: CartState = { items: [] };

describe('cartSlice', () => {
  it('adds items to cart', () => {
    const state = cartReducer(
      emptyState,
      addItem({ item: { productId: 'prod-1', name: 'Ashwagandha', price: 299, imageUrl: '' } }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0]!.quantity).toBe(1);
  });

  it('increments quantity for existing items', () => {
    const item = { productId: 'prod-1', name: 'Test', price: 100, imageUrl: '' };
    let state = cartReducer(emptyState, addItem({ item }));
    state = cartReducer(state, addItem({ item, quantity: 2 }));
    expect(state.items[0]!.quantity).toBe(3);
  });

  it('removes item when quantity reaches zero', () => {
    let state = cartReducer(
      emptyState,
      addItem({ item: { productId: 'prod-1', name: 'Test', price: 100, imageUrl: '' } }),
    );
    state = cartReducer(state, updateQuantity({ productId: 'prod-1', quantity: 0 }));
    expect(state.items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    let state = cartReducer(
      emptyState,
      addItem({ item: { productId: 'p1', name: 'A', price: 100, imageUrl: '' }, quantity: 2 }),
    );
    state = cartReducer(
      state,
      addItem({ item: { productId: 'p2', name: 'B', price: 50, imageUrl: '' }, quantity: 1 }),
    );
    expect(selectCartTotal({ cart: state })).toBe(250);
  });

  it('clears cart', () => {
    let state = cartReducer(
      emptyState,
      addItem({ item: { productId: 'p1', name: 'A', price: 100, imageUrl: '' } }),
    );
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
  });
});

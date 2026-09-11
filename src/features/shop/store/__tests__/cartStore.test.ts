import { useCartStore } from '../cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('adds items to cart', () => {
    const { addItem, items } = useCartStore.getState();
    addItem({ productId: 'prod-1', name: 'Ashwagandha', price: 299, imageUrl: '' });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(items[0]?.quantity).toBeUndefined();
    expect(useCartStore.getState().items[0]!.quantity).toBe(1);
  });

  it('increments quantity for existing items', () => {
    const item = { productId: 'prod-1', name: 'Test', price: 100, imageUrl: '' };
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item, 2);
    expect(useCartStore.getState().items[0]!.quantity).toBe(3);
  });

  it('removes item when quantity reaches zero', () => {
    const item = { productId: 'prod-1', name: 'Test', price: 100, imageUrl: '' };
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity('prod-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    useCartStore.getState().addItem(
      { productId: 'p1', name: 'A', price: 100, imageUrl: '' },
      2,
    );
    useCartStore.getState().addItem(
      { productId: 'p2', name: 'B', price: 50, imageUrl: '' },
      1,
    );
    expect(useCartStore.getState().getTotal()).toBe(250);
  });

  it('clears cart', () => {
    useCartStore.getState().addItem(
      { productId: 'p1', name: 'A', price: 100, imageUrl: '' },
    );
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

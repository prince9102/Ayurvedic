import React, { useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { EmptyState } from '../../../shared/components/ui';
import { useToast } from '../../../core/toast/ToastProvider';
import { toggleWishlist, selectWishlistIds } from '../store/wishlistSlice';
import { addItem } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { generateProduct, Product } from '../../../mocks/generators/products';
import { getProductIndex } from '../../../mocks/generators/products';
import { ShopStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ShopStackParamList, 'Wishlist'>;

function WishlistItem({
  item,
  onRemove,
  onAddToCart,
  onPress,
}: {
  item: Product;
  onRemove: (id: string) => void;
  onAddToCart: (item: Product) => void;
  onPress: (id: string) => void;
}) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();

  const hasDiscount = item.originalPrice > item.price;
  const discountPct = hasDiscount
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },
      ]}
    >
      <View>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        {hasDiscount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.discountText}>-{discountPct}%</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={[styles.outOfStockOverlay, { borderRadius: borderRadius.lg }]}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={[styles.content, { padding: spacing.sm }]}>
        <View style={[styles.categoryTag, { backgroundColor: colors.surface }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
        </View>
        <Text
          style={[typography.body, { color: colors.text, marginTop: 4, fontWeight: '600' }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={{ color: '#F4A261', fontSize: 12 }}>★</Text>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {item.rating} ({item.reviewCount})
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[typography.h3, { color: colors.primary }]}>₹{item.price}</Text>
          {hasDiscount && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              ₹{item.originalPrice}
            </Text>
          )}
        </View>
        <View style={[styles.actions, { marginTop: spacing.sm, gap: spacing.xs }]}>
          <TouchableOpacity
            onPress={() => onAddToCart(item)}
            disabled={!item.inStock}
            style={[
              styles.cartBtn,
              {
                backgroundColor: item.inStock ? colors.primary : colors.disabled,
                borderRadius: borderRadius.md,
                flex: 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('shop.addToCart')}
          >
            <Text style={[styles.cartBtnText, { color: colors.textInverse }]}>
              🛒 {t('shop.addToCart')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={[styles.removeBtn, { borderColor: colors.error, borderRadius: borderRadius.md }]}
            accessibilityRole="button"
            accessibilityLabel={t('shop.removeFromWishlist')}
          >
            <Text style={{ color: colors.error, fontSize: 18 }}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

export function WishlistScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const productIds = useAppSelector(selectWishlistIds);

  const products = productIds.map((id) => generateProduct(getProductIndex(id)));

  const handleAddToCart = useCallback(
    (item: Product) => {
      dispatch(addItem({ item: { productId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl } }));
      showToast(t('shop.addedToCart'), 'success');
    },
    [dispatch, showToast, t],
  );

  const handlePress = useCallback(
    (id: string) => navigation.navigate('ProductDetail', { productId: id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <WishlistItem
        item={item}
        onRemove={(id) => dispatch(toggleWishlist(id))}
        onAddToCart={handleAddToCart}
        onPress={handlePress}
      />
    ),
    [dispatch, handleAddToCart, handlePress],
  );

  if (products.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 56, textAlign: 'center' }}>♡</Text>
        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
          {t('shop.emptyWishlist')}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
          {t('shop.title')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.summaryBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <FlashList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={220}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  summaryBar: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  card: { flexDirection: 'row', overflow: 'hidden' },
  image: { width: 110, height: '100%', minHeight: 140 },
  discountBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  content: { flex: 1 },
  categoryTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 11, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  ratingText: { fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  cartBtn: { paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  cartBtnText: { fontSize: 13, fontWeight: '600' },
  removeBtn: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

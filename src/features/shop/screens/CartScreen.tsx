import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Button, EmptyState } from '../../../shared/components/ui';
import { useCartStore, CartItem } from '../store/cartStore';
import { ShopStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ShopStackParamList, 'Cart'>;

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          padding: spacing.md,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          borderRadius: 12,
        },
      ]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ color: colors.primary, fontWeight: '600' }}>₹{item.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => onUpdate(item.productId, item.quantity - 1)}
            accessibilityRole="button"
            accessibilityLabel={t('shop.decreaseQty')}
          >
            <Text style={styles.qtyBtn}>−</Text>
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 12 }}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdate(item.productId, item.quantity + 1)}
            accessibilityRole="button"
            accessibilityLabel={t('shop.increaseQty')}
          >
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(item.productId)}
            style={{ marginLeft: 'auto' }}
            accessibilityRole="button"
            accessibilityLabel="Remove item"
          >
            <Text style={{ color: colors.error }}>{t('shop.remove')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function CartScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemRow item={item} onUpdate={updateQuantity} onRemove={removeItem} />
    ),
    [updateQuantity, removeItem],
  );

  if (items.length === 0) {
    return <EmptyState message={t('shop.emptyCart')} />;
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        estimatedItemSize={100}
      />
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, padding: spacing.md, borderTopColor: colors.border, gap: spacing.sm },
        ]}
      >
        <Text style={[typography.h3, { color: colors.text }]}>
          {t('shop.total')}: ₹{getTotal()}
        </Text>
        <Button
          title={t('shop.checkout')}
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row' },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { fontSize: 20, fontWeight: '600', paddingHorizontal: 8 },
  footer: { borderTopWidth: 1 },
});

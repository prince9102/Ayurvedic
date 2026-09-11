import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useToast } from '../../../core/toast/ToastProvider';
import { Button, LoadingOverlay } from '../../../shared/components/ui';
import { useProduct } from '../hooks/useShop';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { ShopStackParamList } from '../navigation/types';

type Route = RouteProp<ShopStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { showToast } = useToast();
  const route = useRoute<Route>();
  const { productId } = route.params;

  const { data: product, isLoading } = useProduct(productId);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();

  if (isLoading || !product) return <LoadingOverlay />;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    showToast(t('shop.addedToCart'), 'success');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        accessibilityLabel={product.name}
      />
      <View style={{ padding: spacing.md }}>
        <Text style={[typography.h1, { color: colors.text }]}>{product.name}</Text>
        <Text style={[typography.h2, { color: colors.primary, marginTop: spacing.sm }]}>
          ₹{product.price}
          {product.originalPrice > product.price && (
            <Text style={{ color: colors.textSecondary, fontSize: 16, textDecorationLine: 'line-through' }}>
              {' '}₹{product.originalPrice}
            </Text>
          )}
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
          ★ {product.rating} ({product.reviewCount} {t('shop.reviews')}) · {product.category}
        </Text>
        <Text style={[typography.body, { color: colors.text, marginTop: spacing.md }]}>
          {product.description}
        </Text>
        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Button
            title={t('shop.addToCart')}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          />
          <Button
            title={isWishlisted(product.id) ? t('shop.wishlisted') : t('shop.addToWishlist')}
            onPress={() => toggle(product.id)}
            variant="outline"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 300 },
});

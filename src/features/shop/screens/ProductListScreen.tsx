import React, { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { featureFlags } from '../../../core/feature-flags/featureFlags';
import { Chip, EmptyState, LoadingOverlay, SearchBar } from '../../../shared/components/ui';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { Product, SortOption } from '../../../mocks/generators/products';
import { PRODUCT_CATEGORIES } from '../../../mocks/constants';
import { useProducts } from '../hooks/useShop';
import { useWishlistStore } from '../store/wishlistStore';
import { ShopStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ShopStackParamList, 'ProductList'>;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'sortName', value: 'name' },
  { label: 'sortPriceAsc', value: 'price_asc' },
  { label: 'sortPriceDesc', value: 'price_desc' },
  { label: 'rating', value: 'rating' },
];

const ProductCard = memo(function ProductCard({
  product,
  onPress,
  onWishlist,
  isWishlisted,
}: {
  product: Product;
  onPress: (id: string) => void;
  onWishlist: (id: string) => void;
  isWishlisted: boolean;
}) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.price} rupees`}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.cardBody}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 4 }}>
          ₹{product.price}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>★ {product.rating}</Text>
        {featureFlags.isEnabled('enableShopWishlist') && (
          <TouchableOpacity
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            onPress={() => onWishlist(product.id)}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? t('shop.removeFromWishlist') : t('shop.addToWishlistLabel')}
          >
            <Text>{isWishlisted ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
});

export function ProductListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { spacing } = useTheme();
  const { toggle, isWishlisted } = useWishlistStore();

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('name');
  const [inStockOnly, setInStockOnly] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      categories: categories.length ? categories : undefined,
      sort,
      inStockOnly,
    }),
    [debouncedSearch, categories, sort, inStockOnly],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useProducts(filters);

  const products = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const handlePress = useCallback(
    (id: string) => navigation.navigate('ProductDetail', { productId: id }),
    [navigation],
  );

  const toggleCategory = useCallback((cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={handlePress}
        onWishlist={toggle}
        isWishlisted={isWishlisted(item.id)}
      />
    ),
    [handlePress, toggle, isWishlisted],
  );

  if (isLoading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <View style={{ padding: spacing.md }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('common.search')} />
        <View style={[styles.chips, { marginTop: spacing.sm }]}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={categories.includes(cat)}
              onPress={() => toggleCategory(cat)}
            />
          ))}
        </View>
        <View style={[styles.chips, { marginTop: spacing.sm }]}>
          {SORT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.value === 'rating' ? t('shop.sortRating') : t(`shop.${opt.label}`)}
              selected={sort === opt.value}
              onPress={() => setSort(opt.value)}
            />
          ))}
          <Chip
            label={t('shop.inStock')}
            selected={inStockOnly}
            onPress={() => setInStockOnly(!inStockOnly)}
          />
        </View>
      </View>

      {isError ? (
        <EmptyState message={t('common.error')} actionLabel={t('common.retry')} onAction={() => refetch()} />
      ) : products.length === 0 ? (
        <EmptyState message={t('common.noResults')} />
      ) : (
        <FlashList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <LoadingOverlay /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { flexDirection: 'row', overflow: 'hidden' },
  image: { width: 100, height: 100 },
  cardBody: { flex: 1, padding: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});

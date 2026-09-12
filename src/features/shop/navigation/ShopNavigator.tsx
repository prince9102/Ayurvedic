import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { ShopStackParamList } from './types';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { selectCartItemCount } from '../store/cartSlice';
import { useAppSelector } from '../../../shared/hooks/useRedux';

const Stack = createNativeStackNavigator<ShopStackParamList>();

function ShopHeaderButtons() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const itemCount = useAppSelector(selectCartItemCount);

  return (
    <>
      <TouchableOpacity
        onPress={() => navigation.navigate('Wishlist' as never)}
        style={{ marginRight: 16 }}
        accessibilityRole="button"
        accessibilityLabel="Wishlist"
      >
        <Text style={{ color: colors.textInverse, fontSize: 20 }}>♡</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart' as never)}
        accessibilityRole="button"
        accessibilityLabel={`Cart, ${itemCount} items`}
      >
        <Text style={{ color: colors.textInverse, fontSize: 20 }}>
          🛒{itemCount > 0 ? ` (${itemCount})` : ''}
        </Text>
      </TouchableOpacity>
    </>
  );
}

export function ShopNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: t('shop.title'),
          headerRight: () => <ShopHeaderButtons />,
        }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: t('shop.productDetail') }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: t('shop.cart') }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('shop.checkout') }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: t('shop.wishlist') }} />
    </Stack.Navigator>
  );
}

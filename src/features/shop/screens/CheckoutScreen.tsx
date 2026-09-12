import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useToast } from '../../../core/toast/ToastProvider';
import { Button } from '../../../shared/components/ui';
import { clearCart, selectCartItems, selectCartTotal } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { ShopStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ShopStackParamList, 'Checkout'>;

export function CheckoutScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { showToast } = useToast();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);

  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    dispatch(clearCart());
    showToast(t('shop.orderSuccess'), 'success');
    navigation.popToTop();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text style={[typography.h2, { color: colors.text }]}>{t('shop.checkout')}</Text>

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: 12, padding: spacing.md, marginTop: spacing.lg }]}>
        <Text style={[typography.h3, { color: colors.text }]}>{t('shop.orderSummary')}</Text>
        {items.map((item) => (
          <View key={item.productId} style={styles.line}>
            <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
              {item.name} × {item.quantity}
            </Text>
            <Text style={{ color: colors.text }}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={[styles.line, { marginTop: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary }}>{t('shop.subtotal')}</Text>
          <Text style={{ color: colors.text }}>₹{subtotal}</Text>
        </View>
        <View style={styles.line}>
          <Text style={{ color: colors.textSecondary }}>{t('shop.shipping')}</Text>
          <Text style={{ color: colors.text }}>{shipping === 0 ? t('common.free') : `₹${shipping}`}</Text>
        </View>
        <View style={[styles.line, { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }]}>
          <Text style={[typography.h3, { color: colors.text }]}>{t('shop.total')}</Text>
          <Text style={[typography.h3, { color: colors.primary }]}>₹{total}</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Button title={t('shop.placeOrder')} onPress={handlePlaceOrder} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {},
  line: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});

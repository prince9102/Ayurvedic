import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Button } from '../../../shared/components/ui';
import { useToast } from '../../../core/toast/ToastProvider';
import { isAppError } from '../../../core/errors/AppError';
import { useNetwork } from '../../../core/network/NetworkProvider';
import { useCreateBooking } from '../hooks/useConsultation';
import { ConsultationStackParamList } from '../navigation/types';

type Route = RouteProp<ConsultationStackParamList, 'BookingConfirm'>;
type Nav = NativeStackNavigationProp<ConsultationStackParamList, 'BookingConfirm'>;

export function BookingConfirmScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const { mutate, isPending } = useCreateBooking();

  const { doctorId, doctorName, slotId, startTime, endTime } = route.params;

  const handleConfirm = () => {
    mutate(
      { doctorId, slotId, doctorName, startTime, endTime },
      {
        onSuccess: () => {
          showToast(
            isOnline ? t('consultation.bookingSuccess') : t('consultation.bookingQueued'),
            'success',
          );
          navigation.popToTop();
        },
        onError: (error) => {
          if (isAppError(error)) {
            if (error.code === 'CONFLICT') {
              showToast(t('consultation.slotConflict'), 'error');
            } else if (error.message.includes('expired')) {
              showToast(t('consultation.slotExpired'), 'error');
            } else {
              showToast(error.message, 'error');
            }
          } else {
            showToast(t('common.error'), 'error');
          }
        },
      },
    );
  };

  const dateStr = new Date(startTime).toLocaleString();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <Text style={[typography.h2, { color: colors.text }]}>{t('consultation.confirmBooking')}</Text>

      <View style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          marginTop: spacing.lg,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },
      ]}>
        <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />
        <View style={{ padding: spacing.md }}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{t('consultation.specialty')}</Text>
          <Text style={[typography.h3, { color: colors.text, marginTop: 2 }]}>{doctorName}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.sm }]} />
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📅</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{dateStr}</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 6 }]}>
            <Text style={styles.icon}>🕐</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {t('consultation.until')} {new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <Button title={t('common.confirm')} onPress={handleConfirm} loading={isPending} />
        <Button title={t('common.cancel')} onPress={() => navigation.goBack()} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {},
  cardAccent: { height: 4 },
  divider: { height: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 14, marginRight: 8, width: 20 },
});

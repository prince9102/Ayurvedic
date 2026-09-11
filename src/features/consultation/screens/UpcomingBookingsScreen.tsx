import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { EmptyState, LoadingOverlay } from '../../../shared/components/ui';
import { useToast } from '../../../core/toast/ToastProvider';
import { Booking } from '../../../mocks/generators/doctors';
import { useBookings, useCancelBooking } from '../hooks/useConsultation';

const STATUS_CONFIG = {
  confirmed: { color: '#28A745', bg: '#D4EDDA', label: '✓ Confirmed' },
  pending_sync: { color: '#856404', bg: '#FFF3CD', label: '⏳ Pending Sync' },
  cancelled: { color: '#721C24', bg: '#F8D7DA', label: '✕ Cancelled' },
};

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
}) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.confirmed;

  const dateStr = start.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <View
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
      {/* Top accent bar */}
      <View style={[styles.accentBar, { backgroundColor: colors.primary, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg }]} />

      <View style={{ padding: spacing.md }}>
        {/* Header row: doctor name + status badge */}
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight ?? colors.primary }]}>
            <Text style={styles.avatarText}>
              {booking.doctorName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
              {booking.doctorName}
            </Text>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{dateStr}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 4 }]}>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{timeStr}</Text>
        </View>

        {/* Cancel button — only for non-cancelled */}
        {booking.status !== 'cancelled' && (
          <TouchableOpacity
            onPress={() => onCancel(booking.id)}
            style={[styles.cancelBtn, { borderColor: colors.error, marginTop: spacing.md }]}
            accessibilityRole="button"
            accessibilityLabel={t('consultation.cancelBooking')}
          >
            <Text style={[typography.bodySmall, { color: colors.error, fontWeight: '600' }]}>
              {t('consultation.cancelBooking')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function UpcomingBookingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { showToast } = useToast();
  const { data: bookings, isLoading } = useBookings();
  const { mutate: cancelBooking } = useCancelBooking();

  const handleCancel = useCallback(
    (id: string) => {
      Alert.alert(t('consultation.cancelBooking'), t('common.areYouSure'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () =>
            cancelBooking(id, {
              onSuccess: () => showToast(t('consultation.bookingCancelled'), 'info'),
              onError: () => showToast(t('common.error'), 'error'),
            }),
        },
      ]);
    },
    [cancelBooking, showToast, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingCard booking={item} onCancel={handleCancel} />
    ),
    [handleCancel],
  );

  if (isLoading) return <LoadingOverlay />;

  if (!bookings?.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 56, textAlign: 'center' }}>🗓️</Text>
        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
          {t('consultation.noUpcoming')}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
          {t('consultation.book')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Summary header */}
      <View style={[styles.summaryBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
          {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'}
        </Text>
      </View>

      <FlashList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={180}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  card: { overflow: 'hidden' },
  accentBar: { height: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 14, marginRight: 6, width: 20 },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
});

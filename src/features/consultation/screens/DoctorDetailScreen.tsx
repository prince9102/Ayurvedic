import React, { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Button, Chip, LoadingOverlay } from '../../../shared/components/ui';
import { TimeSlot } from '../../../mocks/generators/doctors';
import { useDoctor, useDoctorSlots } from '../hooks/useConsultation';
import { ConsultationStackParamList } from '../navigation/types';

type Route = RouteProp<ConsultationStackParamList, 'DoctorDetail'>;
type Nav = NativeStackNavigationProp<ConsultationStackParamList, 'DoctorDetail'>;

export function DoctorDetailScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { doctorId } = route.params;

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const date = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }, []);

  const { data: doctor, isLoading } = useDoctor(doctorId);
  const { data: slots, isLoading: slotsLoading } = useDoctorSlots(doctorId, date);

  const availableSlots = useMemo(
    () => slots?.filter((s: TimeSlot & { isExpired?: boolean }) => !s.isBooked && !s.isExpired) ?? [],
    [slots],
  );

  const handleBook = useCallback(() => {
    if (!selectedSlotId || !doctor) return;
    const slot = slots?.find((s: TimeSlot) => s.id === selectedSlotId);
    if (!slot) return;
    navigation.navigate('BookingConfirm', {
      doctorId,
      doctorName: doctor.name,
      slotId: selectedSlotId,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  }, [selectedSlotId, doctor, slots, navigation, doctorId]);

  if (isLoading || !doctor) return <LoadingOverlay />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={{ uri: doctor.imageUrl }}
        style={styles.hero}
        accessibilityLabel={`Photo of ${doctor.name}`}
      />
      <View style={{ padding: spacing.md }}>
        <Text style={[typography.h1, { color: colors.text }]}>{doctor.name}</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {doctor.specialty} · {doctor.city}
        </Text>
        <Text style={{ color: colors.primary, marginTop: spacing.sm }}>
          ★ {doctor.rating} · {doctor.experienceYears} {t('consultation.experience')}
        </Text>
        <Text style={[typography.body, { color: colors.text, marginTop: spacing.md }]}>
          {doctor.bio}
        </Text>
        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.lg }]}>
          {t('consultation.slots')}
        </Text>
        {slotsLoading ? (
          <LoadingOverlay />
        ) : availableSlots.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>{t('common.noResults')}</Text>
        ) : (
          <View style={styles.slots}>
            {availableSlots.map((slot: TimeSlot) => {
              const time = new Date(slot.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <Chip
                  key={slot.id}
                  label={time}
                  selected={selectedSlotId === slot.id}
                  onPress={() => setSelectedSlotId(slot.id)}
                />
              );
            })}
          </View>
        )}
        <View style={{ marginTop: spacing.lg }}>
          <Button
            title={t('consultation.book')}
            onPress={handleBook}
            disabled={!selectedSlotId}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { width: '100%', height: 200 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
});

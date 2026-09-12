import React, { memo, useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useNetwork } from '../../../core/network/NetworkProvider';
import { Chip, EmptyState, LoadingOverlay, OfflineBanner, SearchBar } from '../../../shared/components/ui';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { Doctor } from '../../../mocks/generators/doctors';
import { useDoctors, useSpecialties } from '../hooks/useConsultation';
import { ConsultationStackParamList } from '../navigation/types';
import { CITIES } from '../../../mocks/constants';

type Nav = NativeStackNavigationProp<ConsultationStackParamList, 'DoctorList'>;

const DoctorCard = memo(function DoctorCard({
  doctor,
  onPress,
}: {
  doctor: Doctor;
  onPress: (id: string) => void;
}) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();
  const handlePress = useCallback(() => onPress(doctor.id), [doctor.id, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          padding: spacing.md,
        },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.specialty}, rating ${doctor.rating}`}
    >
      <Image source={{ uri: doctor.imageUrl }} style={styles.avatar} accessibilityIgnoresInvertColors />
      <View style={styles.cardContent}>
        <Text style={[typography.h3, { color: colors.text }]}>{doctor.name}</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
          {doctor.specialty} · {doctor.city}
        </Text>
        <View style={styles.meta}>
          <Text style={{ color: colors.primary }}>★ {doctor.rating}</Text>
          <Text style={{ color: colors.textSecondary }}>
            {doctor.experienceYears} {t('consultation.experience')} · ₹{doctor.consultationFee}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export function DoctorListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { isOnline } = useNetwork();
  const { colors, spacing } = useTheme();

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const filters = useMemo(
    () => ({ search: debouncedSearch, specialty, city }),
    [debouncedSearch, specialty, city],
  );

  const { data: doctors, fetchNextPage, hasMore, isLoading, isError, refetch } =
    useDoctors(filters);
  const { data: specialties } = useSpecialties();

  const handlePress = useCallback(
    (id: string) => navigation.navigate('DoctorDetail', { doctorId: id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => <DoctorCard doctor={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: Doctor) => item.id, []);

  if (isLoading) return <LoadingOverlay message={t('common.loading')} />;

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('common.search')}
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('common.filter')}</Text>
        </TouchableOpacity>
        {showFilters && (
          <View>
            <Text style={{ fontWeight: '600', marginBottom: 4, color: colors.text }}>{t('consultation.specialty')}</Text>
            <View style={styles.chips}>
              {specialties?.map((s: string) => (
                <Chip
                  key={s}
                  label={s}
                  selected={specialty === s}
                  onPress={() => setSpecialty(specialty === s ? undefined : s)}
                />
              ))}
            </View>
            <Text style={{ fontWeight: '600', marginBottom: 4, marginTop: 8, color: colors.text }}>{t('consultation.city')}</Text>
            <View style={styles.chips}>
              {CITIES.slice(0, 5).map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={city === c}
                  onPress={() => setCity(city === c ? undefined : c)}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {isError ? (
        <EmptyState message={t('common.error')} actionLabel={t('common.retry')} onAction={() => refetch()} />
      ) : doctors.length === 0 ? (
        <EmptyState message={t('common.noResults')} />
      ) : (
        <FlashList
          data={doctors}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={() => hasMore && fetchNextPage()}
          onEndReachedThreshold={0.5}
          estimatedItemSize={100}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { flexDirection: 'row' },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  cardContent: { flex: 1, marginLeft: 12 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Chip, EmptyState, LoadingOverlay, SearchBar } from '../../../shared/components/ui';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { RECORD_TYPES, RecordType } from '../../../mocks/constants';
import { GroupBy, HealthRecord } from '../../../mocks/generators/healthRecords';
import { useHealthRecordsInfinite } from '../hooks/useHealthRecords';
import { RecordsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RecordsStackParamList, 'RecordsTimeline'>;

const TYPE_LABEL_KEYS: Record<RecordType, string> = {
  lab_report: 'records.labReport',
  prescription: 'records.prescription',
  consultation: 'records.consultation',
  vaccination: 'records.vaccination',
  allergy: 'records.allergy',
};

const TYPE_COLORS: Record<RecordType, string> = {
  lab_report: '#17A2B8',
  prescription: '#28A745',
  consultation: '#2D6A4F',
  vaccination: '#6F42C1',
  allergy: '#DC3545',
};

const RecordCard = memo(function RecordCard({
  record,
  onPress,
}: {
  record: HealthRecord;
  onPress: (id: string) => void;
}) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();

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
          borderLeftWidth: 4,
          borderLeftColor: TYPE_COLORS[record.type],
        },
      ]}
      onPress={() => onPress(record.id)}
      accessibilityRole="button"
      accessibilityLabel={`${record.title}, ${t(TYPE_LABEL_KEYS[record.type])}`}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.text }]}>{record.title}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            {t(TYPE_LABEL_KEYS[record.type])} · {new Date(record.date).toLocaleDateString()}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{record.provider}</Text>
        </View>
        {record.attachmentUrl && (
          <Image
            source={{ uri: record.attachmentUrl }}
            style={styles.thumb}
            accessibilityLabel="Attachment preview"
          />
        )}
      </View>
      <View style={styles.tags}>
        {record.tags.map((tag) => (
          <Text key={tag} style={[styles.tag, { color: colors.primary, backgroundColor: colors.background }]}>
            {tag}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
});

export function RecordsTimelineScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { spacing } = useTheme();

  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<RecordType[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  const debouncedSearch = useDebounce(search, 300);
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      types: types.length ? types : undefined,
    }),
    [debouncedSearch, types],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useHealthRecordsInfinite(filters);

  const records = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const groupedRecords = useMemo(() => {
    if (groupBy === 'none') return null;
    const groups: Record<string, HealthRecord[]> = {};
    for (const record of records) {
      const d = new Date(record.date);
      const key =
        groupBy === 'year'
          ? `${d.getFullYear()}`
          : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(record);
    }
    return groups;
  }, [records, groupBy]);

  const handlePress = useCallback(
    (id: string) => navigation.navigate('RecordDetail', { recordId: id }),
    [navigation],
  );

  const toggleType = useCallback((type: RecordType) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: HealthRecord }) => (
      <RecordCard record={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  if (isLoading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <View style={{ padding: spacing.md }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('common.search')} />
        <View style={[styles.chips, { marginTop: spacing.sm }]}>
          {RECORD_TYPES.map((type) => (
            <Chip
              key={type}
              label={t(TYPE_LABEL_KEYS[type])}
              selected={types.includes(type)}
              onPress={() => toggleType(type)}
            />
          ))}
        </View>
        <View style={[styles.chips, { marginTop: spacing.sm }]}>
          <Chip label={t('common.all')} selected={groupBy === 'none'} onPress={() => setGroupBy('none')} />
          <Chip label={t('records.groupByMonth')} selected={groupBy === 'month'} onPress={() => setGroupBy('month')} />
          <Chip label={t('records.groupByYear')} selected={groupBy === 'year'} onPress={() => setGroupBy('year')} />
        </View>
      </View>

      {isError ? (
        <EmptyState message={t('common.error')} actionLabel={t('common.retry')} onAction={() => refetch()} />
      ) : records.length === 0 ? (
        <EmptyState message={t('common.noResults')} />
      ) : groupedRecords ? (
        <FlashList
          data={Object.entries(groupedRecords)}
          renderItem={({ item: [title, groupRecords] }) => (
            <View>
              <Text style={[styles.groupTitle, { paddingHorizontal: spacing.md, color: colors.text }]}>{title}</Text>
              {groupRecords.map((record) => (
                <RecordCard key={record.id} record={record} onPress={handlePress} />
              ))}
            </View>
          )}
          keyExtractor={([title]) => title}
          estimatedItemSize={200}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        />
      ) : (
        <FlashList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          estimatedItemSize={120}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <LoadingOverlay /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {},
  cardHeader: { flexDirection: 'row' },
  thumb: { width: 48, height: 48, borderRadius: 4, marginLeft: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
  tag: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  groupTitle: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
});

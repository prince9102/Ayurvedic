import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { LoadingOverlay } from '../../../shared/components/ui';
import { useHealthRecord } from '../hooks/useHealthRecords';
import { RecordsStackParamList } from '../navigation/types';

type Route = RouteProp<RecordsStackParamList, 'RecordDetail'>;

export function RecordDetailScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const { recordId } = route.params;

  const { data: record, isLoading } = useHealthRecord(recordId);

  if (isLoading || !record) return <LoadingOverlay />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.lg }}>
        <Text style={[typography.h1, { color: colors.text }]}>{record.title}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
          {new Date(record.date).toLocaleDateString()} · {record.provider}
        </Text>
        <Text style={[typography.body, { color: colors.text, marginTop: spacing.lg }]}>
          {record.description}
        </Text>

        <View style={[styles.tags, { marginTop: spacing.md }]}>
          {record.tags.map((tag: string) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.textInverse, fontSize: 12 }}>{tag}</Text>
            </View>
          ))}
        </View>

        {record.attachmentUrl && (
          <View style={{ marginTop: spacing.xl }}>
            <Text style={[typography.h3, { color: colors.text }]}>{t('records.attachment')}</Text>
            {record.attachmentType === 'image' ? (
              <Image
                source={{ uri: record.attachmentUrl }}
                style={styles.attachment}
                accessibilityLabel={t('records.recordAttachment')}
              />
            ) : (
              <TouchableOpacity
                onPress={() => Linking.openURL(record.attachmentUrl!)}
                style={[styles.pdfThumb, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityRole="link"
                accessibilityLabel={t('records.openPdf')}
              >
                <Text style={{ fontSize: 32 }}>📄</Text>
                <Text style={{ color: colors.primary, marginTop: 8 }}>{t('records.viewPdf')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  attachment: { width: '100%', height: 300, borderRadius: 12, marginTop: 12 },
  pdfThumb: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../../core/i18n';
import { useTheme, ThemeMode } from '../../../core/theme/ThemeProvider';
import { Chip } from '../../../shared/components/ui';

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, typography, mode, setMode } = useTheme();

  const themeModes: ThemeMode[] = ['light', 'dark', 'system'];
  const languages = [
    { code: 'en' as const, label: 'English' },
    { code: 'hi' as const, label: 'हिंदी' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <Text style={[typography.h2, { color: colors.text }]}>{t('settings.title')}</Text>

      <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xl }]}>
        {t('settings.theme')}
      </Text>
      <View style={styles.row}>
        {themeModes.map((m) => (
          <Chip
            key={m}
            label={t(`settings.${m}`)}
            selected={mode === m}
            onPress={() => setMode(m)}
          />
        ))}
      </View>

      <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xl }]}>
        {t('settings.language')}
      </Text>
      <View style={styles.row}>
        {languages.map((lang) => (
          <Chip
            key={lang.code}
            label={lang.label}
            selected={i18n.language === lang.code}
            onPress={() => changeLanguage(lang.code)}
          />
        ))}
      </View>

      <View style={{ marginTop: spacing.xxl }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          {t('settings.version')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
});

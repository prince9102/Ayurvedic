import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, borderRadius, typography } = useTheme();

  const bgColors = {
    primary: colors.primary,
    secondary: colors.secondary,
    outline: 'transparent',
    danger: colors.error,
  };

  const textColors = {
    primary: colors.textInverse,
    secondary: colors.textInverse,
    outline: colors.primary,
    danger: colors.textInverse,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgColors[variant],
          borderRadius: borderRadius.md,
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled || loading ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <Text style={[styles.text, typography.button, { color: textColors[variant] }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  ...props
}: SearchBarProps) {
  const { colors, borderRadius, spacing } = useTheme();

  return (
    <TextInput
      style={[
        styles.search,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.md,
          color: colors.text,
          paddingHorizontal: spacing.md,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      {...props}
    />
  );
});

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip = memo(function Chip({ label, selected = false, onPress }: ChipProps) {
  const { colors, borderRadius, spacing } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.md,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.textInverse : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = memo(function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.empty, { padding: spacing.lg }]}>
      <Text
        style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}
        accessibilityRole="text"
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.md }}>
          <Button title={actionLabel} onPress={onAction} variant="outline" />
        </View>
      )}
    </View>
  );
});

export const LoadingOverlay = memo(function LoadingOverlay({ message }: { message?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={styles.loading} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>{message}</Text>
      )}
    </View>
  );
});

interface OfflineBannerProps {
  visible: boolean;
}

export const OfflineBanner = memo(function OfflineBanner({ visible }: OfflineBannerProps) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <View
      style={[styles.offline, { backgroundColor: colors.warning, padding: spacing.sm }]}
      accessibilityRole="alert"
      accessibilityLabel={t('common.offline')}
    >
      <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '600' }}>
        {t('common.offline')}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    textAlign: 'center',
  },
  search: {
    height: 44,
    borderWidth: 1,
    fontSize: 16,
  },
  chip: {
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offline: {},
});

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();
  const { colors, borderRadius, spacing } = useTheme();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const typeColors: Record<ToastType, string> = {
    success: colors.success,
    error: colors.error,
    info: colors.info,
    warning: colors.warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        style={[styles.container, { top: insets.top + spacing.sm }]}
        pointerEvents="box-none"
        accessibilityLiveRegion="polite"
      >
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            style={[
              styles.toast,
              {
                backgroundColor: colors.surfaceElevated,
                borderLeftColor: typeColors[toast.type],
                borderRadius: borderRadius.md,
              },
            ]}
            accessibilityRole="alert"
          >
            <Text style={[styles.text, { color: colors.text }]}>{toast.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontSize: 14,
  },
});

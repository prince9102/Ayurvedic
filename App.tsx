import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator, linking } from './src/app/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/core/theme/ThemeProvider';
import { ToastProvider } from './src/core/toast/ToastProvider';
import { NetworkProvider } from './src/core/network/NetworkProvider';
import { ErrorBoundary } from './src/core/errors/ErrorBoundary';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer linking={linking as LinkingOptions<Record<string, unknown>>}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AppProviders>
            <ThemeProvider>
              <NetworkProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </NetworkProvider>
            </ThemeProvider>
          </AppProviders>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

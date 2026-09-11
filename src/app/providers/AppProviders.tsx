import React, { useEffect, useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setMockApiHandler } from '../../core/api/client';
import { mockApiHandler } from '../../mocks/mockApi';
import { featureFlags } from '../../core/feature-flags/featureFlags';
import { startSyncListener } from '../../core/sync/syncManager';
import { logger } from '../../core/logging/logger';
import '../../core/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ayurvedic-query-cache',
});

setMockApiHandler(mockApiHandler);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await featureFlags.load();
      logger.info('App initialized', { flags: featureFlags.get() });
      setReady(true);
    }
    init();

    const unsubscribeSync = startSyncListener();
    return unsubscribeSync;
  }, []);

  if (!ready) return null;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

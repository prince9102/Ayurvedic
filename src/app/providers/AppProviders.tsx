import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { setMockApiHandler } from '../../core/api/client';
import { mockApiHandler } from '../../mocks/mockApi';
import { featureFlags } from '../../core/feature-flags/featureFlags';
import { startSyncListener } from '../../core/sync/syncManager';
import { logger } from '../../core/logging/logger';
import '../../core/i18n';

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
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

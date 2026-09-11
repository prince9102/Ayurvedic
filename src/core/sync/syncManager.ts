import NetInfo from '@react-native-community/netinfo';
import { consultationApi } from '../../features/consultation/api/consultationApi';
import { offlineQueue } from '../sync/offlineQueue';
import { logger } from '../logging/logger';

let syncing = false;

export async function processSyncQueue(): Promise<void> {
  if (syncing) return;
  syncing = true;

  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      logger.debug('Skipping sync — offline');
      return;
    }

    const actions = await offlineQueue.getAll();
    if (actions.length === 0) return;

    logger.info(`Processing ${actions.length} queued actions`);

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'CREATE_BOOKING':
            await consultationApi.createBooking(
              String(action.payload.doctorId),
              String(action.payload.slotId),
            );
            break;
          case 'CANCEL_BOOKING':
            await consultationApi.cancelBooking(String(action.payload.bookingId));
            break;
        }
        await offlineQueue.remove(action.id);
      } catch (error) {
        logger.error('Sync action failed', { action, error });
        await offlineQueue.incrementRetry(action.id);
      }
    }
  } finally {
    syncing = false;
  }
}

export function startSyncListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      processSyncQueue();
    }
  });

  processSyncQueue();

  return unsubscribe;
}

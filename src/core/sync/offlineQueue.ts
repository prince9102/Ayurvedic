import { storage } from '../storage/storage';
import { logger } from '../logging/logger';

export type SyncActionType = 'CREATE_BOOKING' | 'CANCEL_BOOKING';

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

const QUEUE_KEY = 'offline_sync_queue';
const MAX_RETRIES = 3;

class OfflineQueue {
  private queue: SyncAction[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    const stored = await storage.get<SyncAction[]>(QUEUE_KEY);
    this.queue = stored ?? [];
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await storage.set(QUEUE_KEY, this.queue);
  }

  async enqueue(type: SyncActionType, payload: Record<string, unknown>): Promise<SyncAction> {
    await this.load();
    const action: SyncAction = {
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
    };
    this.queue.push(action);
    await this.persist();
    logger.info('Enqueued offline action', { type, id: action.id });
    return action;
  }

  async getAll(): Promise<SyncAction[]> {
    await this.load();
    return [...this.queue];
  }

  async remove(id: string): Promise<void> {
    await this.load();
    this.queue = this.queue.filter((a) => a.id !== id);
    await this.persist();
  }

  async incrementRetry(id: string): Promise<void> {
    await this.load();
    const action = this.queue.find((a) => a.id === id);
    if (action) {
      action.retries += 1;
      if (action.retries >= MAX_RETRIES) {
        logger.error('Sync action exceeded max retries', { id, type: action.type });
        await this.remove(id);
        return;
      }
      await this.persist();
    }
  }

  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
  }
}

export const offlineQueue = new OfflineQueue();

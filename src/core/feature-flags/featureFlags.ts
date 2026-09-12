import { storage } from '../storage/storage';
import { logger } from '../logging/logger';

export interface FeatureFlags {
  enableShopWishlist: boolean;
  maxCartItems: number;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableShopWishlist: true,
  maxCartItems: 50,
};

const STORAGE_KEY = 'feature_flags';

let cachedFlags: FeatureFlags = { ...DEFAULT_FLAGS };

export const featureFlags = {
  get(): FeatureFlags {
    return cachedFlags;
  },

  isEnabled(flag: keyof FeatureFlags): boolean {
    const value = cachedFlags[flag];
    return typeof value === 'boolean' ? value : false;
  },

  async load(): Promise<void> {
    try {
      const stored = await storage.get<FeatureFlags>(STORAGE_KEY);
      if (stored) {
        cachedFlags = { ...DEFAULT_FLAGS, ...stored };
      }
    } catch (error) {
      logger.warn('Failed to load feature flags', error);
    }
  },

  // only used in tests
  reset() {
    cachedFlags = { ...DEFAULT_FLAGS };
  },
};

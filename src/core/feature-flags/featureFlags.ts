import { storage } from '../storage/storage';
import { logger } from '../logging/logger';

export interface FeatureFlags {
  enableShopWishlist: boolean;
  enableHealthRecordsExport: boolean;
  enableConsultationVideo: boolean;
  enableNewCheckout: boolean;
  maxCartItems: number;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableShopWishlist: true,
  enableHealthRecordsExport: false,
  enableConsultationVideo: false,
  enableNewCheckout: true,
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

  async load(): Promise<FeatureFlags> {
    try {
      const stored = await storage.get<FeatureFlags>(STORAGE_KEY);
      if (stored) {
        cachedFlags = { ...DEFAULT_FLAGS, ...stored };
      }
    } catch (error) {
      logger.warn('Failed to load feature flags', error);
    }
    return cachedFlags;
  },

  async update(flags: Partial<FeatureFlags>): Promise<void> {
    cachedFlags = { ...cachedFlags, ...flags };
    await storage.set(STORAGE_KEY, cachedFlags);
  },

  reset() {
    cachedFlags = { ...DEFAULT_FLAGS };
  },
};

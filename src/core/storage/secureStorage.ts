import * as Keychain from 'react-native-keychain';
import { logger } from '../logging/logger';

const PREFIX = 'ayurvedic_';

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({ service: `${PREFIX}${key}` });
      return result ? result.password : null;
    } catch (error) {
      logger.error(`Secure storage get failed: ${key}`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, { service: `${PREFIX}${key}` });
    } catch (error) {
      logger.error(`Secure storage set failed: ${key}`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: `${PREFIX}${key}` });
    } catch (error) {
      logger.error(`Secure storage remove failed: ${key}`, error);
    }
  },
};

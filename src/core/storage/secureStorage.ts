import * as Keychain from 'react-native-keychain';

const PREFIX = 'ayurvedic_';

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({ service: `${PREFIX}${key}` });
      return result ? result.password : null;
    } catch (error) {
      
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, { service: `${PREFIX}${key}` });
    } catch (error) {
      
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: `${PREFIX}${key}` });
    } catch (error) {
     
    }
  },
};

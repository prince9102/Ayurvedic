import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@ayurvedic:';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
     
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
     
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
    } catch (error) {
     
    }
  },
};

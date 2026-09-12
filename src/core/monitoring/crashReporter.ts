import { logger } from '../logging/logger';

export const crashReporter = {
  recordError(error: Error, context?: Record<string, string>) {
    logger.error('Crash reported', { message: error.message, stack: error.stack, context });
  },
};

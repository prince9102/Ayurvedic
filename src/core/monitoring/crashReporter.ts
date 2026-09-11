import { logger } from '../logging/logger';

export interface CrashReporter {
  recordError(error: Error, context?: Record<string, string>): void;
  logBreadcrumb(message: string, data?: Record<string, unknown>): void;
}

class ConsoleCrashReporter implements CrashReporter {
  recordError(error: Error, context?: Record<string, string>) {
    logger.error('Crash reported', { error: error.message, stack: error.stack, context });
  }

  logBreadcrumb(message: string, data?: Record<string, unknown>) {
    logger.debug(`Breadcrumb: ${message}`, data);
  }
}

export const crashReporter: CrashReporter = new ConsoleCrashReporter();

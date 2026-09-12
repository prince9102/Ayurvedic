import { config } from '../config/env';
import { logger } from '../logging/logger';

export const performanceMonitor = {
  startTimer(name: string): () => void {
    if (!config.enablePerformanceMonitoring) return () => undefined;
    const start = Date.now();
    return () => {
      const durationMs = Date.now() - start;
      logger.debug(`Perf: ${name}`, { durationMs });
    };
  },
};

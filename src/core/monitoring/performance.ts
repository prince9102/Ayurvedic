import { config } from '../config/env';
import { logger } from '../logging/logger';

interface PerformanceMetric {
  name: string;
  durationMs: number;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 100;

export const performanceMonitor = {
  startTimer(name: string): () => void {
    if (!config.enablePerformanceMonitoring) return () => undefined;
    const start = Date.now();
    return () => {
      const durationMs = Date.now() - start;
      metrics.push({ name, durationMs, timestamp: Date.now() });
      if (metrics.length > MAX_METRICS) metrics.shift();
      logger.debug(`Perf: ${name}`, { durationMs });
    };
  },

  getMetrics(): PerformanceMetric[] {
    return [...metrics];
  },

  clear() {
    metrics.length = 0;
  },
};

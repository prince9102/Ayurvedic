export type Environment = 'development';

export interface AppConfig {
  env: Environment;
  apiBaseUrl: string;
  apiTimeoutMs: number;
  mockFailureRate: number;
  mockSlowNetworkRate: number;
  enableLogging: boolean;
  enablePerformanceMonitoring: boolean;
  featureFlagsEndpoint: string;
}

const env = (process.env.APP_ENV as Environment) ?? 'development';

const configs: Record<Environment, AppConfig> = {
  development: {
    env: 'development',
    apiBaseUrl: 'mock://api',
    apiTimeoutMs: 15000,
    mockFailureRate: 0.05,
    mockSlowNetworkRate: 0.1,
    enableLogging: true,
    enablePerformanceMonitoring: true,
    featureFlagsEndpoint: 'mock://feature-flags'
  }
};

export const config = configs[env];

export type Environment = 'development' | 'staging' | 'production';

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
    featureFlagsEndpoint: 'mock://feature-flags',
  },
  staging: {
    env: 'staging',
    apiBaseUrl: 'https://staging-api.ayurvedic.app',
    apiTimeoutMs: 12000,
    mockFailureRate: 0,
    mockSlowNetworkRate: 0,
    enableLogging: true,
    enablePerformanceMonitoring: true,
    featureFlagsEndpoint: 'https://staging-api.ayurvedic.app/config',
  },
  production: {
    env: 'production',
    apiBaseUrl: 'https://api.ayurvedic.app',
    apiTimeoutMs: 10000,
    mockFailureRate: 0,
    mockSlowNetworkRate: 0,
    enableLogging: false,
    enablePerformanceMonitoring: true,
    featureFlagsEndpoint: 'https://api.ayurvedic.app/config',
  },
};

export const config = configs[env];

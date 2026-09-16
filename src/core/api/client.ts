import { config } from '../config/env';
import { AppError, SessionExpiredError, TimeoutError } from '../errors/AppError';
import { secureStorage } from '../storage/secureStorage';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
}

export type ApiHandler = (
  path: string,
  options: ApiRequestOptions,
) => Promise<unknown>;

let mockHandler: ApiHandler | null = null;

export function setMockApiHandler(handler: ApiHandler) {
  mockHandler = handler;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const timeout = options.timeout ?? config.apiTimeoutMs;

  try {
    const token = options.skipAuth ? null : await secureStorage.get('auth_token');


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let result: T;

      if (config.apiBaseUrl.startsWith('mock://') && mockHandler) {
        result = (await mockHandler(path, options)) as T;
      } else {
        const response = await fetch(`${config.apiBaseUrl}${path}`, {
          method: options.method ?? 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new SessionExpiredError();
        }

        const text = await response.text();
        if (!text) {
          throw new AppError('Empty response from server', 'EMPTY_RESPONSE', response.status, true);
        }

        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          throw new AppError('Invalid JSON response', 'INVALID_JSON', response.status, true);
        }

        if (!response.ok) {
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message: string }).message)
              : 'Request failed';
          throw new AppError(message, 'API_ERROR', response.status, response.status >= 500);
        }

        result = data as T;
      }

      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError();
    }
    throw new AppError('Network request failed', 'NETWORK_ERROR', 0, true);
  } finally {
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network request failed', retryable = true) {
    super(message, 'NETWORK_ERROR', 0, retryable);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends AppError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT', 408, true);
    this.name = 'TimeoutError';
  }
}

export class SessionExpiredError extends AppError {
  constructor(message = 'Session expired. Please sign in again.') {
    super(message, 'SESSION_EXPIRED', 401, false);
    this.name = 'SessionExpiredError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409, false);
    this.name = 'ConflictError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

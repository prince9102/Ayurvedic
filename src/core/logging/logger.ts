import { config } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel = config.enableLogging ? 'debug' : 'warn';

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel) {
    return levelPriority[level] >= levelPriority[this.minLevel];
  }

  private format(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (meta !== undefined) {
      console.log(prefix, message, meta);
    } else {
      console.log(prefix, message);
    }
  }

  debug(message: string, meta?: unknown) {
    if (this.shouldLog('debug')) this.format('debug', message, meta);
  }

  info(message: string, meta?: unknown) {
    if (this.shouldLog('info')) this.format('info', message, meta);
  }

  warn(message: string, meta?: unknown) {
    if (this.shouldLog('warn')) this.format('warn', message, meta);
  }

  error(message: string, meta?: unknown) {
    if (this.shouldLog('error')) this.format('error', message, meta);
  }
}

export const logger = new Logger();

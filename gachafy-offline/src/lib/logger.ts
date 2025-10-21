import { sanitizeForLogging } from './validation';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: number;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      level,
      message,
      context,
      data: data ? sanitizeForLogging(data) : undefined,
      timestamp: Date.now(),
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : '';
      const logMethod = console[level] || console.log;
      
      if (data) {
        logMethod(`${prefix} ${message}`, data);
      } else {
        logMethod(`${prefix} ${message}`);
      }
    } else if (level === 'error' || level === 'warn') {
      // In production, only log errors and warnings
      // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
      const logMethod = console[level];
      logMethod(`${level.toUpperCase()}: ${message}`, entry);
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.log('warn', message, data, context);
  }

  error(message: string, error?: any, context?: string) {
    this.log('error', message, error, context);
  }

  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearLogs() {
    this.logBuffer = [];
  }
}

export const logger = new Logger();

import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 503);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class TransactionError extends AppError {
  constructor(message = 'Transaction failed') {
    super(message, 'TRANSACTION_ERROR', 500);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

// Retry configuration
interface RetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: any, attempt: number) => {
    // Don't retry validation errors or client errors (4xx)
    if (error instanceof ValidationError) return false;
    if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) return false;
    return attempt < 3;
  },
};

// Retry with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const cfg = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === cfg.maxAttempts || !cfg.shouldRetry(error, attempt)) {
        throw error;
      }

      const delay = cfg.delayMs * Math.pow(cfg.backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Timeout wrapper
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AppError(errorMessage, 'TIMEOUT', 408));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Safe async wrapper with error handling
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: {
    fallback?: T;
    onError?: (error: any) => void;
    errorMessage?: string;
  } = {}
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Safe async error:', error);
    }

    if (options.onError) {
      options.onError(error);
    }

    if (options.errorMessage) {
      toast.error(options.errorMessage);
    }

    return options.fallback;
  }
}

// Global error handler
export const handleError = (error: any, context?: string) => {
  // Log error (in production, send to monitoring service)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  } else {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  }

  // Show user-friendly message
  if (error instanceof AppError) {
    toast.error(error.message);
  } else if (error instanceof Error) {
    toast.error(error.message || 'An unexpected error occurred');
  } else {
    toast.error('An unexpected error occurred');
  }
};

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new AppError('Service temporarily unavailable', 'CIRCUIT_OPEN', 503);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  reset() {
    this.failures = 0;
    this.state = 'closed';
  }
}

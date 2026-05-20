import { Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(
    private readonly threshold: number,
    private readonly timeout: number,
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.timeout) {
        this.logger.log('Circuit breaker transitioning to HALF_OPEN');
        this.state = CircuitState.HALF_OPEN;
      } else {
        this.logger.warn('Circuit breaker is OPEN, using fallback');
        if (fallback) return fallback();
        throw new Error('Circuit breaker is OPEN and no fallback provided');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      const shouldUseFallback = this.onFailure();
      // onFailure() retorna true si el circuito se abrió
      if (shouldUseFallback && fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.log('Circuit breaker transitioning to CLOSED');
      this.state = CircuitState.CLOSED;
    }
  }

  private onFailure(): boolean {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.logger.error(`Circuit breaker OPEN after ${this.failureCount} failures`);
      this.state = CircuitState.OPEN;
      return true; // Indica que el circuito se abrió
    }
    return false;
  }

  getState(): CircuitState {
    return this.state;
  }
}

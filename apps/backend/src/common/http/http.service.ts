import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RequestOptions {
  timeout: number;
  retries: number;
  retryDelay: number;
}

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private readonly defaultTimeout: number;
  private readonly defaultRetries: number;
  private readonly defaultRetryDelay: number;

  constructor(private configService: ConfigService) {
    this.defaultTimeout = this.configService.get<number>('HTTP_TIMEOUT', 30000);
    this.defaultRetries = this.configService.get<number>('HTTP_RETRIES', 3);
    this.defaultRetryDelay = this.configService.get<number>('HTTP_RETRY_DELAY', 1000);
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const options: RequestOptions = {
      timeout: config.timeout ?? this.defaultTimeout,
      retries: config.retries ?? this.defaultRetries,
      retryDelay: config.retryDelay ?? this.defaultRetryDelay,
    };

    return this.executeWithRetry<T>(config, options, 0);
  }

  private async executeWithRetry<T>(
    config: RequestConfig,
    options: RequestOptions,
    attempt: number,
  ): Promise<T> {
    try {
      return await this.executeRequest<T>(config, options);
    } catch (error) {
      const isLastAttempt = attempt >= options.retries - 1;

      if (isLastAttempt) {
        this.logger.error(
          `HTTP request failed after ${options.retries} attempts: ${config.url}`,
          error.stack,
        );
        throw error;
      }

      const shouldRetry = this.isRetryableError(error);
      if (!shouldRetry) {
        this.logger.error(`Non-retryable error for ${config.url}`, error.stack);
        throw error;
      }

      const delay = this.calculateBackoff(attempt, options.retryDelay);
      this.logger.warn(
        `Retrying HTTP request (attempt ${attempt + 1}/${options.retries}) after ${delay}ms: ${config.url}`,
      );

      await this.delay(delay);
      return this.executeWithRetry<T>(config, options, attempt + 1);
    }
  }

  private async executeRequest<T>(
    config: RequestConfig,
    options: RequestOptions,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const startTime = Date.now();

      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;
      this.logger.debug(`HTTP ${config.method || 'GET'} ${config.url} - ${response.status} (${duration}ms)`);

      if (!response.ok) {
        throw new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          config.url,
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as T;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new HttpTimeoutError(
          `Request timeout after ${options.timeout}ms`,
          config.url,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private isRetryableError(error: any): boolean {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }

    // Timeout errors
    if (error instanceof HttpTimeoutError) {
      return true;
    }

    // 5xx server errors
    if (error instanceof HttpError && error.statusCode >= 500) {
      return true;
    }

    // 429 Too Many Requests
    if (error instanceof HttpError && error.statusCode === 429) {
      return true;
    }

    return false;
  }

  private calculateBackoff(attempt: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // 0-1000ms jitter
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url,
      method: 'GET',
      ...config,
    });
  }

  async post<T>(url: string, body: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      body,
      ...config,
    });
  }

  async put<T>(url: string, body: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      body,
      ...config,
    });
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config,
    });
  }
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly url: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class HttpTimeoutError extends Error {
  constructor(message: string, public readonly url: string) {
    super(message);
    this.name = 'HttpTimeoutError';
  }
}

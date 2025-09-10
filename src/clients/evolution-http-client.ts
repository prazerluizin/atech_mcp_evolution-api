import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { z } from 'zod';
import { 
  ErrorHandler, 
  McpError, 
  ErrorType, 
  ErrorContext,
  globalErrorHandler 
} from '../utils/error-handler';

// Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: McpError;
  statusCode: number;
  headers?: Record<string, string>;
}

// Re-export error types for backward compatibility
export { ErrorType, McpError as ApiError } from '../utils/error-handler';

// Request options interface
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// HTTP Client configuration
export interface HttpClientConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
  enableLogging?: boolean;
}

// Configuration schema
export const HttpClientConfigSchema = z.object({
  baseURL: z.string().url('Base URL must be a valid URL'),
  apiKey: z.string().min(1, 'API key is required'),
  timeout: z.number().positive().optional().default(30000),
  retryAttempts: z.number().min(0).max(10).optional().default(3),
  retryDelay: z.number().positive().optional().default(1000),
  maxRetryDelay: z.number().positive().optional().default(30000),
  enableLogging: z.boolean().optional().default(false)
});

export class EvolutionHttpClient {
  private axiosInstance: AxiosInstance;
  private config: HttpClientConfig;
  private requestCount = 0;
  private errorHandler: ErrorHandler;

  constructor(config: HttpClientConfig) {
    // Validate configuration
    this.config = HttpClientConfigSchema.parse(config);
    
    // Initialize error handler
    this.errorHandler = new ErrorHandler({
      enableLogging: this.config.enableLogging,
      logLevel: this.config.enableLogging ? 'error' : 'error'
    });
    
    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.config.apiKey,
        'User-Agent': 'evolution-api-mcp/1.0.0'
      },
      // Enable connection pooling
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging and authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.config.enableLogging) {
          console.log(`[HTTP Client] Request: ${config.method?.toUpperCase()} ${config.url}`);
          if (config.data) {
            console.log('[HTTP Client] Request data:', JSON.stringify(config.data, null, 2));
          }
        }

        // Ensure API key is always present
        if (!config.headers['apikey']) {
          config.headers['apikey'] = this.config.apiKey;
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[HTTP Client] Request error:', error.message);
        }
        return Promise.reject(this.createApiError(error, { operation: 'request_interceptor' }));
      }
    );

    // Response interceptor for logging and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.config.enableLogging) {
          console.log(`[HTTP Client] Response: ${response.status} ${response.statusText}`);
          console.log('[HTTP Client] Response data:', JSON.stringify(response.data, null, 2));
        }
        return response;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[HTTP Client] Response error:', error.message);
          if (error.response) {
            console.error('[HTTP Client] Error response:', {
              status: error.response.status,
              data: error.response.data
            });
          }
        }
        return Promise.reject(this.createApiError(error, { operation: 'response_interceptor' }));
      }
    );
  }

  private createApiError(error: any, context?: ErrorContext): McpError {
    return this.errorHandler.handleHttpError(error, context);
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.config.retryAttempts!,
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    let lastError: McpError;
    let currentDelay = this.config.retryDelay!;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this.requestCount++;
        const response = await requestFn();
        
        return {
          success: true,
          data: response.data,
          statusCode: response.status,
          headers: response.headers as Record<string, string>
        };
      } catch (error: any) {
        // Convert axios error to our McpError format with context
        const errorContext: ErrorContext = {
          ...context,
          operation: 'http_request',
          requestId: `req_${this.requestCount}_${Date.now()}`
        };
        
        lastError = this.createApiError(error, errorContext);
        
        // Don't retry on non-retryable errors
        if (!lastError.retryable) {
          break;
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          break;
        }

        if (this.config.enableLogging) {
          console.log(`[HTTP Client] Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms...`);
        }

        // Wait before retrying with exponential backoff
        await this.delay(currentDelay);
        currentDelay = Math.min(currentDelay * 2, this.config.maxRetryDelay!);
      }
    }

    // Log the final error
    this.errorHandler.logError(lastError!);

    return {
      success: false,
      error: lastError!,
      statusCode: lastError!.statusCode || 0
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method
  async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    const { method, path, data, params, headers, timeout, retries } = options;
    
    const requestConfig: AxiosRequestConfig = {
      method,
      url: path,
      data,
      params,
      headers: { ...headers },
      timeout: timeout || this.config.timeout
    };

    const context: ErrorContext = {
      operation: 'http_request',
      endpoint: path,
      parameters: { method, path, params }
    };

    return this.executeWithRetry(
      () => this.axiosInstance.request<T>(requestConfig),
      retries !== undefined ? retries : this.config.retryAttempts,
      context
    );
  }

  // Convenience methods
  async get<T = any>(path: string, params?: Record<string, any>, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      path,
      params,
      ...options
    });
  }

  async post<T = any>(path: string, data?: any, params?: Record<string, any>, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      path,
      data,
      params,
      ...options
    });
  }

  async put<T = any>(path: string, data?: any, params?: Record<string, any>, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      path,
      data,
      params,
      ...options
    });
  }

  async delete<T = any>(path: string, params?: Record<string, any>, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      path,
      params,
      ...options
    });
  }

  async patch<T = any>(path: string, data?: any, params?: Record<string, any>, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      path,
      data,
      params,
      ...options
    });
  }

  // Configuration methods
  updateConfig(updates: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Update axios instance if needed
    if (updates.baseURL) {
      this.axiosInstance.defaults.baseURL = updates.baseURL;
    }
    
    if (updates.apiKey) {
      this.axiosInstance.defaults.headers['apikey'] = updates.apiKey;
    }
    
    if (updates.timeout) {
      this.axiosInstance.defaults.timeout = updates.timeout;
    }
  }

  getConfig(): HttpClientConfig {
    return { ...this.config };
  }

  // Health check method
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      return await this.get('/');
    } catch (error) {
      const mcpError = this.createApiError(error, { operation: 'health_check' });
      return {
        success: false,
        error: mcpError,
        statusCode: mcpError.statusCode || 0
      };
    }
  }

  // Get request statistics
  getStats(): { requestCount: number } {
    return {
      requestCount: this.requestCount
    };
  }
}
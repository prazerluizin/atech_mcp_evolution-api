/**
 * Comprehensive error handling system for Evolution API MCP Server
 * 
 * This module provides:
 * - Error type definitions and classes
 * - HTTP status code to user-friendly message mapping
 * - Authentication failure handling
 * - Timeout and network error handling with retry suggestions
 * - Validation error messages with parameter correction hints
 * - Error logging and debugging information
 */

import { z } from 'zod';

/**
 * Error types for different categories of errors
 */
export enum ErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INSTANCE_ERROR = 'INSTANCE_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Error severity levels for logging and handling
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Base error interface
 */
export interface BaseError {
  type: ErrorType;
  message: string;
  code?: string;
  statusCode?: number;
  severity: ErrorSeverity;
  timestamp: Date;
  details?: any;
  suggestions?: string[];
  retryable: boolean;
  context?: ErrorContext;
}

/**
 * Error context for debugging and logging
 */
export interface ErrorContext {
  operation?: string;
  endpoint?: string;
  instance?: string;
  parameters?: any;
  requestId?: string;
  userId?: string;
  stackTrace?: string;
}

/**
 * Validation error details
 */
export interface ValidationErrorDetail {
  field: string;
  value: any;
  message: string;
  code: string;
  suggestion?: string;
}

/**
 * Network error details
 */
export interface NetworkErrorDetail {
  url?: string;
  timeout?: number;
  retryAttempt?: number;
  maxRetries?: number;
  nextRetryIn?: number;
}

/**
 * Base error class with comprehensive error information
 */
export class McpError extends Error implements BaseError {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: Date;
  public readonly details?: any;
  public readonly suggestions: string[];
  public readonly retryable: boolean;
  public readonly context?: ErrorContext;

  constructor(
    type: ErrorType,
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      severity?: ErrorSeverity;
      details?: any;
      suggestions?: string[];
      retryable?: boolean;
      context?: ErrorContext;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'McpError';
    this.type = type;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.severity = options.severity || this.getDefaultSeverity(type);
    this.timestamp = new Date();
    this.details = options.details;
    this.suggestions = options.suggestions || [];
    this.retryable = options.retryable ?? this.getDefaultRetryable(type);
    this.context = options.context;

    if (options.cause) {
      (this as any).cause = options.cause;
    }

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, McpError);
    }
  }

  private getDefaultSeverity(type: ErrorType): ErrorSeverity {
    switch (type) {
      case ErrorType.CONFIGURATION_ERROR:
      case ErrorType.AUTHENTICATION_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorType.INTERNAL_ERROR:
        return ErrorSeverity.CRITICAL;
      case ErrorType.VALIDATION_ERROR:
      case ErrorType.RESOURCE_NOT_FOUND:
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.LOW;
    }
  }

  private getDefaultRetryable(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
      case ErrorType.RATE_LIMIT_ERROR:
        return true;
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.VALIDATION_ERROR:
      case ErrorType.CONFIGURATION_ERROR:
      case ErrorType.PERMISSION_ERROR:
        return false;
      default:
        return false;
    }
  }

  /**
   * Convert error to JSON for logging and API responses
   */
  toJSON(): Record<string, any> {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      suggestions: this.suggestions,
      retryable: this.retryable,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Get user-friendly error message for Claude Desktop
   */
  getUserMessage(): string {
    const baseMessage = this.message;
    const suggestions = this.suggestions.length > 0 
      ? `\n\nSuggestions:\n${this.suggestions.map(s => `• ${s}`).join('\n')}`
      : '';
    
    return `${baseMessage}${suggestions}`;
  }
}

/**
 * Specific error classes for different error types
 */
export class ConfigurationError extends McpError {
  constructor(message: string, options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}) {
    super(ErrorType.CONFIGURATION_ERROR, message, {
      ...options,
      severity: ErrorSeverity.HIGH,
      retryable: false
    });
  }
}

export class AuthenticationError extends McpError {
  constructor(message: string, options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}) {
    const suggestions = (options as any).suggestions || [
      'Verify your Evolution API key is correct',
      'Check if the API key has the required permissions',
      'Ensure the Evolution API server is accessible'
    ];
    
    super(ErrorType.AUTHENTICATION_ERROR, message, {
      ...options,
      severity: ErrorSeverity.HIGH,
      retryable: false,
      suggestions
    });
  }
}

export class ValidationError extends McpError {
  public readonly validationDetails: ValidationErrorDetail[];

  constructor(
    message: string, 
    validationDetails: ValidationErrorDetail[] = [],
    options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}
  ) {
    const details = { validationDetails, ...(options as any).details };
    
    super(ErrorType.VALIDATION_ERROR, message, {
      ...options,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      details
    });
    this.validationDetails = validationDetails;
  }
}

export class NetworkError extends McpError {
  public readonly networkDetails: NetworkErrorDetail;

  constructor(
    message: string,
    networkDetails: NetworkErrorDetail = {},
    options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}
  ) {
    const details = { networkDetails, ...(options as any).details };
    const suggestions = (options as any).suggestions || [
      'Check your internet connection',
      'Verify the Evolution API server is running',
      'Try again in a few moments'
    ];
    
    super(ErrorType.NETWORK_ERROR, message, {
      ...options,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      details,
      suggestions
    });
    this.networkDetails = networkDetails;
  }
}

export class TimeoutError extends McpError {
  constructor(
    message: string,
    timeout: number,
    options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}
  ) {
    const details = { timeout, ...(options as any).details };
    const suggestions = (options as any).suggestions || [
      `Request timed out after ${timeout}ms`,
      'Try increasing the timeout value',
      'Check if the Evolution API server is responding slowly'
    ];
    
    super(ErrorType.TIMEOUT_ERROR, message, {
      ...options,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      details,
      suggestions
    });
  }
}

export class RateLimitError extends McpError {
  constructor(
    message: string,
    retryAfter?: number,
    options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}
  ) {
    const defaultSuggestions = retryAfter 
      ? [`Wait ${retryAfter} seconds before retrying`]
      : ['Wait a moment before making more requests'];

    const details = { retryAfter, ...(options as any).details };
    const suggestions = (options as any).suggestions || defaultSuggestions;

    super(ErrorType.RATE_LIMIT_ERROR, message, {
      ...options,
      severity: ErrorSeverity.LOW,
      retryable: true,
      details,
      suggestions
    });
  }
}

export class InstanceError extends McpError {
  constructor(
    message: string,
    instanceName?: string,
    options: Omit<ConstructorParameters<typeof McpError>[2], 'type'> = {}
  ) {
    const details = { instanceName, ...(options as any).details };
    const suggestions = (options as any).suggestions || [
      'Verify the instance name is correct',
      'Check if the instance exists and is connected',
      'Try creating the instance if it doesn\'t exist'
    ];
    
    super(ErrorType.INSTANCE_ERROR, message, {
      ...options,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      details,
      suggestions
    });
  }
}

/**
 * HTTP status code to error type mapping
 */
export const HTTP_STATUS_ERROR_MAP: Record<number, {
  type: ErrorType;
  getMessage: (status: number, data?: any) => string;
  getSuggestions: (status: number, data?: any) => string[];
}> = {
  400: {
    type: ErrorType.VALIDATION_ERROR,
    getMessage: (status, data) => data?.message || 'Bad request - invalid parameters provided',
    getSuggestions: () => [
      'Check the request parameters for correct format',
      'Verify all required fields are provided',
      'Review the API documentation for parameter requirements'
    ]
  },
  401: {
    type: ErrorType.AUTHENTICATION_ERROR,
    getMessage: () => 'Authentication failed - invalid or missing API key',
    getSuggestions: () => [
      'Verify your Evolution API key is correct',
      'Check if the API key has expired',
      'Ensure the API key has the required permissions'
    ]
  },
  403: {
    type: ErrorType.PERMISSION_ERROR,
    getMessage: () => 'Access forbidden - insufficient permissions',
    getSuggestions: () => [
      'Check if your API key has the required permissions',
      'Verify you have access to the requested resource',
      'Contact your administrator for permission updates'
    ]
  },
  404: {
    type: ErrorType.RESOURCE_NOT_FOUND,
    getMessage: (status, data) => data?.message || 'Resource not found',
    getSuggestions: () => [
      'Verify the resource identifier is correct',
      'Check if the resource exists',
      'Ensure you\'re using the correct endpoint'
    ]
  },
  409: {
    type: ErrorType.API_ERROR,
    getMessage: (status, data) => data?.message || 'Conflict - resource already exists or is in use',
    getSuggestions: () => [
      'Check if the resource already exists',
      'Try using a different identifier',
      'Verify the current state of the resource'
    ]
  },
  422: {
    type: ErrorType.VALIDATION_ERROR,
    getMessage: (status, data) => data?.message || 'Unprocessable entity - validation failed',
    getSuggestions: () => [
      'Review the validation errors in the response',
      'Correct the invalid fields and try again',
      'Check the API documentation for field requirements'
    ]
  },
  429: {
    type: ErrorType.RATE_LIMIT_ERROR,
    getMessage: () => 'Rate limit exceeded - too many requests',
    getSuggestions: (status, data) => {
      const retryAfter = data?.retryAfter || 60;
      return [
        `Wait ${retryAfter} seconds before making more requests`,
        'Reduce the frequency of your requests',
        'Consider implementing request queuing'
      ];
    }
  },
  500: {
    type: ErrorType.API_ERROR,
    getMessage: () => 'Internal server error - something went wrong on the Evolution API server',
    getSuggestions: () => [
      'Try the request again in a few moments',
      'Check the Evolution API server status',
      'Contact support if the problem persists'
    ]
  },
  502: {
    type: ErrorType.NETWORK_ERROR,
    getMessage: () => 'Bad gateway - Evolution API server is unreachable',
    getSuggestions: () => [
      'Check if the Evolution API server is running',
      'Verify the server URL is correct',
      'Try again in a few moments'
    ]
  },
  503: {
    type: ErrorType.API_ERROR,
    getMessage: () => 'Service unavailable - Evolution API server is temporarily down',
    getSuggestions: () => [
      'Wait a few moments and try again',
      'Check the Evolution API server status',
      'Contact your administrator if the issue persists'
    ]
  },
  504: {
    type: ErrorType.TIMEOUT_ERROR,
    getMessage: () => 'Gateway timeout - Evolution API server took too long to respond',
    getSuggestions: () => [
      'Try the request again',
      'Check if the Evolution API server is responding slowly',
      'Consider increasing the timeout value'
    ]
  }
};

/**
 * Error handler class for comprehensive error processing
 */
export class ErrorHandler {
  private enableLogging: boolean;
  private logLevel: 'error' | 'warn' | 'info' | 'debug';

  constructor(options: { enableLogging?: boolean; logLevel?: 'error' | 'warn' | 'info' | 'debug' } = {}) {
    this.enableLogging = options.enableLogging ?? true;
    this.logLevel = options.logLevel ?? 'error';
  }

  /**
   * Handle HTTP errors from axios responses
   */
  handleHttpError(error: any, context?: ErrorContext): McpError {
    // If it's already our error type, return it
    if (error instanceof McpError) {
      return error;
    }

    // Handle axios errors
    if (error.isAxiosError) {
      return this.handleAxiosError(error, context);
    }

    // Handle generic errors
    return new McpError(ErrorType.INTERNAL_ERROR, error.message || 'Unknown error occurred', {
      details: error,
      context,
      cause: error
    });
  }

  /**
   * Handle axios-specific errors
   */
  private handleAxiosError(axiosError: any, context?: ErrorContext): McpError {
    const { response, request, code, message } = axiosError;

    // Network errors (no response received)
    if (!response && request) {
      if (code === 'ECONNABORTED' || message.includes('timeout')) {
        return new TimeoutError(
          'Request timeout - the Evolution API did not respond in time',
          axiosError.timeout || 30000,
          { context, cause: axiosError }
        );
      }

      return new NetworkError(
        `Network error: ${message}`,
        { url: request.responseURL },
        { context, cause: axiosError, code }
      );
    }

    // HTTP response errors
    if (response) {
      const status = response.status;
      const data = response.data;
      const errorMapping = HTTP_STATUS_ERROR_MAP[status];

      if (errorMapping) {
        const errorMessage = errorMapping.getMessage(status, data);
        const suggestions = errorMapping.getSuggestions(status, data);

        // Create specific error types based on status
        switch (errorMapping.type) {
          case ErrorType.AUTHENTICATION_ERROR:
            return new AuthenticationError(errorMessage, {
              statusCode: status,
              details: data,
              suggestions,
              context
            });

          case ErrorType.VALIDATION_ERROR:
            return new ValidationError(errorMessage, this.extractValidationDetails(data), {
              statusCode: status,
              details: data,
              suggestions,
              context
            });

          case ErrorType.RATE_LIMIT_ERROR:
            return new RateLimitError(errorMessage, data?.retryAfter, {
              statusCode: status,
              details: data,
              suggestions,
              context
            });

          case ErrorType.NETWORK_ERROR:
            return new NetworkError(errorMessage, { url: response.config?.url }, {
              statusCode: status,
              details: data,
              suggestions,
              context
            });

          case ErrorType.TIMEOUT_ERROR:
            return new TimeoutError(errorMessage, response.config?.timeout || 30000, {
              statusCode: status,
              details: data,
              suggestions,
              context
            });

          default:
            return new McpError(errorMapping.type, errorMessage, {
              statusCode: status,
              details: data,
              suggestions,
              context
            });
        }
      }

      // Fallback for unmapped status codes
      return new McpError(ErrorType.API_ERROR, `HTTP ${status}: ${data?.message || message}`, {
        statusCode: status,
        details: data,
        context
      });
    }

    // Fallback for other axios errors
    return new McpError(ErrorType.NETWORK_ERROR, message, {
      details: axiosError,
      context,
      cause: axiosError
    });
  }

  /**
   * Extract validation details from error response
   */
  private extractValidationDetails(data: any): ValidationErrorDetail[] {
    if (!data) return [];

    const details: ValidationErrorDetail[] = [];

    // Handle different validation error formats
    if (data.errors && Array.isArray(data.errors)) {
      data.errors.forEach((error: any) => {
        details.push({
          field: error.field || error.path || 'unknown',
          value: error.value,
          message: error.message || 'Validation failed',
          code: error.code || 'VALIDATION_ERROR',
          suggestion: this.getValidationSuggestion(error)
        });
      });
    } else if (data.message && typeof data.message === 'string') {
      // Try to parse validation messages from string
      const validationMatch = data.message.match(/(\w+):\s*(.+)/);
      if (validationMatch) {
        details.push({
          field: validationMatch[1],
          value: undefined,
          message: validationMatch[2],
          code: 'VALIDATION_ERROR',
          suggestion: this.getValidationSuggestion({ field: validationMatch[1], message: validationMatch[2] })
        });
      }
    }

    return details;
  }

  /**
   * Generate validation suggestions based on field and error
   */
  private getValidationSuggestion(error: any): string {
    const field = error.field || error.path || '';
    const message = error.message || '';

    // Common validation suggestions
    if (field.includes('email')) {
      return 'Provide a valid email address (e.g., user@example.com)';
    }
    if (field.includes('phone') || field.includes('number')) {
      return 'Use the format: country code + number (e.g., 5511999999999)';
    }
    if (field.includes('url')) {
      return 'Provide a valid URL starting with http:// or https://';
    }
    if (field.includes('instance')) {
      return 'Use a valid instance name (alphanumeric characters and hyphens only)';
    }
    if (message.includes('required')) {
      return `The field '${field}' is required and cannot be empty`;
    }
    if (message.includes('format')) {
      return `Check the format of the '${field}' field`;
    }

    return `Please check the '${field}' field and try again`;
  }

  /**
   * Handle validation errors from Zod schemas
   */
  handleValidationError(zodError: z.ZodError, context?: ErrorContext): ValidationError {
    const validationDetails: ValidationErrorDetail[] = zodError.errors.map(error => ({
      field: error.path.join('.'),
      value: (error as any).received || undefined,
      message: error.message,
      code: error.code,
      suggestion: this.getZodValidationSuggestion(error)
    }));

    const message = `Validation failed: ${validationDetails.map(d => `${d.field} - ${d.message}`).join(', ')}`;

    return new ValidationError(message, validationDetails, { context });
  }

  /**
   * Generate suggestions for Zod validation errors
   */
  private getZodValidationSuggestion(error: z.ZodIssue): string {
    switch (error.code) {
      case 'invalid_type':
        return `Expected ${(error as any).expected}, but received ${(error as any).received}`;
      case 'too_small':
        if ((error as any).type === 'string') {
          return `Must be at least ${(error as any).minimum} characters long`;
        }
        return `Must be at least ${(error as any).minimum}`;
      case 'too_big':
        if ((error as any).type === 'string') {
          return `Must be no more than ${(error as any).maximum} characters long`;
        }
        return `Must be no more than ${(error as any).maximum}`;
      case 'invalid_string':
        if ((error as any).validation === 'email') {
          return 'Must be a valid email address';
        }
        if ((error as any).validation === 'url') {
          return 'Must be a valid URL';
        }
        if ((error as any).validation === 'regex') {
          return 'Value contains invalid characters. Please check the format requirements.';
        }
        return 'Invalid string format';
      case 'custom':
        return error.message;
      default:
        return 'Please check the value and try again';
    }
  }

  /**
   * Log error with appropriate level
   */
  logError(error: McpError): void {
    if (!this.enableLogging) return;

    const logData = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      severity: error.severity,
      context: error.context,
      details: error.details
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('[CRITICAL ERROR]', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('[HIGH ERROR]', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[MEDIUM ERROR]', logData);
        break;
      case ErrorSeverity.LOW:
        if (this.logLevel === 'info' || this.logLevel === 'debug') {
          console.info('[LOW ERROR]', logData);
        }
        break;
    }

    // Log stack trace for debugging
    if (this.logLevel === 'debug' && error.stack) {
      console.debug('[ERROR STACK]', error.stack);
    }
  }

  /**
   * Create error response for MCP tools
   */
  createToolErrorResponse(error: McpError): {
    success: false;
    error: {
      type: string;
      message: string;
      code?: string;
      suggestions?: string[];
      retryable: boolean;
    };
  } {
    this.logError(error);

    return {
      success: false,
      error: {
        type: error.type,
        message: error.getUserMessage(),
        code: error.code,
        suggestions: error.suggestions,
        retryable: error.retryable
      }
    };
  }

  /**
   * Create success response for MCP tools
   */
  createToolSuccessResponse<T>(data: T): {
    success: true;
    data: T;
  } {
    return {
      success: true,
      data
    };
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler();

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  /**
   * Create configuration error
   */
  configurationError(message: string, suggestions?: string[]): ConfigurationError {
    return new ConfigurationError(message, { suggestions });
  },

  /**
   * Create authentication error
   */
  authenticationError(message?: string): AuthenticationError {
    return new AuthenticationError(message || 'Authentication failed');
  },

  /**
   * Create validation error from Zod error
   */
  validationError(zodError: z.ZodError, context?: ErrorContext): ValidationError {
    return globalErrorHandler.handleValidationError(zodError, context);
  },

  /**
   * Create instance error
   */
  instanceError(instanceName: string, message?: string): InstanceError {
    return new InstanceError(
      message || `Instance '${instanceName}' not found or not connected`,
      instanceName
    );
  },

  /**
   * Create network error
   */
  networkError(message: string, url?: string): NetworkError {
    return new NetworkError(message, { url });
  },

  /**
   * Create timeout error
   */
  timeoutError(timeout: number): TimeoutError {
    return new TimeoutError(`Request timed out after ${timeout}ms`, timeout);
  },

  /**
   * Create rate limit error
   */
  rateLimitError(retryAfter?: number): RateLimitError {
    return new RateLimitError('Rate limit exceeded', retryAfter);
  }
};
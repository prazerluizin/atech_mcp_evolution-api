/**
 * Tests for comprehensive error handling system
 */

import { z } from 'zod';
import {
  ErrorHandler,
  McpError,
  ErrorType,
  ErrorSeverity,
  ConfigurationError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  InstanceError,
  ErrorUtils,
  HTTP_STATUS_ERROR_MAP
} from '../../src/utils/error-handler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler({ enableLogging: false });
  });

  describe('McpError', () => {
    it('should create error with all properties', () => {
      const error = new McpError(ErrorType.API_ERROR, 'Test error', {
        code: 'TEST_001',
        statusCode: 400,
        severity: ErrorSeverity.HIGH,
        details: { test: true },
        suggestions: ['Try again'],
        retryable: true,
        context: { operation: 'test' }
      });

      expect(error.type).toBe(ErrorType.API_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_001');
      expect(error.statusCode).toBe(400);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.details).toEqual({ test: true });
      expect(error.suggestions).toEqual(['Try again']);
      expect(error.retryable).toBe(true);
      expect(error.context).toEqual({ operation: 'test' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should use default severity and retryable values', () => {
      const error = new McpError(ErrorType.AUTHENTICATION_ERROR, 'Auth error');
      
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.retryable).toBe(false);
    });

    it('should convert to JSON correctly', () => {
      const error = new McpError(ErrorType.VALIDATION_ERROR, 'Validation failed', {
        code: 'VAL_001',
        suggestions: ['Check input']
      });

      const json = error.toJSON();
      
      expect(json.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(json.message).toBe('Validation failed');
      expect(json.code).toBe('VAL_001');
      expect(json.suggestions).toEqual(['Check input']);
      expect(json.timestamp).toBeDefined();
    });

    it('should generate user-friendly message', () => {
      const error = new McpError(ErrorType.NETWORK_ERROR, 'Connection failed', {
        suggestions: ['Check internet', 'Try again']
      });

      const userMessage = error.getUserMessage();
      
      expect(userMessage).toContain('Connection failed');
      expect(userMessage).toContain('• Check internet');
      expect(userMessage).toContain('• Try again');
    });
  });

  describe('Specific Error Classes', () => {
    it('should create ConfigurationError with correct properties', () => {
      const error = new ConfigurationError('Invalid config', {
        suggestions: ['Check settings']
      });

      expect(error.type).toBe(ErrorType.CONFIGURATION_ERROR);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.retryable).toBe(false);
      expect(error.suggestions).toEqual(['Check settings']);
    });

    it('should create AuthenticationError with default suggestions', () => {
      const error = new AuthenticationError('Auth failed');

      expect(error.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(error.suggestions).toContain('Verify your Evolution API key is correct');
    });

    it('should create ValidationError with validation details', () => {
      const validationDetails = [{
        field: 'email',
        value: 'invalid',
        message: 'Invalid email',
        code: 'invalid_email',
        suggestion: 'Use valid email format'
      }];

      const error = new ValidationError('Validation failed', validationDetails);

      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.validationDetails).toEqual(validationDetails);
    });

    it('should create NetworkError with network details', () => {
      const networkDetails = { url: 'https://api.example.com', timeout: 5000 };
      const error = new NetworkError('Network failed', networkDetails);

      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.networkDetails).toEqual(networkDetails);
      expect(error.retryable).toBe(true);
    });

    it('should create TimeoutError with timeout info', () => {
      const error = new TimeoutError('Request timeout', 30000);

      expect(error.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(error.details.timeout).toBe(30000);
      expect(error.suggestions[0]).toContain('30000ms');
    });

    it('should create RateLimitError with retry info', () => {
      const error = new RateLimitError('Rate limited', 60);

      expect(error.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(error.details.retryAfter).toBe(60);
      expect(error.suggestions[0]).toContain('60 seconds');
    });

    it('should create InstanceError with instance info', () => {
      const error = new InstanceError('Instance not found', 'test-instance');

      expect(error.type).toBe(ErrorType.INSTANCE_ERROR);
      expect(error.details.instanceName).toBe('test-instance');
    });
  });

  describe('HTTP Status Error Mapping', () => {
    it('should map 400 status to validation error', () => {
      const mapping = HTTP_STATUS_ERROR_MAP[400];
      
      expect(mapping.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(mapping.getMessage(400, { message: 'Bad request' })).toBe('Bad request');
      expect(mapping.getSuggestions(400)).toContain('Check the request parameters for correct format');
    });

    it('should map 401 status to authentication error', () => {
      const mapping = HTTP_STATUS_ERROR_MAP[401];
      
      expect(mapping.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(mapping.getMessage(401)).toContain('Authentication failed');
      expect(mapping.getSuggestions(401)).toContain('Verify your Evolution API key is correct');
    });

    it('should map 429 status to rate limit error', () => {
      const mapping = HTTP_STATUS_ERROR_MAP[429];
      
      expect(mapping.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(mapping.getSuggestions(429, { retryAfter: 120 })[0]).toContain('120 seconds');
    });

    it('should map 500 status to API error', () => {
      const mapping = HTTP_STATUS_ERROR_MAP[500];
      
      expect(mapping.type).toBe(ErrorType.API_ERROR);
      expect(mapping.getMessage(500)).toContain('Internal server error');
    });
  });

  describe('handleHttpError', () => {
    it('should return existing McpError unchanged', () => {
      const originalError = new McpError(ErrorType.API_ERROR, 'Original error');
      const result = errorHandler.handleHttpError(originalError);

      expect(result).toBe(originalError);
    });

    it('should handle axios timeout error', () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        timeout: 5000,
        request: {},
        response: undefined
      };

      const result = errorHandler.handleHttpError(axiosError);

      expect(result).toBeInstanceOf(TimeoutError);
      expect(result.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(result.message).toContain('timeout');
    });

    it('should handle axios network error', () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED',
        request: { responseURL: 'https://api.example.com' },
        response: undefined
      };

      const result = errorHandler.handleHttpError(axiosError);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should handle axios 401 response error', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Invalid API key' },
          config: { url: '/test' }
        }
      };

      const result = errorHandler.handleHttpError(axiosError);

      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.statusCode).toBe(401);
      expect(result.message).toContain('Authentication failed');
    });

    it('should handle axios 422 validation error', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: [
              { field: 'email', message: 'Invalid email', code: 'invalid' }
            ]
          }
        }
      };

      const result = errorHandler.handleHttpError(axiosError);

      expect(result).toBeInstanceOf(ValidationError);
      expect((result as ValidationError).validationDetails).toHaveLength(1);
      expect((result as ValidationError).validationDetails[0].field).toBe('email');
    });

    it('should handle generic error', () => {
      const genericError = new Error('Something went wrong');
      const result = errorHandler.handleHttpError(genericError);

      expect(result.type).toBe(ErrorType.INTERNAL_ERROR);
      expect(result.message).toBe('Something went wrong');
    });
  });

  describe('handleValidationError', () => {
    it('should handle Zod validation error', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      try {
        schema.parse({ email: 'invalid', age: 15 });
      } catch (zodError) {
        const result = errorHandler.handleValidationError(zodError as z.ZodError);

        expect(result).toBeInstanceOf(ValidationError);
        expect(result.validationDetails).toHaveLength(2);
        expect(result.validationDetails.some(d => d.field === 'email')).toBe(true);
        expect(result.validationDetails.some(d => d.field === 'age')).toBe(true);
      }
    });
  });

  describe('createToolErrorResponse', () => {
    it('should create proper tool error response', () => {
      const error = new ValidationError('Invalid input', [], {
        suggestions: ['Check format']
      });

      const response = errorHandler.createToolErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(response.error.message).toContain('Invalid input');
      expect(response.error.suggestions).toEqual(['Check format']);
      expect(response.error.retryable).toBe(false);
    });
  });

  describe('createToolSuccessResponse', () => {
    it('should create proper tool success response', () => {
      const data = { result: 'success' };
      const response = errorHandler.createToolSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });
  });
});

describe('ErrorUtils', () => {
  it('should create configuration error', () => {
    const error = ErrorUtils.configurationError('Config missing', ['Add config']);

    expect(error).toBeInstanceOf(ConfigurationError);
    expect(error.suggestions).toEqual(['Add config']);
  });

  it('should create authentication error', () => {
    const error = ErrorUtils.authenticationError();

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Authentication failed');
  });

  it('should create validation error from Zod error', () => {
    const schema = z.string().email();
    
    try {
      schema.parse('invalid-email');
    } catch (zodError) {
      const error = ErrorUtils.validationError(zodError as z.ZodError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.validationDetails).toHaveLength(1);
    }
  });

  it('should create instance error', () => {
    const error = ErrorUtils.instanceError('test-instance');

    expect(error).toBeInstanceOf(InstanceError);
    expect(error.details.instanceName).toBe('test-instance');
  });

  it('should create network error', () => {
    const error = ErrorUtils.networkError('Connection failed', 'https://api.example.com');

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.networkDetails.url).toBe('https://api.example.com');
  });

  it('should create timeout error', () => {
    const error = ErrorUtils.timeoutError(5000);

    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.details.timeout).toBe(5000);
  });

  it('should create rate limit error', () => {
    const error = ErrorUtils.rateLimitError(60);

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.details.retryAfter).toBe(60);
  });
});
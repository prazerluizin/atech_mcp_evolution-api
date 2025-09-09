import axios from 'axios';
import { EvolutionHttpClient, ErrorType, type HttpClientConfig } from '../../src/clients/evolution-http-client';
import { McpError, AuthenticationError, NetworkError, TimeoutError } from '../../src/utils/error-handler';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EvolutionHttpClient', () => {
  let client: EvolutionHttpClient;
  let mockAxiosInstance: jest.Mocked<any>;
  
  const defaultConfig: HttpClientConfig = {
    baseURL: 'https://api.example.com',
    apiKey: 'test-api-key',
    timeout: 5000,
    retryAttempts: 2,
    retryDelay: 100,
    maxRetryDelay: 1000,
    enableLogging: false
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock axios.create
    mockAxiosInstance = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      defaults: {
        headers: {},
        baseURL: '',
        timeout: 0
      },
      interceptors: {
        request: {
          use: jest.fn().mockImplementation((successHandler, errorHandler) => {
            // Store the handlers for potential use
            mockAxiosInstance._requestSuccessHandler = successHandler;
            mockAxiosInstance._requestErrorHandler = errorHandler;
          })
        },
        response: {
          use: jest.fn().mockImplementation((successHandler, errorHandler) => {
            // Store the handlers for potential use
            mockAxiosInstance._responseSuccessHandler = successHandler;
            mockAxiosInstance._responseErrorHandler = errorHandler;
          })
        }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError.mockImplementation((error) => error.isAxiosError === true);
    
    client = new EvolutionHttpClient(defaultConfig);
  });

  describe('Constructor and Configuration', () => {
    it('should create client with valid configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: defaultConfig.baseURL,
        timeout: defaultConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
          'apikey': defaultConfig.apiKey,
          'User-Agent': 'evolution-api-mcp/1.0.0'
        },
        maxRedirects: 5,
        validateStatus: expect.any(Function)
      });
    });

    it('should validate configuration schema', () => {
      expect(() => {
        new EvolutionHttpClient({
          baseURL: 'invalid-url',
          apiKey: ''
        });
      }).toThrow();
    });

    it('should use default values for optional config', () => {
      const minimalConfig = {
        baseURL: 'https://api.example.com',
        apiKey: 'test-key'
      };
      
      const client = new EvolutionHttpClient(minimalConfig);
      const config = client.getConfig();
      
      expect(config.timeout).toBe(30000);
      expect(config.retryAttempts).toBe(3);
      expect(config.retryDelay).toBe(1000);
      expect(config.maxRetryDelay).toBe(30000);
      expect(config.enableLogging).toBe(false);
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' }
      });
    });

    it('should make GET request', async () => {
      const response = await client.get('/test', { param: 'value' });
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        params: { param: 'value' },
        headers: {},
        timeout: defaultConfig.timeout
      });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ success: true });
      expect(response.statusCode).toBe(200);
    });

    it('should make POST request with data', async () => {
      const data = { message: 'test' };
      const response = await client.post('/send', data);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/send',
        data,
        params: undefined,
        headers: {},
        timeout: defaultConfig.timeout
      });
      
      expect(response.success).toBe(true);
    });

    it('should make PUT request', async () => {
      const data = { update: 'value' };
      await client.put('/update/123', data);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/update/123',
        data,
        params: undefined,
        headers: {},
        timeout: defaultConfig.timeout
      });
    });

    it('should make DELETE request', async () => {
      await client.delete('/delete/123');
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/delete/123',
        params: undefined,
        headers: {},
        timeout: defaultConfig.timeout
      });
    });

    it('should make PATCH request', async () => {
      const data = { patch: 'value' };
      await client.patch('/patch/123', data);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/patch/123',
        data,
        params: undefined,
        headers: {},
        timeout: defaultConfig.timeout
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors (401)', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);
      
      const response = await client.get('/test');
      
      expect(response.success).toBe(false);
      expect(response.error).toBeInstanceOf(McpError);
      expect(response.error?.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(response.error?.message).toContain('Authentication failed');
      expect(response.error?.statusCode).toBe(401);
      expect(response.error?.suggestions).toContain('Verify your Evolution API key is correct');
    });

    it('should handle rate limit errors (429)', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 429,
          data: { message: 'Too many requests' },
          headers: { 'retry-after': '60' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);
      
      const response = await client.get('/test');
      
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(response.error?.message).toContain('Rate limit exceeded');
      expect(response.error?.retryable).toBe(true);
      expect(response.error?.suggestions).toContain('Wait 60 seconds before making more requests');
    });

    it('should handle timeout errors', async () => {
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        timeout: 5000,
        request: { responseURL: 'https://api.example.com/test' },
        response: undefined
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);
      
      const response = await client.get('/test');
      
      expect(response.success).toBe(false);
      expect(response.error).toBeInstanceOf(McpError);
      expect(response.error?.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(response.error?.message).toContain('Request timeout');
      expect(response.error?.retryable).toBe(true);
      expect(response.error?.suggestions).toContain('Request timed out after 5000ms');
    });

    it('should handle network errors', async () => {
      const error = {
        isAxiosError: true,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:3000',
        request: { responseURL: 'https://api.example.com/test' }
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);
      
      const response = await client.get('/test');
      
      expect(response.success).toBe(false);
      expect(response.error).toBeInstanceOf(McpError);
      expect(response.error?.type).toBe(ErrorType.NETWORK_ERROR);
      expect(response.error?.message).toContain('Network error');
      expect(response.error?.retryable).toBe(true);
      expect(response.error?.suggestions).toContain('Check your internet connection');
    });

    it('should handle API errors (4xx/5xx)', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Instance not found', code: 'INSTANCE_NOT_FOUND' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);
      
      const response = await client.get('/test');
      
      expect(response.success).toBe(false);
      expect(response.error).toBeInstanceOf(McpError);
      expect(response.error?.type).toBe(ErrorType.RESOURCE_NOT_FOUND);
      expect(response.error?.message).toContain('Instance not found');
      expect(response.error?.statusCode).toBe(404);
      expect(response.error?.suggestions).toContain('Verify the resource identifier is correct');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors with exponential backoff', async () => {
      const networkError = {
        isAxiosError: true,
        code: 'ECONNRESET',
        message: 'socket hang up'
      };
      
      // Fail twice, then succeed
      mockAxiosInstance.request
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
          headers: {}
        });
      
      const response = await client.get('/test');
      
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      expect(response.success).toBe(true);
    });

    it('should not retry on authentication errors', async () => {
      const authError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(authError);
      
      const response = await client.get('/test');
      
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(response.error?.retryable).toBe(false);
    });

    it('should not retry on 4xx errors (except 429)', async () => {
      const clientError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Bad request' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(clientError);
      
      const response = await client.get('/test');
      
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
    });

    it('should respect custom retry attempts', async () => {
      const networkError = {
        isAxiosError: true,
        code: 'ECONNRESET',
        message: 'socket hang up'
      };
      
      mockAxiosInstance.request.mockRejectedValue(networkError);
      
      const response = await client.get('/test', undefined, { retries: 1 });
      
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
      expect(response.success).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const updates = {
        apiKey: 'new-api-key',
        timeout: 10000
      };
      
      client.updateConfig(updates);
      
      const config = client.getConfig();
      expect(config.apiKey).toBe('new-api-key');
      expect(config.timeout).toBe(10000);
      expect(mockAxiosInstance.defaults.headers['apikey']).toBe('new-api-key');
      expect(mockAxiosInstance.defaults.timeout).toBe(10000);
    });

    it('should update base URL', () => {
      client.updateConfig({ baseURL: 'https://new-api.example.com' });
      
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://new-api.example.com');
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { status: 'ok' },
        status: 200,
        headers: {}
      });
      
      const response = await client.healthCheck();
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/',
        params: undefined,
        headers: {},
        timeout: defaultConfig.timeout
      });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ status: 'ok' });
    });

    it('should handle health check failure', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 503,
          data: { message: 'Service unavailable' }
        }
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);
      
      const response = await client.healthCheck();
      
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.API_ERROR);
    });
  });

  describe('Statistics', () => {
    it('should track request count', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        headers: {}
      });
      
      await client.get('/test1');
      await client.post('/test2', {});
      await client.put('/test3', {});
      
      const stats = client.getStats();
      expect(stats.requestCount).toBe(3);
    });
  });

  describe('Custom Request Options', () => {
    it('should use custom timeout', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        headers: {}
      });
      
      await client.get('/test', undefined, { timeout: 15000 });
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        params: undefined,
        headers: {},
        timeout: 15000
      });
    });

    it('should merge custom headers', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        headers: {}
      });
      
      await client.post('/test', {}, undefined, { 
        headers: { 'Custom-Header': 'value' } 
      });
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data: {},
        params: undefined,
        headers: { 'Custom-Header': 'value' },
        timeout: defaultConfig.timeout
      });
    });
  });
});
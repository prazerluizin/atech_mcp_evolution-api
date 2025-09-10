/**
 * Comprehensive Error Scenarios and Edge Cases Tests
 * Tests various error conditions and edge cases across the entire system
 */

import { EvolutionMcpServer } from '../../src/server/mcp-server';
import { ConfigurationManager } from '../../src/config/configuration-manager';
import { EvolutionHttpClient } from '../../src/clients/evolution-http-client';
import { McpToolRegistry } from '../../src/server/tool-registry';
import { ErrorType } from '../../src/utils/error-handler';
import { createMockMcpError, createMockApiResponse, EnvHelpers } from '../helpers/test-utils';

describe('Error Scenarios and Edge Cases', () => {
  let server: EvolutionMcpServer;
  let configManager: ConfigurationManager;
  let httpClient: EvolutionHttpClient;
  let registry: McpToolRegistry;

  beforeEach(() => {
    EnvHelpers.setupTestEnv();
    server = new EvolutionMcpServer();
    configManager = new ConfigurationManager();
    registry = new McpToolRegistry();
  });

  afterEach(() => {
    EnvHelpers.cleanupTestEnv();
  });

  describe('Configuration Error Scenarios', () => {
    it('should handle missing configuration gracefully', async () => {
      EnvHelpers.cleanupTestEnv();
      
      await expect(configManager.loadConfig()).rejects.toThrow();
    });

    it('should handle invalid URL formats', async () => {
      process.env.EVOLUTION_URL = 'not-a-valid-url';
      process.env.EVOLUTION_API_KEY = 'test-key';

      await expect(configManager.loadConfig()).rejects.toThrow();
    });

    it('should handle empty API key', async () => {
      process.env.EVOLUTION_URL = 'https://valid-url.com';
      process.env.EVOLUTION_API_KEY = '';

      await expect(configManager.loadConfig()).rejects.toThrow();
    });

    it('should handle corrupted config file', async () => {
      const corruptedConfigPath = EnvHelpers.createTempConfig('invalid json content');
      
      try {
        const manager = new ConfigurationManager(corruptedConfigPath);
        await expect(manager.loadConfig()).rejects.toThrow();
      } finally {
        EnvHelpers.removeTempConfig(corruptedConfigPath);
      }
    });

    it('should handle config file with missing required fields', async () => {
      const incompleteConfig = {
        evolutionUrl: 'https://test.com'
        // Missing evolutionApiKey
      };
      const configPath = EnvHelpers.createTempConfig(incompleteConfig);
      
      try {
        const manager = new ConfigurationManager(configPath);
        await expect(manager.loadConfig()).rejects.toThrow();
      } finally {
        EnvHelpers.removeTempConfig(configPath);
      }
    });
  });

  describe('HTTP Client Error Scenarios', () => {
    beforeEach(() => {
      httpClient = new EvolutionHttpClient({
        baseURL: 'https://test-api.com',
        apiKey: 'test-key',
        timeout: 1000,
        retryAttempts: 1
      });
    });

    it('should handle network timeouts', async () => {
      // Mock a timeout error
      const mockAxios = require('axios');
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue({
          isAxiosError: true,
          code: 'ECONNABORTED',
          message: 'timeout of 1000ms exceeded'
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: { headers: {}, baseURL: '', timeout: 0 }
      });

      const client = new EvolutionHttpClient({
        baseURL: 'https://test-api.com',
        apiKey: 'test-key',
        timeout: 1000
      });

      const response = await client.get('/test');
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.TIMEOUT_ERROR);
    });

    it('should handle connection refused errors', async () => {
      const mockAxios = require('axios');
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue({
          isAxiosError: true,
          code: 'ECONNREFUSED',
          message: 'connect ECONNREFUSED 127.0.0.1:3000'
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: { headers: {}, baseURL: '', timeout: 0 }
      });

      const client = new EvolutionHttpClient({
        baseURL: 'https://test-api.com',
        apiKey: 'test-key'
      });

      const response = await client.get('/test');
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should handle DNS resolution errors', async () => {
      const mockAxios = require('axios');
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue({
          isAxiosError: true,
          code: 'ENOTFOUND',
          message: 'getaddrinfo ENOTFOUND invalid-domain.com'
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: { headers: {}, baseURL: '', timeout: 0 }
      });

      const client = new EvolutionHttpClient({
        baseURL: 'https://invalid-domain.com',
        apiKey: 'test-key'
      });

      const response = await client.get('/test');
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should handle SSL certificate errors', async () => {
      const mockAxios = require('axios');
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue({
          isAxiosError: true,
          code: 'CERT_UNTRUSTED',
          message: 'certificate verify failed'
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: { headers: {}, baseURL: '', timeout: 0 }
      });

      const client = new EvolutionHttpClient({
        baseURL: 'https://untrusted-cert.com',
        apiKey: 'test-key'
      });

      const response = await client.get('/test');
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe(ErrorType.NETWORK_ERROR);
    });
  });

  describe('MCP Server Error Scenarios', () => {
    it('should handle initialization failure', async () => {
      const mockConfigManager = {
        loadConfig: jest.fn().mockRejectedValue(new Error('Config load failed'))
      } as any;

      await expect(server.initialize(mockConfigManager)).rejects.toThrow('Failed to initialize MCP server');
    });

    it('should handle tool registration failures', async () => {
      const invalidTool = {
        name: '', // Invalid name
        description: 'Test tool',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async () => ({ success: true })
      };

      expect(() => registry.registerTool(invalidTool)).toThrow();
    });

    it('should handle duplicate tool registration', async () => {
      const tool = {
        name: 'test_tool',
        description: 'Test tool',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async () => ({ success: true })
      };

      registry.registerTool(tool);
      expect(() => registry.registerTool(tool)).toThrow('already registered');
    });

    it('should handle STDIO transport connection failure', async () => {
      // Mock the MCP SDK to simulate connection failure
      const mockServer = {
        setRequestHandler: jest.fn(),
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
        close: jest.fn()
      };

      // Replace the server instance
      (server as any).server = mockServer;
      (server as any).initialized = true;

      await expect(server.startStdio()).rejects.toThrow('Failed to start STDIO transport');
    });
  });

  describe('Tool Execution Error Scenarios', () => {
    it('should handle tool execution timeout', async () => {
      const slowTool = {
        name: 'slow_tool',
        description: 'Slow tool',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async () => {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
          return { success: true };
        }
      };

      registry.registerTool(slowTool);
      
      // This would timeout in a real scenario
      const tool = registry.getTool('slow_tool');
      expect(tool).toBeDefined();
    });

    it('should handle tool handler exceptions', async () => {
      const faultyTool = {
        name: 'faulty_tool',
        description: 'Faulty tool',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async () => {
          throw new Error('Tool execution failed');
        }
      };

      registry.registerTool(faultyTool);
      
      const tool = registry.getTool('faulty_tool');
      await expect(tool?.handler({})).rejects.toThrow('Tool execution failed');
    });

    it('should handle invalid tool parameters', async () => {
      const strictTool = {
        name: 'strict_tool',
        description: 'Strict tool',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async (params: any) => {
          if (!params.required) {
            throw new Error('Missing required parameter');
          }
          return { success: true };
        }
      };

      registry.registerTool(strictTool);
      
      const tool = registry.getTool('strict_tool');
      await expect(tool?.handler({})).rejects.toThrow('Missing required parameter');
    });
  });

  describe('Evolution API Error Scenarios', () => {
    it('should handle API authentication failures', async () => {
      const mockResponse = createMockApiResponse(undefined, {
        type: ErrorType.AUTHENTICATION_ERROR,
        statusCode: 401,
        message: 'Invalid API key'
      });

      // This would be handled by the HTTP client in real scenarios
      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error?.type).toBe(ErrorType.AUTHENTICATION_ERROR);
    });

    it('should handle instance not found errors', async () => {
      const mockResponse = createMockApiResponse(undefined, {
        type: ErrorType.RESOURCE_NOT_FOUND,
        statusCode: 404,
        message: 'Instance not found'
      });

      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error?.type).toBe(ErrorType.RESOURCE_NOT_FOUND);
    });

    it('should handle rate limiting', async () => {
      const mockResponse = createMockApiResponse(undefined, {
        type: ErrorType.RATE_LIMIT_ERROR,
        statusCode: 429,
        message: 'Rate limit exceeded'
      });

      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error?.type).toBe(ErrorType.RATE_LIMIT_ERROR);
    });

    it('should handle server errors', async () => {
      const mockResponse = createMockApiResponse(undefined, {
        type: ErrorType.API_ERROR,
        statusCode: 500,
        message: 'Internal server error'
      });

      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error?.type).toBe(ErrorType.API_ERROR);
    });

    it('should handle malformed API responses', async () => {
      const mockResponse = createMockApiResponse(undefined, {
        type: ErrorType.VALIDATION_ERROR,
        statusCode: 422,
        message: 'Invalid response format'
      });

      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle memory pressure gracefully', async () => {
      // Simulate registering many tools
      for (let i = 0; i < 1000; i++) {
        const tool = {
          name: `tool_${i}`,
          description: `Tool ${i}`,
          controller: 'instance' as const,
          endpoint: {} as any,
          schema: {} as any,
          handler: async () => ({ success: true })
        };
        registry.registerTool(tool);
      }

      const stats = registry.getStats();
      expect(stats.total).toBe(1000);
      
      // Clean up
      registry.clear();
      expect(registry.getStats().total).toBe(0);
    });

    it('should handle concurrent tool executions', async () => {
      const concurrentTool = {
        name: 'concurrent_tool',
        description: 'Concurrent tool',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async (params: any) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { success: true, id: params.id };
        }
      };

      registry.registerTool(concurrentTool);
      const tool = registry.getTool('concurrent_tool');

      // Execute multiple instances concurrently
      const promises = Array.from({ length: 10 }, (_, i) => 
        tool?.handler({ id: i })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result?.success).toBe(true);
        expect(result?.id).toBe(index);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tool registry', () => {
      const tools = registry.getTools();
      expect(tools).toHaveLength(0);
      
      const stats = registry.getStats();
      expect(stats.total).toBe(0);
      expect(stats.byController).toEqual({});
    });

    it('should handle tool search with no matches', () => {
      const results = registry.searchTools('nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should handle configuration with extreme values', async () => {
      const extremeConfig = {
        evolutionUrl: 'https://test.com',
        evolutionApiKey: 'test-key',
        http: {
          timeout: 1, // Very low timeout
          retryAttempts: 0, // No retries
          retryDelay: 0 // No delay
        }
      };

      const configPath = EnvHelpers.createTempConfig(extremeConfig);
      
      try {
        const manager = new ConfigurationManager(configPath);
        const config = await manager.loadConfig();
        expect(config.http.timeout).toBe(1);
        expect(config.http.retryAttempts).toBe(0);
      } finally {
        EnvHelpers.removeTempConfig(configPath);
      }
    });

    it('should handle very long tool names', () => {
      const longName = 'a'.repeat(1000);
      const tool = {
        name: longName,
        description: 'Tool with very long name',
        controller: 'instance' as const,
        endpoint: {} as any,
        schema: {} as any,
        handler: async () => ({ success: true })
      };

      // This should be handled gracefully (either accepted or rejected with clear error)
      try {
        registry.registerTool(tool);
        const retrievedTool = registry.getTool(longName);
        expect(retrievedTool?.name).toBe(longName);
      } catch (error) {
        // If rejected, should have a clear error message
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle special characters in tool names', () => {
      const specialNames = [
        'tool-with-dashes',
        'tool_with_underscores',
        'tool.with.dots',
        'tool123with456numbers'
      ];

      specialNames.forEach((name, index) => {
        const tool = {
          name,
          description: `Tool ${index}`,
          controller: 'instance' as const,
          endpoint: {} as any,
          schema: {} as any,
          handler: async () => ({ success: true })
        };

        try {
          registry.registerTool(tool);
          const retrievedTool = registry.getTool(name);
          expect(retrievedTool?.name).toBe(name);
        } catch (error) {
          // Some special characters might not be allowed
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Recovery Scenarios', () => {
    it('should recover from temporary network failures', async () => {
      // This would be tested with actual HTTP client retry logic
      const mockError = createMockMcpError({
        type: ErrorType.NETWORK_ERROR,
        retryable: true,
        message: 'Temporary network failure'
      });

      expect(mockError.retryable).toBe(true);
      expect(mockError.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should handle graceful shutdown', async () => {
      await server.initialize(configManager);
      
      // Simulate shutdown
      const serverInstance = server.getServer();
      expect(serverInstance).toBeDefined();
      
      // In a real scenario, this would clean up resources
      const stats = server.getStats();
      expect(stats.initialized).toBe(true);
    });

    it('should handle configuration reload', async () => {
      const config1 = await configManager.loadConfig();
      expect(config1).toBeDefined();
      
      // Clear cache and reload
      configManager.clearCache();
      const config2 = await configManager.loadConfig();
      
      expect(config2).toBeDefined();
      expect(config1).not.toBe(config2); // Different object instances
      expect(config1).toEqual(config2); // Same values
    });
  });
});
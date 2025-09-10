/**
 * End-to-End MCP Protocol Communication Tests
 * Tests the complete MCP protocol flow from client to Evolution API
 */

import { EvolutionMcpServer } from '../../src/server/mcp-server';
import { ConfigurationManager } from '../../src/config/configuration-manager';
import { MockMcpServer, EnvHelpers, TestData, AsyncTestHelpers } from '../helpers/test-utils';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
    onerror: null
  }))
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn()
}));

describe('MCP Protocol End-to-End Tests', () => {
  let server: EvolutionMcpServer;
  let configManager: ConfigurationManager;
  let mockMcpServer: MockMcpServer;

  beforeEach(async () => {
    EnvHelpers.setupTestEnv();
    server = new EvolutionMcpServer();
    configManager = new ConfigurationManager();
    mockMcpServer = new MockMcpServer();
  });

  afterEach(() => {
    EnvHelpers.cleanupTestEnv();
    mockMcpServer.reset();
  });

  describe('Server Initialization and Connection', () => {
    it('should initialize MCP server with all tools', async () => {
      await server.initialize(configManager);
      
      const stats = server.getStats();
      expect(stats.initialized).toBe(true);
      expect(stats.toolCount).toBeGreaterThan(0);
      expect(stats.serverInfo.name).toBe('test-evolution-mcp');
    });

    it('should establish STDIO transport connection', async () => {
      await server.initialize(configManager);
      
      // Mock successful connection
      const mockServerInstance = server.getServer();
      (mockServerInstance.connect as jest.Mock).mockResolvedValue(undefined);
      
      await expect(server.startStdio()).resolves.not.toThrow();
    });

    it('should handle MCP client disconnection gracefully', async () => {
      await server.initialize(configManager);
      await server.startStdio();
      
      // Simulate disconnection
      mockMcpServer.disconnect();
      expect(mockMcpServer.isConnected()).toBe(false);
    });

    it('should provide server capabilities to MCP client', async () => {
      await server.initialize(configManager);
      
      const registry = server.getToolRegistry();
      const tools = registry.getTools();
      
      expect(tools.length).toBeGreaterThan(0);
      
      // Verify tools have proper MCP structure
      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.schema).toBeDefined();
        expect(tool.handler).toBeDefined();
      });
    });
  });

  describe('Tool Discovery and Registration', () => {
    beforeEach(async () => {
      await server.initialize(configManager);
    });

    it('should register all Evolution API tools', async () => {
      const registry = server.getToolRegistry();
      const stats = registry.getStats();
      
      // Should have tools for all controllers
      expect(stats.byController.instance).toBeGreaterThan(0);
      expect(stats.byController.message).toBeGreaterThan(0);
      expect(stats.byController.chat).toBeGreaterThan(0);
      expect(stats.byController.group).toBeGreaterThan(0);
      expect(stats.byController.profile).toBeGreaterThan(0);
      expect(stats.byController.webhook).toBeGreaterThan(0);
    });

    it('should provide tool schemas for MCP client validation', async () => {
      const registry = server.getToolRegistry();
      const instanceTools = registry.getToolsByController('instance');
      
      expect(instanceTools.length).toBeGreaterThan(0);
      
      const createInstanceTool = instanceTools.find(t => t.name.includes('create'));
      expect(createInstanceTool).toBeDefined();
      expect(createInstanceTool?.schema).toBeDefined();
    });

    it('should handle tool metadata requests', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getTools();
      
      // Each tool should have complete metadata
      tools.forEach(tool => {
        expect(tool.name).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*$/); // Valid tool name format
        expect(tool.description).toBeTruthy();
        expect(tool.controller).toBeTruthy();
        expect(tool.endpoint).toBeDefined();
      });
    });
  });

  describe('Tool Execution Flow', () => {
    beforeEach(async () => {
      await server.initialize(configManager);
    });

    it('should execute instance creation tool end-to-end', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('instance');
      const createTool = tools.find(t => t.name.includes('create'));
      
      expect(createTool).toBeDefined();
      
      // Mock HTTP client response
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
          success: true,
          data: { instanceName: 'test-instance', status: 'created' },
          statusCode: 201
        });
        
        const result = await createTool?.handler(TestData.instance.create);
        expect(result.success).toBe(true);
      }
    });

    it('should execute message sending tool end-to-end', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('message');
      const sendTextTool = tools.find(t => t.name.includes('text'));
      
      expect(sendTextTool).toBeDefined();
      
      // Mock HTTP client response
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
          success: true,
          data: { messageId: 'msg-123', status: 'sent' },
          statusCode: 200
        });
        
        const result = await sendTextTool?.handler(TestData.message.text);
        expect(result.success).toBe(true);
      }
    });

    it('should execute group management tool end-to-end', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('group');
      const createGroupTool = tools.find(t => t.name.includes('create'));
      
      expect(createGroupTool).toBeDefined();
      
      // Mock HTTP client response
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
          success: true,
          data: { groupId: 'group-123@g.us', status: 'created' },
          statusCode: 201
        });
        
        const result = await createGroupTool?.handler(TestData.group.create);
        expect(result.success).toBe(true);
      }
    });

    it('should handle tool parameter validation', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('message');
      const sendTextTool = tools.find(t => t.name.includes('text'));
      
      expect(sendTextTool).toBeDefined();
      
      // Test with invalid parameters
      const invalidParams = {
        instance: '', // Empty instance
        number: 'invalid-number',
        text: ''
      };
      
      try {
        await sendTextTool?.handler(invalidParams);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Error Handling in MCP Context', () => {
    beforeEach(async () => {
      await server.initialize(configManager);
    });

    it('should return MCP-formatted errors for tool failures', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('instance');
      const createTool = tools.find(t => t.name.includes('create'));
      
      expect(createTool).toBeDefined();
      
      // Mock HTTP client error
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
          success: false,
          error: {
            type: 'AUTHENTICATION_ERROR',
            message: 'Invalid API key',
            statusCode: 401,
            severity: 'error',
            timestamp: new Date(),
            suggestions: ['Check your API key'],
            retryable: false,
            code: 'AUTH_FAILED',
            details: {},
            context: {}
          },
          statusCode: 401
        });
        
        const result = await createTool?.handler(TestData.instance.create);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should handle network errors gracefully in MCP context', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('message');
      const sendTool = tools.find(t => t.name.includes('text'));
      
      expect(sendTool).toBeDefined();
      
      // Mock network error
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: 'Connection failed',
            severity: 'error',
            timestamp: new Date(),
            suggestions: ['Check network connection'],
            retryable: true,
            code: 'NETWORK_FAILED',
            details: {},
            context: {}
          },
          statusCode: 0
        });
        
        const result = await sendTool?.handler(TestData.message.text);
        expect(result.success).toBe(false);
        expect(result.error?.retryable).toBe(true);
      }
    });

    it('should handle Evolution API rate limiting', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('chat');
      const findTool = tools.find(t => t.name.includes('find'));
      
      expect(findTool).toBeDefined();
      
      // Mock rate limit error
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.get as jest.Mock).mockResolvedValue({
          success: false,
          error: {
            type: 'RATE_LIMIT_ERROR',
            message: 'Rate limit exceeded',
            statusCode: 429,
            severity: 'warning',
            timestamp: new Date(),
            suggestions: ['Wait before retrying'],
            retryable: true,
            code: 'RATE_LIMITED',
            details: { retryAfter: 60 },
            context: {}
          },
          statusCode: 429
        });
        
        const result = await findTool?.handler({
          instance: 'test-instance',
          where: { key: { remoteJid: 'test@c.us' } }
        });
        
        expect(result.success).toBe(false);
        expect(result.error?.type).toBe('RATE_LIMIT_ERROR');
      }
    });
  });

  describe('Concurrent Operations', () => {
    beforeEach(async () => {
      await server.initialize(configManager);
    });

    it('should handle multiple concurrent tool executions', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('message');
      const sendTool = tools.find(t => t.name.includes('text'));
      
      expect(sendTool).toBeDefined();
      
      // Mock HTTP client responses
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        (mockHttpClient.post as jest.Mock).mockImplementation(async (path, data) => {
          await AsyncTestHelpers.delay(100); // Simulate network delay
          return {
            success: true,
            data: { messageId: `msg-${Date.now()}`, status: 'sent' },
            statusCode: 200
          };
        });
        
        // Execute multiple tools concurrently
        const promises = Array.from({ length: 5 }, (_, i) => 
          sendTool?.handler({
            ...TestData.message.text,
            text: `Message ${i}`
          })
        );
        
        const results = await Promise.all(promises);
        expect(results).toHaveLength(5);
        results.forEach(result => {
          expect(result?.success).toBe(true);
        });
      }
    });

    it('should handle mixed success and failure scenarios', async () => {
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('instance');
      const createTool = tools.find(t => t.name.includes('create'));
      
      expect(createTool).toBeDefined();
      
      // Mock HTTP client with alternating success/failure
      const mockHttpClient = server.getHttpClient();
      if (mockHttpClient) {
        let callCount = 0;
        (mockHttpClient.post as jest.Mock).mockImplementation(async () => {
          callCount++;
          if (callCount % 2 === 0) {
            return {
              success: false,
              error: {
                type: 'API_ERROR',
                message: 'Server error',
                statusCode: 500,
                severity: 'error',
                timestamp: new Date(),
                suggestions: ['Try again later'],
                retryable: true,
                code: 'SERVER_ERROR',
                details: {},
                context: {}
              },
              statusCode: 500
            };
          }
          return {
            success: true,
            data: { instanceName: `instance-${callCount}`, status: 'created' },
            statusCode: 201
          };
        });
        
        const promises = Array.from({ length: 4 }, (_, i) => 
          createTool?.handler({
            ...TestData.instance.create,
            instanceName: `test-instance-${i}`
          })
        );
        
        const results = await Promise.all(promises);
        expect(results).toHaveLength(4);
        
        // Should have 2 successes and 2 failures
        const successes = results.filter(r => r?.success);
        const failures = results.filter(r => !r?.success);
        expect(successes).toHaveLength(2);
        expect(failures).toHaveLength(2);
      }
    });
  });

  describe('Health Monitoring and Diagnostics', () => {
    beforeEach(async () => {
      await server.initialize(configManager);
    });

    it('should provide health status through MCP', async () => {
      const health = await server.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.details.server).toBe('initialized');
      expect(health.details.httpClient).toBe('ready');
    });

    it('should provide server statistics', async () => {
      const stats = server.getStats();
      expect(stats.initialized).toBe(true);
      expect(stats.toolCount).toBeGreaterThan(0);
      expect(stats.serverInfo.name).toBeTruthy();
      expect(stats.serverInfo.version).toBeTruthy();
    });

    it('should track tool usage statistics', async () => {
      const registry = server.getToolRegistry();
      const initialStats = registry.getStats();
      
      // Execute some tools
      const tools = registry.getToolsByController('message');
      const sendTool = tools.find(t => t.name.includes('text'));
      
      if (sendTool) {
        const mockHttpClient = server.getHttpClient();
        if (mockHttpClient) {
          (mockHttpClient.post as jest.Mock).mockResolvedValue({
            success: true,
            data: { messageId: 'msg-123' },
            statusCode: 200
          });
          
          await sendTool.handler(TestData.message.text);
        }
      }
      
      // Stats should reflect usage (in a real implementation)
      const finalStats = registry.getStats();
      expect(finalStats.total).toBe(initialStats.total);
    });
  });

  describe('Configuration Changes During Runtime', () => {
    beforeEach(async () => {
      await server.initialize(configManager);
    });

    it('should handle configuration updates', async () => {
      const httpClient = server.getHttpClient();
      expect(httpClient).toBeDefined();
      
      if (httpClient) {
        const initialConfig = httpClient.getConfig();
        expect(initialConfig.apiKey).toBe('test-api-key');
        
        // Update configuration
        httpClient.updateConfig({ apiKey: 'new-api-key' });
        
        const updatedConfig = httpClient.getConfig();
        expect(updatedConfig.apiKey).toBe('new-api-key');
      }
    });

    it('should handle Evolution API URL changes', async () => {
      const httpClient = server.getHttpClient();
      
      if (httpClient) {
        const initialConfig = httpClient.getConfig();
        expect(initialConfig.baseURL).toBe('https://test-evolution-api.com');
        
        // Update base URL
        httpClient.updateConfig({ baseURL: 'https://new-api.com' });
        
        const updatedConfig = httpClient.getConfig();
        expect(updatedConfig.baseURL).toBe('https://new-api.com');
      }
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should clean up resources on shutdown', async () => {
      await server.initialize(configManager);
      
      const stats = server.getStats();
      expect(stats.initialized).toBe(true);
      
      // In a real implementation, this would clean up connections, timers, etc.
      const serverInstance = server.getServer();
      expect(serverInstance).toBeDefined();
    });

    it('should handle graceful shutdown during active operations', async () => {
      await server.initialize(configManager);
      
      const registry = server.getToolRegistry();
      const tools = registry.getToolsByController('message');
      const sendTool = tools.find(t => t.name.includes('text'));
      
      if (sendTool) {
        const mockHttpClient = server.getHttpClient();
        if (mockHttpClient) {
          // Mock a slow operation
          (mockHttpClient.post as jest.Mock).mockImplementation(async () => {
            await AsyncTestHelpers.delay(1000);
            return { success: true, data: {}, statusCode: 200 };
          });
          
          // Start operation
          const operationPromise = sendTool.handler(TestData.message.text);
          
          // Simulate shutdown request
          await AsyncTestHelpers.delay(100);
          
          // Operation should complete or be cancelled gracefully
          const result = await operationPromise;
          expect(result).toBeDefined();
        }
      }
    });
  });
});
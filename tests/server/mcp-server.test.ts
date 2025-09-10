/**
 * Tests for MCP Server Core Implementation
 */

import { EvolutionMcpServer } from '../../src/server/mcp-server';
import { ConfigurationManager } from '../../src/config/configuration-manager';

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

// Mock the configuration manager
jest.mock('../../src/config/configuration-manager', () => ({
  ConfigurationManager: jest.fn().mockImplementation(() => ({
    loadConfig: jest.fn().mockResolvedValue({
      evolutionUrl: 'https://test-api.com',
      evolutionApiKey: 'test-key',
      server: {
        name: 'test-server',
        version: '1.0.0'
      },
      http: {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    })
  }))
}));

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client', () => ({
  EvolutionHttpClient: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue({ success: true }),
    getStats: jest.fn().mockReturnValue({ requestCount: 0 })
  }))
}));

// Mock the tool generator
jest.mock('../../src/server/tool-generator', () => ({
  mcpToolGenerator: {
    generateTools: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock the tool registry
jest.mock('../../src/server/tool-registry', () => ({
  mcpToolRegistry: {
    getStats: jest.fn().mockReturnValue({
      total: 5,
      byController: {},
      registered: []
    }),
    getTools: jest.fn().mockReturnValue([]),
    getTool: jest.fn().mockReturnValue(null)
  }
}));

describe('EvolutionMcpServer', () => {
  let server: EvolutionMcpServer;
  let configManager: ConfigurationManager;

  beforeEach(() => {
    server = new EvolutionMcpServer();
    configManager = new ConfigurationManager();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      await expect(server.initialize(configManager)).resolves.not.toThrow();
    });

    it('should not initialize twice', async () => {
      await server.initialize(configManager);
      await server.initialize(configManager); // Should not throw
    });

    it('should throw error if configuration is invalid', async () => {
      const mockConfigManager = {
        loadConfig: jest.fn().mockRejectedValue(new Error('Invalid config'))
      } as any;

      await expect(server.initialize(mockConfigManager)).rejects.toThrow('Failed to initialize MCP server');
    });
  });

  describe('STDIO transport', () => {
    it('should start STDIO transport after initialization', async () => {
      await server.initialize(configManager);
      
      // Mock the connect method to avoid actual connection
      const mockServer = server.getServer();
      (mockServer.connect as jest.Mock).mockResolvedValue(undefined);

      await expect(server.startStdio()).resolves.not.toThrow();
    });

    it('should throw error if starting before initialization', async () => {
      await expect(server.startStdio()).rejects.toThrow('Server must be initialized before starting');
    });
  });

  describe('server statistics', () => {
    it('should return correct stats before initialization', () => {
      const stats = server.getStats();
      expect(stats.initialized).toBe(false);
      expect(stats.toolCount).toBe(5); // Mocked value
    });

    it('should return correct stats after initialization', async () => {
      await server.initialize(configManager);
      const stats = server.getStats();
      expect(stats.initialized).toBe(true);
      expect(stats.serverInfo.name).toBe('test-server');
    });
  });

  describe('health check', () => {
    it('should return unhealthy before initialization', async () => {
      const health = await server.healthCheck();
      expect(health.healthy).toBe(false);
      expect(health.details.error).toBe('Server not initialized');
    });

    it('should return healthy after initialization', async () => {
      await server.initialize(configManager);
      const health = await server.healthCheck();
      expect(health.healthy).toBe(true);
    });
  });

  describe('component access', () => {
    it('should provide access to HTTP client after initialization', async () => {
      await server.initialize(configManager);
      const httpClient = server.getHttpClient();
      expect(httpClient).toBeDefined();
    });

    it('should provide access to tool registry', () => {
      const registry = server.getToolRegistry();
      expect(registry).toBeDefined();
    });

    it('should provide access to server instance', () => {
      const serverInstance = server.getServer();
      expect(serverInstance).toBeDefined();
    });
  });
});
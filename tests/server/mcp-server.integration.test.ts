/**
 * Integration tests for MCP Server
 */

import { EvolutionMcpServer } from '../../src/server/mcp-server';
import { ConfigurationManager } from '../../src/config/configuration-manager';

describe('EvolutionMcpServer Integration', () => {
  let server: EvolutionMcpServer;

  beforeEach(() => {
    server = new EvolutionMcpServer();
  });

  afterEach(async () => {
    // Clean up any resources
    try {
      const serverInstance = server.getServer();
      if (serverInstance && typeof serverInstance.close === 'function') {
        await serverInstance.close();
      }
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  it('should create server instance without errors', () => {
    expect(server).toBeInstanceOf(EvolutionMcpServer);
    expect(server.getStats().initialized).toBe(false);
  });

  it('should handle initialization with missing configuration gracefully', async () => {
    const mockConfigManager = {
      loadConfig: jest.fn().mockRejectedValue(new Error('Configuration not found'))
    } as any;

    await expect(server.initialize(mockConfigManager)).rejects.toThrow('Failed to initialize MCP server');
  });

  it('should provide access to internal components', () => {
    const registry = server.getToolRegistry();
    const serverInstance = server.getServer();
    
    expect(registry).toBeDefined();
    expect(serverInstance).toBeDefined();
  });

  it('should handle health check before initialization', async () => {
    const health = await server.healthCheck();
    expect(health.healthy).toBe(false);
    expect(health.details.error).toBe('Server not initialized');
  });

  it('should return proper server statistics', () => {
    const stats = server.getStats();
    expect(stats).toHaveProperty('initialized');
    expect(stats).toHaveProperty('toolCount');
    expect(stats).toHaveProperty('serverInfo');
    expect(stats.serverInfo).toHaveProperty('name');
    expect(stats.serverInfo).toHaveProperty('version');
  });
});
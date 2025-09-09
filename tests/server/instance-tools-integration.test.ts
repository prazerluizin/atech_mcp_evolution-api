/**
 * Integration tests for Instance Controller tools with Tool Registry
 */

import { McpToolRegistry } from '../../src/server/tool-registry';
import { EvolutionHttpClient } from '../../src/clients/evolution-http-client';

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client');

describe('Instance Tools Integration', () => {
  let toolRegistry: McpToolRegistry;
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;

  beforeEach(() => {
    toolRegistry = new McpToolRegistry();
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
      updateConfig: jest.fn(),
      getConfig: jest.fn(),
      healthCheck: jest.fn(),
      getStats: jest.fn()
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerInstanceTools', () => {
    it('should register all instance tools successfully', () => {
      expect(toolRegistry.getStats().total).toBe(0);

      toolRegistry.registerInstanceTools(mockHttpClient);

      const stats = toolRegistry.getStats();
      expect(stats.total).toBe(6);
      expect(stats.byController.instance).toBe(6);

      const toolNames = toolRegistry.getToolNames();
      expect(toolNames).toContain('evolution_create_instance');
      expect(toolNames).toContain('evolution_fetch_instances');
      expect(toolNames).toContain('evolution_connect_instance');
      expect(toolNames).toContain('evolution_restart_instance');
      expect(toolNames).toContain('evolution_delete_instance');
      expect(toolNames).toContain('evolution_set_presence');
    });

    it('should allow retrieval of instance tools by controller', () => {
      toolRegistry.registerInstanceTools(mockHttpClient);

      const instanceTools = toolRegistry.getToolsByController('instance');
      expect(instanceTools).toHaveLength(6);

      instanceTools.forEach(tool => {
        expect(tool.controller).toBe('instance');
        expect(tool.name).toMatch(/^evolution_/);
      });
    });

    it('should allow individual tool retrieval', () => {
      toolRegistry.registerInstanceTools(mockHttpClient);

      const createTool = toolRegistry.getTool('evolution_create_instance');
      expect(createTool).toBeDefined();
      expect(createTool?.name).toBe('evolution_create_instance');
      expect(createTool?.description).toContain('Create a new WhatsApp instance');

      const fetchTool = toolRegistry.getTool('evolution_fetch_instances');
      expect(fetchTool).toBeDefined();
      expect(fetchTool?.name).toBe('evolution_fetch_instances');
      expect(fetchTool?.description).toContain('List all WhatsApp instances');
    });

    it('should provide proper tool configuration export', () => {
      toolRegistry.registerInstanceTools(mockHttpClient);

      const config = toolRegistry.exportConfig();
      expect(config.tools).toHaveLength(6);
      expect(config.stats.total).toBe(6);

      config.tools.forEach((tool: any) => {
        expect(tool.name).toMatch(/^evolution_/);
        expect(tool.controller).toBe('instance');
        expect(tool.hasHandler).toBe(true);
        expect(tool.hasSchema).toBe(true);
        expect(tool.endpoint).toBeDefined();
      });
    });

    it('should handle tool search functionality', () => {
      toolRegistry.registerInstanceTools(mockHttpClient);

      const createTools = toolRegistry.searchTools('create');
      expect(createTools).toHaveLength(1);
      expect(createTools[0].name).toBe('evolution_create_instance');

      const instanceTools = toolRegistry.searchTools('instance');
      expect(instanceTools.length).toBeGreaterThan(0);

      const presenceTools = toolRegistry.searchTools('presence');
      expect(presenceTools).toHaveLength(1);
      expect(presenceTools[0].name).toBe('evolution_set_presence');
    });

    it('should prevent duplicate tool registration', () => {
      toolRegistry.registerInstanceTools(mockHttpClient);
      
      expect(() => {
        toolRegistry.registerInstanceTools(mockHttpClient);
      }).toThrow(/already registered/);
    });
  });

  describe('Tool Execution Integration', () => {
    beforeEach(() => {
      toolRegistry.registerInstanceTools(mockHttpClient);
    });

    it('should execute create instance tool successfully', async () => {
      const tool = toolRegistry.getTool('evolution_create_instance');
      expect(tool).toBeDefined();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { instanceName: 'test_instance', status: 'created' },
        statusCode: 201
      });

      const result = await tool!.handler({
        instanceName: 'test_instance',
        qrcode: true
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('created successfully');
    });

    it('should execute fetch instances tool successfully', async () => {
      const tool = toolRegistry.getTool('evolution_fetch_instances');
      expect(tool).toBeDefined();

      mockHttpClient.get.mockResolvedValue({
        success: true,
        data: [
          { instanceName: 'instance1', status: 'open' },
          { instanceName: 'instance2', status: 'close' }
        ],
        statusCode: 200
      });

      const result = await tool!.handler({});

      expect(result.success).toBe(true);
      expect(result.data?.instances).toHaveLength(2);
    });

    it('should execute set presence tool successfully', async () => {
      const tool = toolRegistry.getTool('evolution_set_presence');
      expect(tool).toBeDefined();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { status: 'presence updated' },
        statusCode: 200
      });

      const result = await tool!.handler({
        instance: 'test_instance',
        presence: 'available'
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Online');
    });
  });
});
/**
 * Tests for Instance Controller MCP Tools
 */

import { InstanceTools } from '../../src/server/tools/instance-tools';
import { EvolutionHttpClient, ApiResponse, ErrorType } from '../../src/clients/evolution-http-client';
import { createMockMcpError } from '../helpers/test-utils';

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client');

describe('InstanceTools', () => {
  let instanceTools: InstanceTools;
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;

  beforeEach(() => {
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

    instanceTools = new InstanceTools(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCreateInstanceTool', () => {
    it('should create a valid create-instance tool', () => {
      const tool = instanceTools.createCreateInstanceTool();

      expect(tool.name).toBe('evolution_create_instance');
      expect(tool.description).toContain('Create a new WhatsApp instance');
      expect(tool.controller).toBe('instance');
      expect(tool.schema).toBeDefined();
      expect(tool.handler).toBeDefined();
      expect(tool.examples).toBeDefined();
    });

    it('should validate schema correctly', () => {
      const tool = instanceTools.createCreateInstanceTool();
      
      // Valid parameters
      const validParams = {
        instanceName: 'test_instance',
        qrcode: true,
        webhook: 'https://example.com/webhook'
      };

      expect(() => tool.schema.parse(validParams)).not.toThrow();

      // Invalid parameters
      const invalidParams = {
        instanceName: '', // Empty name
        webhook: 'invalid-url' // Invalid URL
      };

      expect(() => tool.schema.parse(invalidParams)).toThrow();
    });

    it('should handle successful instance creation', async () => {
      const tool = instanceTools.createCreateInstanceTool();
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          instanceName: 'test_instance',
          status: 'created',
          qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
        },
        statusCode: 201
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instanceName: 'test_instance',
        qrcode: true
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('created successfully');
      expect(mockHttpClient.post).toHaveBeenCalledWith('/instance/create', params);
    });

    it('should handle API errors gracefully', async () => {
      const tool = instanceTools.createCreateInstanceTool();
      const mockResponse: ApiResponse = {
        success: false,
        error: createMockMcpError({
          type: ErrorType.API_ERROR,
          message: 'Instance already exists',
          statusCode: 409
        }),
        statusCode: 409
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instanceName: 'existing_instance'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('API_ERROR');
      expect(result.error?.message).toContain('Conflict');
    });
  });

  describe('createFetchInstancesTool', () => {
    it('should create a valid fetch-instances tool', () => {
      const tool = instanceTools.createFetchInstancesTool();

      expect(tool.name).toBe('evolution_fetch_instances');
      expect(tool.description).toContain('List all WhatsApp instances');
      expect(tool.controller).toBe('instance');
      expect(tool.schema).toBeDefined();
    });

    it('should handle successful instances fetch', async () => {
      const tool = instanceTools.createFetchInstancesTool();
      const mockResponse: ApiResponse = {
        success: true,
        data: [
          { instanceName: 'instance1', status: 'open' },
          { instanceName: 'instance2', status: 'close' }
        ],
        statusCode: 200
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await tool.handler({});

      expect(result.success).toBe(true);
      expect(result.data?.instances).toHaveLength(2);
      expect(result.data?.summary).toHaveLength(2);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/instance/fetchInstances');
    });
  });

  describe('createConnectInstanceTool', () => {
    it('should create a valid connect-instance tool', () => {
      const tool = instanceTools.createConnectInstanceTool();

      expect(tool.name).toBe('evolution_connect_instance');
      expect(tool.description).toContain('Connect a WhatsApp instance');
      expect(tool.controller).toBe('instance');
    });

    it('should handle successful instance connection', async () => {
      const tool = instanceTools.createConnectInstanceTool();
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          status: 'connecting'
        },
        statusCode: 200
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const params = { instance: 'test_instance' };
      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.qrCode).toBeDefined();
      expect(result.data?.instructions).toContain('Scan the QR code');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/instance/connect/test_instance');
    });
  });

  describe('createRestartInstanceTool', () => {
    it('should create a valid restart-instance tool', () => {
      const tool = instanceTools.createRestartInstanceTool();

      expect(tool.name).toBe('evolution_restart_instance');
      expect(tool.description).toContain('Restart a WhatsApp instance');
      expect(tool.controller).toBe('instance');
    });

    it('should handle successful instance restart', async () => {
      const tool = instanceTools.createRestartInstanceTool();
      const mockResponse: ApiResponse = {
        success: true,
        data: { status: 'restarting' },
        statusCode: 200
      };

      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = { instance: 'test_instance' };
      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('restarted successfully');
      expect(mockHttpClient.put).toHaveBeenCalledWith('/instance/restart/test_instance');
    });
  });

  describe('createDeleteInstanceTool', () => {
    it('should create a valid delete-instance tool', () => {
      const tool = instanceTools.createDeleteInstanceTool();

      expect(tool.name).toBe('evolution_delete_instance');
      expect(tool.description).toContain('Permanently delete a WhatsApp instance');
      expect(tool.controller).toBe('instance');
    });

    it('should handle successful instance deletion', async () => {
      const tool = instanceTools.createDeleteInstanceTool();
      const mockResponse: ApiResponse = {
        success: true,
        data: { message: 'Instance deleted' },
        statusCode: 200
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const params = { instance: 'test_instance' };
      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('deleted successfully');
      expect(result.data?.warning).toContain('cannot be undone');
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/instance/delete/test_instance');
    });
  });

  describe('createSetPresenceTool', () => {
    it('should create a valid set-presence tool', () => {
      const tool = instanceTools.createSetPresenceTool();

      expect(tool.name).toBe('evolution_set_presence');
      expect(tool.description).toContain('Set the online presence status');
      expect(tool.controller).toBe('instance');
    });

    it('should validate presence values', () => {
      const tool = instanceTools.createSetPresenceTool();
      
      const validParams = {
        instance: 'test_instance',
        presence: 'available'
      };

      expect(() => tool.schema.parse(validParams)).not.toThrow();

      const invalidParams = {
        instance: 'test_instance',
        presence: 'invalid_status'
      };

      expect(() => tool.schema.parse(invalidParams)).toThrow();
    });

    it('should handle successful presence update', async () => {
      const tool = instanceTools.createSetPresenceTool();
      const mockResponse: ApiResponse = {
        success: true,
        data: { status: 'presence updated' },
        statusCode: 200
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test_instance',
        presence: 'available'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Online');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/chat/presence/test_instance',
        { presence: 'available' }
      );
    });
  });

  describe('getAllTools', () => {
    it('should return all instance tools', () => {
      const tools = instanceTools.getAllTools();

      expect(tools).toHaveLength(6);
      expect(tools.map(t => t.name)).toEqual([
        'evolution_create_instance',
        'evolution_fetch_instances',
        'evolution_connect_instance',
        'evolution_restart_instance',
        'evolution_delete_instance',
        'evolution_set_presence'
      ]);
    });

    it('should have all tools with proper structure', () => {
      const tools = instanceTools.getAllTools();

      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.controller).toBe('instance');
        expect(tool.endpoint).toBeDefined();
        expect(tool.schema).toBeDefined();
        expect(tool.handler).toBeDefined();
        expect(tool.examples).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const tool = instanceTools.createCreateInstanceTool();
      const mockResponse: ApiResponse = {
        success: false,
        error: createMockMcpError({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Invalid API key',
          statusCode: 401
        }),
        statusCode: 401
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await tool.handler({ instanceName: 'test' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('AUTHENTICATION_ERROR');
      expect(result.error?.details?.suggestion).toContain('EVOLUTION_API_KEY');
    });

    it('should handle network errors', async () => {
      const tool = instanceTools.createFetchInstancesTool();
      const mockResponse: ApiResponse = {
        success: false,
        error: createMockMcpError({
          type: ErrorType.NETWORK_ERROR,
          message: 'Connection failed'
        }),
        statusCode: 0
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await tool.handler({});

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('NETWORK_ERROR');
      expect(result.error?.details?.suggestion).toContain('EVOLUTION_URL');
    });

    it('should handle timeout errors', async () => {
      const tool = instanceTools.createConnectInstanceTool();
      const mockResponse: ApiResponse = {
        success: false,
        error: createMockMcpError({
          type: ErrorType.TIMEOUT_ERROR,
          message: 'Request timeout'
        }),
        statusCode: 0
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await tool.handler({ instance: 'test' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('TIMEOUT_ERROR');
      expect(result.error?.details?.suggestion).toContain('Try again');
    });

    it('should handle unexpected errors', async () => {
      const tool = instanceTools.createCreateInstanceTool();
      
      mockHttpClient.post.mockRejectedValue(new Error('Unexpected error'));

      const result = await tool.handler({ instanceName: 'test' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('UNKNOWN_ERROR');
      expect(result.error?.message).toContain('Unexpected error');
    });
  });
});
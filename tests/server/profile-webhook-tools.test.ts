/**
 * Unit tests for Profile and Webhook Management Tools
 */

import { ProfileWebhookTools } from '../../src/server/tools/profile-webhook-tools';
import { EvolutionHttpClient, ErrorType } from '../../src/clients/evolution-http-client';

// Mock the entire HTTP client module
jest.mock('../../src/clients/evolution-http-client');

describe('ProfileWebhookTools', () => {
  let profileWebhookTools: ProfileWebhookTools;
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;

  beforeEach(() => {
    // Create a mock instance
    const MockedEvolutionHttpClient = EvolutionHttpClient as jest.MockedClass<typeof EvolutionHttpClient>;
    mockHttpClient = new MockedEvolutionHttpClient({
      baseURL: 'http://test.com',
      apiKey: 'test-key'
    }) as jest.Mocked<EvolutionHttpClient>;
    
    // Mock the methods we need
    mockHttpClient.get = jest.fn();
    mockHttpClient.post = jest.fn();
    mockHttpClient.put = jest.fn();
    mockHttpClient.delete = jest.fn();
    
    profileWebhookTools = new ProfileWebhookTools(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tool Creation', () => {
    it('should create fetch profile tool with correct configuration', () => {
      const tool = profileWebhookTools.createFetchProfileTool();
      
      expect(tool.name).toBe('evolution_fetch_profile');
      expect(tool.description).toContain('Fetch profile information');
      expect(tool.controller).toBe('profile');
      expect(tool.schema).toBeDefined();
      expect(tool.handler).toBeDefined();
    });

    it('should create update profile name tool with correct configuration', () => {
      const tool = profileWebhookTools.createUpdateProfileNameTool();
      
      expect(tool.name).toBe('evolution_update_profile_name');
      expect(tool.description).toContain('Update the profile name');
      expect(tool.controller).toBe('profile');
    });

    it('should create set webhook tool with correct configuration', () => {
      const tool = profileWebhookTools.createSetWebhookTool();
      
      expect(tool.name).toBe('evolution_set_webhook');
      expect(tool.description).toContain('Configure webhook settings');
      expect(tool.controller).toBe('webhook');
    });

    it('should create get information tool with correct configuration', () => {
      const tool = profileWebhookTools.createGetInformationTool();
      
      expect(tool.name).toBe('evolution_get_information');
      expect(tool.description).toContain('Get Evolution API information');
      expect(tool.controller).toBe('information');
    });
  });

  describe('Tool Functionality', () => {
    it('should handle successful profile fetch', async () => {
      const mockResponse = {
        success: true,
        statusCode: 200,
        data: {
          name: 'Test User',
          status: 'Available'
        }
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const tool = profileWebhookTools.createFetchProfileTool();
      const result = await tool.handler({ instance: 'test-instance' });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/chat/fetchProfile/test-instance', {});
      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Profile information fetched successfully');
    });

    it('should handle successful webhook configuration', async () => {
      const mockResponse = {
        success: true,
        statusCode: 200,
        data: { configured: true }
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const webhookConfig = {
        url: 'https://myserver.com/webhook',
        enabled: true,
        events: ['MESSAGES_UPSERT']
      };

      const tool = profileWebhookTools.createSetWebhookTool();
      const result = await tool.handler({ 
        instance: 'test-instance', 
        webhook: webhookConfig 
      });

      expect(result.success).toBe(true);
      expect(result.data?.webhookUrl).toBe(webhookConfig.url);
    });

    it('should validate webhook URL format', async () => {
      const tool = profileWebhookTools.createSetWebhookTool();
      const result = await tool.handler({ 
        instance: 'test-instance', 
        webhook: { url: 'invalid-url' } 
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.error?.message).toContain('Invalid webhook URL format');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        success: false,
        statusCode: 404,
        error: {
          type: ErrorType.API_ERROR,
          message: 'Instance not found',
          statusCode: 404
        }
      };
      mockHttpClient.post.mockResolvedValue(mockError);

      const tool = profileWebhookTools.createFetchProfileTool();
      const result = await tool.handler({ instance: 'invalid-instance' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.API_ERROR);
    });
  });

  describe('getAllTools', () => {
    it('should return all profile and webhook tools', () => {
      const tools = profileWebhookTools.getAllTools();
      
      expect(tools).toHaveLength(11);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('evolution_fetch_profile');
      expect(toolNames).toContain('evolution_update_profile_name');
      expect(toolNames).toContain('evolution_update_profile_status');
      expect(toolNames).toContain('evolution_update_profile_picture');
      expect(toolNames).toContain('evolution_fetch_privacy_settings');
      expect(toolNames).toContain('evolution_update_privacy_settings');
      expect(toolNames).toContain('evolution_fetch_business_profile');
      expect(toolNames).toContain('evolution_update_business_profile');
      expect(toolNames).toContain('evolution_set_webhook');
      expect(toolNames).toContain('evolution_get_webhook');
      expect(toolNames).toContain('evolution_get_information');
    });

    it('should return tools with correct controllers', () => {
      const tools = profileWebhookTools.getAllTools();
      
      const profileTools = tools.filter(tool => tool.controller === 'profile');
      const webhookTools = tools.filter(tool => tool.controller === 'webhook');
      const informationTools = tools.filter(tool => tool.controller === 'information');
      
      expect(profileTools).toHaveLength(8);
      expect(webhookTools).toHaveLength(2);
      expect(informationTools).toHaveLength(1);
    });
  });

  describe('Schema Validation', () => {
    it('should validate profile name parameters', () => {
      const tool = profileWebhookTools.createUpdateProfileNameTool();
      
      // Valid parameters
      expect(() => {
        tool.schema.parse({
          instance: 'test-instance',
          name: 'Valid Name'
        });
      }).not.toThrow();

      // Invalid parameters (empty name)
      expect(() => {
        tool.schema.parse({
          instance: 'test-instance',
          name: ''
        });
      }).toThrow();
    });

    it('should validate webhook parameters', () => {
      const tool = profileWebhookTools.createSetWebhookTool();
      
      // Valid webhook configuration
      expect(() => {
        tool.schema.parse({
          instance: 'test-instance',
          webhook: {
            url: 'https://valid.com/webhook',
            enabled: true,
            events: ['MESSAGES_UPSERT']
          }
        });
      }).not.toThrow();

      // Invalid webhook URL
      expect(() => {
        tool.schema.parse({
          instance: 'test-instance',
          webhook: {
            url: 'not-a-url'
          }
        });
      }).toThrow();
    });

    it('should validate privacy settings parameters', () => {
      const tool = profileWebhookTools.createUpdatePrivacySettingsTool();
      
      // Valid privacy settings
      expect(() => {
        tool.schema.parse({
          instance: 'test-instance',
          privacySettings: {
            readreceipts: 'all',
            profile: 'contacts'
          }
        });
      }).not.toThrow();

      // Invalid privacy setting value
      expect(() => {
        tool.schema.parse({
          instance: 'test-instance',
          privacySettings: {
            readreceipts: 'invalid_value'
          }
        });
      }).toThrow();
    });
  });
});
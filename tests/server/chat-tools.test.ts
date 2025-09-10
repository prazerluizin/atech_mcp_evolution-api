/**
 * Chat Controller Tools Tests
 */

import { ChatTools } from '../../src/server/tools/chat-tools';
import { EvolutionHttpClient, ErrorType } from '../../src/clients/evolution-http-client';
import { createMockMcpError } from '../helpers/test-utils';

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client');

describe('ChatTools', () => {
  let chatTools: ChatTools;
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;

  beforeEach(() => {
    mockHttpClient = new EvolutionHttpClient({
      baseURL: 'https://test-api.com',
      apiKey: 'test-key'
    }) as jest.Mocked<EvolutionHttpClient>;
    
    chatTools = new ChatTools(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFindMessagesTool', () => {
    it('should create find messages tool with correct configuration', () => {
      const tool = chatTools.createFindMessagesTool();

      expect(tool.name).toBe('evolution_find_messages');
      expect(tool.description).toContain('Find messages in chats');
      expect(tool.controller).toBe('chat');
      expect(tool.handler).toBeDefined();
      expect(tool.schema).toBeDefined();
      expect(tool.examples).toBeDefined();
    });

    it('should validate required parameters', async () => {
      const tool = chatTools.createFindMessagesTool();
      
      // Test with missing instance
      const invalidParams = {};
      const result = tool.schema.safeParse(invalidParams);
      
      expect(result.success).toBe(false);
    });

    it('should validate optional parameters correctly', async () => {
      const tool = chatTools.createFindMessagesTool();
      
      // Test with valid minimal parameters
      const validParams = {
        instance: 'test_instance'
      };
      const result = tool.schema.safeParse(validParams);
      
      expect(result.success).toBe(true);
    });

    it('should handle successful API response', async () => {
      const tool = chatTools.createFindMessagesTool();
      const mockMessages = [
        { id: 'msg1', text: 'Hello' },
        { id: 'msg2', text: 'World' }
      ];

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: mockMessages,
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        where: {
          key: {
            remoteJid: '5511999999999@s.whatsapp.net'
          }
        },
        limit: 50
      };

      const result = await tool.handler(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/chat/findMessages/test_instance',
        {
          where: params.where,
          limit: params.limit
        }
      );
      expect(result.success).toBe(true);
      expect(result.data?.messageCount).toBe(2);
      expect(result.data?.messages).toEqual(mockMessages);
    });

    it('should handle API errors', async () => {
      const tool = chatTools.createFindMessagesTool();

      mockHttpClient.post.mockResolvedValue({
        success: false,
        error: createMockMcpError({
          type: ErrorType.API_ERROR,
          statusCode: 404,
          message: 'Instance not found'
        }),
        statusCode: 404
      });

      const params = {
        instance: 'nonexistent_instance'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Instance not found');
    });
  });

  describe('createFindContactsTool', () => {
    it('should create find contacts tool with correct configuration', () => {
      const tool = chatTools.createFindContactsTool();

      expect(tool.name).toBe('evolution_find_contacts');
      expect(tool.description).toContain('Find contacts');
      expect(tool.controller).toBe('chat');
      expect(tool.handler).toBeDefined();
    });

    it('should handle successful contacts search', async () => {
      const tool = chatTools.createFindContactsTool();
      const mockContacts = [
        { name: 'John Doe', number: '5511999999999' },
        { name: 'Jane Smith', number: '5511888888888' }
      ];

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: mockContacts,
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        where: {
          name: 'John'
        }
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.contactCount).toBe(2);
      expect(result.data?.contacts).toEqual(mockContacts);
    });
  });

  describe('createFindChatsTool', () => {
    it('should create find chats tool with correct configuration', () => {
      const tool = chatTools.createFindChatsTool();

      expect(tool.name).toBe('evolution_find_chats');
      expect(tool.description).toContain('Find chats');
      expect(tool.controller).toBe('chat');
    });

    it('should handle successful chats search', async () => {
      const tool = chatTools.createFindChatsTool();
      const mockChats = [
        { jid: '5511999999999@s.whatsapp.net', name: 'John Doe' },
        { jid: '5511888888888@s.whatsapp.net', name: 'Jane Smith' }
      ];

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: mockChats,
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        where: {
          name: 'Support'
        }
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.chatCount).toBe(2);
    });
  });

  describe('createMarkAsReadTool', () => {
    it('should create mark as read tool with correct configuration', () => {
      const tool = chatTools.createMarkAsReadTool();

      expect(tool.name).toBe('evolution_mark_messages_as_read');
      expect(tool.description).toContain('Mark specific messages as read');
      expect(tool.controller).toBe('chat');
    });

    it('should validate readMessages parameter', () => {
      const tool = chatTools.createMarkAsReadTool();
      
      // Test with empty array
      const invalidParams = {
        instance: 'test_instance',
        readMessages: []
      };
      const result = tool.schema.safeParse(invalidParams);
      
      expect(result.success).toBe(false);
    });

    it('should handle successful mark as read', async () => {
      const tool = chatTools.createMarkAsReadTool();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { success: true },
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        readMessages: [
          {
            remoteJid: '5511999999999@s.whatsapp.net',
            fromMe: false,
            id: 'message_id_1'
          }
        ]
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.markedCount).toBe(1);
      expect(result.data?.messageIds).toEqual(['message_id_1']);
    });
  });

  describe('createArchiveChatTool', () => {
    it('should create archive chat tool with correct configuration', () => {
      const tool = chatTools.createArchiveChatTool();

      expect(tool.name).toBe('evolution_archive_chat');
      expect(tool.description).toContain('Archive or unarchive');
      expect(tool.controller).toBe('chat');
    });

    it('should handle successful chat archiving', async () => {
      const tool = chatTools.createArchiveChatTool();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { archived: true },
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        chat: '5511999999999@s.whatsapp.net',
        archive: true
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('archived');
      expect(result.data?.archived).toBe(true);
    });

    it('should handle successful chat unarchiving', async () => {
      const tool = chatTools.createArchiveChatTool();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { archived: false },
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        chat: '5511999999999@s.whatsapp.net',
        archive: false
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('unarchived');
      expect(result.data?.archived).toBe(false);
    });
  });

  describe('createCheckIsWhatsappTool', () => {
    it('should create check WhatsApp tool with correct configuration', () => {
      const tool = chatTools.createCheckIsWhatsappTool();

      expect(tool.name).toBe('evolution_check_is_whatsapp');
      expect(tool.description).toContain('Check if phone numbers have WhatsApp');
      expect(tool.controller).toBe('chat');
    });

    it('should validate phone number format', () => {
      const tool = chatTools.createCheckIsWhatsappTool();
      
      // Test with invalid phone number
      const invalidParams = {
        instance: 'test_instance',
        numbers: ['invalid-number']
      };
      const result = tool.schema.safeParse(invalidParams);
      
      expect(result.success).toBe(false);
    });

    it('should validate array limits', () => {
      const tool = chatTools.createCheckIsWhatsappTool();
      
      // Test with empty array
      const emptyParams = {
        instance: 'test_instance',
        numbers: []
      };
      const emptyResult = tool.schema.safeParse(emptyParams);
      expect(emptyResult.success).toBe(false);

      // Test with too many numbers
      const tooManyParams = {
        instance: 'test_instance',
        numbers: Array(51).fill('5511999999999')
      };
      const tooManyResult = tool.schema.safeParse(tooManyParams);
      expect(tooManyResult.success).toBe(false);
    });

    it('should handle successful WhatsApp check', async () => {
      const tool = chatTools.createCheckIsWhatsappTool();
      const mockResults = [
        { number: '5511999999999', exists: true },
        { number: '5511888888888', exists: false }
      ];

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: mockResults,
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        numbers: ['5511999999999', '5511888888888']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.totalChecked).toBe(2);
      expect(result.data?.validWhatsAppNumbers).toBe(1);
      expect(result.data?.invalidNumbers).toBe(1);
    });
  });

  describe('createSendPresenceTool', () => {
    it('should create send presence tool with correct configuration', () => {
      const tool = chatTools.createSendPresenceTool();

      expect(tool.name).toBe('evolution_send_presence');
      expect(tool.description).toContain('Send presence indicators');
      expect(tool.controller).toBe('chat');
    });

    it('should validate presence enum values', () => {
      const tool = chatTools.createSendPresenceTool();
      
      // Test with invalid presence
      const invalidParams = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'invalid_presence'
      };
      const result = tool.schema.safeParse(invalidParams);
      
      expect(result.success).toBe(false);
    });

    it('should validate delay range', () => {
      const tool = chatTools.createSendPresenceTool();
      
      // Test with delay too small
      const tooSmallParams = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'composing',
        delay: 500
      };
      const tooSmallResult = tool.schema.safeParse(tooSmallParams);
      expect(tooSmallResult.success).toBe(false);

      // Test with delay too large
      const tooLargeParams = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'composing',
        delay: 35000
      };
      const tooLargeResult = tool.schema.safeParse(tooLargeParams);
      expect(tooLargeResult.success).toBe(false);
    });

    it('should handle successful presence sending', async () => {
      const tool = chatTools.createSendPresenceTool();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { sent: true },
        statusCode: 200
      });

      const params = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'composing',
        delay: 5000
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.presence).toBe('composing');
      expect(result.data?.duration).toBe(5000);
      expect(result.data?.message).toContain('typing');
    });

    it('should handle different presence types', async () => {
      const tool = chatTools.createSendPresenceTool();

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { sent: true },
        statusCode: 200
      });

      // Test recording presence
      const recordingParams = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'recording'
      };

      const recordingResult = await tool.handler(recordingParams);
      expect(recordingResult.success).toBe(true);
      expect(recordingResult.data?.message).toContain('recording voice');

      // Test paused presence
      const pausedParams = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'paused'
      };

      const pausedResult = await tool.handler(pausedParams);
      expect(pausedResult.success).toBe(true);
      expect(pausedResult.data?.message).toContain('stopped typing');
    });
  });

  describe('getAllTools', () => {
    it('should return all chat tools', () => {
      const tools = chatTools.getAllTools();

      expect(tools).toHaveLength(7);
      expect(tools.map(t => t.name)).toEqual([
        'evolution_find_messages',
        'evolution_find_contacts',
        'evolution_find_chats',
        'evolution_mark_messages_as_read',
        'evolution_archive_chat',
        'evolution_check_is_whatsapp',
        'evolution_send_presence'
      ]);
    });

    it('should return tools with all required properties', () => {
      const tools = chatTools.getAllTools();

      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.controller).toBe('chat');
        expect(tool.endpoint).toBeDefined();
        expect(tool.schema).toBeDefined();
        expect(tool.handler).toBeDefined();
        expect(tool.examples).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const tool = chatTools.createFindMessagesTool();

      mockHttpClient.post.mockResolvedValue({
        success: false,
        error: createMockMcpError({
          type: ErrorType.AUTHENTICATION_ERROR,
          statusCode: 401,
          message: 'Unauthorized'
        }),
        statusCode: 401
      });

      const params = {
        instance: 'test_instance'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('AUTHENTICATION_ERROR');
      expect(result.error?.message).toContain('Authentication failed');
      expect(result.error?.message).toContain('Authentication failed');
    });

    it('should handle validation errors', async () => {
      const tool = chatTools.createCheckIsWhatsappTool();

      mockHttpClient.post.mockResolvedValue({
        success: false,
        error: createMockMcpError({
          type: ErrorType.VALIDATION_ERROR,
          statusCode: 422,
          message: 'Invalid phone number format'
        }),
        statusCode: 422
      });

      const params = {
        instance: 'test_instance',
        numbers: ['5511999999999']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('Invalid data provided');
    });

    it('should handle rate limit errors', async () => {
      const tool = chatTools.createSendPresenceTool();

      mockHttpClient.post.mockResolvedValue({
        success: false,
        error: createMockMcpError({
          type: ErrorType.RATE_LIMIT_ERROR,
          statusCode: 429,
          message: 'Too many requests'
        }),
        statusCode: 429
      });

      const params = {
        instance: 'test_instance',
        number: '5511999999999',
        presence: 'composing'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('RATE_LIMIT_ERROR');
      expect(result.error?.message).toContain('Rate limit exceeded');
    });

    it('should handle unexpected errors', async () => {
      const tool = chatTools.createFindContactsTool();

      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const params = {
        instance: 'test_instance'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('UNKNOWN_ERROR');
      expect(result.error?.message).toContain('Network error');
    });
  });
});
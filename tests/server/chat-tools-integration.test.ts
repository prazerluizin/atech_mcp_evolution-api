/**
 * Chat Controller Tools Integration Tests
 */

import { ChatTools } from '../../src/server/tools/chat-tools';
import { EvolutionHttpClient, ErrorType } from '../../src/clients/evolution-http-client';
import { McpToolRegistry } from '../../src/server/tool-registry';

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client');

describe('ChatTools Integration', () => {
  let chatTools: ChatTools;
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;
  let toolRegistry: McpToolRegistry;

  beforeEach(() => {
    mockHttpClient = new EvolutionHttpClient({
      baseURL: 'https://test-api.com',
      apiKey: 'test-key'
    }) as jest.Mocked<EvolutionHttpClient>;
    
    chatTools = new ChatTools(mockHttpClient);
    toolRegistry = new McpToolRegistry();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tool Registry Integration', () => {
    it('should register all chat tools in the registry', () => {
      const tools = chatTools.getAllTools();
      
      tools.forEach(tool => {
        toolRegistry.registerTool(tool);
      });

      const registeredTools = toolRegistry.getTools();
      const chatToolsInRegistry = registeredTools.filter((tool: any) => tool.controller === 'chat');

      expect(chatToolsInRegistry).toHaveLength(7);
      expect(chatToolsInRegistry.map((t: any) => t.name)).toEqual([
        'evolution_find_messages',
        'evolution_find_contacts',
        'evolution_find_chats',
        'evolution_mark_messages_as_read',
        'evolution_archive_chat',
        'evolution_check_is_whatsapp',
        'evolution_send_presence'
      ]);
    });

    it('should be able to retrieve and execute tools from registry', async () => {
      const tools = chatTools.getAllTools();
      tools.forEach(tool => toolRegistry.registerTool(tool));

      const findMessagesTool = toolRegistry.getTool('evolution_find_messages');
      expect(findMessagesTool).toBeDefined();

      // Mock successful response
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: [{ id: 'msg1', text: 'Hello' }],
        statusCode: 200
      });

      const result = await findMessagesTool!.handler({
        instance: 'test_instance',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data?.messageCount).toBe(1);
    });

    it('should validate tool schemas through registry', () => {
      const tools = chatTools.getAllTools();
      tools.forEach(tool => toolRegistry.registerTool(tool));

      const checkWhatsappTool = toolRegistry.getTool('evolution_check_is_whatsapp');
      expect(checkWhatsappTool).toBeDefined();

      // Test valid parameters
      const validParams = {
        instance: 'test_instance',
        numbers: ['5511999999999']
      };
      const validResult = checkWhatsappTool!.schema.safeParse(validParams);
      expect(validResult.success).toBe(true);

      // Test invalid parameters
      const invalidParams = {
        instance: 'test_instance',
        numbers: ['invalid-number']
      };
      const invalidResult = checkWhatsappTool!.schema.safeParse(invalidParams);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('End-to-End Tool Execution', () => {
    it('should execute find messages workflow', async () => {
      const findMessagesTool = chatTools.createFindMessagesTool();
      
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: [
          { id: 'msg1', text: 'Hello', remoteJid: '5511999999999@s.whatsapp.net' },
          { id: 'msg2', text: 'World', remoteJid: '5511999999999@s.whatsapp.net' }
        ],
        statusCode: 200
      });

      const result = await findMessagesTool.handler({
        instance: 'my_instance',
        where: {
          key: {
            remoteJid: '5511999999999@s.whatsapp.net'
          }
        },
        limit: 50
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/chat/findMessages/my_instance',
        {
          where: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net'
            }
          },
          limit: 50
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.messageCount).toBe(2);
      expect(result.data?.instance).toBe('my_instance');
    });

    it('should execute check WhatsApp workflow', async () => {
      const checkWhatsappTool = chatTools.createCheckIsWhatsappTool();
      
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: [
          { number: '5511999999999', exists: true },
          { number: '5511888888888', exists: false }
        ],
        statusCode: 200
      });

      const result = await checkWhatsappTool.handler({
        instance: 'my_instance',
        numbers: ['5511999999999', '5511888888888']
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/chat/whatsappNumbers/my_instance',
        {
          numbers: ['5511999999999', '5511888888888']
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.totalChecked).toBe(2);
      expect(result.data?.validWhatsAppNumbers).toBe(1);
      expect(result.data?.invalidNumbers).toBe(1);
    });

    it('should execute send presence workflow', async () => {
      const sendPresenceTool = chatTools.createSendPresenceTool();
      
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { sent: true },
        statusCode: 200
      });

      const result = await sendPresenceTool.handler({
        instance: 'my_instance',
        number: '5511999999999',
        presence: 'composing',
        delay: 5000
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/chat/sendPresence/my_instance',
        {
          number: '5511999999999',
          presence: 'composing',
          delay: 5000
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.presence).toBe('composing');
      expect(result.data?.message).toContain('typing');
    });

    it('should execute archive chat workflow', async () => {
      const archiveChatTool = chatTools.createArchiveChatTool();
      
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: { archived: true },
        statusCode: 200
      });

      const result = await archiveChatTool.handler({
        instance: 'my_instance',
        chat: '5511999999999@s.whatsapp.net',
        archive: true
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/chat/archiveChat/my_instance',
        {
          chat: '5511999999999@s.whatsapp.net',
          archive: true
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('archived');
      expect(result.data?.chatJid).toBe('5511999999999@s.whatsapp.net');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      const findContactsTool = chatTools.createFindContactsTool();
      
      mockHttpClient.post.mockRejectedValue(new Error('Network timeout'));

      const result = await findContactsTool.handler({
        instance: 'my_instance'
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('UNKNOWN_ERROR');
      expect(result.error?.message).toContain('Network timeout');
    });

    it('should handle API errors with proper error mapping', async () => {
      const markAsReadTool = chatTools.createMarkAsReadTool();
      
      mockHttpClient.post.mockResolvedValue({
        success: false,
        error: {
          type: ErrorType.AUTHENTICATION_ERROR,
          statusCode: 401,
          message: 'Invalid API key'
        },
        statusCode: 401
      });

      const result = await markAsReadTool.handler({
        instance: 'my_instance',
        readMessages: [
          {
            remoteJid: '5511999999999@s.whatsapp.net',
            fromMe: false,
            id: 'msg1'
          }
        ]
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('AUTHENTICATION_ERROR');
      expect(result.error?.message).toContain('Authentication failed');
    });
  });
});
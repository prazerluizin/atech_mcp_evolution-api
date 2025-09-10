/**
 * Chat Controller MCP Tools Implementation
 * Implements all tools for chat management through Evolution API
 */

import { z } from 'zod';
import { ToolInfo, ToolResult } from '../types';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';
import { chatEndpoints } from '../../registry/endpoints/chat-endpoints';

/**
 * Chat Controller tool implementations
 */
export class ChatTools {
  private httpClient: EvolutionHttpClient;

  constructor(httpClient: EvolutionHttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Find messages with filtering and pagination
   */
  createFindMessagesTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'find-messages')!;
    
    return {
      name: 'evolution_find_messages',
      description: 'Find messages in chats with filtering and pagination options',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        where: z.object({
          key: z.object({
            remoteJid: z.string()
              .optional()
              .describe('JID of the chat to search in (e.g., 5511999999999@s.whatsapp.net)'),
            fromMe: z.boolean()
              .optional()
              .describe('Filter by messages sent by this instance (true) or received (false)'),
            id: z.string()
              .optional()
              .describe('Specific message ID to find')
          }).optional()
        }).optional().describe('Search filters for messages'),
        limit: z.number()
          .min(1)
          .max(1000)
          .optional()
          .describe('Maximum number of messages to return (1-1000, default: 50)')
      }),
      handler: this.findMessagesHandler.bind(this),
      examples: {
        usage: 'Search for messages in a specific chat or across all chats',
        parameters: {
          instance: 'my_whatsapp_bot',
          where: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net'
            }
          },
          limit: 50
        }
      }
    };
  }

  private async findMessagesHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        ...(params.where && { where: params.where }),
        ...(params.limit && { limit: params.limit })
      };

      const response = await this.httpClient.post(`/chat/findMessages/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'find messages');
      }

      const messages = response.data || [];
      const messageCount = Array.isArray(messages) ? messages.length : 0;

      return {
        success: true,
        data: {
          message: `Found ${messageCount} messages`,
          instance: params.instance,
          messageCount,
          filters: params.where,
          limit: params.limit,
          messages: messages
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'find messages');
    }
  }

  /**
   * Find contacts
   */
  createFindContactsTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'find-contacts')!;
    
    return {
      name: 'evolution_find_contacts',
      description: 'Find contacts with optional filtering by name or number',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        where: z.object({
          name: z.string()
            .optional()
            .describe('Filter contacts by name (partial match)'),
          number: z.string()
            .optional()
            .describe('Filter contacts by phone number')
        }).optional().describe('Search filters for contacts')
      }),
      handler: this.findContactsHandler.bind(this),
      examples: {
        usage: 'Search for contacts by name or phone number',
        parameters: {
          instance: 'my_whatsapp_bot',
          where: {
            name: 'John'
          }
        }
      }
    };
  }

  private async findContactsHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        ...(params.where && { where: params.where })
      };

      const response = await this.httpClient.post(`/chat/findContacts/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'find contacts');
      }

      const contacts = response.data || [];
      const contactCount = Array.isArray(contacts) ? contacts.length : 0;

      return {
        success: true,
        data: {
          message: `Found ${contactCount} contacts`,
          instance: params.instance,
          contactCount,
          filters: params.where,
          contacts: contacts
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'find contacts');
    }
  }

  /**
   * Find chats
   */
  createFindChatsTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'find-chats')!;
    
    return {
      name: 'evolution_find_chats',
      description: 'Find chats/conversations with optional filtering',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        where: z.object({
          name: z.string()
            .optional()
            .describe('Filter chats by contact/group name (partial match)'),
          jid: z.string()
            .optional()
            .describe('Filter by specific chat JID')
        }).optional().describe('Search filters for chats')
      }),
      handler: this.findChatsHandler.bind(this),
      examples: {
        usage: 'Search for chats by name or JID',
        parameters: {
          instance: 'my_whatsapp_bot',
          where: {
            name: 'Support'
          }
        }
      }
    };
  }

  private async findChatsHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        ...(params.where && { where: params.where })
      };

      const response = await this.httpClient.post(`/chat/findChats/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'find chats');
      }

      const chats = response.data || [];
      const chatCount = Array.isArray(chats) ? chats.length : 0;

      return {
        success: true,
        data: {
          message: `Found ${chatCount} chats`,
          instance: params.instance,
          chatCount,
          filters: params.where,
          chats: chats
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'find chats');
    }
  }

  /**
   * Mark messages as read
   */
  createMarkAsReadTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'mark-as-read')!;
    
    return {
      name: 'evolution_mark_messages_as_read',
      description: 'Mark specific messages as read',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        readMessages: z.array(z.object({
          remoteJid: z.string()
            .describe('JID of the chat where the message is located'),
          fromMe: z.boolean()
            .describe('Whether the message was sent by this instance'),
          id: z.string()
            .describe('ID of the message to mark as read')
        })).min(1, 'At least one message must be specified')
          .describe('Array of messages to mark as read')
      }),
      handler: this.markAsReadHandler.bind(this),
      examples: {
        usage: 'Mark one or more messages as read',
        parameters: {
          instance: 'my_whatsapp_bot',
          readMessages: [
            {
              remoteJid: '5511999999999@s.whatsapp.net',
              fromMe: false,
              id: 'message_id_1'
            }
          ]
        }
      }
    };
  }

  private async markAsReadHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        readMessages: params.readMessages
      };

      const response = await this.httpClient.post(`/chat/markMessageAsRead/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'mark messages as read');
      }

      return {
        success: true,
        data: {
          message: `Successfully marked ${params.readMessages.length} message(s) as read`,
          instance: params.instance,
          markedCount: params.readMessages.length,
          messageIds: params.readMessages.map((msg: any) => msg.id),
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'mark messages as read');
    }
  }

  /**
   * Archive or unarchive chat
   */
  createArchiveChatTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'archive-chat')!;
    
    return {
      name: 'evolution_archive_chat',
      description: 'Archive or unarchive a chat conversation',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        chat: z.string()
          .min(1, 'Chat JID is required')
          .describe('JID of the chat to archive/unarchive (e.g., 5511999999999@s.whatsapp.net)'),
        archive: z.boolean()
          .describe('True to archive the chat, false to unarchive')
      }),
      handler: this.archiveChatHandler.bind(this),
      examples: {
        usage: 'Archive or unarchive a chat conversation',
        parameters: {
          instance: 'my_whatsapp_bot',
          chat: '5511999999999@s.whatsapp.net',
          archive: true
        }
      }
    };
  }

  private async archiveChatHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        chat: params.chat,
        archive: params.archive
      };

      const response = await this.httpClient.post(`/chat/archiveChat/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'archive chat');
      }

      const action = params.archive ? 'archived' : 'unarchived';

      return {
        success: true,
        data: {
          message: `Chat successfully ${action}`,
          instance: params.instance,
          chatJid: params.chat,
          action: action,
          archived: params.archive,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'archive chat');
    }
  }

  /**
   * Check if numbers have WhatsApp
   */
  createCheckIsWhatsappTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'check-is-whatsapp')!;
    
    return {
      name: 'evolution_check_is_whatsapp',
      description: 'Check if phone numbers have WhatsApp accounts',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        numbers: z.array(z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
        ).min(1, 'At least one phone number must be provided')
          .max(50, 'Cannot check more than 50 numbers at once')
          .describe('Array of phone numbers to check (format: 5511999999999)')
      }),
      handler: this.checkIsWhatsappHandler.bind(this),
      examples: {
        usage: 'Verify if phone numbers have active WhatsApp accounts',
        parameters: {
          instance: 'my_whatsapp_bot',
          numbers: ['5511999999999', '5511888888888']
        }
      }
    };
  }

  private async checkIsWhatsappHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        numbers: params.numbers
      };

      const response = await this.httpClient.post(`/chat/whatsappNumbers/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'check WhatsApp numbers');
      }

      const results = response.data || [];
      const validNumbers = Array.isArray(results) ? results.filter((r: any) => r.exists).length : 0;

      return {
        success: true,
        data: {
          message: `Checked ${params.numbers.length} numbers, ${validNumbers} have WhatsApp`,
          instance: params.instance,
          totalChecked: params.numbers.length,
          validWhatsAppNumbers: validNumbers,
          invalidNumbers: params.numbers.length - validNumbers,
          results: results
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'check WhatsApp numbers');
    }
  }

  /**
   * Send presence (typing indicators)
   */
  createSendPresenceTool(): ToolInfo {
    const endpoint = chatEndpoints.find(e => e.name === 'send-presence')!;
    
    return {
      name: 'evolution_send_presence',
      description: 'Send presence indicators like typing, recording, or paused to a chat',
      controller: 'chat',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Phone number to send presence to (format: 5511999999999)'),
        presence: z.enum(['composing', 'recording', 'paused'])
          .describe('Type of presence: composing (typing), recording (voice), paused (stopped)'),
        delay: z.number()
          .min(1000)
          .max(30000)
          .optional()
          .describe('Duration to show presence in milliseconds (1000-30000, default: 5000)')
      }),
      handler: this.sendPresenceHandler.bind(this),
      examples: {
        usage: 'Show typing indicator or other presence status in a chat',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          presence: 'composing',
          delay: 5000
        }
      }
    };
  }

  private async sendPresenceHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        presence: params.presence,
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/chat/sendPresence/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send presence');
      }

      const presenceLabels = {
        composing: 'typing',
        recording: 'recording voice',
        paused: 'stopped typing'
      };

      return {
        success: true,
        data: {
          message: `Presence "${presenceLabels[params.presence as keyof typeof presenceLabels]}" sent to ${params.number}`,
          instance: params.instance,
          recipient: params.number,
          presence: params.presence,
          duration: params.delay || 5000,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send presence');
    }
  }

  /**
   * Get all chat tools
   */
  getAllTools(): ToolInfo[] {
    return [
      this.createFindMessagesTool(),
      this.createFindContactsTool(),
      this.createFindChatsTool(),
      this.createMarkAsReadTool(),
      this.createArchiveChatTool(),
      this.createCheckIsWhatsappTool(),
      this.createSendPresenceTool()
    ];
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any, operation: string): ToolResult {
    const statusCode = error.statusCode || error.status || 0;
    let message = `Failed to ${operation}`;

    switch (statusCode) {
      case 400:
        message = `Invalid request parameters for ${operation}`;
        break;
      case 401:
        message = `Authentication failed for ${operation}`;
        break;
      case 404:
        message = `Instance not found for ${operation}`;
        break;
      case 422:
        message = `Invalid data provided for ${operation}`;
        break;
      case 429:
        message = `Rate limit exceeded for ${operation}`;
        break;
      case 500:
        message = `Server error occurred during ${operation}`;
        break;
    }

    return {
      success: false,
      error: {
        type: this.mapStatusToErrorType(statusCode),
        message,
        code: statusCode.toString(),
        details: error
      }
    };
  }

  /**
   * Handle unexpected errors
   */
  private handleUnexpectedError(error: any, operation: string): ToolResult {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: `Unexpected error during ${operation}: ${errorMessage}`,
        details: error
      }
    };
  }

  /**
   * Map HTTP status codes to error types
   */
  private mapStatusToErrorType(statusCode: number): string {
    switch (statusCode) {
      case 400:
      case 422:
        return 'VALIDATION_ERROR';
      case 401:
      case 403:
        return 'AUTHENTICATION_ERROR';
      case 404:
        return 'NOT_FOUND_ERROR';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 500:
      case 502:
      case 503:
        return 'API_ERROR';
      default:
        return 'NETWORK_ERROR';
    }
  }
}
/**
 * Message Controller MCP Tools Implementation
 * Implements all tools for sending messages through Evolution API
 */

import { z } from 'zod';
import { ToolInfo, ToolResult } from '../types';
import { EvolutionHttpClient, ErrorType } from '../../clients/evolution-http-client';
import { messageEndpoints } from '../../registry/endpoints/message-endpoints';

/**
 * Message Controller tool implementations
 */
export class MessageTools {
  private httpClient: EvolutionHttpClient;

  constructor(httpClient: EvolutionHttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Send text message
   */
  createSendTextTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-text')!;
    
    return {
      name: 'evolution_send_text_message',
      description: 'Send a text message to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        text: z.string()
          .min(1, 'Message text is required')
          .max(4096, 'Message text cannot exceed 4096 characters')
          .describe('Text message content to send'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)'),
        quoted: z.object({
          key: z.object({
            remoteJid: z.string().describe('JID of the chat where the original message was sent'),
            fromMe: z.boolean().describe('Whether the original message was sent by this instance'),
            id: z.string().describe('ID of the original message')
          }),
          message: z.any().describe('Original message content')
        }).optional().describe('Quote a previous message')
      }),
      handler: this.sendTextHandler.bind(this),
      examples: {
        usage: 'Send a text message to a WhatsApp number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          text: 'Hello! This is a test message.',
          delay: 1000
        }
      }
    };
  }

  private async sendTextHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        text: params.text,
        ...(params.delay && { delay: params.delay }),
        ...(params.quoted && { quoted: params.quoted })
      };

      const response = await this.httpClient.post(`/message/sendText/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send text message');
      }

      return {
        success: true,
        data: {
          message: `Text message sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          text: params.text,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send text message');
    }
  }

  /**
   * Send media message (images, videos, documents)
   */
  createSendMediaTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-media')!;
    
    return {
      name: 'evolution_send_media_message',
      description: 'Send media (image, video, document) to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        media: z.string()
          .min(1, 'Media URL or base64 is required')
          .describe('Media URL (https://...) or base64 encoded media data'),
        caption: z.string()
          .max(1024, 'Caption cannot exceed 1024 characters')
          .optional()
          .describe('Optional caption for the media'),
        fileName: z.string()
          .optional()
          .describe('Optional filename for documents'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendMediaHandler.bind(this),
      examples: {
        usage: 'Send an image, video, or document to a WhatsApp number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          media: 'https://example.com/image.jpg',
          caption: 'Check out this image!',
          delay: 1000
        }
      }
    };
  }

  private async sendMediaHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        media: params.media,
        ...(params.caption && { caption: params.caption }),
        ...(params.fileName && { fileName: params.fileName }),
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendMedia/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send media message');
      }

      return {
        success: true,
        data: {
          message: `Media message sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          mediaType: this.detectMediaType(params.media),
          caption: params.caption,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send media message');
    }
  }

  /**
   * Send audio/voice message
   */
  createSendAudioTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-audio')!;
    
    return {
      name: 'evolution_send_audio_message',
      description: 'Send audio or voice message to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        audio: z.string()
          .min(1, 'Audio URL or base64 is required')
          .describe('Audio URL (https://...) or base64 encoded audio data'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendAudioHandler.bind(this),
      examples: {
        usage: 'Send an audio or voice message to a WhatsApp number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          audio: 'https://example.com/audio.mp3',
          delay: 1000
        }
      }
    };
  }

  private async sendAudioHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        audio: params.audio,
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendWhatsAppAudio/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send audio message');
      }

      return {
        success: true,
        data: {
          message: `Audio message sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send audio message');
    }
  }

  /**
   * Send sticker
   */
  createSendStickerTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-sticker')!;
    
    return {
      name: 'evolution_send_sticker',
      description: 'Send a sticker to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        sticker: z.string()
          .min(1, 'Sticker URL or base64 is required')
          .describe('Sticker URL (https://...) or base64 encoded sticker data'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendStickerHandler.bind(this),
      examples: {
        usage: 'Send a sticker to a WhatsApp number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          sticker: 'https://example.com/sticker.webp',
          delay: 1000
        }
      }
    };
  }

  private async sendStickerHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        sticker: params.sticker,
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendSticker/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send sticker');
      }

      return {
        success: true,
        data: {
          message: `Sticker sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send sticker');
    }
  }
  /*
*
   * Send location
   */
  createSendLocationTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-location')!;
    
    return {
      name: 'evolution_send_location',
      description: 'Send a location to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        latitude: z.number()
          .min(-90)
          .max(90)
          .describe('Latitude coordinate (-90 to 90)'),
        longitude: z.number()
          .min(-180)
          .max(180)
          .describe('Longitude coordinate (-180 to 180)'),
        name: z.string()
          .optional()
          .describe('Optional name/title for the location'),
        address: z.string()
          .optional()
          .describe('Optional address description'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendLocationHandler.bind(this),
      examples: {
        usage: 'Send a location with coordinates to a WhatsApp number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          latitude: -23.5505,
          longitude: -46.6333,
          name: 'São Paulo',
          address: 'São Paulo, SP, Brazil',
          delay: 1000
        }
      }
    };
  }

  private async sendLocationHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        latitude: params.latitude,
        longitude: params.longitude,
        ...(params.name && { name: params.name }),
        ...(params.address && { address: params.address }),
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendLocation/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send location');
      }

      return {
        success: true,
        data: {
          message: `Location sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          coordinates: `${params.latitude}, ${params.longitude}`,
          locationName: params.name,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send location');
    }
  }

  /**
   * Send contact
   */
  createSendContactTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-contact')!;
    
    return {
      name: 'evolution_send_contact',
      description: 'Send a contact card to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        contact: z.object({
          fullName: z.string()
            .min(1, 'Contact full name is required')
            .describe('Full name of the contact'),
          wuid: z.string()
            .describe('WhatsApp user ID of the contact'),
          phoneNumber: z.string()
            .min(10, 'Valid phone number is required')
            .describe('Phone number of the contact')
        }).describe('Contact information to send'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendContactHandler.bind(this),
      examples: {
        usage: 'Send a contact card to a WhatsApp number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          contact: {
            fullName: 'John Doe',
            wuid: '5511888888888',
            phoneNumber: '5511888888888'
          },
          delay: 1000
        }
      }
    };
  }

  private async sendContactHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        contact: params.contact,
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendContact/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send contact');
      }

      return {
        success: true,
        data: {
          message: `Contact card sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          contactName: params.contact.fullName,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send contact');
    }
  }

  /**
   * Send reaction to a message
   */
  createSendReactionTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-reaction')!;
    
    return {
      name: 'evolution_send_reaction',
      description: 'Send a reaction (emoji) to a specific message',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        key: z.object({
          remoteJid: z.string()
            .describe('JID of the chat where the message is located'),
          fromMe: z.boolean()
            .describe('Whether the message was sent by this instance'),
          id: z.string()
            .describe('ID of the message to react to')
        }).describe('Message key identifying which message to react to'),
        reaction: z.string()
          .min(1, 'Reaction emoji is required')
          .max(10, 'Reaction must be a single emoji or short text')
          .describe('Emoji or reaction text (e.g., "👍", "❤️", "😂")')
      }),
      handler: this.sendReactionHandler.bind(this),
      examples: {
        usage: 'Send a reaction emoji to a specific message',
        parameters: {
          instance: 'my_whatsapp_bot',
          key: {
            remoteJid: '5511999999999@s.whatsapp.net',
            fromMe: false,
            id: 'message_id_here'
          },
          reaction: '👍'
        }
      }
    };
  }

  private async sendReactionHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        key: params.key,
        reaction: params.reaction
      };

      const response = await this.httpClient.post(`/message/sendReaction/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send reaction');
      }

      return {
        success: true,
        data: {
          message: `Reaction "${params.reaction}" sent successfully`,
          instance: params.instance,
          messageId: params.key.id,
          reaction: params.reaction,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send reaction');
    }
  }

  /**
   * Send poll
   */
  createSendPollTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-poll')!;
    
    return {
      name: 'evolution_send_poll',
      description: 'Send an interactive poll to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        name: z.string()
          .min(1, 'Poll question is required')
          .max(255, 'Poll question cannot exceed 255 characters')
          .describe('The poll question'),
        selectableCount: z.number()
          .min(1)
          .max(12)
          .describe('Number of options users can select (1-12)'),
        values: z.array(z.string())
          .min(2, 'Poll must have at least 2 options')
          .max(12, 'Poll cannot have more than 12 options')
          .describe('Array of poll options'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendPollHandler.bind(this),
      examples: {
        usage: 'Send an interactive poll with multiple choice options',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          name: 'What is your favorite programming language?',
          selectableCount: 1,
          values: ['JavaScript', 'Python', 'Java', 'TypeScript'],
          delay: 1000
        }
      }
    };
  }

  private async sendPollHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        name: params.name,
        selectableCount: params.selectableCount,
        values: params.values,
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendPoll/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send poll');
      }

      return {
        success: true,
        data: {
          message: `Poll sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          pollQuestion: params.name,
          optionsCount: params.values.length,
          selectableCount: params.selectableCount,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send poll');
    }
  }  
/**
   * Send interactive list
   */
  createSendListTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-list')!;
    
    return {
      name: 'evolution_send_list',
      description: 'Send an interactive list message to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        title: z.string()
          .min(1, 'List title is required')
          .max(60, 'Title cannot exceed 60 characters')
          .describe('Title of the list message'),
        description: z.string()
          .min(1, 'List description is required')
          .max(1024, 'Description cannot exceed 1024 characters')
          .describe('Description of the list message'),
        buttonText: z.string()
          .min(1, 'Button text is required')
          .max(20, 'Button text cannot exceed 20 characters')
          .describe('Text displayed on the list button'),
        footerText: z.string()
          .max(60, 'Footer text cannot exceed 60 characters')
          .optional()
          .describe('Optional footer text'),
        sections: z.array(z.object({
          title: z.string()
            .min(1, 'Section title is required')
            .max(24, 'Section title cannot exceed 24 characters')
            .describe('Title of the section'),
          rows: z.array(z.object({
            title: z.string()
              .min(1, 'Row title is required')
              .max(24, 'Row title cannot exceed 24 characters')
              .describe('Title of the row'),
            description: z.string()
              .max(72, 'Row description cannot exceed 72 characters')
              .optional()
              .describe('Optional description of the row'),
            rowId: z.string()
              .min(1, 'Row ID is required')
              .max(200, 'Row ID cannot exceed 200 characters')
              .describe('Unique identifier for the row')
          })).min(1, 'Section must have at least 1 row')
            .max(10, 'Section cannot have more than 10 rows')
            .describe('Rows in the section')
        })).min(1, 'List must have at least 1 section')
          .max(10, 'List cannot have more than 10 sections')
          .describe('Sections of the list'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendListHandler.bind(this),
      examples: {
        usage: 'Send an interactive list with selectable options',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          title: 'Choose a Service',
          description: 'Please select one of the available services below:',
          buttonText: 'View Options',
          footerText: 'Powered by Evolution API',
          sections: [
            {
              title: 'Main Services',
              rows: [
                {
                  title: 'Support',
                  description: 'Get technical support',
                  rowId: 'support_option'
                },
                {
                  title: 'Sales',
                  description: 'Talk to sales team',
                  rowId: 'sales_option'
                }
              ]
            }
          ],
          delay: 1000
        }
      }
    };
  }

  private async sendListHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        title: params.title,
        description: params.description,
        buttonText: params.buttonText,
        sections: params.sections,
        ...(params.footerText && { footerText: params.footerText }),
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendList/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send list');
      }

      const totalRows = params.sections.reduce((total: number, section: any) => total + section.rows.length, 0);

      return {
        success: true,
        data: {
          message: `Interactive list sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          listTitle: params.title,
          sectionsCount: params.sections.length,
          totalOptions: totalRows,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send list');
    }
  }

  /**
   * Send interactive buttons
   */
  createSendButtonTool(): ToolInfo {
    const endpoint = messageEndpoints.find(e => e.name === 'send-button')!;
    
    return {
      name: 'evolution_send_button',
      description: 'Send interactive buttons to a WhatsApp number',
      controller: 'message',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance to send from'),
        number: z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
          .describe('Recipient phone number (format: 5511999999999)'),
        title: z.string()
          .min(1, 'Message title is required')
          .max(1024, 'Title cannot exceed 1024 characters')
          .describe('Title of the button message'),
        description: z.string()
          .min(1, 'Message description is required')
          .max(1024, 'Description cannot exceed 1024 characters')
          .describe('Description of the button message'),
        footer: z.string()
          .max(60, 'Footer text cannot exceed 60 characters')
          .optional()
          .describe('Optional footer text'),
        buttons: z.array(z.object({
          type: z.literal('replyButton')
            .describe('Button type (must be "replyButton")'),
          reply: z.object({
            displayText: z.string()
              .min(1, 'Button text is required')
              .max(20, 'Button text cannot exceed 20 characters')
              .describe('Text displayed on the button'),
            id: z.string()
              .min(1, 'Button ID is required')
              .max(256, 'Button ID cannot exceed 256 characters')
              .describe('Unique identifier for the button')
          }).describe('Button reply configuration')
        })).min(1, 'Must have at least 1 button')
          .max(3, 'Cannot have more than 3 buttons')
          .describe('Array of interactive buttons'),
        delay: z.number()
          .min(0)
          .max(60000)
          .optional()
          .describe('Delay in milliseconds before sending (0-60000)')
      }),
      handler: this.sendButtonHandler.bind(this),
      examples: {
        usage: 'Send interactive buttons for user selection',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999',
          title: 'Choose an Option',
          description: 'Please select one of the options below:',
          footer: 'Powered by Evolution API',
          buttons: [
            {
              type: 'replyButton',
              reply: {
                displayText: 'Yes',
                id: 'yes_button'
              }
            },
            {
              type: 'replyButton',
              reply: {
                displayText: 'No',
                id: 'no_button'
              }
            }
          ],
          delay: 1000
        }
      }
    };
  }

  private async sendButtonHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        number: params.number,
        title: params.title,
        description: params.description,
        buttons: params.buttons,
        ...(params.footer && { footer: params.footer }),
        ...(params.delay && { delay: params.delay })
      };

      const response = await this.httpClient.post(`/message/sendButtons/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'send button');
      }

      return {
        success: true,
        data: {
          message: `Interactive buttons sent successfully to ${params.number}`,
          messageId: response.data?.key?.id,
          instance: params.instance,
          recipient: params.number,
          buttonCount: params.buttons.length,
          buttonLabels: params.buttons.map((btn: any) => btn.reply.displayText),
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'send button');
    }
  }  /**
  
 * Get all message controller tools
   */
  getAllTools(): ToolInfo[] {
    return [
      this.createSendTextTool(),
      this.createSendMediaTool(),
      this.createSendAudioTool(),
      this.createSendStickerTool(),
      this.createSendLocationTool(),
      this.createSendContactTool(),
      this.createSendReactionTool(),
      this.createSendPollTool(),
      this.createSendListTool(),
      this.createSendButtonTool()
    ];
  }

  /**
   * Detect media type from URL or base64
   */
  private detectMediaType(media: string): string {
    if (media.startsWith('data:')) {
      // Base64 data URL
      const mimeType = media.split(';')[0].split(':')[1];
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      return 'document';
    }
    
    // URL - try to detect from extension
    const extension = media.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    
    if (extension && imageExts.includes(extension)) return 'image';
    if (extension && videoExts.includes(extension)) return 'video';
    if (extension && audioExts.includes(extension)) return 'audio';
    
    return 'document';
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any, operation: string): ToolResult {
    const baseMessage = `Failed to ${operation}`;
    
    switch (error.type) {
      case ErrorType.AUTHENTICATION_ERROR:
        return {
          success: false,
          error: {
            type: 'AUTHENTICATION_ERROR',
            message: `${baseMessage}: Authentication failed. Please check your Evolution API key.`,
            code: error.code,
            details: {
              suggestion: 'Verify that your EVOLUTION_API_KEY environment variable is set correctly',
              originalError: error.message
            }
          }
        };

      case ErrorType.NETWORK_ERROR:
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: `${baseMessage}: Network error occurred. Please check your connection to the Evolution API.`,
            code: error.code,
            details: {
              suggestion: 'Verify that your EVOLUTION_URL is correct and the API is accessible',
              originalError: error.message
            }
          }
        };

      case ErrorType.TIMEOUT_ERROR:
        return {
          success: false,
          error: {
            type: 'TIMEOUT_ERROR',
            message: `${baseMessage}: Request timed out. The Evolution API did not respond in time.`,
            code: error.code,
            details: {
              suggestion: 'Try again in a few moments. If the problem persists, check the API server status',
              originalError: error.message
            }
          }
        };

      case ErrorType.API_ERROR:
        // Handle specific API error codes
        if (error.statusCode === 404) {
          return {
            success: false,
            error: {
              type: 'API_ERROR',
              message: `${baseMessage}: Instance not found or endpoint not available.`,
              code: error.code,
              details: {
                suggestion: 'Check that the instance name is correct and that the instance exists',
                statusCode: error.statusCode,
                originalError: error.message
              }
            }
          };
        }

        if (error.statusCode === 400) {
          return {
            success: false,
            error: {
              type: 'VALIDATION_ERROR',
              message: `${baseMessage}: Invalid parameters provided.`,
              code: error.code,
              details: {
                suggestion: 'Check the parameter values and format. Ensure phone numbers are in correct format (e.g., 5511999999999)',
                statusCode: error.statusCode,
                originalError: error.message,
                apiResponse: error.details
              }
            }
          };
        }

        if (error.statusCode === 409) {
          return {
            success: false,
            error: {
              type: 'API_ERROR',
              message: `${baseMessage}: Conflict - instance may not be connected or ready.`,
              code: error.code,
              details: {
                suggestion: 'Ensure the instance is connected and authenticated with WhatsApp',
                statusCode: error.statusCode,
                originalError: error.message
              }
            }
          };
        }

        return {
          success: false,
          error: {
            type: 'API_ERROR',
            message: `${baseMessage}: ${error.message}`,
            code: error.code,
            details: {
              statusCode: error.statusCode,
              originalError: error.message,
              apiResponse: error.details
            }
          }
        };

      case ErrorType.RATE_LIMIT_ERROR:
        return {
          success: false,
          error: {
            type: 'RATE_LIMIT_ERROR',
            message: `${baseMessage}: Rate limit exceeded. Too many requests.`,
            code: error.code,
            details: {
              suggestion: 'Wait a moment before trying again',
              retryAfter: error.details?.retryAfter,
              originalError: error.message
            }
          }
        };

      default:
        return {
          success: false,
          error: {
            type: 'UNKNOWN_ERROR',
            message: `${baseMessage}: ${error.message || 'Unknown error occurred'}`,
            code: error.code,
            details: {
              suggestion: 'Please try again or contact support if the problem persists',
              originalError: error
            }
          }
        };
    }
  }

  /**
   * Handle unexpected errors
   */
  private handleUnexpectedError(error: any, operation: string): ToolResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: `Failed to ${operation}: ${errorMessage}`,
        details: {
          suggestion: 'This is an unexpected error. Please try again or contact support.',
          originalError: error
        }
      }
    };
  }
}
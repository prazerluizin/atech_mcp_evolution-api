/**
 * Profile and Webhook Management MCP Tools Implementation
 * Implements tools for profile management, privacy settings, webhook configuration, and API information
 */

import { z } from 'zod';
import { ToolInfo, ToolResult } from '../types';
import { EvolutionHttpClient, ErrorType } from '../../clients/evolution-http-client';
import { profileEndpoints } from '../../registry/endpoints/profile-endpoints';
import { webhookEndpoints } from '../../registry/endpoints/webhook-endpoints';
import { informationEndpoints } from '../../registry/endpoints/information-endpoints';

/**
 * Profile and Webhook Management tool implementations
 */
export class ProfileWebhookTools {
  private httpClient: EvolutionHttpClient;

  constructor(httpClient: EvolutionHttpClient) {
    this.httpClient = httpClient;
  }

  // ===== PROFILE MANAGEMENT TOOLS =====

  /**
   * Fetch profile information
   */
  createFetchProfileTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'fetch-profile')!;
    
    return {
      name: 'evolution_fetch_profile',
      description: 'Fetch profile information for a WhatsApp instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        number: z.string()
          .optional()
          .describe('Phone number to fetch profile for (optional, defaults to instance owner)')
      }),
      handler: this.fetchProfileHandler.bind(this),
      examples: {
        usage: 'Fetch profile information for the instance or a specific number',
        parameters: {
          instance: 'my_whatsapp_bot',
          number: '5511999999999'
        }
      }
    };
  }

  private async fetchProfileHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = params.number ? { number: params.number } : {};

      const response = await this.httpClient.post(`/chat/fetchProfile/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'fetch profile');
      }

      return {
        success: true,
        data: {
          message: `Profile information fetched successfully`,
          instance: params.instance,
          targetNumber: params.number || 'instance owner',
          profile: response.data,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'fetch profile');
    }
  }

  /**
   * Update profile name
   */
  createUpdateProfileNameTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'update-profile-name')!;
    
    return {
      name: 'evolution_update_profile_name',
      description: 'Update the profile name for a WhatsApp instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        name: z.string()
          .min(1, 'Profile name is required')
          .max(25, 'Profile name cannot exceed 25 characters')
          .describe('New profile name to set')
      }),
      handler: this.updateProfileNameHandler.bind(this),
      examples: {
        usage: 'Update the display name for the WhatsApp profile',
        parameters: {
          instance: 'my_whatsapp_bot',
          name: 'My Business Bot'
        }
      }
    };
  }

  private async updateProfileNameHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = { name: params.name };

      const response = await this.httpClient.put(`/chat/updateProfileName/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update profile name');
      }

      return {
        success: true,
        data: {
          message: `Profile name updated successfully to "${params.name}"`,
          instance: params.instance,
          newName: params.name,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update profile name');
    }
  }

  /**
   * Update profile status
   */
  createUpdateProfileStatusTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'update-profile-status')!;
    
    return {
      name: 'evolution_update_profile_status',
      description: 'Update the profile status message for a WhatsApp instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        status: z.string()
          .min(1, 'Profile status is required')
          .max(139, 'Profile status cannot exceed 139 characters')
          .describe('New profile status message to set')
      }),
      handler: this.updateProfileStatusHandler.bind(this),
      examples: {
        usage: 'Update the status message for the WhatsApp profile',
        parameters: {
          instance: 'my_whatsapp_bot',
          status: 'Available for business inquiries 24/7'
        }
      }
    };
  }

  private async updateProfileStatusHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = { status: params.status };

      const response = await this.httpClient.put(`/chat/updateProfileStatus/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update profile status');
      }

      return {
        success: true,
        data: {
          message: `Profile status updated successfully`,
          instance: params.instance,
          newStatus: params.status,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update profile status');
    }
  }

  /**
   * Update profile picture
   */
  createUpdateProfilePictureTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'update-profile-picture')!;
    
    return {
      name: 'evolution_update_profile_picture',
      description: 'Update the profile picture for a WhatsApp instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        picture: z.string()
          .min(1, 'Picture URL or base64 is required')
          .describe('Profile picture URL (https://...) or base64 encoded image data')
      }),
      handler: this.updateProfilePictureHandler.bind(this),
      examples: {
        usage: 'Update the profile picture for the WhatsApp instance',
        parameters: {
          instance: 'my_whatsapp_bot',
          picture: 'https://example.com/profile-picture.jpg'
        }
      }
    };
  }

  private async updateProfilePictureHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = { picture: params.picture };

      const response = await this.httpClient.put(`/chat/updateProfilePicture/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update profile picture');
      }

      return {
        success: true,
        data: {
          message: `Profile picture updated successfully`,
          instance: params.instance,
          pictureSource: params.picture.startsWith('http') ? 'URL' : 'Base64',
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update profile picture');
    }
  }

  // ===== PRIVACY SETTINGS TOOLS =====

  /**
   * Fetch privacy settings
   */
  createFetchPrivacySettingsTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'fetch-privacy-settings')!;
    
    return {
      name: 'evolution_fetch_privacy_settings',
      description: 'Fetch privacy settings for a WhatsApp instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance')
      }),
      handler: this.fetchPrivacySettingsHandler.bind(this),
      examples: {
        usage: 'Get current privacy settings for the WhatsApp instance',
        parameters: {
          instance: 'my_whatsapp_bot'
        }
      }
    };
  }

  private async fetchPrivacySettingsHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get(`/chat/fetchPrivacySettings/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'fetch privacy settings');
      }

      return {
        success: true,
        data: {
          message: `Privacy settings fetched successfully`,
          instance: params.instance,
          privacySettings: response.data,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'fetch privacy settings');
    }
  }

  /**
   * Update privacy settings
   */
  createUpdatePrivacySettingsTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'update-privacy-settings')!;
    
    return {
      name: 'evolution_update_privacy_settings',
      description: 'Update privacy settings for a WhatsApp instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        privacySettings: z.object({
          readreceipts: z.enum(['all', 'none']).optional()
            .describe('Who can see read receipts'),
          profile: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional()
            .describe('Who can see profile photo'),
          status: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional()
            .describe('Who can see status updates'),
          online: z.enum(['all', 'match_last_seen']).optional()
            .describe('Who can see online status'),
          last: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional()
            .describe('Who can see last seen'),
          groupadd: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional()
            .describe('Who can add to groups')
        }).describe('Privacy settings to update')
      }),
      handler: this.updatePrivacySettingsHandler.bind(this),
      examples: {
        usage: 'Update privacy settings for the WhatsApp instance',
        parameters: {
          instance: 'my_whatsapp_bot',
          privacySettings: {
            readreceipts: 'all',
            profile: 'contacts',
            status: 'contacts',
            online: 'all',
            last: 'contacts',
            groupadd: 'contacts'
          }
        }
      }
    };
  }

  private async updatePrivacySettingsHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = { privacySettings: params.privacySettings };

      const response = await this.httpClient.put(`/chat/updatePrivacySettings/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update privacy settings');
      }

      return {
        success: true,
        data: {
          message: `Privacy settings updated successfully`,
          instance: params.instance,
          updatedSettings: params.privacySettings,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update privacy settings');
    }
  }

  // ===== BUSINESS PROFILE TOOLS =====

  /**
   * Fetch business profile
   */
  createFetchBusinessProfileTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'fetch-business-profile')!;
    
    return {
      name: 'evolution_fetch_business_profile',
      description: 'Fetch business profile information for a WhatsApp Business instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp Business instance')
      }),
      handler: this.fetchBusinessProfileHandler.bind(this),
      examples: {
        usage: 'Get business profile information for a WhatsApp Business account',
        parameters: {
          instance: 'my_business_bot'
        }
      }
    };
  }

  private async fetchBusinessProfileHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get(`/chat/fetchBusinessProfile/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'fetch business profile');
      }

      return {
        success: true,
        data: {
          message: `Business profile information fetched successfully`,
          instance: params.instance,
          businessProfile: response.data,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'fetch business profile');
    }
  }

  /**
   * Update business profile
   */
  createUpdateBusinessProfileTool(): ToolInfo {
    const endpoint = profileEndpoints.find(e => e.name === 'update-business-profile')!;
    
    return {
      name: 'evolution_update_business_profile',
      description: 'Update business profile information for a WhatsApp Business instance',
      controller: 'profile',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp Business instance'),
        business: z.object({
          description: z.string()
            .max(512, 'Business description cannot exceed 512 characters')
            .optional()
            .describe('Business description'),
          category: z.string()
            .optional()
            .describe('Business category'),
          email: z.string()
            .email('Invalid email format')
            .optional()
            .describe('Business email address'),
          website: z.array(z.string().url('Invalid website URL'))
            .max(2, 'Cannot have more than 2 websites')
            .optional()
            .describe('Business website URLs'),
          address: z.string()
            .max(256, 'Address cannot exceed 256 characters')
            .optional()
            .describe('Business address')
        }).describe('Business profile information to update')
      }),
      handler: this.updateBusinessProfileHandler.bind(this),
      examples: {
        usage: 'Update business profile information for a WhatsApp Business account',
        parameters: {
          instance: 'my_business_bot',
          business: {
            description: 'We provide excellent customer service and quality products',
            category: 'Technology',
            email: 'contact@mybusiness.com',
            website: ['https://mybusiness.com'],
            address: '123 Business Street, City, State'
          }
        }
      }
    };
  }

  private async updateBusinessProfileHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = { business: params.business };

      const response = await this.httpClient.put(`/chat/updateBusinessProfile/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update business profile');
      }

      return {
        success: true,
        data: {
          message: `Business profile updated successfully`,
          instance: params.instance,
          updatedFields: Object.keys(params.business),
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update business profile');
    }
  }

  // ===== WEBHOOK MANAGEMENT TOOLS =====

  /**
   * Set webhook configuration
   */
  createSetWebhookTool(): ToolInfo {
    const endpoint = webhookEndpoints.find(e => e.name === 'set-webhook')!;
    
    return {
      name: 'evolution_set_webhook',
      description: 'Configure webhook settings for a WhatsApp instance',
      controller: 'webhook',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        webhook: z.object({
          url: z.string()
            .url('Invalid webhook URL format')
            .describe('Webhook URL to receive events'),
          enabled: z.boolean()
            .optional()
            .default(true)
            .describe('Whether the webhook is enabled'),
          webhookByEvents: z.boolean()
            .optional()
            .default(true)
            .describe('Send webhook by events'),
          webhookBase64: z.boolean()
            .optional()
            .default(false)
            .describe('Send media in base64 format'),
          events: z.array(z.enum([
            'APPLICATION_STARTUP',
            'QRCODE_UPDATED',
            'CONNECTION_UPDATE',
            'MESSAGES_SET',
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'MESSAGES_DELETE',
            'SEND_MESSAGE',
            'CONTACTS_SET',
            'CONTACTS_UPSERT',
            'CONTACTS_UPDATE',
            'PRESENCE_UPDATE',
            'CHATS_SET',
            'CHATS_UPSERT',
            'CHATS_UPDATE',
            'CHATS_DELETE',
            'GROUPS_UPSERT',
            'GROUP_UPDATE',
            'GROUP_PARTICIPANTS_UPDATE',
            'NEW_JWT_TOKEN',
            'TYPEBOT_START',
            'TYPEBOT_CHANGE_STATUS'
          ])).optional()
            .describe('List of events to send to webhook')
        }).describe('Webhook configuration')
      }),
      handler: this.setWebhookHandler.bind(this),
      examples: {
        usage: 'Configure webhook to receive WhatsApp events',
        parameters: {
          instance: 'my_whatsapp_bot',
          webhook: {
            url: 'https://myserver.com/webhook',
            enabled: true,
            webhookByEvents: true,
            webhookBase64: false,
            events: [
              'APPLICATION_STARTUP',
              'QRCODE_UPDATED',
              'CONNECTION_UPDATE',
              'MESSAGES_UPSERT',
              'SEND_MESSAGE'
            ]
          }
        }
      }
    };
  }

  private async setWebhookHandler(params: any): Promise<ToolResult> {
    try {
      // Validate webhook URL format
      try {
        new URL(params.webhook.url);
      } catch {
        return {
          success: false,
          error: {
            type: ErrorType.VALIDATION_ERROR,
            message: 'Invalid webhook URL format. Ensure the URL starts with http:// or https:// and is properly formatted.'
          }
        };
      }

      const requestData = { webhook: params.webhook };

      const response = await this.httpClient.post(`/webhook/set/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'set webhook');
      }

      return {
        success: true,
        data: {
          message: `Webhook configured successfully for ${params.instance}`,
          instance: params.instance,
          webhookUrl: params.webhook.url,
          enabled: params.webhook.enabled,
          eventsCount: params.webhook.events?.length || 0,
          selectedEvents: params.webhook.events || [],
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'set webhook');
    }
  }

  /**
   * Get webhook configuration
   */
  createGetWebhookTool(): ToolInfo {
    const endpoint = webhookEndpoints.find(e => e.name === 'get-webhook')!;
    
    return {
      name: 'evolution_get_webhook',
      description: 'Get current webhook configuration for a WhatsApp instance',
      controller: 'webhook',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance')
      }),
      handler: this.getWebhookHandler.bind(this),
      examples: {
        usage: 'Retrieve current webhook settings for an instance',
        parameters: {
          instance: 'my_whatsapp_bot'
        }
      }
    };
  }

  private async getWebhookHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get(`/webhook/find/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'get webhook');
      }

      return {
        success: true,
        data: {
          message: `Webhook configuration retrieved successfully`,
          instance: params.instance,
          webhookConfig: response.data,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'get webhook');
    }
  }

  // ===== API INFORMATION TOOL =====

  /**
   * Get Evolution API information
   */
  createGetInformationTool(): ToolInfo {
    const endpoint = informationEndpoints.find(e => e.name === 'get-information')!;
    
    return {
      name: 'evolution_get_information',
      description: 'Get Evolution API information including version, status, and available features',
      controller: 'information',
      endpoint,
      schema: z.object({
        // No parameters required for this endpoint
      }),
      handler: this.getInformationHandler.bind(this),
      examples: {
        usage: 'Get Evolution API server information and status',
        parameters: {}
      }
    };
  }

  private async getInformationHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get('/get-information');
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'get API information');
      }

      return {
        success: true,
        data: {
          message: `Evolution API information retrieved successfully`,
          apiInfo: response.data,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'get API information');
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get all profile and webhook tools
   */
  getAllTools(): ToolInfo[] {
    return [
      // Profile Management Tools
      this.createFetchProfileTool(),
      this.createUpdateProfileNameTool(),
      this.createUpdateProfileStatusTool(),
      this.createUpdateProfilePictureTool(),
      
      // Privacy Settings Tools
      this.createFetchPrivacySettingsTool(),
      this.createUpdatePrivacySettingsTool(),
      
      // Business Profile Tools
      this.createFetchBusinessProfileTool(),
      this.createUpdateBusinessProfileTool(),
      
      // Webhook Management Tools
      this.createSetWebhookTool(),
      this.createGetWebhookTool(),
      
      // API Information Tool
      this.createGetInformationTool()
    ];
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any, operation: string): ToolResult {
    const statusCode = error.statusCode || error.status || 500;
    
    switch (statusCode) {
      case 400:
        return {
          success: false,
          error: {
            type: ErrorType.VALIDATION_ERROR,
            message: `Invalid request parameters for ${operation}. Check that all required parameters are provided and verify parameter formats.`
          }
        };
      
      case 401:
        return {
          success: false,
          error: {
            type: ErrorType.AUTHENTICATION_ERROR,
            message: `Authentication failed for ${operation}. Check that EVOLUTION_API_KEY is correct and has proper permissions.`
          }
        };
      
      case 404:
        return {
          success: false,
          error: {
            type: ErrorType.API_ERROR,
            message: `Instance not found for ${operation}. Verify the instance name is correct and that it exists.`
          }
        };
      
      case 422:
        return {
          success: false,
          error: {
            type: ErrorType.VALIDATION_ERROR,
            message: `Invalid data provided for ${operation}. Check parameter formats and ensure required fields are provided.`
          }
        };
      
      case 500:
        return {
          success: false,
          error: {
            type: ErrorType.API_ERROR,
            message: `Server error during ${operation}. Try the operation again or check Evolution API server status.`
          }
        };
      
      default:
        return {
          success: false,
          error: {
            type: ErrorType.API_ERROR,
            message: `Failed to ${operation}: ${error.message || 'Unknown error'}. Check the Evolution API server status and network connection.`
          }
        };
    }
  }

  /**
   * Handle unexpected errors
   */
  private handleUnexpectedError(error: any, operation: string): ToolResult {
    return {
      success: false,
      error: {
        type: ErrorType.API_ERROR,
        message: `Unexpected error during ${operation}: ${error.message || 'Unknown error'}. Check your network connection and try again.`
      }
    };
  }
}
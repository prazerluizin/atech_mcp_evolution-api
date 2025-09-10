/**
 * Group Controller MCP Tools Implementation
 * Implements all tools for group management through Evolution API
 */

import { z } from 'zod';
import { ToolInfo, ToolResult } from '../types';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';
import { groupEndpoints } from '../../registry/endpoints/group-endpoints';

/**
 * Group Controller tool implementations
 */
export class GroupTools {
  private httpClient: EvolutionHttpClient;

  constructor(httpClient: EvolutionHttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Create a new group
   */
  createCreateGroupTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'create-group')!;
    
    return {
      name: 'evolution_create_group',
      description: 'Create a new WhatsApp group with participants',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        subject: z.string()
          .min(1, 'Group name is required')
          .max(100, 'Group name cannot exceed 100 characters')
          .describe('Name of the group to create'),
        description: z.string()
          .max(512, 'Group description cannot exceed 512 characters')
          .optional()
          .describe('Optional description for the group'),
        participants: z.array(z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
        ).min(1, 'At least one participant is required')
          .max(256, 'Cannot add more than 256 participants at once')
          .describe('Array of participant phone numbers (format: 5511999999999)')
      }),
      handler: this.createGroupHandler.bind(this),
      examples: {
        usage: 'Create a new WhatsApp group with multiple participants',
        parameters: {
          instance: 'my_whatsapp_bot',
          subject: 'My New Group',
          description: 'This is a test group created via Evolution API',
          participants: ['5511999999999', '5511888888888']
        }
      }
    };
  }

  private async createGroupHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        subject: params.subject,
        participants: params.participants,
        ...(params.description && { description: params.description })
      };

      const response = await this.httpClient.post(`/group/create/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'create group');
      }

      return {
        success: true,
        data: {
          message: `Group "${params.subject}" created successfully with ${params.participants.length} participants`,
          instance: params.instance,
          groupName: params.subject,
          groupJid: response.data?.groupJid || response.data?.id,
          participantCount: params.participants.length,
          participants: params.participants,
          description: params.description,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'create group');
    }
  }

  /**
   * Update group picture
   */
  createUpdateGroupPictureTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'update-group-picture')!;
    
    return {
      name: 'evolution_update_group_picture',
      description: 'Update the profile picture of a WhatsApp group',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group (format: 120363123456789012@g.us)'),
        image: z.string()
          .min(1, 'Image URL or base64 is required')
          .describe('Image URL (https://...) or base64 encoded image data')
      }),
      handler: this.updateGroupPictureHandler.bind(this),
      examples: {
        usage: 'Update the profile picture of a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us',
          image: 'https://example.com/group-picture.jpg'
        }
      }
    };
  }

  private async updateGroupPictureHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid,
        image: params.image
      };

      const response = await this.httpClient.put(`/group/updateGroupPicture/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update group picture');
      }

      return {
        success: true,
        data: {
          message: `Group picture updated successfully`,
          instance: params.instance,
          groupJid: params.groupJid,
          imageSource: this.detectImageType(params.image),
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update group picture');
    }
  }

  /**
   * Update group subject (name)
   */
  createUpdateGroupSubjectTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'update-group-subject')!;
    
    return {
      name: 'evolution_update_group_subject',
      description: 'Update the name/subject of a WhatsApp group',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group (format: 120363123456789012@g.us)'),
        subject: z.string()
          .min(1, 'Group name is required')
          .max(100, 'Group name cannot exceed 100 characters')
          .describe('New name for the group')
      }),
      handler: this.updateGroupSubjectHandler.bind(this),
      examples: {
        usage: 'Change the name of a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us',
          subject: 'Updated Group Name'
        }
      }
    };
  }

  private async updateGroupSubjectHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid,
        subject: params.subject
      };

      const response = await this.httpClient.put(`/group/updateGroupSubject/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update group subject');
      }

      return {
        success: true,
        data: {
          message: `Group name updated successfully to "${params.subject}"`,
          instance: params.instance,
          groupJid: params.groupJid,
          newSubject: params.subject,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update group subject');
    }
  }

  /**
   * Update group description
   */
  createUpdateGroupDescriptionTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'update-group-description')!;
    
    return {
      name: 'evolution_update_group_description',
      description: 'Update the description of a WhatsApp group',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group (format: 120363123456789012@g.us)'),
        description: z.string()
          .max(512, 'Group description cannot exceed 512 characters')
          .describe('New description for the group (empty string to remove description)')
      }),
      handler: this.updateGroupDescriptionHandler.bind(this),
      examples: {
        usage: 'Update the description of a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us',
          description: 'This is the updated group description'
        }
      }
    };
  }

  private async updateGroupDescriptionHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid,
        description: params.description
      };

      const response = await this.httpClient.put(`/group/updateGroupDescription/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update group description');
      }

      const action = params.description ? 'updated' : 'removed';

      return {
        success: true,
        data: {
          message: `Group description ${action} successfully`,
          instance: params.instance,
          groupJid: params.groupJid,
          newDescription: params.description,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update group description');
    }
  }  /**

   * Fetch group invite code
   */
  createFetchInviteCodeTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'fetch-invite-code')!;
    
    return {
      name: 'evolution_fetch_group_invite_code',
      description: 'Get the invite code/link for a WhatsApp group',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group (format: 120363123456789012@g.us)')
      }),
      handler: this.fetchInviteCodeHandler.bind(this),
      examples: {
        usage: 'Get the invite link for a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us'
        }
      }
    };
  }

  private async fetchInviteCodeHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid
      };

      const response = await this.httpClient.post(`/group/fetchInviteCode/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'fetch group invite code');
      }

      const inviteCode = response.data?.inviteCode || response.data?.code;
      const inviteUrl = inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : null;

      return {
        success: true,
        data: {
          message: `Group invite code retrieved successfully`,
          instance: params.instance,
          groupJid: params.groupJid,
          inviteCode: inviteCode,
          inviteUrl: inviteUrl,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'fetch group invite code');
    }
  }

  /**
   * Revoke group invite code
   */
  createRevokeInviteCodeTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'revoke-invite-code')!;
    
    return {
      name: 'evolution_revoke_group_invite_code',
      description: 'Revoke the current invite code for a WhatsApp group (generates a new one)',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group (format: 120363123456789012@g.us)')
      }),
      handler: this.revokeInviteCodeHandler.bind(this),
      examples: {
        usage: 'Revoke the current invite link and generate a new one for a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us'
        }
      }
    };
  }

  private async revokeInviteCodeHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid
      };

      const response = await this.httpClient.put(`/group/revokeInviteCode/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'revoke group invite code');
      }

      const newInviteCode = response.data?.inviteCode || response.data?.code;
      const newInviteUrl = newInviteCode ? `https://chat.whatsapp.com/${newInviteCode}` : null;

      return {
        success: true,
        data: {
          message: `Group invite code revoked and new code generated successfully`,
          instance: params.instance,
          groupJid: params.groupJid,
          newInviteCode: newInviteCode,
          newInviteUrl: newInviteUrl,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'revoke group invite code');
    }
  }

  /**
   * Update group participants (add, remove, promote, demote)
   */
  createUpdateParticipantTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'update-participant')!;
    
    return {
      name: 'evolution_update_group_participant',
      description: 'Manage group participants: add, remove, promote to admin, or demote from admin',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group (format: 120363123456789012@g.us)'),
        action: z.enum(['add', 'remove', 'promote', 'demote'])
          .describe('Action to perform: add (new members), remove (kick members), promote (make admin), demote (remove admin)'),
        participants: z.array(z.string()
          .min(10, 'Valid phone number is required')
          .regex(/^\d+$/, 'Phone number must contain only digits')
        ).min(1, 'At least one participant is required')
          .max(50, 'Cannot process more than 50 participants at once')
          .describe('Array of participant phone numbers (format: 5511999999999)')
      }),
      handler: this.updateParticipantHandler.bind(this),
      examples: {
        usage: 'Add, remove, promote, or demote participants in a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us',
          action: 'add',
          participants: ['5511999999999', '5511888888888']
        }
      }
    };
  }

  private async updateParticipantHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid,
        action: params.action,
        participants: params.participants
      };

      const response = await this.httpClient.put(`/group/updateParticipant/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'update group participants');
      }

      const actionLabels = {
        add: 'added to',
        remove: 'removed from',
        promote: 'promoted to admin in',
        demote: 'demoted from admin in'
      };

      return {
        success: true,
        data: {
          message: `${params.participants.length} participant(s) ${actionLabels[params.action as keyof typeof actionLabels]} the group successfully`,
          instance: params.instance,
          groupJid: params.groupJid,
          action: params.action,
          participantCount: params.participants.length,
          participants: params.participants,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'update group participants');
    }
  }

  /**
   * Leave group
   */
  createLeaveGroupTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'leave-group')!;
    
    return {
      name: 'evolution_leave_group',
      description: 'Leave a WhatsApp group (the bot instance will exit the group)',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance'),
        groupJid: z.string()
          .min(1, 'Group JID is required')
          .regex(/@g\.us$/, 'Group JID must end with @g.us')
          .describe('JID of the group to leave (format: 120363123456789012@g.us)')
      }),
      handler: this.leaveGroupHandler.bind(this),
      examples: {
        usage: 'Leave a WhatsApp group',
        parameters: {
          instance: 'my_whatsapp_bot',
          groupJid: '120363123456789012@g.us'
        }
      }
    };
  }

  private async leaveGroupHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        groupJid: params.groupJid
      };

      const response = await this.httpClient.delete(`/group/leaveGroup/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'leave group');
      }

      return {
        success: true,
        data: {
          message: `Successfully left the group`,
          instance: params.instance,
          groupJid: params.groupJid,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'leave group');
    }
  }

  /**
   * Fetch group information
   */
  createFetchGroupInfoTool(): ToolInfo {
    const endpoint = groupEndpoints.find(e => e.name === 'fetch-group-info')!;
    
    return {
      name: 'evolution_fetch_group_info',
      description: 'Fetch information about all groups the instance is part of',
      controller: 'group',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the WhatsApp instance')
      }),
      handler: this.fetchGroupInfoHandler.bind(this),
      examples: {
        usage: 'Get information about all groups the bot is part of',
        parameters: {
          instance: 'my_whatsapp_bot'
        }
      }
    };
  }

  private async fetchGroupInfoHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get(`/group/fetchAllGroups/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'fetch group information');
      }

      const groups = response.data || [];
      const groupCount = Array.isArray(groups) ? groups.length : 0;

      return {
        success: true,
        data: {
          message: `Found ${groupCount} group(s)`,
          instance: params.instance,
          groupCount,
          groups: groups
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'fetch group information');
    }
  }

  /**
   * Get all group tools
   */
  getAllTools(): ToolInfo[] {
    return [
      this.createCreateGroupTool(),
      this.createUpdateGroupPictureTool(),
      this.createUpdateGroupSubjectTool(),
      this.createUpdateGroupDescriptionTool(),
      this.createFetchInviteCodeTool(),
      this.createRevokeInviteCodeTool(),
      this.createUpdateParticipantTool(),
      this.createLeaveGroupTool(),
      this.createFetchGroupInfoTool()
    ];
  }

  /**
   * Detect image type from URL or base64
   */
  private detectImageType(image: string): string {
    if (image.startsWith('data:')) {
      return 'base64';
    } else if (image.startsWith('http')) {
      return 'url';
    }
    return 'unknown';
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
      case 403:
        message = `Permission denied for ${operation}`;
        break;
      case 404:
        message = `Resource not found for ${operation}`;
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
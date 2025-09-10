/**
 * Unit tests for Group Controller MCP Tools
 */

import { GroupTools } from '../../src/server/tools/group-tools';
import { EvolutionHttpClient, ErrorType } from '../../src/clients/evolution-http-client';
import { ToolInfo, ToolResult } from '../../src/server/types';
import { createMockMcpError } from '../helpers/test-utils';

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client');

describe('GroupTools', () => {
  let groupTools: GroupTools;
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;

  beforeEach(() => {
    mockHttpClient = new EvolutionHttpClient({
      baseURL: 'http://test.com',
      apiKey: 'test-key'
    }) as jest.Mocked<EvolutionHttpClient>;
    groupTools = new GroupTools(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCreateGroupTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createCreateGroupTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_create_group');
      expect(tool.description).toContain('Create a new WhatsApp group');
      expect(tool.controller).toBe('group');
      expect(tool.schema).toBeDefined();
    });

    it('should validate required parameters', () => {
      const result = tool.schema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should validate instance parameter', () => {
      const result = tool.schema.safeParse({
        instance: '',
        subject: 'Test Group',
        participants: ['5511999999999']
      });
      expect(result.success).toBe(false);
    });

    it('should validate subject parameter', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        subject: '',
        participants: ['5511999999999']
      });
      expect(result.success).toBe(false);
    });

    it('should validate participants array', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        subject: 'Test Group',
        participants: []
      });
      expect(result.success).toBe(false);
    });

    it('should validate phone number format in participants', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        subject: 'Test Group',
        participants: ['invalid-number']
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid parameters', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        subject: 'Test Group',
        participants: ['5511999999999'],
        description: 'Test description'
      });
      expect(result.success).toBe(true);
    });

    it('should handle successful group creation', async () => {
      const mockResponse = {
        success: true,
        data: { groupJid: '120363123456789012@g.us', id: '120363123456789012@g.us' },
        statusCode: 200
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        subject: 'Test Group',
        participants: ['5511999999999', '5511888888888'],
        description: 'Test description'
      };

      const result = await tool.handler(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/group/create/test', {
        subject: 'Test Group',
        participants: ['5511999999999', '5511888888888'],
        description: 'Test description'
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group "Test Group" created successfully');
      expect(result.data?.participantCount).toBe(2);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        error: createMockMcpError({ type: ErrorType.VALIDATION_ERROR, statusCode: 400, message: 'Invalid request' }),
        statusCode: 400
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        subject: 'Test Group',
        participants: ['5511999999999']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('createUpdateGroupPictureTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createUpdateGroupPictureTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_update_group_picture');
      expect(tool.description).toContain('Update the profile picture');
      expect(tool.controller).toBe('group');
    });

    it('should validate group JID format', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        groupJid: 'invalid-jid',
        image: 'https://example.com/image.jpg'
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid group JID', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        image: 'https://example.com/image.jpg'
      });
      expect(result.success).toBe(true);
    });

    it('should handle successful picture update', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        image: 'https://example.com/image.jpg'
      };

      const result = await tool.handler(params);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/group/updateGroupPicture/test', {
        groupJid: '120363123456789012@g.us',
        image: 'https://example.com/image.jpg'
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group picture updated successfully');
    });
  });

  describe('createUpdateGroupSubjectTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createUpdateGroupSubjectTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_update_group_subject');
      expect(tool.description).toContain('Update the name/subject');
      expect(tool.controller).toBe('group');
    });

    it('should validate subject length', () => {
      const longSubject = 'a'.repeat(101);
      const result = tool.schema.safeParse({
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        subject: longSubject
      });
      expect(result.success).toBe(false);
    });

    it('should handle successful subject update', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        subject: 'New Group Name'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group name updated successfully to "New Group Name"');
    });
  });

  describe('createUpdateGroupDescriptionTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createUpdateGroupDescriptionTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_update_group_description');
      expect(tool.description).toContain('Update the description');
      expect(tool.controller).toBe('group');
    });

    it('should validate description length', () => {
      const longDescription = 'a'.repeat(513);
      const result = tool.schema.safeParse({
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        description: longDescription
      });
      expect(result.success).toBe(false);
    });

    it('should handle successful description update', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        description: 'New description'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group description updated successfully');
    });

    it('should handle empty description (removal)', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        description: ''
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group description removed successfully');
    });
  });

  describe('createFetchInviteCodeTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createFetchInviteCodeTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_fetch_group_invite_code');
      expect(tool.description).toContain('Get the invite code/link');
      expect(tool.controller).toBe('group');
    });

    it('should handle successful invite code fetch', async () => {
      const mockResponse = {
        success: true,
        data: { inviteCode: 'ABC123DEF456' },
        statusCode: 200
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.inviteCode).toBe('ABC123DEF456');
      expect(result.data?.inviteUrl).toBe('https://chat.whatsapp.com/ABC123DEF456');
    });
  });

  describe('createRevokeInviteCodeTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createRevokeInviteCodeTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_revoke_group_invite_code');
      expect(tool.description).toContain('Revoke the current invite code');
      expect(tool.controller).toBe('group');
    });

    it('should handle successful invite code revocation', async () => {
      const mockResponse = {
        success: true,
        data: { inviteCode: 'NEW123CODE456' },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.newInviteCode).toBe('NEW123CODE456');
      expect(result.data?.message).toContain('revoked and new code generated');
    });
  });

  describe('createUpdateParticipantTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createUpdateParticipantTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_update_group_participant');
      expect(tool.description).toContain('Manage group participants');
      expect(tool.controller).toBe('group');
    });

    it('should validate action parameter', () => {
      const result = tool.schema.safeParse({
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        action: 'invalid-action',
        participants: ['5511999999999']
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid actions', () => {
      const actions = ['add', 'remove', 'promote', 'demote'];
      
      actions.forEach(action => {
        const result = tool.schema.safeParse({
          instance: 'test',
          groupJid: '120363123456789012@g.us',
          action,
          participants: ['5511999999999']
        });
        expect(result.success).toBe(true);
      });
    });

    it('should handle successful participant addition', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us',
        action: 'add',
        participants: ['5511999999999', '5511888888888']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('2 participant(s) added to the group');
      expect(result.data?.action).toBe('add');
    });

    it('should handle different actions correctly', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.put.mockResolvedValue(mockResponse);

      const testCases = [
        { action: 'remove', expectedMessage: 'removed from' },
        { action: 'promote', expectedMessage: 'promoted to admin in' },
        { action: 'demote', expectedMessage: 'demoted from admin in' }
      ];

      for (const testCase of testCases) {
        const params = {
          instance: 'test',
          groupJid: '120363123456789012@g.us',
          action: testCase.action,
          participants: ['5511999999999']
        };

        const result = await tool.handler(params);

        expect(result.success).toBe(true);
        expect(result.data?.message).toContain(testCase.expectedMessage);
      }
    });
  });

  describe('createLeaveGroupTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createLeaveGroupTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_leave_group');
      expect(tool.description).toContain('Leave a WhatsApp group');
      expect(tool.controller).toBe('group');
    });

    it('should handle successful group leave', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200
      };
      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        groupJid: '120363123456789012@g.us'
      };

      const result = await tool.handler(params);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/group/leaveGroup/test', {
        groupJid: '120363123456789012@g.us'
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Successfully left the group');
    });
  });

  describe('createFetchGroupInfoTool', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createFetchGroupInfoTool();
    });

    it('should create tool with correct configuration', () => {
      expect(tool.name).toBe('evolution_fetch_group_info');
      expect(tool.description).toContain('Fetch information about all groups');
      expect(tool.controller).toBe('group');
    });

    it('should handle successful group info fetch', async () => {
      const mockGroups = [
        { id: '120363123456789012@g.us', subject: 'Group 1' },
        { id: '120363123456789013@g.us', subject: 'Group 2' }
      ];
      const mockResponse = {
        success: true,
        data: mockGroups,
        statusCode: 200
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test'
      };

      const result = await tool.handler(params);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/group/fetchAllGroups/test');

      expect(result.success).toBe(true);
      expect(result.data?.groupCount).toBe(2);
      expect(result.data?.groups).toEqual(mockGroups);
    });

    it('should handle empty group list', async () => {
      const mockResponse = {
        success: true,
        data: [],
        statusCode: 200
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test'
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.groupCount).toBe(0);
      expect(result.data?.message).toContain('Found 0 group(s)');
    });
  });

  describe('getAllTools', () => {
    it('should return all group tools', () => {
      const tools = groupTools.getAllTools();
      
      expect(tools).toHaveLength(9);
      expect(tools.map(t => t.name)).toEqual([
        'evolution_create_group',
        'evolution_update_group_picture',
        'evolution_update_group_subject',
        'evolution_update_group_description',
        'evolution_fetch_group_invite_code',
        'evolution_revoke_group_invite_code',
        'evolution_update_group_participant',
        'evolution_leave_group',
        'evolution_fetch_group_info'
      ]);
    });

    it('should return tools with correct controllers', () => {
      const tools = groupTools.getAllTools();
      
      tools.forEach(tool => {
        expect(tool.controller).toBe('group');
      });
    });
  });

  describe('error handling', () => {
    let tool: ToolInfo;

    beforeEach(() => {
      tool = groupTools.createCreateGroupTool();
    });

    it('should handle 403 permission errors', async () => {
      const mockResponse = {
        success: false,
        error: createMockMcpError({ type: ErrorType.AUTHENTICATION_ERROR, statusCode: 403, message: 'Permission denied' }),
        statusCode: 403
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        subject: 'Test Group',
        participants: ['5511999999999']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('AUTHENTICATION_ERROR');
      expect(result.error?.message).toContain('Permission denied');
      expect(result.error?.message).toContain('Permission denied');
    });

    it('should handle 404 not found errors', async () => {
      const mockResponse = {
        success: false,
        error: createMockMcpError({ type: ErrorType.NETWORK_ERROR, statusCode: 404, message: 'Not found' }),
        statusCode: 404
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const params = {
        instance: 'test',
        subject: 'Test Group',
        participants: ['5511999999999']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('NOT_FOUND_ERROR');
      expect(result.error?.message).toContain('Resource not found');
    });

    it('should handle unexpected errors', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const params = {
        instance: 'test',
        subject: 'Test Group',
        participants: ['5511999999999']
      };

      const result = await tool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('UNKNOWN_ERROR');
      expect(result.error?.message).toContain('Network error');
    });
  });
});
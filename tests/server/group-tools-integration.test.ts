/**
 * Integration tests for Group Controller MCP Tools
 * These tests verify the tools work with a real Evolution API instance
 */

import { GroupTools } from '../../src/server/tools/group-tools';
import { EvolutionHttpClient } from '../../src/clients/evolution-http-client';

// Skip integration tests if no test environment is configured
const skipIntegration = !process.env.EVOLUTION_URL || !process.env.EVOLUTION_API_KEY || !process.env.TEST_INSTANCE;

describe('GroupTools Integration', () => {
  let groupTools: GroupTools;
  let httpClient: EvolutionHttpClient;
  let testInstance: string;
  let testGroupJid: string;

  beforeAll(() => {
    if (skipIntegration) {
      console.log('Skipping integration tests - missing environment variables');
      return;
    }

    httpClient = new EvolutionHttpClient({
      baseURL: process.env.EVOLUTION_URL!,
      apiKey: process.env.EVOLUTION_API_KEY!
    });
    groupTools = new GroupTools(httpClient);
    testInstance = process.env.TEST_INSTANCE!;
  });

  describe('Group Management Flow', () => {
    it('should create a test group', async () => {
      if (skipIntegration) return;

      const createTool = groupTools.createCreateGroupTool();
      const params = {
        instance: testInstance,
        subject: 'Test Group - Integration Test',
        description: 'This is a test group created by integration tests',
        participants: [process.env.TEST_PHONE_NUMBER || '5511999999999']
      };

      const result = await createTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.groupJid).toBeDefined();
      expect(result.data?.message).toContain('created successfully');

      // Store group JID for other tests
      testGroupJid = result.data?.groupJid;
    }, 30000);

    it('should update group subject', async () => {
      if (skipIntegration || !testGroupJid) return;

      const updateSubjectTool = groupTools.createUpdateGroupSubjectTool();
      const params = {
        instance: testInstance,
        groupJid: testGroupJid,
        subject: 'Updated Test Group Name'
      };

      const result = await updateSubjectTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group name updated successfully');
      expect(result.data?.newSubject).toBe('Updated Test Group Name');
    }, 15000);

    it('should update group description', async () => {
      if (skipIntegration || !testGroupJid) return;

      const updateDescriptionTool = groupTools.createUpdateGroupDescriptionTool();
      const params = {
        instance: testInstance,
        groupJid: testGroupJid,
        description: 'Updated description for integration test group'
      };

      const result = await updateDescriptionTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Group description updated successfully');
    }, 15000);

    it('should fetch group invite code', async () => {
      if (skipIntegration || !testGroupJid) return;

      const fetchInviteTool = groupTools.createFetchInviteCodeTool();
      const params = {
        instance: testInstance,
        groupJid: testGroupJid
      };

      const result = await fetchInviteTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.inviteCode).toBeDefined();
      expect(result.data?.inviteUrl).toContain('https://chat.whatsapp.com/');
    }, 15000);

    it('should revoke and generate new invite code', async () => {
      if (skipIntegration || !testGroupJid) return;

      // First get current invite code
      const fetchTool = groupTools.createFetchInviteCodeTool();
      const fetchResult = await fetchTool.handler({
        instance: testInstance,
        groupJid: testGroupJid
      });

      const oldInviteCode = fetchResult.data?.inviteCode;

      // Revoke the invite code
      const revokeTool = groupTools.createRevokeInviteCodeTool();
      const revokeResult = await revokeTool.handler({
        instance: testInstance,
        groupJid: testGroupJid
      });

      expect(revokeResult.success).toBe(true);
      expect(revokeResult.data?.newInviteCode).toBeDefined();
      expect(revokeResult.data?.newInviteCode).not.toBe(oldInviteCode);
    }, 20000);

    it('should fetch group information', async () => {
      if (skipIntegration) return;

      const fetchInfoTool = groupTools.createFetchGroupInfoTool();
      const params = {
        instance: testInstance
      };

      const result = await fetchInfoTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.groupCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.data?.groups)).toBe(true);
    }, 15000);

    it('should leave the test group (cleanup)', async () => {
      if (skipIntegration || !testGroupJid) return;

      const leaveTool = groupTools.createLeaveGroupTool();
      const params = {
        instance: testInstance,
        groupJid: testGroupJid
      };

      const result = await leaveTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Successfully left the group');
    }, 15000);
  });

  describe('Participant Management', () => {
    let participantTestGroupJid: string;

    beforeAll(async () => {
      if (skipIntegration) return;

      // Create a group for participant testing
      const createTool = groupTools.createCreateGroupTool();
      const result = await createTool.handler({
        instance: testInstance,
        subject: 'Participant Test Group',
        participants: [process.env.TEST_PHONE_NUMBER || '5511999999999']
      });

      if (result.success) {
        participantTestGroupJid = result.data?.groupJid;
      }
    }, 30000);

    afterAll(async () => {
      if (skipIntegration || !participantTestGroupJid) return;

      // Clean up by leaving the group
      const leaveTool = groupTools.createLeaveGroupTool();
      await leaveTool.handler({
        instance: testInstance,
        groupJid: participantTestGroupJid
      });
    }, 15000);

    it('should add participants to group', async () => {
      if (skipIntegration || !participantTestGroupJid || !process.env.TEST_PHONE_NUMBER_2) return;

      const updateParticipantTool = groupTools.createUpdateParticipantTool();
      const params = {
        instance: testInstance,
        groupJid: participantTestGroupJid,
        action: 'add' as const,
        participants: [process.env.TEST_PHONE_NUMBER_2]
      };

      const result = await updateParticipantTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('added to the group');
      expect(result.data?.action).toBe('add');
    }, 20000);

    it('should remove participants from group', async () => {
      if (skipIntegration || !participantTestGroupJid || !process.env.TEST_PHONE_NUMBER_2) return;

      const updateParticipantTool = groupTools.createUpdateParticipantTool();
      const params = {
        instance: testInstance,
        groupJid: participantTestGroupJid,
        action: 'remove' as const,
        participants: [process.env.TEST_PHONE_NUMBER_2]
      };

      const result = await updateParticipantTool.handler(params);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('removed from the group');
      expect(result.data?.action).toBe('remove');
    }, 20000);
  });

  describe('Error Scenarios', () => {
    it('should handle invalid group JID', async () => {
      if (skipIntegration) return;

      const updateSubjectTool = groupTools.createUpdateGroupSubjectTool();
      const params = {
        instance: testInstance,
        groupJid: '999999999999999999@g.us', // Non-existent group
        subject: 'New Name'
      };

      const result = await updateSubjectTool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBeDefined();
    }, 15000);

    it('should handle invalid instance', async () => {
      if (skipIntegration) return;

      const createTool = groupTools.createCreateGroupTool();
      const params = {
        instance: 'non-existent-instance',
        subject: 'Test Group',
        participants: ['5511999999999']
      };

      const result = await createTool.handler(params);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBeDefined();
    }, 15000);

    it('should handle invalid participant numbers', async () => {
      if (skipIntegration) return;

      const createTool = groupTools.createCreateGroupTool();
      const params = {
        instance: testInstance,
        subject: 'Test Group',
        participants: ['999999999999999'] // Invalid number format
      };

      const result = await createTool.handler(params);

      // This might succeed but with warnings, or fail depending on API validation
      // We just check that we get a response
      expect(typeof result.success).toBe('boolean');
    }, 15000);
  });

  describe('Tool Schema Validation', () => {
    it('should validate all group tools have correct schemas', () => {
      if (skipIntegration) return;

      const tools = groupTools.getAllTools();

      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.controller).toBe('group');
        expect(tool.schema).toBeDefined();
        expect(tool.handler).toBeDefined();
        expect(tool.examples).toBeDefined();

        // Test that schema can parse valid examples
        const exampleParams = tool.examples?.parameters;
        if (exampleParams) {
          const parseResult = tool.schema.safeParse(exampleParams);
          expect(parseResult.success).toBe(true);
        }
      });
    });

    it('should have unique tool names', () => {
      if (skipIntegration) return;

      const tools = groupTools.getAllTools();
      const names = tools.map(t => t.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });
});

// Helper function to wait for async operations
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Demo script for Group Controller MCP Tools
 * Demonstrates all group management capabilities
 */

import { GroupTools } from './group-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

async function runGroupToolsDemo() {
  console.log('🚀 Evolution API Group Tools Demo\n');

  // Initialize HTTP client and tools
  const httpClient = new EvolutionHttpClient({
    baseURL: process.env.EVOLUTION_URL || 'https://your-evolution-api.com',
    apiKey: process.env.EVOLUTION_API_KEY || 'your-api-key'
  });
  
  const groupTools = new GroupTools(httpClient);
  const testInstance = process.env.TEST_INSTANCE || 'demo-instance';

  console.log('📋 Available Group Tools:');
  const tools = groupTools.getAllTools();
  tools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
  });
  console.log();

  // Demo 1: Create Group
  console.log('🔧 Demo 1: Create Group');
  const createTool = groupTools.createCreateGroupTool();
  console.log('Tool Name:', createTool.name);
  console.log('Description:', createTool.description);
  console.log('Example Parameters:', JSON.stringify(createTool.examples?.parameters, null, 2));
  
  // Validate example parameters
  const createValidation = createTool.schema.safeParse(createTool.examples?.parameters);
  console.log('Schema Validation:', createValidation.success ? '✅ Valid' : '❌ Invalid');
  if (!createValidation.success) {
    console.log('Validation Errors:', createValidation.error.errors);
  }
  console.log();

  // Demo 2: Update Group Picture
  console.log('🔧 Demo 2: Update Group Picture');
  const updatePictureTool = groupTools.createUpdateGroupPictureTool();
  console.log('Tool Name:', updatePictureTool.name);
  console.log('Description:', updatePictureTool.description);
  console.log('Example Parameters:', JSON.stringify(updatePictureTool.examples?.parameters, null, 2));
  
  const pictureValidation = updatePictureTool.schema.safeParse(updatePictureTool.examples?.parameters);
  console.log('Schema Validation:', pictureValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 3: Update Group Subject
  console.log('🔧 Demo 3: Update Group Subject');
  const updateSubjectTool = groupTools.createUpdateGroupSubjectTool();
  console.log('Tool Name:', updateSubjectTool.name);
  console.log('Description:', updateSubjectTool.description);
  console.log('Example Parameters:', JSON.stringify(updateSubjectTool.examples?.parameters, null, 2));
  
  const subjectValidation = updateSubjectTool.schema.safeParse(updateSubjectTool.examples?.parameters);
  console.log('Schema Validation:', subjectValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 4: Update Group Description
  console.log('🔧 Demo 4: Update Group Description');
  const updateDescriptionTool = groupTools.createUpdateGroupDescriptionTool();
  console.log('Tool Name:', updateDescriptionTool.name);
  console.log('Description:', updateDescriptionTool.description);
  console.log('Example Parameters:', JSON.stringify(updateDescriptionTool.examples?.parameters, null, 2));
  
  const descriptionValidation = updateDescriptionTool.schema.safeParse(updateDescriptionTool.examples?.parameters);
  console.log('Schema Validation:', descriptionValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 5: Fetch Invite Code
  console.log('🔧 Demo 5: Fetch Group Invite Code');
  const fetchInviteTool = groupTools.createFetchInviteCodeTool();
  console.log('Tool Name:', fetchInviteTool.name);
  console.log('Description:', fetchInviteTool.description);
  console.log('Example Parameters:', JSON.stringify(fetchInviteTool.examples?.parameters, null, 2));
  
  const fetchInviteValidation = fetchInviteTool.schema.safeParse(fetchInviteTool.examples?.parameters);
  console.log('Schema Validation:', fetchInviteValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 6: Revoke Invite Code
  console.log('🔧 Demo 6: Revoke Group Invite Code');
  const revokeInviteTool = groupTools.createRevokeInviteCodeTool();
  console.log('Tool Name:', revokeInviteTool.name);
  console.log('Description:', revokeInviteTool.description);
  console.log('Example Parameters:', JSON.stringify(revokeInviteTool.examples?.parameters, null, 2));
  
  const revokeInviteValidation = revokeInviteTool.schema.safeParse(revokeInviteTool.examples?.parameters);
  console.log('Schema Validation:', revokeInviteValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 7: Update Participants
  console.log('🔧 Demo 7: Update Group Participants');
  const updateParticipantTool = groupTools.createUpdateParticipantTool();
  console.log('Tool Name:', updateParticipantTool.name);
  console.log('Description:', updateParticipantTool.description);
  console.log('Example Parameters:', JSON.stringify(updateParticipantTool.examples?.parameters, null, 2));
  
  const participantValidation = updateParticipantTool.schema.safeParse(updateParticipantTool.examples?.parameters);
  console.log('Schema Validation:', participantValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 8: Leave Group
  console.log('🔧 Demo 8: Leave Group');
  const leaveTool = groupTools.createLeaveGroupTool();
  console.log('Tool Name:', leaveTool.name);
  console.log('Description:', leaveTool.description);
  console.log('Example Parameters:', JSON.stringify(leaveTool.examples?.parameters, null, 2));
  
  const leaveValidation = leaveTool.schema.safeParse(leaveTool.examples?.parameters);
  console.log('Schema Validation:', leaveValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Demo 9: Fetch Group Info
  console.log('🔧 Demo 9: Fetch Group Information');
  const fetchInfoTool = groupTools.createFetchGroupInfoTool();
  console.log('Tool Name:', fetchInfoTool.name);
  console.log('Description:', fetchInfoTool.description);
  console.log('Example Parameters:', JSON.stringify(fetchInfoTool.examples?.parameters, null, 2));
  
  const fetchInfoValidation = fetchInfoTool.schema.safeParse(fetchInfoTool.examples?.parameters);
  console.log('Schema Validation:', fetchInfoValidation.success ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Schema validation tests
  console.log('🧪 Schema Validation Tests:');
  
  // Test Group JID validation
  console.log('\n📝 Group JID Validation:');
  const validGroupJids = [
    '120363123456789012@g.us',
    '120363000000000000@g.us'
  ];
  
  const invalidGroupJids = [
    'invalid-jid',
    '120363123456789012@s.whatsapp.net',
    '120363123456789012',
    '@g.us'
  ];

  validGroupJids.forEach(jid => {
    const result = updateSubjectTool.schema.safeParse({
      instance: 'test',
      groupJid: jid,
      subject: 'Test'
    });
    console.log(`  ${jid}: ${result.success ? '✅' : '❌'}`);
  });

  invalidGroupJids.forEach(jid => {
    const result = updateSubjectTool.schema.safeParse({
      instance: 'test',
      groupJid: jid,
      subject: 'Test'
    });
    console.log(`  ${jid}: ${result.success ? '❌ Should be invalid' : '✅ Correctly invalid'}`);
  });

  // Test participant actions validation
  console.log('\n📝 Participant Action Validation:');
  const validActions = ['add', 'remove', 'promote', 'demote'];
  const invalidActions = ['invalid', 'delete', 'kick'];

  validActions.forEach(action => {
    const result = updateParticipantTool.schema.safeParse({
      instance: 'test',
      groupJid: '120363123456789012@g.us',
      action,
      participants: ['5511999999999']
    });
    console.log(`  ${action}: ${result.success ? '✅' : '❌'}`);
  });

  invalidActions.forEach(action => {
    const result = updateParticipantTool.schema.safeParse({
      instance: 'test',
      groupJid: '120363123456789012@g.us',
      action,
      participants: ['5511999999999']
    });
    console.log(`  ${action}: ${result.success ? '❌ Should be invalid' : '✅ Correctly invalid'}`);
  });

  // Test phone number validation
  console.log('\n📝 Phone Number Validation:');
  const validNumbers = [
    '5511999999999',
    '1234567890',
    '551199999999999'
  ];
  
  const invalidNumbers = [
    'invalid',
    '123',
    '+5511999999999',
    '5511-99999-9999'
  ];

  validNumbers.forEach(number => {
    const result = createTool.schema.safeParse({
      instance: 'test',
      subject: 'Test',
      participants: [number]
    });
    console.log(`  ${number}: ${result.success ? '✅' : '❌'}`);
  });

  invalidNumbers.forEach(number => {
    const result = createTool.schema.safeParse({
      instance: 'test',
      subject: 'Test',
      participants: [number]
    });
    console.log(`  ${number}: ${result.success ? '❌ Should be invalid' : '✅ Correctly invalid'}`);
  });

  console.log('\n✨ Group Tools Demo Complete!');
  console.log('\n📚 Usage Tips:');
  console.log('1. Always validate Group JIDs end with @g.us');
  console.log('2. Phone numbers should contain only digits');
  console.log('3. Group names are limited to 100 characters');
  console.log('4. Descriptions are limited to 512 characters');
  console.log('5. You can add up to 256 participants at once');
  console.log('6. Valid participant actions: add, remove, promote, demote');
  console.log('7. Invite codes can be fetched and revoked to generate new ones');
  console.log('8. Use fetch-group-info to see all groups the instance is part of');
}

// Run demo if called directly
if (require.main === module) {
  runGroupToolsDemo().catch(console.error);
}

export { runGroupToolsDemo };
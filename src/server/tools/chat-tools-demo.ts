/**
 * Chat Controller Tools Demo
 * Demonstrates how to use the Chat Controller tools
 */

import { ChatTools } from './chat-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

async function demonstrateChatTools() {
  // Initialize HTTP client (this would use real credentials in production)
  const httpClient = new EvolutionHttpClient({
    baseURL: 'https://your-evolution-api.com',
    apiKey: 'your-api-key'
  });

  // Initialize Chat Tools
  const chatTools = new ChatTools(httpClient);

  console.log('=== Chat Controller Tools Demo ===\n');

  // Get all available tools
  const tools = chatTools.getAllTools();
  console.log(`Available Chat Tools: ${tools.length}`);
  tools.forEach(tool => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });

  console.log('\n=== Tool Examples ===\n');

  // Example 1: Find Messages
  console.log('1. Find Messages Tool:');
  const findMessagesTool = chatTools.createFindMessagesTool();
  console.log(`   Name: ${findMessagesTool.name}`);
  console.log(`   Description: ${findMessagesTool.description}`);
  console.log('   Example parameters:', JSON.stringify(findMessagesTool.examples?.parameters, null, 2));

  // Example 2: Check WhatsApp Numbers
  console.log('\n2. Check WhatsApp Tool:');
  const checkWhatsappTool = chatTools.createCheckIsWhatsappTool();
  console.log(`   Name: ${checkWhatsappTool.name}`);
  console.log(`   Description: ${checkWhatsappTool.description}`);
  console.log('   Example parameters:', JSON.stringify(checkWhatsappTool.examples?.parameters, null, 2));

  // Example 3: Send Presence
  console.log('\n3. Send Presence Tool:');
  const sendPresenceTool = chatTools.createSendPresenceTool();
  console.log(`   Name: ${sendPresenceTool.name}`);
  console.log(`   Description: ${sendPresenceTool.description}`);
  console.log('   Example parameters:', JSON.stringify(sendPresenceTool.examples?.parameters, null, 2));

  // Example 4: Archive Chat
  console.log('\n4. Archive Chat Tool:');
  const archiveChatTool = chatTools.createArchiveChatTool();
  console.log(`   Name: ${archiveChatTool.name}`);
  console.log(`   Description: ${archiveChatTool.description}`);
  console.log('   Example parameters:', JSON.stringify(archiveChatTool.examples?.parameters, null, 2));

  console.log('\n=== Schema Validation Examples ===\n');

  // Demonstrate schema validation
  const findContactsTool = chatTools.createFindContactsTool();
  
  // Valid parameters
  const validParams = {
    instance: 'my_whatsapp_bot',
    where: {
      name: 'John'
    }
  };
  
  const validResult = findContactsTool.schema.safeParse(validParams);
  console.log('Valid parameters validation:', validResult.success ? 'PASSED' : 'FAILED');

  // Invalid parameters (missing instance)
  const invalidParams = {
    where: {
      name: 'John'
    }
  };
  
  const invalidResult = findContactsTool.schema.safeParse(invalidParams);
  console.log('Invalid parameters validation:', invalidResult.success ? 'PASSED' : 'FAILED');
  if (!invalidResult.success) {
    console.log('Validation errors:', invalidResult.error.errors.map(e => e.message));
  }

  console.log('\n=== Usage in MCP Server ===\n');
  console.log('To use these tools in an MCP server:');
  console.log('1. Initialize ChatTools with your EvolutionHttpClient');
  console.log('2. Get all tools using chatTools.getAllTools()');
  console.log('3. Register each tool with your MCP server');
  console.log('4. The tools will be available for Claude Desktop or other MCP clients');

  console.log('\nExample MCP server registration:');
  console.log(`
const chatTools = new ChatTools(httpClient);
const tools = chatTools.getAllTools();

tools.forEach(tool => {
  server.tool(tool.name, tool.schema, tool.handler);
});
  `);
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateChatTools().catch(console.error);
}

export { demonstrateChatTools };
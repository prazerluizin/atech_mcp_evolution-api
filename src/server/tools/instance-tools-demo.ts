/**
 * Demo/Example usage of Instance Controller tools
 * This file demonstrates how to use the Instance Controller MCP tools
 */

import { InstanceTools } from './instance-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';
import { McpToolRegistry } from '../tool-registry';

/**
 * Demo function showing how to use Instance Controller tools
 */
export async function demoInstanceTools() {
  console.log('🚀 Evolution API MCP - Instance Controller Tools Demo\n');

  // Initialize HTTP client (you would use real credentials in production)
  const httpClient = new EvolutionHttpClient({
    baseURL: process.env.EVOLUTION_URL || 'https://your-evolution-api.com',
    apiKey: process.env.EVOLUTION_API_KEY || 'your-api-key',
    enableLogging: true
  });

  // Create instance tools
  const instanceTools = new InstanceTools(httpClient);

  // Get all available tools
  const tools = instanceTools.getAllTools();
  console.log(`📋 Available Instance Tools (${tools.length}):`);
  tools.forEach(tool => {
    console.log(`  • ${tool.name}: ${tool.description}`);
  });
  console.log();

  // Example 1: Create a new instance
  console.log('📝 Example 1: Creating a new WhatsApp instance');
  const createTool = tools.find(t => t.name === 'evolution_create_instance')!;
  
  try {
    const createParams = {
      instanceName: 'demo_instance',
      qrcode: true,
      webhook: 'https://example.com/webhook'
    };

    console.log('Parameters:', JSON.stringify(createParams, null, 2));
    
    // Validate parameters
    const validationResult = createTool.schema.safeParse(createParams);
    if (validationResult.success) {
      console.log('✅ Parameters are valid');
      
      // In a real scenario, you would call:
      // const result = await createTool.handler(createParams);
      console.log('🔄 Would call Evolution API to create instance...');
    } else {
      console.log('❌ Parameter validation failed:', validationResult.error.errors);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log();

  // Example 2: Fetch all instances
  console.log('📝 Example 2: Fetching all instances');
  const fetchTool = tools.find(t => t.name === 'evolution_fetch_instances')!;
  
  try {
    const fetchParams = {};
    console.log('Parameters:', JSON.stringify(fetchParams, null, 2));
    
    // In a real scenario, you would call:
    // const result = await fetchTool.handler(fetchParams);
    console.log('🔄 Would call Evolution API to fetch instances...');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log();

  // Example 3: Set presence status
  console.log('📝 Example 3: Setting presence status');
  const presenceTool = tools.find(t => t.name === 'evolution_set_presence')!;
  
  try {
    const presenceParams = {
      instance: 'demo_instance',
      presence: 'available'
    };

    console.log('Parameters:', JSON.stringify(presenceParams, null, 2));
    
    const validationResult = presenceTool.schema.safeParse(presenceParams);
    if (validationResult.success) {
      console.log('✅ Parameters are valid');
      console.log('🔄 Would call Evolution API to set presence...');
    } else {
      console.log('❌ Parameter validation failed:', validationResult.error.errors);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  console.log();

  // Example 4: Using with Tool Registry
  console.log('📝 Example 4: Using tools with Tool Registry');
  const registry = new McpToolRegistry();
  
  try {
    registry.registerInstanceTools(httpClient);
    
    const stats = registry.getStats();
    console.log(`✅ Registered ${stats.total} tools`);
    console.log(`   Instance tools: ${stats.byController.instance}`);
    
    // Search for tools
    const createTools = registry.searchTools('create');
    console.log(`🔍 Found ${createTools.length} tools matching 'create':`);
    createTools.forEach(tool => {
      console.log(`   • ${tool.name}`);
    });
    
  } catch (error) {
    console.error('❌ Registry error:', error);
  }
  console.log();

  // Example 5: Tool schema information
  console.log('📝 Example 5: Tool schema information');
  const connectTool = tools.find(t => t.name === 'evolution_connect_instance')!;
  
  console.log(`Tool: ${connectTool.name}`);
  console.log(`Description: ${connectTool.description}`);
  console.log(`Controller: ${connectTool.controller}`);
  console.log(`Endpoint: ${connectTool.endpoint.method} ${connectTool.endpoint.path}`);
  console.log('Example usage:', JSON.stringify(connectTool.examples, null, 2));
  console.log();

  console.log('✨ Demo completed! All Instance Controller tools are ready to use.');
}

/**
 * Run the demo if this file is executed directly
 */
if (require.main === module) {
  demoInstanceTools().catch(console.error);
}
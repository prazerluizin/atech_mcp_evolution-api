/**
 * Demo: MCP Tool Registry and Generation
 * Shows how to use the tool registry system
 */

import { mcpToolGenerator, mcpToolRegistry, mcpToolFactory } from './index';
import { evolutionEndpointRegistry } from '../registry/endpoint-registry';

/**
 * Demo function showing basic usage
 */
async function basicDemo() {
  console.log('=== MCP Tool Registry Demo ===\n');

  // 1. Show available endpoints
  console.log('1. Available endpoints:');
  const endpointStats = evolutionEndpointRegistry.getStats();
  console.log(`   Total endpoints: ${endpointStats.total}`);
  console.log('   By controller:', endpointStats.byController);
  console.log();

  // 2. Generate tools for specific controllers
  console.log('2. Generating tools for Instance and Message controllers...');
  await mcpToolGenerator.generateTools({
    controllers: ['instance', 'message'],
    toolNamePrefix: 'demo_'
  });

  const toolStats = mcpToolRegistry.getStats();
  console.log(`   Generated ${toolStats.total} tools`);
  console.log('   By controller:', toolStats.byController);
  console.log();

  // 3. Show some generated tools
  console.log('3. Sample generated tools:');
  const tools = mcpToolRegistry.getTools().slice(0, 3);
  tools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description}`);
    console.log(`     Endpoint: ${tool.endpoint.method} ${tool.endpoint.path}`);
    console.log(`     Parameters: ${tool.endpoint.parameters.map(p => p.name).join(', ')}`);
  });
  console.log();

  // 4. Show tool search
  console.log('4. Searching for "send" tools:');
  const sendTools = mcpToolRegistry.searchTools('send');
  sendTools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description}`);
  });
  console.log();

  // 5. Show generation statistics
  console.log('5. Generation statistics:');
  const genStats = mcpToolGenerator.getGenerationStats();
  console.log(`   Available endpoints: ${genStats.availableEndpoints}`);
  console.log(`   Registered tools: ${genStats.registeredTools}`);
  console.log('   Coverage by controller:');
  Object.entries(genStats.byController).forEach(([controller, stats]) => {
    const coverage = stats.endpoints > 0 ? (stats.tools / stats.endpoints * 100).toFixed(1) : '0';
    console.log(`     ${controller}: ${stats.tools}/${stats.endpoints} (${coverage}%)`);
  });
  console.log();

  // 6. Validate generation
  console.log('6. Validating generation:');
  const validation = mcpToolGenerator.validateGeneration();
  console.log(`   Valid: ${validation.valid}`);
  if (!validation.valid) {
    console.log('   Errors:', validation.errors);
  }
  console.log();
}

/**
 * Demo function showing advanced usage
 */
async function advancedDemo() {
  console.log('=== Advanced Tool Registry Demo ===\n');

  // 1. Generate tools with filtering
  console.log('1. Generating tools with filtering...');
  await mcpToolGenerator.generateTools({
    controllers: ['instance', 'message'],
    includeEndpoints: ['create-instance', 'send-text-message', 'fetch-instances'],
    toolNamePrefix: 'filtered_'
  });

  console.log(`   Generated ${mcpToolRegistry.getStats().total} filtered tools`);
  mcpToolRegistry.getTools().forEach(tool => {
    console.log(`   - ${tool.name}`);
  });
  console.log();

  // 2. Create a custom tool manually
  console.log('2. Creating custom tool manually...');
  const customEndpoint = evolutionEndpointRegistry.getEndpoint('create-instance');
  if (customEndpoint) {
    const customTool = mcpToolFactory.createToolForEndpoint(customEndpoint, {
      errorHandler: (error) => ({
        success: false,
        error: {
          type: 'CUSTOM_ERROR',
          message: `Custom error handler: ${error.message}`
        }
      })
    });

    // Modify the tool name and register it
    customTool.name = 'custom_create_instance';
    mcpToolRegistry.registerTool(customTool);
    console.log(`   Created custom tool: ${customTool.name}`);
  }
  console.log();

  // 3. Show tool examples
  console.log('3. Tool examples:');
  const tool = mcpToolRegistry.getTool('filtered_evolution_send_text_message');
  if (tool && tool.examples) {
    console.log(`   Tool: ${tool.name}`);
    console.log(`   Usage: ${tool.examples.usage}`);
    console.log('   Example parameters:', JSON.stringify(tool.examples.parameters, null, 4));
  }
  console.log();

  // 4. Export configuration for debugging
  console.log('4. Exporting configuration...');
  const config = mcpToolGenerator.exportToolConfig();
  console.log('   Configuration exported (see full output in logs)');
  console.log(`   Summary: ${config.generation.registeredTools} tools, ${config.generation.availableEndpoints} endpoints`);
  console.log();
}

/**
 * Demo function showing error handling
 */
async function errorHandlingDemo() {
  console.log('=== Error Handling Demo ===\n');

  // 1. Try to register duplicate tool
  console.log('1. Testing duplicate tool registration...');
  try {
    const endpoint = evolutionEndpointRegistry.getEndpoint('create-instance');
    if (endpoint) {
      const tool1 = mcpToolFactory.createToolForEndpoint(endpoint);
      const tool2 = mcpToolFactory.createToolForEndpoint(endpoint);
      
      mcpToolRegistry.registerTool(tool1);
      mcpToolRegistry.registerTool(tool2); // Should throw
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   Expected error: ${errorMessage}`);
  }
  console.log();

  // 2. Try to generate tool for non-existent endpoint
  console.log('2. Testing non-existent endpoint...');
  try {
    await mcpToolGenerator.generateToolForEndpoint('non-existent-endpoint');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   Expected error: ${errorMessage}`);
  }
  console.log();

  // 3. Test tool validation
  console.log('3. Testing tool validation...');
  const tool = mcpToolRegistry.getTool('filtered_evolution_create_instance');
  if (tool) {
    try {
      // Test the handler with invalid parameters
      const result = await tool.handler({});
      console.log(`   Validation result: ${result.success ? 'Success' : 'Failed'}`);
      if (!result.success) {
        console.log(`   Error: ${result.error?.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`   Handler error: ${errorMessage}`);
    }
  }
  console.log();
}

/**
 * Run all demos
 */
async function runAllDemos() {
  try {
    await basicDemo();
    
    // Clear registry between demos
    mcpToolRegistry.clear();
    
    await advancedDemo();
    await errorHandlingDemo();
    
    console.log('=== Demo Complete ===');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run demos if this file is executed directly
if (require.main === module) {
  runAllDemos();
}

export { basicDemo, advancedDemo, errorHandlingDemo, runAllDemos };
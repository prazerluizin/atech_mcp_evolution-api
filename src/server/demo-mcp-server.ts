/**
 * Demo script for MCP Server Core
 * Shows how to initialize and use the Evolution API MCP Server
 */

import { EvolutionMcpServer } from './mcp-server';
import { ConfigurationManager } from '../config/configuration-manager';

async function demoMcpServer() {
  console.log('=== Evolution API MCP Server Demo ===\n');

  try {
    // Create server instance
    console.log('1. Creating MCP server instance...');
    const server = new EvolutionMcpServer();
    console.log('✓ Server instance created');

    // Show initial stats
    console.log('\n2. Initial server statistics:');
    console.log(JSON.stringify(server.getStats(), null, 2));

    // Create mock configuration manager for demo
    const mockConfigManager = {
      loadConfig: async () => ({
        evolutionUrl: 'https://demo-evolution-api.com',
        evolutionApiKey: 'demo-api-key-12345',
        server: {
          name: 'evolution-api-mcp-demo',
          version: '1.0.0'
        },
        http: {
          timeout: 30000,
          retryAttempts: 3,
          retryDelay: 1000
        }
      })
    } as any;

    // Initialize server
    console.log('\n3. Initializing server with configuration...');
    await server.initialize(mockConfigManager);
    console.log('✓ Server initialized successfully');

    // Show updated stats
    console.log('\n4. Server statistics after initialization:');
    console.log(JSON.stringify(server.getStats(), null, 2));

    // Show tool registry stats
    console.log('\n5. Tool registry statistics:');
    const registry = server.getToolRegistry();
    console.log(JSON.stringify(registry.getStats(), null, 2));

    // Show available tools
    console.log('\n6. Available tools:');
    const tools = registry.getTools();
    tools.slice(0, 5).forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
    });
    if (tools.length > 5) {
      console.log(`   ... and ${tools.length - 5} more tools`);
    }

    // Health check
    console.log('\n7. Performing health check...');
    const health = await server.healthCheck();
    console.log(`   Health status: ${health.healthy ? '✓ Healthy' : '✗ Unhealthy'}`);
    if (!health.healthy) {
      console.log(`   Details: ${JSON.stringify(health.details, null, 2)}`);
    }

    // Show HTTP client info
    console.log('\n8. HTTP client information:');
    const httpClient = server.getHttpClient();
    if (httpClient) {
      console.log('   ✓ HTTP client initialized');
      console.log(`   Configuration: ${JSON.stringify(httpClient.getConfig(), null, 2)}`);
      console.log(`   Statistics: ${JSON.stringify(httpClient.getStats(), null, 2)}`);
    } else {
      console.log('   ✗ HTTP client not available');
    }

    console.log('\n=== Demo completed successfully! ===');
    console.log('\nTo start the server for Claude Desktop integration, run:');
    console.log('npx evolution-api-mcp');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  demoMcpServer().catch(console.error);
}

export { demoMcpServer };
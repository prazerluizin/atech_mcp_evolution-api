/**
 * Demo script to showcase the Evolution API Endpoint Registry
 */

import { evolutionEndpointRegistry } from './endpoint-registry';

function demonstrateRegistry() {
  console.log('=== Evolution API v2 Endpoint Registry Demo ===\n');

  // Show basic statistics
  const stats = evolutionEndpointRegistry.getStats();
  console.log('📊 Registry Statistics:');
  console.log(`  Total endpoints: ${stats.total}`);
  console.log(`  Controllers: ${Object.keys(stats.byController).length}`);
  console.log(`  Endpoints requiring instance: ${stats.requiresInstance}`);
  console.log(`  Global endpoints: ${stats.global}`);
  console.log();

  // Show endpoints by controller
  console.log('🎛️  Endpoints by Controller:');
  Object.entries(stats.byController).forEach(([controller, count]) => {
    console.log(`  ${controller}: ${count} endpoints`);
  });
  console.log();

  // Show HTTP methods distribution
  console.log('🌐 HTTP Methods:');
  Object.entries(stats.byMethod).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} endpoints`);
  });
  console.log();

  // Show some example endpoints
  console.log('📋 Example Endpoints:');
  
  // Instance endpoints
  console.log('\n  Instance Controller:');
  const instanceEndpoints = evolutionEndpointRegistry.getEndpointsByController('instance');
  instanceEndpoints.slice(0, 3).forEach(endpoint => {
    console.log(`    ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
  });

  // Message endpoints
  console.log('\n  Message Controller:');
  const messageEndpoints = evolutionEndpointRegistry.getEndpointsByController('message');
  messageEndpoints.slice(0, 3).forEach(endpoint => {
    console.log(`    ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
  });

  // Search functionality
  console.log('\n🔍 Search Examples:');
  const sendEndpoints = evolutionEndpointRegistry.searchEndpoints('send');
  console.log(`  Found ${sendEndpoints.length} endpoints containing "send"`);
  
  const groupEndpoints = evolutionEndpointRegistry.searchEndpoints('grupo');
  console.log(`  Found ${groupEndpoints.length} endpoints containing "grupo"`);

  // Validation
  console.log('\n✅ Registry Validation:');
  const validation = evolutionEndpointRegistry.validateRegistry();
  if (validation.valid) {
    console.log('  Registry structure is valid ✓');
  } else {
    console.log('  Registry has validation errors:');
    validation.errors.forEach(error => console.log(`    - ${error}`));
  }

  // Show a detailed endpoint example
  console.log('\n📄 Detailed Endpoint Example:');
  const sendTextEndpoint = evolutionEndpointRegistry.getEndpoint('send-text');
  if (sendTextEndpoint) {
    console.log(`  Name: ${sendTextEndpoint.name}`);
    console.log(`  Path: ${sendTextEndpoint.path}`);
    console.log(`  Method: ${sendTextEndpoint.method}`);
    console.log(`  Controller: ${sendTextEndpoint.controller}`);
    console.log(`  Requires Instance: ${sendTextEndpoint.requiresInstance}`);
    console.log(`  Description: ${sendTextEndpoint.description}`);
    console.log(`  Parameters: ${sendTextEndpoint.parameters.length}`);
    sendTextEndpoint.parameters.forEach(param => {
      console.log(`    - ${param.name} (${param.type}): ${param.description}`);
    });
  }

  console.log('\n=== Demo Complete ===');
}

// Run demo if called directly
if (require.main === module) {
  demonstrateRegistry();
}

export { demonstrateRegistry };
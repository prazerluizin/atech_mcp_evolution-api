#!/usr/bin/env node

/**
 * CLI Demo Script
 * Demonstrates the CLI functionality with different options
 */

import { runCli } from './cli';

async function demo() {
  console.log('Evolution API MCP Server CLI Demo');
  console.log('=================================');
  console.log('');

  // Test help command
  console.log('1. Testing help command:');
  process.argv = ['node', 'demo.js', '--help'];
  
  try {
    await runCli();
  } catch (error) {
    console.log('Help command completed');
  }

  console.log('');
  console.log('2. Testing version command:');
  process.argv = ['node', 'demo.js', '--version'];
  
  try {
    await runCli();
  } catch (error) {
    console.log('Version command completed');
  }

  console.log('');
  console.log('3. Testing configuration validation (will fail without proper config):');
  process.argv = ['node', 'demo.js', '--validate'];
  
  try {
    await runCli();
  } catch (error) {
    console.log('Validation command completed (expected to fail without config)');
  }

  console.log('');
  console.log('Demo completed!');
  console.log('');
  console.log('To test with actual configuration, set these environment variables:');
  console.log('  EVOLUTION_URL=https://your-evolution-api.com');
  console.log('  EVOLUTION_API_KEY=your-global-api-key');
  console.log('');
  console.log('Then run:');
  console.log('  npx tsx src/cli/demo.ts --validate');
}

if (require.main === module) {
  demo().catch(console.error);
}

export { demo };
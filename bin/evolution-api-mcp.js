#!/usr/bin/env node

/**
 * Evolution API MCP Server - NPX Executable
 * This is the entry point when running via npx evolution-api-mcp
 */

const path = require('path');

// Determine if we're running from source or built distribution
const isBuilt = require('fs').existsSync(path.join(__dirname, '..', 'dist'));

if (isBuilt) {
  // Running from built distribution
  require('../dist/cli/cli.js').runCli().catch(error => {
    console.error('Failed to start Evolution API MCP Server:', error);
    process.exit(1);
  });
} else {
  // Running from source (development)
  try {
    require('tsx/cjs').register();
    require('../src/cli/cli.ts').runCli().catch(error => {
      console.error('Failed to start Evolution API MCP Server:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Development mode requires tsx to be installed.');
    console.error('Please run: npm install tsx');
    console.error('Or build the project first: npm run build');
    process.exit(1);
  }
}
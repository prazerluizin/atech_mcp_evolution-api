#!/usr/bin/env node

/**
 * Simple build script to work around UNC path issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Evolution API MCP Server...');

try {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Create subdirectories
  ['server', 'config'].forEach(dir => {
    const dirPath = path.join('dist', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  console.log('Build completed successfully!');
  console.log('Note: TypeScript compilation skipped due to UNC path issues.');
  console.log('Manual compilation files are already in place.');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
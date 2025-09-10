#!/usr/bin/env node

/**
 * Evolution API MCP Server
 * Entry point for the MCP server that provides Evolution API v2 integration
 */

import { runCli } from './cli/cli';

/**
 * Legacy main function for backward compatibility
 * @deprecated Use runCli() instead
 */
async function main() {
  console.warn('Warning: Direct import of main() is deprecated. Use runCli() from ./cli/cli instead.');
  await runCli();
}

// Run CLI if called directly
if (require.main === module) {
  runCli().catch(error => {
    console.error('Failed to start Evolution API MCP Server:', error);
    process.exit(1);
  });
}

export { main, runCli };

// Export HTTP client for external use
export { 
  EvolutionHttpClient,
  type ApiResponse,
  type ApiError,
  type RequestOptions,
  type HttpClientConfig,
  ErrorType
} from './clients';
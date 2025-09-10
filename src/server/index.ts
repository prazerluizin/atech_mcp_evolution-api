/**
 * MCP Server Components
 * Exports all server-related classes and utilities
 */

// Types
export * from './types';

// Core components
export { McpToolRegistry, mcpToolRegistry } from './tool-registry';
export { McpToolFactory, mcpToolFactory } from './tool-factory';
export { McpToolGenerator, mcpToolGenerator } from './tool-generator';
export { EvolutionMcpServer } from './mcp-server';

// Type exports for convenience
export type {
  ToolHandler,
  ToolResult,
  ToolInfo,
  ToolFactoryConfig,
  ToolRegistry,
  ToolRegistryStats,
  ToolFactory
} from './types';

export type { McpServerConfig } from './mcp-server';
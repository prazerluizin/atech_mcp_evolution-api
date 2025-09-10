/**
 * Types and interfaces for MCP tool registry and server components
 */

import { z } from 'zod';
import { EndpointInfo, ControllerType } from '../registry/types';

/**
 * MCP tool handler function type
 */
export type ToolHandler = (params: any) => Promise<ToolResult>;

/**
 * Result returned by a tool execution
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  id?: any;
  error?: {
    type: string;
    message: string;
    code?: string;
    details?: any;
    suggestions?: string[];
    retryable?: boolean;
  };
}

/**
 * MCP tool information
 */
export interface ToolInfo {
  name: string;
  description: string;
  controller: ControllerType;
  endpoint: EndpointInfo;
  schema: z.ZodSchema;
  handler: ToolHandler;
  examples?: {
    usage: string;
    parameters: any;
  };
}

/**
 * Error handler function type
 */
export type ErrorHandlerFunction = (error: any) => ToolResult;

/**
 * Tool factory configuration
 */
export interface ToolFactoryConfig {
  httpClient?: any; // Will be typed properly when HTTP client is available
  errorHandler?: ErrorHandlerFunction;
  validator?: (params: any, schema: z.ZodSchema) => { valid: boolean; errors?: string[] };
}

/**
 * Tool registry interface
 */
export interface ToolRegistry {
  registerTool(toolInfo: ToolInfo): void;
  getTools(): ToolInfo[];
  getTool(name: string): ToolInfo | undefined;
  getToolsByController(controller: ControllerType): ToolInfo[];
  updateTool(name: string, updates: Partial<ToolInfo>): void;
  removeTool(name: string): void;
  clear(): void;
  getStats(): ToolRegistryStats;
}

/**
 * Tool registry statistics
 */
export interface ToolRegistryStats {
  total: number;
  byController: Record<ControllerType, number>;
  registered: string[];
}

/**
 * Tool factory interface
 */
export interface ToolFactory {
  createToolsForController(controller: ControllerType, config?: ToolFactoryConfig): ToolInfo[];
  createToolForEndpoint(endpoint: EndpointInfo, config?: ToolFactoryConfig): ToolInfo;
  generateSchema(endpoint: EndpointInfo): z.ZodSchema;
  createHandler(endpoint: EndpointInfo, config?: ToolFactoryConfig): ToolHandler;
}
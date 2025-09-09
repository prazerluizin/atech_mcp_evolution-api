import { z } from 'zod';

/**
 * Configuration schema for the Evolution API MCP Server
 * Defines validation rules for all configuration options
 */

// Base configuration schema
export const ConfigSchema = z.object({
  // Evolution API connection settings
  evolutionUrl: z.string()
    .url('Evolution URL must be a valid URL')
    .describe('Base URL for the Evolution API instance'),
  
  evolutionApiKey: z.string()
    .min(1, 'Evolution API key is required')
    .describe('Global API key for Evolution API authentication'),

  // MCP Server settings
  server: z.object({
    name: z.string()
      .default('evolution-api-mcp')
      .describe('Name of the MCP server'),
    
    version: z.string()
      .default('1.0.0')
      .describe('Version of the MCP server')
  }).default({}),

  // HTTP client settings
  http: z.object({
    timeout: z.number()
      .positive('HTTP timeout must be positive')
      .default(30000)
      .describe('HTTP request timeout in milliseconds'),
    
    retryAttempts: z.number()
      .int('Retry attempts must be an integer')
      .min(0, 'Retry attempts cannot be negative')
      .max(10, 'Maximum 10 retry attempts allowed')
      .default(3)
      .describe('Number of retry attempts for failed requests'),
    
    retryDelay: z.number()
      .positive('Retry delay must be positive')
      .default(1000)
      .describe('Base delay between retries in milliseconds')
  }).default({})
});

// Environment variables schema
export const EnvSchema = z.object({
  EVOLUTION_URL: z.string().optional(),
  EVOLUTION_API_KEY: z.string().optional(),
  MCP_SERVER_NAME: z.string().optional(),
  MCP_SERVER_VERSION: z.string().optional(),
  HTTP_TIMEOUT: z.string().optional(),
  RETRY_ATTEMPTS: z.string().optional(),
  RETRY_DELAY: z.string().optional()
});

// Configuration file schema (JSON format)
export const ConfigFileSchema = z.object({
  evolutionUrl: z.string().optional(),
  evolutionApiKey: z.string().optional(),
  server: z.object({
    name: z.string().optional(),
    version: z.string().optional()
  }).optional(),
  http: z.object({
    timeout: z.number().optional(),
    retryAttempts: z.number().optional(),
    retryDelay: z.number().optional()
  }).optional()
});

// Type exports
export type Config = z.infer<typeof ConfigSchema>;
export type EnvConfig = z.infer<typeof EnvSchema>;
export type ConfigFile = z.infer<typeof ConfigFileSchema>;

// Default configuration values
export const DEFAULT_CONFIG: Partial<Config> = {
  server: {
    name: 'evolution-api-mcp',
    version: '1.0.0'
  },
  http: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  }
};
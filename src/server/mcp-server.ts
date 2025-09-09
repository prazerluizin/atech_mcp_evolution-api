/**
 * MCP Server Core Implementation
 * Main MCP server class using MCP TypeScript SDK with STDIO transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { Config } from '../config/schemas';
import { ConfigurationManager } from '../config/configuration-manager';
import { EvolutionHttpClient, HttpClientConfig } from '../clients/evolution-http-client';
import { McpToolGenerator, mcpToolGenerator } from './tool-generator';
import { McpToolRegistry, mcpToolRegistry } from './tool-registry';
import { ToolInfo, ToolResult, ErrorHandlerFunction } from './types';
import { ErrorHandler } from '../utils/error-handler';

/**
 * MCP Server configuration interface
 */
export interface McpServerConfig {
  name: string;
  version: string;
  evolutionUrl: string;
  evolutionApiKey: string;
  enableLogging?: boolean;
  httpTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Evolution API MCP Server
 * Implements the MCP protocol for Evolution API v2 integration
 */
export class EvolutionMcpServer {
  private server: Server;
  private httpClient?: EvolutionHttpClient;
  private toolGenerator: McpToolGenerator;
  private toolRegistry: McpToolRegistry;
  private config?: McpServerConfig;
  private isInitialized = false;

  constructor(
    toolGenerator: McpToolGenerator = mcpToolGenerator,
    toolRegistry: McpToolRegistry = mcpToolRegistry
  ) {
    this.toolGenerator = toolGenerator;
    this.toolRegistry = toolRegistry;
    
    // Initialize MCP server
    this.server = new Server(
      {
        name: 'evolution-api-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupErrorHandling();
  }

  /**
   * Initialize the MCP server with configuration
   */
  async initialize(configManager?: ConfigurationManager): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load configuration
      const manager = configManager || new ConfigurationManager();
      const config = await manager.loadConfig();
      
      this.config = this.transformConfig(config);

      // Initialize HTTP client
      this.httpClient = new EvolutionHttpClient({
        baseURL: this.config.evolutionUrl,
        apiKey: this.config.evolutionApiKey,
        timeout: this.config.httpTimeout,
        retryAttempts: this.config.retryAttempts,
        retryDelay: this.config.retryDelay,
        enableLogging: this.config.enableLogging
      });

      // Update server info with actual config
      this.server = new Server(
        {
          name: this.config.name,
          version: this.config.version
        },
        {
          capabilities: {
            tools: {}
          }
        }
      );

      // Generate and register tools
      await this.registerTools();

      // Setup request handlers
      this.setupRequestHandlers();

      this.isInitialized = true;

      if (this.config.enableLogging) {
        console.log(`[MCP Server] Initialized successfully`);
        console.log(`[MCP Server] Evolution API URL: ${this.config.evolutionUrl}`);
        console.log(`[MCP Server] Registered ${this.toolRegistry.getStats().total} tools`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize MCP server: ${errorMessage}`);
    }
  }

  /**
   * Start the server with STDIO transport for Claude Desktop integration
   */
  async startStdio(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Server must be initialized before starting');
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      if (this.config?.enableLogging) {
        console.log('[MCP Server] Connected via STDIO transport');
        console.log('[MCP Server] Ready for Claude Desktop integration');
      }

      // Keep the process alive and handle graceful shutdown
      this.setupProcessHandlers();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to start STDIO server: ${errorMessage}`);
    }
  }

  /**
   * Start the server with HTTP transport for other MCP clients
   */
  async startHttp(port: number = 3000): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Server must be initialized before starting');
    }

    try {
      // Import HTTP transport and express
      const express = await import('express');
      const app = express.default();
      
      // Enable CORS for cross-origin requests
      app.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });

      // Health check endpoint
      app.get('/health', (req: any, res: any) => {
        this.healthCheck().then(health => {
          res.status(health.healthy ? 200 : 503).json(health);
        }).catch(error => {
          res.status(500).json({
            healthy: false,
            details: { error: error instanceof Error ? error.message : String(error) }
          });
        });
      });

      // Basic MCP info endpoint (since SSE transport might not be available)
      app.get('/mcp', (req: any, res: any) => {
        res.json({
          name: this.config?.name || 'evolution-api-mcp',
          version: this.config?.version || '1.0.0',
          description: 'Evolution API MCP Server',
          transport: 'http',
          endpoints: {
            health: '/health',
            info: '/mcp'
          }
        });
      });

      // Start HTTP server
      const httpServer = app.listen(port, () => {
        if (this.config?.enableLogging) {
          console.log(`[MCP Server] HTTP server listening on port ${port}`);
          console.log(`[MCP Server] Health check: http://localhost:${port}/health`);
          console.log(`[MCP Server] MCP endpoint: http://localhost:${port}/mcp`);
        }
      });

      // Setup graceful shutdown for HTTP server
      this.setupHttpProcessHandlers(httpServer);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to start HTTP server: ${errorMessage}`);
    }
  }

  /**
   * Shutdown the server gracefully
   */
  async shutdown(): Promise<void> {
    try {
      if (this.config?.enableLogging) {
        console.log('[MCP Server] Shutting down...');
      }
      
      await this.server.close();
      
      if (this.config?.enableLogging) {
        console.log('[MCP Server] Server closed successfully');
      }
    } catch (error) {
      console.error('[MCP Server] Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Generate and register all MCP tools
   */
  private async registerTools(): Promise<void> {
    if (!this.httpClient) {
      throw new Error('HTTP client not initialized');
    }

    try {
      // Generate tools with HTTP client configuration
      await this.toolGenerator.generateTools({
        httpClient: this.httpClient,
        errorHandler: this.createErrorHandler(),
        validator: this.createValidator()
      });

      if (this.config?.enableLogging) {
        const stats = this.toolRegistry.getStats();
        console.log(`[MCP Server] Generated ${stats.total} tools across ${Object.keys(stats.byController).length} controllers`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register tools: ${errorMessage}`);
    }
  }

  /**
   * Setup MCP request handlers
   */
  private setupRequestHandlers(): void {
    // Handle list tools requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.toolRegistry.getTools();
      
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.schema._def as any
        }))
      };
    });

    // Handle call tool requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const tool = this.toolRegistry.getTool(name);
        if (!tool) {
          return {
            content: [{
              type: 'text',
              text: `Tool '${name}' not found`
            }],
            isError: true
          };
        }

        // Execute the tool
        const result = await tool.handler(args || {});
        
        return this.formatToolResponse(result, tool);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (this.config?.enableLogging) {
          console.error(`[MCP Server] Tool execution error for '${name}':`, error);
        }

        return {
          content: [{
            type: 'text',
            text: `Error executing tool '${name}': ${errorMessage}`
          }],
          isError: true
        };
      }
    });
  }

  /**
   * Format tool response for Claude Desktop
   */
  private formatToolResponse(result: ToolResult, tool: ToolInfo): any {
    if (result.success) {
      // Format successful response
      let responseText = '';
      
      if (result.data) {
        if (typeof result.data === 'string') {
          responseText = result.data;
        } else if (typeof result.data === 'object') {
          // Format object data in a readable way
          if (result.data.message) {
            responseText = result.data.message;
          } else {
            responseText = `Operation completed successfully.\n\nResult:\n${JSON.stringify(result.data, null, 2)}`;
          }
        } else {
          responseText = `Operation completed successfully. Result: ${result.data}`;
        }
      } else {
        responseText = `${tool.description} completed successfully.`;
      }

      return {
        content: [{
          type: 'text',
          text: responseText
        }]
      };
    } else {
      // Format error response
      const error = result.error;
      let errorText = `Error: ${error?.message || 'Unknown error occurred'}`;
      
      // Add helpful suggestions based on error type
      if (error?.type === 'AUTHENTICATION_ERROR') {
        errorText += '\n\nSuggestion: Please check your Evolution API key configuration.';
      } else if (error?.type === 'VALIDATION_ERROR') {
        errorText += '\n\nSuggestion: Please check the parameters you provided.';
        if (error.details && Array.isArray(error.details)) {
          errorText += `\nValidation errors: ${error.details.join(', ')}`;
        }
      } else if (error?.type === 'NETWORK_ERROR') {
        errorText += '\n\nSuggestion: Please check your Evolution API URL and network connection.';
      } else if (error?.type === 'TIMEOUT_ERROR') {
        errorText += '\n\nSuggestion: The request timed out. Please try again.';
      }

      return {
        content: [{
          type: 'text',
          text: errorText
        }],
        isError: true
      };
    }
  }

  /**
   * Create error handler for tools
   */
  private createErrorHandler(): ErrorHandlerFunction {
    const errorHandler = new ErrorHandler({
      enableLogging: this.config?.enableLogging ?? true,
      logLevel: 'error'
    });

    return (error: any): ToolResult => {
      const mcpError = errorHandler.handleHttpError(error);
      return errorHandler.createToolErrorResponse(mcpError);
    };
  }

  /**
   * Create parameter validator for tools
   */
  private createValidator() {
    return (params: any, schema: z.ZodSchema): { valid: boolean; errors?: string[] } => {
      try {
        schema.parse(params);
        return { valid: true };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            valid: false,
            errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
          };
        }
        const errorMessage = error instanceof Error ? error.message : 'Validation failed';
        return {
          valid: false,
          errors: [errorMessage]
        };
      }
    };
  }

  /**
   * Transform configuration from Config to McpServerConfig
   */
  private transformConfig(config: Config): McpServerConfig {
    return {
      name: config.server.name,
      version: config.server.version,
      evolutionUrl: config.evolutionUrl,
      evolutionApiKey: config.evolutionApiKey,
      enableLogging: true, // Enable logging by default for debugging
      httpTimeout: config.http.timeout,
      retryAttempts: config.http.retryAttempts,
      retryDelay: config.http.retryDelay
    };
  }

  /**
   * Setup error handling for the server
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server] Server error:', error);
    };
  }

  /**
   * Setup process handlers for graceful shutdown (STDIO mode)
   */
  private setupProcessHandlers(): void {
    const shutdown = async (signal: string) => {
      if (this.config?.enableLogging) {
        console.log(`[MCP Server] Received ${signal}, shutting down gracefully...`);
      }
      
      try {
        await this.shutdown();
      } catch (error) {
        console.error('[MCP Server] Error during shutdown:', error);
      }
      
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('[MCP Server] Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[MCP Server] Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  /**
   * Setup process handlers for graceful shutdown (HTTP mode)
   */
  private setupHttpProcessHandlers(httpServer: any): void {
    const shutdown = async (signal: string) => {
      if (this.config?.enableLogging) {
        console.log(`[MCP Server] Received ${signal}, shutting down gracefully...`);
      }
      
      try {
        // Close HTTP server first
        await new Promise<void>((resolve, reject) => {
          httpServer.close((error: any) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        // Then close MCP server
        await this.shutdown();
      } catch (error) {
        console.error('[MCP Server] Error during shutdown:', error);
      }
      
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('[MCP Server] Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[MCP Server] Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  /**
   * Get server statistics
   */
  getStats(): {
    initialized: boolean;
    toolCount: number;
    serverInfo: { name: string; version: string };
    httpClientStats?: { requestCount: number };
  } {
    return {
      initialized: this.isInitialized,
      toolCount: this.toolRegistry.getStats().total,
      serverInfo: {
        name: this.config?.name || 'evolution-api-mcp',
        version: this.config?.version || '1.0.0'
      },
      httpClientStats: this.httpClient?.getStats()
    };
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      if (!this.isInitialized) {
        return {
          healthy: false,
          details: { error: 'Server not initialized' }
        };
      }

      if (!this.httpClient) {
        return {
          healthy: false,
          details: { error: 'HTTP client not available' }
        };
      }

      // Test HTTP client connection
      const httpHealth = await this.httpClient.healthCheck();
      
      return {
        healthy: httpHealth.success,
        details: {
          server: this.getStats(),
          httpClient: httpHealth
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Get the HTTP client instance (for testing)
   */
  getHttpClient(): EvolutionHttpClient | undefined {
    return this.httpClient;
  }

  /**
   * Get the tool registry instance (for testing)
   */
  getToolRegistry(): McpToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Get the server instance (for testing)
   */
  getServer(): Server {
    return this.server;
  }
}
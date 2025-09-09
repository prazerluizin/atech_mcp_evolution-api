/**
 * MCP Tool Generator
 * Dynamically generates and registers MCP tools from Evolution API endpoints
 */

import { ToolInfo, ToolFactoryConfig } from './types';
import { ControllerType } from '../registry/types';
import { McpToolRegistry, mcpToolRegistry } from './tool-registry';
import { McpToolFactory, mcpToolFactory } from './tool-factory';
import { evolutionEndpointRegistry } from '../registry/endpoint-registry';

/**
 * Tool generator configuration
 */
export interface ToolGeneratorConfig extends ToolFactoryConfig {
  controllers?: ControllerType[];
  excludeEndpoints?: string[];
  includeEndpoints?: string[];
  toolNamePrefix?: string;
}

/**
 * MCP Tool Generator
 * Orchestrates the creation and registration of tools from endpoint definitions
 */
export class McpToolGenerator {
  private registry: McpToolRegistry;
  private factory: McpToolFactory;

  constructor(
    registry: McpToolRegistry = mcpToolRegistry,
    factory: McpToolFactory = mcpToolFactory
  ) {
    this.registry = registry;
    this.factory = factory;
  }

  /**
   * Generate and register all tools for specified controllers
   */
  async generateTools(config: ToolGeneratorConfig = {}): Promise<void> {
    const {
      controllers = this.getAllControllers(),
      excludeEndpoints = [],
      includeEndpoints = [],
      toolNamePrefix = '',
      ...factoryConfig
    } = config;

    // Clear existing tools if regenerating
    this.registry.clear();

    const allTools: ToolInfo[] = [];

    // Generate tools for each controller
    for (const controller of controllers) {
      const controllerTools = this.factory.createToolsForController(controller, factoryConfig);
      
      // Filter tools based on include/exclude lists
      const filteredTools = controllerTools.filter(tool => {
        const endpointName = tool.endpoint.name;
        
        // If includeEndpoints is specified, only include those
        if (includeEndpoints.length > 0) {
          return includeEndpoints.includes(endpointName);
        }
        
        // Otherwise, exclude any in the exclude list
        return !excludeEndpoints.includes(endpointName);
      });

      // Apply tool name prefix if specified
      if (toolNamePrefix) {
        filteredTools.forEach(tool => {
          tool.name = `${toolNamePrefix}${tool.name}`;
        });
      }

      allTools.push(...filteredTools);
    }

    // Register all tools
    try {
      this.registry.registerTools(allTools);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register tools: ${errorMessage}`);
    }
  }

  /**
   * Generate tools for a specific controller
   */
  async generateToolsForController(
    controller: ControllerType, 
    config: ToolFactoryConfig = {}
  ): Promise<ToolInfo[]> {
    const tools = this.factory.createToolsForController(controller, config);
    
    // Register the tools
    tools.forEach(tool => {
      this.registry.registerTool(tool);
    });

    return tools;
  }

  /**
   * Generate a single tool for a specific endpoint
   */
  async generateToolForEndpoint(
    endpointName: string, 
    config: ToolFactoryConfig = {}
  ): Promise<ToolInfo | null> {
    const endpoint = evolutionEndpointRegistry.getEndpoint(endpointName);
    if (!endpoint) {
      throw new Error(`Endpoint '${endpointName}' not found`);
    }

    const tool = this.factory.createToolForEndpoint(endpoint, config);
    this.registry.registerTool(tool);

    return tool;
  }

  /**
   * Regenerate tools with new configuration
   */
  async regenerateTools(config: ToolGeneratorConfig = {}): Promise<void> {
    await this.generateTools(config);
  }

  /**
   * Get all available controllers
   */
  private getAllControllers(): ControllerType[] {
    return evolutionEndpointRegistry.getAllControllers();
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(): {
    availableEndpoints: number;
    registeredTools: number;
    byController: Record<ControllerType, { endpoints: number; tools: number }>;
  } {
    const endpointStats = evolutionEndpointRegistry.getStats();
    const toolStats = this.registry.getStats();

    const byController: Record<ControllerType, { endpoints: number; tools: number }> = {} as any;
    
    this.getAllControllers().forEach(controller => {
      byController[controller] = {
        endpoints: endpointStats.byController[controller] || 0,
        tools: toolStats.byController[controller] || 0
      };
    });

    return {
      availableEndpoints: endpointStats.total,
      registeredTools: toolStats.total,
      byController
    };
  }

  /**
   * Validate tool generation
   */
  validateGeneration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const tools = this.registry.getTools();

    // Check that all tools have valid handlers
    tools.forEach(tool => {
      if (typeof tool.handler !== 'function') {
        errors.push(`Tool '${tool.name}' has invalid handler`);
      }

      if (!tool.schema) {
        errors.push(`Tool '${tool.name}' has no schema`);
      }

      if (!tool.endpoint) {
        errors.push(`Tool '${tool.name}' has no endpoint`);
      }
    });

    // Check for duplicate tool names
    const toolNames = tools.map(t => t.name);
    const duplicates = toolNames.filter((name, index) => toolNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate tool names found: ${duplicates.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export tool configuration for debugging
   */
  exportToolConfig(): any {
    return {
      generation: this.getGenerationStats(),
      validation: this.validateGeneration(),
      tools: this.registry.exportConfig(),
      endpoints: evolutionEndpointRegistry.getStats()
    };
  }

  /**
   * Get the registry instance
   */
  getRegistry(): McpToolRegistry {
    return this.registry;
  }

  /**
   * Get the factory instance
   */
  getFactory(): McpToolFactory {
    return this.factory;
  }
}

// Export a singleton instance
export const mcpToolGenerator = new McpToolGenerator();
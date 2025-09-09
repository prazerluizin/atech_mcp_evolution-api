/**
 * MCP Tool Registry Implementation
 * Manages registration and retrieval of MCP tools for Evolution API
 */

import { ToolInfo, ToolRegistry, ToolRegistryStats } from './types';
import { ControllerType } from '../registry/types';
import { InstanceTools } from './tools/instance-tools';
import { EvolutionHttpClient } from '../clients/evolution-http-client';

/**
 * Implementation of the MCP tool registry
 */
export class McpToolRegistry implements ToolRegistry {
    private tools: Map<string, ToolInfo> = new Map();

    /**
     * Register a new tool
     */
    registerTool(toolInfo: ToolInfo): void {
        if (this.tools.has(toolInfo.name)) {
            throw new Error(`Tool with name '${toolInfo.name}' is already registered`);
        }

        // Validate tool info
        this.validateToolInfo(toolInfo);

        this.tools.set(toolInfo.name, { ...toolInfo });
    }

    /**
     * Get all registered tools
     */
    getTools(): ToolInfo[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get a specific tool by name
     */
    getTool(name: string): ToolInfo | undefined {
        return this.tools.get(name);
    }

    /**
     * Get tools filtered by controller type
     */
    getToolsByController(controller: ControllerType): ToolInfo[] {
        return this.getTools().filter(tool => tool.controller === controller);
    }

    /**
     * Update an existing tool
     */
    updateTool(name: string, updates: Partial<ToolInfo>): void {
        const existingTool = this.tools.get(name);
        if (!existingTool) {
            throw new Error(`Tool with name '${name}' not found`);
        }

        const updatedTool = { ...existingTool, ...updates };

        // Validate updated tool info
        this.validateToolInfo(updatedTool);

        this.tools.set(name, updatedTool);
    }

    /**
     * Remove a tool from the registry
     */
    removeTool(name: string): void {
        if (!this.tools.has(name)) {
            throw new Error(`Tool with name '${name}' not found`);
        }

        this.tools.delete(name);
    }

    /**
     * Clear all registered tools
     */
    clear(): void {
        this.tools.clear();
    }

    /**
     * Get registry statistics
     */
    getStats(): ToolRegistryStats {
        const tools = this.getTools();
        const stats: ToolRegistryStats = {
            total: tools.length,
            byController: {} as Record<ControllerType, number>,
            registered: tools.map(tool => tool.name)
        };

        // Count by controller
        const controllers: ControllerType[] = ['instance', 'message', 'chat', 'group', 'profile', 'webhook', 'information'];
        controllers.forEach(controller => {
            stats.byController[controller] = this.getToolsByController(controller).length;
        });

        return stats;
    }

    /**
     * Check if a tool is registered
     */
    hasTool(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Get all registered tool names
     */
    getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }

    /**
     * Search tools by name or description
     */
    searchTools(query: string): ToolInfo[] {
        const lowerQuery = query.toLowerCase();
        return this.getTools().filter(tool =>
            tool.name.toLowerCase().includes(lowerQuery) ||
            tool.description.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Validate tool information
     */
    private validateToolInfo(toolInfo: ToolInfo): void {
        const errors: string[] = [];

        if (!toolInfo.name || typeof toolInfo.name !== 'string') {
            errors.push('Tool name is required and must be a string');
        }

        if (!toolInfo.description || typeof toolInfo.description !== 'string') {
            errors.push('Tool description is required and must be a string');
        }

        if (!toolInfo.controller) {
            errors.push('Tool controller is required');
        }

        if (!toolInfo.endpoint) {
            errors.push('Tool endpoint is required');
        }

        if (!toolInfo.schema) {
            errors.push('Tool schema is required');
        }

        if (!toolInfo.handler || typeof toolInfo.handler !== 'function') {
            errors.push('Tool handler is required and must be a function');
        }

        // Validate tool name format (should be valid MCP tool name)
        if (toolInfo.name && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(toolInfo.name)) {
            errors.push('Tool name must start with a letter and contain only letters, numbers, underscores, and hyphens');
        }

        if (errors.length > 0) {
            throw new Error(`Invalid tool info: ${errors.join(', ')}`);
        }
    }

    /**
     * Register multiple tools at once
     */
    registerTools(tools: ToolInfo[]): void {
        const errors: string[] = [];

        tools.forEach((tool, index) => {
            try {
                this.registerTool(tool);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                errors.push(`Tool at index ${index} (${tool.name}): ${errorMessage}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Failed to register some tools: ${errors.join('; ')}`);
        }
    }

    /**
     * Register all instance controller tools
     */
    registerInstanceTools(httpClient: EvolutionHttpClient): void {
        const instanceTools = new InstanceTools(httpClient);
        const tools = instanceTools.getAllTools();
        this.registerTools(tools);
    }

    /**
     * Export tools configuration for debugging
     */
    exportConfig(): any {
        return {
            tools: this.getTools().map(tool => ({
                name: tool.name,
                description: tool.description,
                controller: tool.controller,
                endpoint: {
                    name: tool.endpoint.name,
                    path: tool.endpoint.path,
                    method: tool.endpoint.method
                },
                hasHandler: typeof tool.handler === 'function',
                hasSchema: !!tool.schema
            })),
            stats: this.getStats()
        };
    }
}

// Export a singleton instance
export const mcpToolRegistry = new McpToolRegistry();
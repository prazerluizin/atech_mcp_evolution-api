/**
 * Tests for MCP Tool Registry
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import { McpToolRegistry } from '../../src/server/tool-registry';
import { ToolInfo } from '../../src/server/types';
import { EndpointInfo } from '../../src/registry/types';

describe('McpToolRegistry', () => {
  let registry: McpToolRegistry;
  let mockEndpoint: EndpointInfo;
  let mockTool: ToolInfo;

  beforeEach(() => {
    registry = new McpToolRegistry();
    
    mockEndpoint = {
      name: 'test-endpoint',
      path: '/test/{instance}',
      method: 'POST',
      description: 'Test endpoint',
      parameters: [
        {
          name: 'instance',
          type: 'string',
          required: true,
          description: 'Instance name',
          location: 'path'
        }
      ],
      controller: 'instance',
      requiresInstance: true,
      schema: z.object({ instance: z.string() })
    };

    mockTool = {
      name: 'test_tool',
      description: 'Test tool',
      controller: 'instance',
      endpoint: mockEndpoint,
      schema: z.object({ instance: z.string() }),
      handler: async () => ({ success: true })
    };
  });

  describe('registerTool', () => {
    it('should register a valid tool', () => {
      expect(() => registry.registerTool(mockTool)).not.toThrow();
      expect(registry.hasTool('test_tool')).toBe(true);
    });

    it('should throw error for duplicate tool names', () => {
      registry.registerTool(mockTool);
      expect(() => registry.registerTool(mockTool)).toThrow('already registered');
    });

    it('should validate tool info', () => {
      const invalidTool = { ...mockTool, name: '' };
      expect(() => registry.registerTool(invalidTool)).toThrow('Tool name is required');
    });

    it('should validate tool name format', () => {
      const invalidTool = { ...mockTool, name: '123invalid' };
      expect(() => registry.registerTool(invalidTool)).toThrow('must start with a letter');
    });
  });

  describe('getTool', () => {
    it('should return registered tool', () => {
      registry.registerTool(mockTool);
      const tool = registry.getTool('test_tool');
      expect(tool).toEqual(mockTool);
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.getTool('non_existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('getTools', () => {
    it('should return all registered tools', () => {
      registry.registerTool(mockTool);
      const tools = registry.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual(mockTool);
    });

    it('should return empty array when no tools registered', () => {
      const tools = registry.getTools();
      expect(tools).toHaveLength(0);
    });
  });

  describe('getToolsByController', () => {
    it('should return tools filtered by controller', () => {
      const messageTool = { ...mockTool, name: 'message_tool', controller: 'message' as const };
      registry.registerTool(mockTool);
      registry.registerTool(messageTool);

      const instanceTools = registry.getToolsByController('instance');
      const messageTools = registry.getToolsByController('message');

      expect(instanceTools).toHaveLength(1);
      expect(messageTools).toHaveLength(1);
      expect(instanceTools[0].name).toBe('test_tool');
      expect(messageTools[0].name).toBe('message_tool');
    });
  });

  describe('updateTool', () => {
    it('should update existing tool', () => {
      registry.registerTool(mockTool);
      registry.updateTool('test_tool', { description: 'Updated description' });
      
      const tool = registry.getTool('test_tool');
      expect(tool?.description).toBe('Updated description');
    });

    it('should throw error for non-existent tool', () => {
      expect(() => registry.updateTool('non_existent', {})).toThrow('not found');
    });
  });

  describe('removeTool', () => {
    it('should remove existing tool', () => {
      registry.registerTool(mockTool);
      registry.removeTool('test_tool');
      expect(registry.hasTool('test_tool')).toBe(false);
    });

    it('should throw error for non-existent tool', () => {
      expect(() => registry.removeTool('non_existent')).toThrow('not found');
    });
  });

  describe('clear', () => {
    it('should remove all tools', () => {
      registry.registerTool(mockTool);
      registry.clear();
      expect(registry.getTools()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const messageTool = { ...mockTool, name: 'message_tool', controller: 'message' as const };
      registry.registerTool(mockTool);
      registry.registerTool(messageTool);

      const stats = registry.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byController.instance).toBe(1);
      expect(stats.byController.message).toBe(1);
      expect(stats.registered).toContain('test_tool');
      expect(stats.registered).toContain('message_tool');
    });
  });

  describe('searchTools', () => {
    it('should search tools by name', () => {
      registry.registerTool(mockTool);
      const results = registry.searchTools('test');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('test_tool');
    });

    it('should search tools by description', () => {
      registry.registerTool(mockTool);
      const results = registry.searchTools('Test tool');
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      registry.registerTool(mockTool);
      const results = registry.searchTools('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('registerTools', () => {
    it('should register multiple tools', () => {
      const tools = [
        mockTool,
        { ...mockTool, name: 'tool2', controller: 'message' as const }
      ];
      
      registry.registerTools(tools);
      expect(registry.getStats().total).toBe(2);
    });

    it('should throw error if any tool registration fails', () => {
      const tools = [
        mockTool,
        { ...mockTool, name: '' } // Invalid tool
      ];
      
      expect(() => registry.registerTools(tools)).toThrow('Failed to register some tools');
    });
  });

  describe('exportConfig', () => {
    it('should export configuration for debugging', () => {
      registry.registerTool(mockTool);
      const config = registry.exportConfig();
      
      expect(config.tools).toHaveLength(1);
      expect(config.tools[0].name).toBe('test_tool');
      expect(config.tools[0].hasHandler).toBe(true);
      expect(config.tools[0].hasSchema).toBe(true);
      expect(config.stats).toBeDefined();
    });
  });
});
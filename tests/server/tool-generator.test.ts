/**
 * Tests for MCP Tool Generator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { McpToolGenerator } from '../../src/server/tool-generator';
import { McpToolRegistry } from '../../src/server/tool-registry';
import { McpToolFactory } from '../../src/server/tool-factory';

describe('McpToolGenerator', () => {
  let generator: McpToolGenerator;
  let registry: McpToolRegistry;
  let factory: McpToolFactory;

  beforeEach(() => {
    registry = new McpToolRegistry();
    factory = new McpToolFactory();
    generator = new McpToolGenerator(registry, factory);
  });

  describe('generateTools', () => {
    it('should generate tools for all controllers by default', async () => {
      await generator.generateTools();
      
      const stats = generator.getGenerationStats();
      expect(stats.registeredTools).toBeGreaterThan(0);
    });

    it('should generate tools for specific controllers', async () => {
      await generator.generateTools({
        controllers: ['instance', 'message']
      });
      
      const instanceTools = registry.getToolsByController('instance');
      const messageTools = registry.getToolsByController('message');
      const chatTools = registry.getToolsByController('chat');
      
      expect(instanceTools.length).toBeGreaterThan(0);
      expect(messageTools.length).toBeGreaterThan(0);
      expect(chatTools.length).toBe(0); // Should not be generated
    });

    it('should exclude specified endpoints', async () => {
      await generator.generateTools({
        controllers: ['instance'],
        excludeEndpoints: ['create-instance']
      });
      
      const tools = registry.getTools();
      const hasExcludedTool = tools.some(tool => 
        tool.endpoint.name === 'create-instance'
      );
      
      expect(hasExcludedTool).toBe(false);
    });

    it('should include only specified endpoints', async () => {
      await generator.generateTools({
        controllers: ['instance'],
        includeEndpoints: ['create-instance']
      });
      
      const tools = registry.getTools();
      expect(tools.length).toBe(1);
      expect(tools[0].endpoint.name).toBe('create-instance');
    });

    it('should apply tool name prefix', async () => {
      await generator.generateTools({
        controllers: ['instance'],
        includeEndpoints: ['create-instance'],
        toolNamePrefix: 'custom_'
      });
      
      const tools = registry.getTools();
      expect(tools[0].name).toMatch(/^custom_evolution_/);
    });

    it('should clear existing tools before regenerating', async () => {
      // Generate tools first time
      await generator.generateTools({
        controllers: ['instance']
      });
      const firstCount = registry.getStats().total;
      
      // Generate tools second time with different controllers
      await generator.generateTools({
        controllers: ['message']
      });
      const secondCount = registry.getStats().total;
      
      // Should have different tools, not accumulated
      const instanceTools = registry.getToolsByController('instance');
      const messageTools = registry.getToolsByController('message');
      
      expect(instanceTools.length).toBe(0);
      expect(messageTools.length).toBeGreaterThan(0);
    });
  });

  describe('generateToolsForController', () => {
    it('should generate and register tools for specific controller', async () => {
      const tools = await generator.generateToolsForController('instance');
      
      expect(tools.length).toBeGreaterThan(0);
      expect(registry.getToolsByController('instance').length).toBe(tools.length);
    });
  });

  describe('generateToolForEndpoint', () => {
    it('should generate tool for specific endpoint', async () => {
      const tool = await generator.generateToolForEndpoint('create-instance');
      
      expect(tool).toBeDefined();
      expect(tool?.endpoint.name).toBe('create-instance');
      expect(registry.hasTool(tool!.name)).toBe(true);
    });

    it('should throw error for non-existent endpoint', async () => {
      await expect(
        generator.generateToolForEndpoint('non-existent-endpoint')
      ).rejects.toThrow('not found');
    });
  });

  describe('getGenerationStats', () => {
    it('should return correct statistics', async () => {
      await generator.generateTools({
        controllers: ['instance', 'message']
      });
      
      const stats = generator.getGenerationStats();
      
      expect(stats.availableEndpoints).toBeGreaterThan(0);
      expect(stats.registeredTools).toBeGreaterThan(0);
      expect(stats.byController.instance.tools).toBeGreaterThan(0);
      expect(stats.byController.message.tools).toBeGreaterThan(0);
      expect(stats.byController.chat.tools).toBe(0);
    });
  });

  describe('validateGeneration', () => {
    it('should validate successful generation', async () => {
      await generator.generateTools({
        controllers: ['instance']
      });
      
      const validation = generator.validateGeneration();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      // Manually add an invalid tool to the registry's internal map to bypass validation
      const invalidTool: any = {
        name: 'invalid_tool',
        description: 'Invalid tool',
        controller: 'instance',
        endpoint: {},
        schema: null,
        handler: null
      };
      
      // Access the private tools map to add invalid tool directly
      (registry as any).tools.set('invalid_tool', invalidTool);
      
      const validation = generator.validateGeneration();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportToolConfig', () => {
    it('should export complete configuration', async () => {
      await generator.generateTools({
        controllers: ['instance']
      });
      
      const config = generator.exportToolConfig();
      
      expect(config.generation).toBeDefined();
      expect(config.validation).toBeDefined();
      expect(config.tools).toBeDefined();
      expect(config.endpoints).toBeDefined();
    });
  });

  describe('regenerateTools', () => {
    it('should regenerate tools with new configuration', async () => {
      // Generate initial tools
      await generator.generateTools({
        controllers: ['instance']
      });
      const initialCount = registry.getStats().total;
      
      // Regenerate with different configuration
      await generator.regenerateTools({
        controllers: ['instance', 'message']
      });
      const newCount = registry.getStats().total;
      
      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  describe('getRegistry and getFactory', () => {
    it('should return registry and factory instances', () => {
      expect(generator.getRegistry()).toBe(registry);
      expect(generator.getFactory()).toBe(factory);
    });
  });
});
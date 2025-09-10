/**
 * Tests for MCP Tool Factory
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import { McpToolFactory } from '../../src/server/tool-factory';
import { EndpointInfo } from '../../src/registry/types';

describe('McpToolFactory', () => {
  let factory: McpToolFactory;
  let mockEndpoint: EndpointInfo;

  beforeEach(() => {
    factory = new McpToolFactory();
    
    mockEndpoint = {
      name: 'send-text-message',
      path: '/message/sendText/{instance}',
      method: 'POST',
      description: 'Send a text message to a WhatsApp number',
      parameters: [
        {
          name: 'instance',
          type: 'string',
          required: true,
          description: 'Instance name',
          location: 'path'
        },
        {
          name: 'number',
          type: 'string',
          required: true,
          description: 'WhatsApp number',
          location: 'body'
        },
        {
          name: 'text',
          type: 'string',
          required: true,
          description: 'Message text',
          location: 'body'
        },
        {
          name: 'delay',
          type: 'number',
          required: false,
          description: 'Delay in milliseconds',
          location: 'body'
        }
      ],
      controller: 'message',
      requiresInstance: true,
      schema: z.object({
        instance: z.string(),
        number: z.string(),
        text: z.string(),
        delay: z.number().optional()
      })
    };
  });

  describe('createToolForEndpoint', () => {
    it('should create a valid tool from endpoint', () => {
      const tool = factory.createToolForEndpoint(mockEndpoint);
      
      expect(tool.name).toBe('evolution_send_text_message');
      expect(tool.description).toBe('Message Controller: Send a text message to a WhatsApp number');
      expect(tool.controller).toBe('message');
      expect(tool.endpoint).toBe(mockEndpoint);
      expect(tool.schema).toBeDefined();
      expect(typeof tool.handler).toBe('function');
      expect(tool.examples).toBeDefined();
    });

    it('should generate correct tool name', () => {
      const tool = factory.createToolForEndpoint(mockEndpoint);
      expect(tool.name).toBe('evolution_send_text_message');
    });

    it('should generate correct description', () => {
      const tool = factory.createToolForEndpoint(mockEndpoint);
      expect(tool.description).toBe('Message Controller: Send a text message to a WhatsApp number');
    });
  });

  describe('generateSchema', () => {
    it('should generate correct Zod schema', () => {
      const schema = factory.generateSchema(mockEndpoint);
      
      // Test valid parameters
      const validParams = {
        instance: 'test_instance',
        number: '5511999999999',
        text: 'Hello World',
        delay: 1000
      };
      expect(() => schema.parse(validParams)).not.toThrow();

      // Test missing required parameter
      const invalidParams = {
        instance: 'test_instance',
        text: 'Hello World'
        // missing required 'number'
      };
      expect(() => schema.parse(invalidParams)).toThrow();

      // Test optional parameter
      const paramsWithoutOptional = {
        instance: 'test_instance',
        number: '5511999999999',
        text: 'Hello World'
        // delay is optional
      };
      expect(() => schema.parse(paramsWithoutOptional)).not.toThrow();
    });

    it('should handle different parameter types', () => {
      const endpoint: EndpointInfo = {
        ...mockEndpoint,
        parameters: [
          {
            name: 'stringParam',
            type: 'string',
            required: true,
            description: 'String parameter',
            location: 'body'
          },
          {
            name: 'numberParam',
            type: 'number',
            required: true,
            description: 'Number parameter',
            location: 'body'
          },
          {
            name: 'booleanParam',
            type: 'boolean',
            required: true,
            description: 'Boolean parameter',
            location: 'body'
          },
          {
            name: 'arrayParam',
            type: 'array',
            required: false,
            description: 'Array parameter',
            location: 'body'
          }
        ]
      };

      const schema = factory.generateSchema(endpoint);
      
      const validParams = {
        stringParam: 'test',
        numberParam: 123,
        booleanParam: true,
        arrayParam: ['item1', 'item2']
      };
      
      expect(() => schema.parse(validParams)).not.toThrow();
    });
  });

  describe('createHandler', () => {
    it('should create a handler function', () => {
      const handler = factory.createHandler(mockEndpoint);
      expect(typeof handler).toBe('function');
    });

    it('should validate parameters in handler', async () => {
      const handler = factory.createHandler(mockEndpoint);
      
      // Test with invalid parameters
      const result = await handler({
        instance: 'test',
        // missing required parameters
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('VALIDATION_ERROR');
    });

    it('should return configuration error when no HTTP client', async () => {
      const handler = factory.createHandler(mockEndpoint);
      
      const result = await handler({
        instance: 'test_instance',
        number: '5511999999999',
        text: 'Hello World'
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('CONFIGURATION_ERROR');
    });
  });

  describe('createToolsForController', () => {
    it('should create tools for all endpoints in controller', () => {
      // This test would require the endpoint registry to be properly set up
      // For now, we'll test the method exists and returns an array
      const tools = factory.createToolsForController('message');
      expect(Array.isArray(tools)).toBe(true);
    });
  });

  describe('example generation', () => {
    it('should generate appropriate examples', () => {
      const tool = factory.createToolForEndpoint(mockEndpoint);
      
      expect(tool.examples).toBeDefined();
      expect(tool.examples?.parameters).toBeDefined();
      expect(tool.examples?.usage).toBeDefined();
      
      // Check that examples contain expected values
      const params = tool.examples?.parameters;
      expect(params.instance).toBe('my_instance');
      expect(params.number).toBe('5511999999999');
      expect(params.text).toBe('Hello, this is a test message');
      expect(params.delay).toBe(1000);
    });
  });
});
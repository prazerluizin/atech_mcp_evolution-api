/**
 * MCP Tool Factory
 * Creates MCP tools from Evolution API endpoint definitions
 */

import { z } from 'zod';
import { ToolInfo, ToolFactory, ToolFactoryConfig, ToolHandler, ToolResult } from './types';
import { EndpointInfo, ControllerType, Parameter } from '../registry/types';
import { evolutionEndpointRegistry } from '../registry/endpoint-registry';

/**
 * Implementation of the MCP tool factory
 */
export class McpToolFactory implements ToolFactory {
  private config: ToolFactoryConfig;

  constructor(config: ToolFactoryConfig = {}) {
    this.config = {
      errorHandler: this.defaultErrorHandler,
      validator: this.defaultValidator,
      ...config
    };
  }

  /**
   * Create tools for all endpoints in a controller
   */
  createToolsForController(controller: ControllerType, config?: ToolFactoryConfig): ToolInfo[] {
    const endpoints = evolutionEndpointRegistry.getEndpointsByController(controller);
    const toolConfig = { ...this.config, ...config };
    
    return endpoints.map(endpoint => this.createToolForEndpoint(endpoint, toolConfig));
  }

  /**
   * Create a single tool from an endpoint definition
   */
  createToolForEndpoint(endpoint: EndpointInfo, config?: ToolFactoryConfig): ToolInfo {
    const toolConfig = { ...this.config, ...config };
    
    return {
      name: this.generateToolName(endpoint),
      description: this.generateToolDescription(endpoint),
      controller: endpoint.controller,
      endpoint,
      schema: this.generateSchema(endpoint),
      handler: this.createHandler(endpoint, toolConfig),
      examples: this.generateExamples(endpoint)
    };
  }

  /**
   * Generate Zod schema for tool parameters based on endpoint definition
   */
  generateSchema(endpoint: EndpointInfo): z.ZodSchema {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    endpoint.parameters.forEach(param => {
      let fieldSchema = this.createZodFieldFromParameter(param);
      
      // Add description
      fieldSchema = fieldSchema.describe(param.description);
      
      schemaFields[param.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }

  /**
   * Create a tool handler for an endpoint
   */
  createHandler(endpoint: EndpointInfo, config?: ToolFactoryConfig): ToolHandler {
    const toolConfig = { ...this.config, ...config };
    
    return async (params: any): Promise<ToolResult> => {
      try {
        // Validate parameters
        const validation = toolConfig.validator!(params, this.generateSchema(endpoint));
        if (!validation.valid) {
          return {
            success: false,
            error: {
              type: 'VALIDATION_ERROR',
              message: 'Invalid parameters',
              details: validation.errors
            }
          };
        }

        // Transform parameters for the API request
        const transformedParams = this.transformParameters(params, endpoint);

        // Make the API request (placeholder - will be implemented when HTTP client is available)
        if (!toolConfig.httpClient) {
          return {
            success: false,
            error: {
              type: 'CONFIGURATION_ERROR',
              message: 'HTTP client not configured'
            }
          };
        }

        // This will be implemented when the HTTP client is available
        const result = await this.makeApiRequest(endpoint, transformedParams, toolConfig.httpClient);
        
        return {
          success: true,
          data: result
        };

      } catch (error) {
        return toolConfig.errorHandler!(error);
      }
    };
  }

  /**
   * Generate a tool name from endpoint information
   */
  private generateToolName(endpoint: EndpointInfo): string {
    // Convert endpoint name to MCP tool name format
    // Example: "send-text-message" -> "evolution_send_text_message"
    const baseName = endpoint.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `evolution_${baseName}`;
  }

  /**
   * Generate a tool description from endpoint information
   */
  private generateToolDescription(endpoint: EndpointInfo): string {
    const controllerName = endpoint.controller.charAt(0).toUpperCase() + endpoint.controller.slice(1);
    return `${controllerName} Controller: ${endpoint.description}`;
  }

  /**
   * Generate examples for a tool
   */
  private generateExamples(endpoint: EndpointInfo): { usage: string; parameters: any } {
    const exampleParams: any = {};
    
    endpoint.parameters.forEach(param => {
      if (param.example !== undefined) {
        exampleParams[param.name] = param.example;
      } else {
        // Generate example based on parameter type and name
        exampleParams[param.name] = this.generateExampleValue(param);
      }
    });

    return {
      usage: `Use this tool to ${endpoint.description.toLowerCase()}`,
      parameters: exampleParams
    };
  }

  /**
   * Generate example value for a parameter
   */
  private generateExampleValue(param: Parameter): any {
    // Generate examples based on parameter name and type
    if (param.name.includes('instance')) {
      return 'my_instance';
    }
    if (param.name.includes('number') || param.name.includes('phone')) {
      return '5511999999999';
    }
    if (param.name.includes('text') || param.name.includes('message')) {
      return 'Hello, this is a test message';
    }
    if (param.name.includes('url')) {
      return 'https://example.com';
    }
    if (param.name.includes('email')) {
      return 'user@example.com';
    }
    if (param.name.includes('name')) {
      return 'Example Name';
    }
    if (param.name.includes('id') || param.name.includes('jid')) {
      return 'example_id';
    }
    if (param.name.includes('delay')) {
      return 1000;
    }
    if (param.name.includes('enabled') || param.name.includes('active')) {
      return true;
    }

    // Default examples based on type
    switch (param.type.toLowerCase()) {
      case 'string':
        return 'example_value';
      case 'number':
      case 'integer':
        return 123;
      case 'boolean':
        return true;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return 'example_value';
    }
  }

  /**
   * Create Zod field schema from parameter definition
   */
  private createZodFieldFromParameter(param: Parameter): z.ZodTypeAny {
    let schema: z.ZodTypeAny;

    // Create base schema based on type
    switch (param.type.toLowerCase()) {
      case 'string':
        schema = z.string();
        break;
      case 'number':
      case 'integer':
        schema = z.number();
        break;
      case 'boolean':
        schema = z.boolean();
        break;
      case 'array':
        schema = z.array(z.any());
        break;
      case 'object':
        schema = z.record(z.any());
        break;
      default:
        schema = z.any();
    }

    // Make optional if not required
    if (!param.required) {
      schema = schema.optional();
    }

    return schema;
  }

  /**
   * Transform parameters for API request
   */
  private transformParameters(params: any, endpoint: EndpointInfo): {
    pathParams: Record<string, any>;
    queryParams: Record<string, any>;
    bodyParams: Record<string, any>;
    headerParams: Record<string, any>;
  } {
    const pathParams: Record<string, any> = {};
    const queryParams: Record<string, any> = {};
    const bodyParams: Record<string, any> = {};
    const headerParams: Record<string, any> = {};

    endpoint.parameters.forEach(param => {
      const value = params[param.name];
      if (value !== undefined) {
        switch (param.location) {
          case 'path':
            pathParams[param.name] = value;
            break;
          case 'query':
            queryParams[param.name] = value;
            break;
          case 'body':
            bodyParams[param.name] = value;
            break;
          case 'header':
            headerParams[param.name] = value;
            break;
        }
      }
    });

    return { pathParams, queryParams, bodyParams, headerParams };
  }

  /**
   * Make API request using the HTTP client
   */
  private async makeApiRequest(endpoint: EndpointInfo, params: any, httpClient: any): Promise<any> {
    const { pathParams, queryParams, bodyParams } = params;
    
    // Replace path parameters in the endpoint path
    let requestPath = endpoint.path;
    Object.entries(pathParams).forEach(([key, value]) => {
      requestPath = requestPath.replace(`{${key}}`, String(value));
    });

    // Make the HTTP request based on the endpoint method
    const method = endpoint.method.toUpperCase();
    let response;

    switch (method) {
      case 'GET':
        response = await httpClient.get(requestPath, queryParams);
        break;
      case 'POST':
        response = await httpClient.post(requestPath, bodyParams, queryParams);
        break;
      case 'PUT':
        response = await httpClient.put(requestPath, bodyParams, queryParams);
        break;
      case 'DELETE':
        response = await httpClient.delete(requestPath, queryParams);
        break;
      case 'PATCH':
        response = await httpClient.patch(requestPath, bodyParams, queryParams);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    if (!response.success) {
      throw response.error;
    }

    return response.data;
  }

  /**
   * Default error handler
   */
  private defaultErrorHandler(error: any): ToolResult {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: errorMessage,
        details: error
      }
    };
  }

  /**
   * Default parameter validator
   */
  private defaultValidator(params: any, schema: z.ZodSchema): { valid: boolean; errors?: string[] } {
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
  }
}

// Export a singleton instance
export const mcpToolFactory = new McpToolFactory();
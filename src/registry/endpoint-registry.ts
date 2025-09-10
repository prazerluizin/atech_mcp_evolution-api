/**
 * Evolution API v2 Endpoint Registry
 * Static registry containing all Evolution API v2 endpoints with their definitions
 */

import { EndpointInfo, EndpointRegistry, ControllerType } from './types';
import { instanceEndpoints } from './endpoints/instance-endpoints';
import { messageEndpoints } from './endpoints/message-endpoints';
import { chatEndpoints } from './endpoints/chat-endpoints';
import { groupEndpoints } from './endpoints/group-endpoints';
import { profileEndpoints } from './endpoints/profile-endpoints';
import { webhookEndpoints } from './endpoints/webhook-endpoints';
import { informationEndpoints } from './endpoints/information-endpoints';

/**
 * Implementation of the Evolution API v2 endpoint registry
 */
export class EvolutionEndpointRegistry implements EndpointRegistry {
  private endpoints: EndpointInfo[];

  constructor() {
    // Combine all endpoint definitions
    this.endpoints = [
      ...instanceEndpoints,
      ...messageEndpoints,
      ...chatEndpoints,
      ...groupEndpoints,
      ...profileEndpoints,
      ...webhookEndpoints,
      ...informationEndpoints
    ];
  }

  /**
   * Get all registered endpoints
   */
  getEndpoints(): EndpointInfo[] {
    return [...this.endpoints];
  }

  /**
   * Get endpoints filtered by controller type
   */
  getEndpointsByController(controller: ControllerType): EndpointInfo[] {
    return this.endpoints.filter(endpoint => endpoint.controller === controller);
  }

  /**
   * Get a specific endpoint by name
   */
  getEndpoint(name: string): EndpointInfo | undefined {
    return this.endpoints.find(endpoint => endpoint.name === name);
  }

  /**
   * Get all available controller types
   */
  getAllControllers(): ControllerType[] {
    const controllers = new Set<ControllerType>();
    this.endpoints.forEach(endpoint => controllers.add(endpoint.controller));
    return Array.from(controllers);
  }

  /**
   * Get endpoints that require an instance parameter
   */
  getInstanceRequiredEndpoints(): EndpointInfo[] {
    return this.endpoints.filter(endpoint => endpoint.requiresInstance);
  }

  /**
   * Get endpoints that don't require an instance parameter
   */
  getGlobalEndpoints(): EndpointInfo[] {
    return this.endpoints.filter(endpoint => !endpoint.requiresInstance);
  }

  /**
   * Search endpoints by name or description
   */
  searchEndpoints(query: string): EndpointInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.endpoints.filter(endpoint => 
      endpoint.name.toLowerCase().includes(lowerQuery) ||
      endpoint.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get endpoint statistics
   */
  getStats() {
    const stats = {
      total: this.endpoints.length,
      byController: {} as Record<ControllerType, number>,
      byMethod: {} as Record<string, number>,
      requiresInstance: this.getInstanceRequiredEndpoints().length,
      global: this.getGlobalEndpoints().length
    };

    // Count by controller
    this.getAllControllers().forEach(controller => {
      stats.byController[controller] = this.getEndpointsByController(controller).length;
    });

    // Count by HTTP method
    this.endpoints.forEach(endpoint => {
      stats.byMethod[endpoint.method] = (stats.byMethod[endpoint.method] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validate that all endpoints have required properties
   */
  validateRegistry(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.endpoints.forEach((endpoint, index) => {
      // Check required properties
      if (!endpoint.name) {
        errors.push(`Endpoint at index ${index} is missing name`);
      }
      if (!endpoint.path) {
        errors.push(`Endpoint ${endpoint.name} is missing path`);
      }
      if (!endpoint.method) {
        errors.push(`Endpoint ${endpoint.name} is missing method`);
      }
      if (!endpoint.description) {
        errors.push(`Endpoint ${endpoint.name} is missing description`);
      }
      if (!endpoint.controller) {
        errors.push(`Endpoint ${endpoint.name} is missing controller`);
      }
      if (!endpoint.schema) {
        errors.push(`Endpoint ${endpoint.name} is missing schema`);
      }

      // Check for duplicate names
      const duplicates = this.endpoints.filter(e => e.name === endpoint.name);
      if (duplicates.length > 1) {
        errors.push(`Duplicate endpoint name: ${endpoint.name}`);
      }

      // Validate path parameters match schema
      const pathParams = endpoint.path.match(/{([^}]+)}/g) || [];
      const pathParamNames = pathParams.map(p => p.slice(1, -1));
      
      pathParamNames.forEach(paramName => {
        const hasParam = endpoint.parameters.some(p => 
          p.name === paramName && p.location === 'path'
        );
        if (!hasParam) {
          errors.push(`Endpoint ${endpoint.name} has path parameter {${paramName}} but no corresponding parameter definition`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance
export const evolutionEndpointRegistry = new EvolutionEndpointRegistry();
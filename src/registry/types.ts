/**
 * Types and interfaces for Evolution API endpoint registry
 */

import { z } from 'zod';

/**
 * HTTP methods supported by Evolution API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Parameter location in the request
 */
export type ParameterLocation = 'path' | 'query' | 'body' | 'header';

/**
 * Evolution API controller categories
 */
export type ControllerType = 
  | 'instance'
  | 'message' 
  | 'chat'
  | 'group'
  | 'profile'
  | 'webhook'
  | 'information';

/**
 * Parameter definition for an endpoint
 */
export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: ParameterLocation;
  example?: any;
}

/**
 * Complete endpoint information
 */
export interface EndpointInfo {
  name: string;
  path: string;
  method: HttpMethod;
  description: string;
  parameters: Parameter[];
  controller: ControllerType;
  requiresInstance: boolean;
  schema: z.ZodSchema;
  examples?: {
    request?: any;
    response?: any;
  };
}

/**
 * Interface for the endpoint registry
 */
export interface EndpointRegistry {
  getEndpoints(): EndpointInfo[];
  getEndpointsByController(controller: ControllerType): EndpointInfo[];
  getEndpoint(name: string): EndpointInfo | undefined;
  getAllControllers(): ControllerType[];
}
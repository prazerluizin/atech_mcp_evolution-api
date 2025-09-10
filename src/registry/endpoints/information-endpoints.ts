/**
 * Evolution API v2 Information Endpoints
 * Endpoints for getting API information and status
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

/**
 * Schema for get information endpoint
 */
const getInformationSchema = z.object({
  // No parameters required for this endpoint
});

/**
 * Information controller endpoints
 */
export const informationEndpoints: EndpointInfo[] = [
  {
    name: 'get-information',
    path: '/get-information',
    method: 'GET',
    description: 'Get Evolution API information including version, status, and available features',
    parameters: [],
    controller: 'information',
    requiresInstance: false,
    schema: getInformationSchema,
    examples: {
      request: {},
      response: {
        version: '2.0.0',
        status: 'online',
        features: ['instances', 'messages', 'groups', 'webhooks'],
        uptime: '2 days, 3 hours, 45 minutes'
      }
    }
  }
];
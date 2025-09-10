/**
 * Instance Controller MCP Tools Implementation
 * Implements all tools for managing WhatsApp instances in Evolution API
 */

import { z } from 'zod';
import { ToolInfo, ToolHandler, ToolResult } from '../types';
import { EvolutionHttpClient, ApiResponse, ErrorType } from '../../clients/evolution-http-client';
import { instanceEndpoints } from '../../registry/endpoints/instance-endpoints';

/**
 * Instance Controller tool implementations
 */
export class InstanceTools {
  private httpClient: EvolutionHttpClient;

  constructor(httpClient: EvolutionHttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Create a new WhatsApp instance
   */
  createCreateInstanceTool(): ToolInfo {
    const endpoint = instanceEndpoints.find(e => e.name === 'create-instance')!;
    
    return {
      name: 'evolution_create_instance',
      description: 'Create a new WhatsApp instance with optional webhook configuration',
      controller: 'instance',
      endpoint,
      schema: z.object({
        instanceName: z.string()
          .min(1, 'Instance name is required')
          .regex(/^[a-zA-Z0-9_-]+$/, 'Instance name can only contain letters, numbers, underscores and hyphens')
          .describe('Unique name for the WhatsApp instance'),
        token: z.string().optional()
          .describe('Optional authentication token for the instance'),
        qrcode: z.boolean().optional().default(true)
          .describe('Whether to generate QR code for connection (default: true)'),
        webhook: z.string().url().optional()
          .describe('Webhook URL to receive events from this instance'),
        webhookByEvents: z.boolean().optional().default(false)
          .describe('Whether to send webhook events separately'),
        webhookBase64: z.boolean().optional().default(false)
          .describe('Whether to encode webhook data in base64'),
        events: z.array(z.string()).optional()
          .describe('List of specific events to send to webhook')
      }),
      handler: this.createInstanceHandler.bind(this),
      examples: {
        usage: 'Create a new WhatsApp instance with QR code generation',
        parameters: {
          instanceName: 'my_whatsapp_bot',
          qrcode: true,
          webhook: 'https://myapp.com/webhook'
        }
      }
    };
  }

  private async createInstanceHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.post('/instance/create', params);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'create instance');
      }

      return {
        success: true,
        data: {
          message: `Instance '${params.instanceName}' created successfully`,
          instance: response.data,
          qrCode: response.data?.qrcode ? 'QR code generated - check the response data' : 'No QR code requested'
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'create instance');
    }
  }

  /**
   * Fetch all instances
   */
  createFetchInstancesTool(): ToolInfo {
    const endpoint = instanceEndpoints.find(e => e.name === 'fetch-instances')!;
    
    return {
      name: 'evolution_fetch_instances',
      description: 'List all WhatsApp instances and their current status',
      controller: 'instance',
      endpoint,
      schema: z.object({}),
      handler: this.fetchInstancesHandler.bind(this),
      examples: {
        usage: 'Get a list of all WhatsApp instances',
        parameters: {}
      }
    };
  }

  private async fetchInstancesHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get('/instance/fetchInstances');
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'fetch instances');
      }

      const instances = response.data || [];
      
      return {
        success: true,
        data: {
          message: `Found ${instances.length} instance(s)`,
          instances: instances,
          summary: instances.map((instance: any) => ({
            name: instance.instanceName || instance.instance,
            status: instance.status || 'unknown',
            connected: instance.status === 'open'
          }))
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'fetch instances');
    }
  }

  /**
   * Connect instance and get QR code
   */
  createConnectInstanceTool(): ToolInfo {
    const endpoint = instanceEndpoints.find(e => e.name === 'connect-instance')!;
    
    return {
      name: 'evolution_connect_instance',
      description: 'Connect a WhatsApp instance and generate QR code for authentication',
      controller: 'instance',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the instance to connect')
      }),
      handler: this.connectInstanceHandler.bind(this),
      examples: {
        usage: 'Connect an instance and get QR code for WhatsApp authentication',
        parameters: {
          instance: 'my_whatsapp_bot'
        }
      }
    };
  }

  private async connectInstanceHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.get(`/instance/connect/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'connect instance');
      }

      return {
        success: true,
        data: {
          message: `Instance '${params.instance}' connection initiated`,
          qrCode: response.data?.qrcode || response.data?.qr,
          status: response.data?.status || 'connecting',
          instructions: 'Scan the QR code with WhatsApp on your phone to connect the instance'
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'connect instance');
    }
  }

  /**
   * Restart an instance
   */
  createRestartInstanceTool(): ToolInfo {
    const endpoint = instanceEndpoints.find(e => e.name === 'restart-instance')!;
    
    return {
      name: 'evolution_restart_instance',
      description: 'Restart a WhatsApp instance to refresh its connection',
      controller: 'instance',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the instance to restart')
      }),
      handler: this.restartInstanceHandler.bind(this),
      examples: {
        usage: 'Restart an instance to fix connection issues',
        parameters: {
          instance: 'my_whatsapp_bot'
        }
      }
    };
  }

  private async restartInstanceHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.put(`/instance/restart/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'restart instance');
      }

      return {
        success: true,
        data: {
          message: `Instance '${params.instance}' restarted successfully`,
          status: response.data?.status || 'restarting',
          note: 'The instance may take a few moments to fully restart and reconnect'
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'restart instance');
    }
  }

  /**
   * Delete an instance
   */
  createDeleteInstanceTool(): ToolInfo {
    const endpoint = instanceEndpoints.find(e => e.name === 'delete-instance')!;
    
    return {
      name: 'evolution_delete_instance',
      description: 'Permanently delete a WhatsApp instance and all its data',
      controller: 'instance',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the instance to delete')
      }),
      handler: this.deleteInstanceHandler.bind(this),
      examples: {
        usage: 'Permanently delete an instance (WARNING: This cannot be undone)',
        parameters: {
          instance: 'my_whatsapp_bot'
        }
      }
    };
  }

  private async deleteInstanceHandler(params: any): Promise<ToolResult> {
    try {
      const response = await this.httpClient.delete(`/instance/delete/${params.instance}`);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'delete instance');
      }

      return {
        success: true,
        data: {
          message: `Instance '${params.instance}' deleted successfully`,
          warning: 'This action cannot be undone. All data for this instance has been permanently removed.',
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'delete instance');
    }
  }

  /**
   * Set presence status for an instance
   */
  createSetPresenceTool(): ToolInfo {
    const endpoint = instanceEndpoints.find(e => e.name === 'set-presence')!;
    
    return {
      name: 'evolution_set_presence',
      description: 'Set the online presence status for a WhatsApp instance',
      controller: 'instance',
      endpoint,
      schema: z.object({
        instance: z.string()
          .min(1, 'Instance name is required')
          .describe('Name of the instance'),
        presence: z.enum(['available', 'unavailable', 'composing', 'recording', 'paused'])
          .describe('Presence status to set (available=online, unavailable=offline, composing=typing, recording=recording audio, paused=stopped typing)')
      }),
      handler: this.setPresenceHandler.bind(this),
      examples: {
        usage: 'Set the instance presence status to show as online or typing',
        parameters: {
          instance: 'my_whatsapp_bot',
          presence: 'available'
        }
      }
    };
  }

  private async setPresenceHandler(params: any): Promise<ToolResult> {
    try {
      const requestData = {
        presence: params.presence
      };

      const response = await this.httpClient.post(`/chat/presence/${params.instance}`, requestData);
      
      if (!response.success) {
        return this.handleApiError(response.error!, 'set presence');
      }

      const presenceLabels = {
        available: 'Online',
        unavailable: 'Offline',
        composing: 'Typing...',
        recording: 'Recording audio...',
        paused: 'Stopped typing'
      };

      return {
        success: true,
        data: {
          message: `Presence for instance '${params.instance}' set to: ${presenceLabels[params.presence as keyof typeof presenceLabels]}`,
          instance: params.instance,
          presence: params.presence,
          result: response.data
        }
      };
    } catch (error) {
      return this.handleUnexpectedError(error, 'set presence');
    }
  }

  /**
   * Get all instance controller tools
   */
  getAllTools(): ToolInfo[] {
    return [
      this.createCreateInstanceTool(),
      this.createFetchInstancesTool(),
      this.createConnectInstanceTool(),
      this.createRestartInstanceTool(),
      this.createDeleteInstanceTool(),
      this.createSetPresenceTool()
    ];
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any, operation: string): ToolResult {
    const baseMessage = `Failed to ${operation}`;
    
    switch (error.type) {
      case ErrorType.AUTHENTICATION_ERROR:
        return {
          success: false,
          error: {
            type: 'AUTHENTICATION_ERROR',
            message: `${baseMessage}: Authentication failed. Please check your Evolution API key.`,
            code: error.code,
            details: {
              suggestion: 'Verify that your EVOLUTION_API_KEY environment variable is set correctly',
              originalError: error.message
            }
          }
        };

      case ErrorType.NETWORK_ERROR:
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: `${baseMessage}: Network error occurred. Please check your connection to the Evolution API.`,
            code: error.code,
            details: {
              suggestion: 'Verify that your EVOLUTION_URL is correct and the API is accessible',
              originalError: error.message
            }
          }
        };

      case ErrorType.TIMEOUT_ERROR:
        return {
          success: false,
          error: {
            type: 'TIMEOUT_ERROR',
            message: `${baseMessage}: Request timed out. The Evolution API did not respond in time.`,
            code: error.code,
            details: {
              suggestion: 'Try again in a few moments. If the problem persists, check the API server status',
              originalError: error.message
            }
          }
        };

      case ErrorType.API_ERROR:
        // Handle specific API error codes
        if (error.statusCode === 404) {
          return {
            success: false,
            error: {
              type: 'API_ERROR',
              message: `${baseMessage}: Instance not found or endpoint not available.`,
              code: error.code,
              details: {
                suggestion: 'Check that the instance name is correct and that the instance exists',
                statusCode: error.statusCode,
                originalError: error.message
              }
            }
          };
        }

        if (error.statusCode === 400) {
          return {
            success: false,
            error: {
              type: 'VALIDATION_ERROR',
              message: `${baseMessage}: Invalid parameters provided.`,
              code: error.code,
              details: {
                suggestion: 'Check the parameter values and format',
                statusCode: error.statusCode,
                originalError: error.message,
                apiResponse: error.details
              }
            }
          };
        }

        if (error.statusCode === 409) {
          return {
            success: false,
            error: {
              type: 'API_ERROR',
              message: `${baseMessage}: Conflict - instance may already exist or be in use.`,
              code: error.code,
              details: {
                suggestion: 'Try using a different instance name or check if the instance already exists',
                statusCode: error.statusCode,
                originalError: error.message
              }
            }
          };
        }

        return {
          success: false,
          error: {
            type: 'API_ERROR',
            message: `${baseMessage}: ${error.message}`,
            code: error.code,
            details: {
              statusCode: error.statusCode,
              originalError: error.message,
              apiResponse: error.details
            }
          }
        };

      case ErrorType.RATE_LIMIT_ERROR:
        return {
          success: false,
          error: {
            type: 'RATE_LIMIT_ERROR',
            message: `${baseMessage}: Rate limit exceeded. Too many requests.`,
            code: error.code,
            details: {
              suggestion: 'Wait a moment before trying again',
              retryAfter: error.details?.retryAfter,
              originalError: error.message
            }
          }
        };

      default:
        return {
          success: false,
          error: {
            type: 'UNKNOWN_ERROR',
            message: `${baseMessage}: ${error.message || 'Unknown error occurred'}`,
            code: error.code,
            details: {
              suggestion: 'Please try again or contact support if the problem persists',
              originalError: error
            }
          }
        };
    }
  }

  /**
   * Handle unexpected errors
   */
  private handleUnexpectedError(error: any, operation: string): ToolResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: `Failed to ${operation}: ${errorMessage}`,
        details: {
          suggestion: 'This is an unexpected error. Please try again or contact support.',
          originalError: error
        }
      }
    };
  }
}
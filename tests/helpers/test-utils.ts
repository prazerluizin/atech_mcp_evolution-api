/**
 * Test Utilities and Helpers
 * Common utilities for testing the Evolution API MCP server
 */

import { McpError, ErrorType, ErrorSeverity } from '../../src/utils/error-handler';

/**
 * Creates a mock McpError with all required properties
 */
export function createMockMcpError(overrides: Partial<McpError> = {}): McpError {
  return {
    type: ErrorType.API_ERROR,
    message: 'Test error',
    severity: ErrorSeverity.MEDIUM,
    timestamp: new Date(),
    suggestions: ['Test suggestion'],
    retryable: false,
    statusCode: 500,
    code: 'TEST_ERROR',
    details: {},
    context: {},
    ...overrides
  };
}

/**
 * Creates a mock API response with proper error structure
 */
export function createMockApiResponse<T>(data?: T, error?: Partial<McpError>) {
  if (error) {
    return {
      success: false,
      statusCode: error.statusCode || 500,
      error: createMockMcpError(error)
    };
  }
  
  return {
    success: true,
    data,
    statusCode: 200
  };
}

/**
 * Mock Evolution API server for integration tests
 */
export class MockEvolutionApiServer {
  private responses: Map<string, any> = new Map();
  private requestLog: Array<{ method: string; path: string; data?: any }> = [];

  setResponse(method: string, path: string, response: any) {
    const key = `${method.toUpperCase()}:${path}`;
    this.responses.set(key, response);
  }

  getResponse(method: string, path: string) {
    const key = `${method.toUpperCase()}:${path}`;
    return this.responses.get(key);
  }

  logRequest(method: string, path: string, data?: any) {
    this.requestLog.push({ method: method.toUpperCase(), path, data });
  }

  getRequestLog() {
    return [...this.requestLog];
  }

  clearRequestLog() {
    this.requestLog = [];
  }

  reset() {
    this.responses.clear();
    this.requestLog = [];
  }
}

/**
 * Creates a mock axios instance for testing
 */
export function createMockAxiosInstance() {
  const mockAxios = {
    request: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    defaults: {
      headers: {},
      baseURL: '',
      timeout: 0
    },
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    }
  };

  return mockAxios;
}

/**
 * Test data generators
 */
export const TestData = {
  instance: {
    valid: {
      instanceName: 'test-instance',
      status: 'open' as const,
      serverUrl: 'https://test-server.com',
      apikey: 'test-api-key'
    },
    create: {
      instanceName: 'new-instance',
      token: 'test-token',
      qrcode: true,
      webhook: 'https://webhook.example.com'
    }
  },

  message: {
    text: {
      instance: 'test-instance',
      number: '5511999999999',
      text: 'Hello, World!',
      delay: 1000
    },
    media: {
      instance: 'test-instance',
      number: '5511999999999',
      media: 'https://example.com/image.jpg',
      caption: 'Test image',
      fileName: 'image.jpg'
    }
  },

  group: {
    create: {
      instance: 'test-instance',
      subject: 'Test Group',
      description: 'A test group',
      participants: ['5511999999999', '5511888888888']
    },
    info: {
      id: 'group-id@g.us',
      subject: 'Test Group',
      description: 'A test group',
      participants: [
        { id: '5511999999999@c.us', admin: true },
        { id: '5511888888888@c.us', admin: false }
      ],
      admins: ['5511999999999@c.us']
    }
  },

  webhook: {
    config: {
      enabled: true,
      url: 'https://webhook.example.com',
      events: ['MESSAGE_RECEIVED', 'MESSAGE_SENT']
    }
  },

  profile: {
    personal: {
      name: 'Test User',
      status: 'Available',
      picture: 'https://example.com/avatar.jpg'
    },
    business: {
      description: 'Test Business',
      category: 'Technology',
      email: 'test@business.com',
      website: 'https://business.com'
    }
  }
};

/**
 * Async test helpers
 */
export const AsyncTestHelpers = {
  /**
   * Waits for a condition to be true with timeout
   */
  async waitFor(condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Waits for a specific amount of time
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

/**
 * Environment setup helpers
 */
export const EnvHelpers = {
  /**
   * Sets up test environment variables
   */
  setupTestEnv() {
    process.env.NODE_ENV = 'test';
    process.env.EVOLUTION_URL = 'https://test-evolution-api.com';
    process.env.EVOLUTION_API_KEY = 'test-api-key';
    process.env.MCP_SERVER_NAME = 'test-evolution-mcp';
    process.env.MCP_SERVER_VERSION = '1.0.0-test';
  },

  /**
   * Cleans up environment variables
   */
  cleanupTestEnv() {
    delete process.env.EVOLUTION_URL;
    delete process.env.EVOLUTION_API_KEY;
    delete process.env.MCP_SERVER_NAME;
    delete process.env.MCP_SERVER_VERSION;
    delete process.env.HTTP_TIMEOUT;
    delete process.env.RETRY_ATTEMPTS;
    delete process.env.RETRY_DELAY;
  },

  /**
   * Creates a temporary config file for testing
   */
  createTempConfig(config: any): string {
    const fs = require('fs');
    const path = require('path');
    const tempPath = path.join(process.cwd(), `test-config-${Date.now()}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(config, null, 2));
    return tempPath;
  },

  /**
   * Removes a temporary config file
   */
  removeTempConfig(configPath: string) {
    const fs = require('fs');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
};

/**
 * Mock MCP server for testing MCP protocol communication
 */
export class MockMcpServer {
  private tools: Map<string, any> = new Map();
  private handlers: Map<string, Function> = new Map();
  private connected = false;

  registerTool(name: string, schema: any, handler: Function) {
    this.tools.set(name, { name, schema, handler });
    this.handlers.set(name, handler);
  }

  async callTool(name: string, params: any) {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`Tool ${name} not found`);
    }
    return await handler(params);
  }

  connect() {
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  getTools() {
    return Array.from(this.tools.values());
  }

  reset() {
    this.tools.clear();
    this.handlers.clear();
    this.connected = false;
  }
}
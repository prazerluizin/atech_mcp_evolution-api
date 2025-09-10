/**
 * Integration Tests with Mock Evolution API Server
 * Tests the complete flow from MCP tools to Evolution API endpoints
 */

import express from 'express';
import { Server } from 'http';
import { EvolutionMcpServer } from '../../src/server/mcp-server';
import { ConfigurationManager } from '../../src/config/configuration-manager';
import { EvolutionHttpClient } from '../../src/clients/evolution-http-client';
import { EnvHelpers, TestData, AsyncTestHelpers } from '../helpers/test-utils';

describe('Integration Tests with Mock Evolution API', () => {
  let mockApiServer: Server;
  let mockApiApp: express.Application;
  let mcpServer: EvolutionMcpServer;
  let configManager: ConfigurationManager;
  let httpClient: EvolutionHttpClient;
  let mockApiPort: number;
  let mockApiUrl: string;

  beforeAll(async () => {
    // Find available port
    mockApiPort = 3001;
    mockApiUrl = `http://localhost:${mockApiPort}`;
    
    // Create mock Evolution API server
    mockApiApp = express();
    mockApiApp.use(express.json());
    
    // Setup mock endpoints
    setupMockEndpoints();
    
    // Start mock server
    await new Promise<void>((resolve) => {
      mockApiServer = mockApiApp.listen(mockApiPort, () => {
        console.log(`Mock Evolution API server running on port ${mockApiPort}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (mockApiServer) {
      await new Promise<void>((resolve) => {
        mockApiServer.close(() => resolve());
      });
    }
  });

  beforeEach(async () => {
    // Setup test environment
    EnvHelpers.setupTestEnv();
    process.env.EVOLUTION_URL = mockApiUrl;
    
    // Initialize components
    configManager = new ConfigurationManager();
    mcpServer = new EvolutionMcpServer();
    
    // Initialize HTTP client with mock API
    httpClient = new EvolutionHttpClient({
      baseURL: mockApiUrl,
      apiKey: 'test-api-key',
      timeout: 5000,
      retryAttempts: 1
    });
  });

  afterEach(() => {
    EnvHelpers.cleanupTestEnv();
  });

  function setupMockEndpoints() {
    // Authentication middleware
    mockApiApp.use((req, res, next) => {
      const apiKey = req.headers['apikey'];
      if (!apiKey || apiKey !== 'test-api-key') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid API key'
        });
      }
      next();
    });

    // Instance endpoints
    mockApiApp.post('/instance/create', (req, res) => {
      const { instanceName, token, qrcode, webhook } = req.body;
      
      if (!instanceName) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'instanceName is required'
        });
      }

      res.status(201).json({
        instanceName,
        status: 'created',
        qrcode: qrcode ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' : undefined,
        webhook: webhook || null
      });
    });

    mockApiApp.get('/instance/fetchInstances', (req, res) => {
      res.json([
        {
          instanceName: 'test-instance-1',
          status: 'open',
          serverUrl: mockApiUrl,
          apikey: 'test-api-key'
        },
        {
          instanceName: 'test-instance-2',
          status: 'close',
          serverUrl: mockApiUrl,
          apikey: 'test-api-key'
        }
      ]);
    });

    mockApiApp.get('/instance/connect/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      res.json({
        instanceName,
        status: 'connecting',
        qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });
    });

    mockApiApp.put('/instance/restart/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      res.json({
        instanceName,
        status: 'restarting',
        message: 'Instance restart initiated'
      });
    });

    mockApiApp.delete('/instance/delete/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      res.json({
        instanceName,
        status: 'deleted',
        message: 'Instance deleted successfully'
      });
    });

    // Message endpoints
    mockApiApp.post('/message/sendText/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      const { number, text, delay } = req.body;

      if (!number || !text) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'number and text are required'
        });
      }

      // Simulate delay if specified
      const responseDelay = delay || 0;
      setTimeout(() => {
        res.json({
          messageId: `msg_${Date.now()}`,
          instanceName,
          number,
          text,
          status: 'sent',
          timestamp: new Date().toISOString()
        });
      }, responseDelay);
    });

    mockApiApp.post('/message/sendMedia/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      const { number, media, caption, fileName } = req.body;

      if (!number || !media) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'number and media are required'
        });
      }

      res.json({
        messageId: `media_${Date.now()}`,
        instanceName,
        number,
        media,
        caption,
        fileName,
        status: 'sent',
        timestamp: new Date().toISOString()
      });
    });

    // Chat endpoints
    mockApiApp.get('/chat/findMessages/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      const { limit = 20 } = req.query;

      res.json({
        instanceName,
        messages: Array.from({ length: Math.min(Number(limit), 5) }, (_, i) => ({
          messageId: `msg_${i}`,
          from: '5511999999999@c.us',
          text: `Test message ${i}`,
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        })),
        total: 5
      });
    });

    mockApiApp.get('/chat/findContacts/:instanceName', (req, res) => {
      const { instanceName } = req.params;

      res.json({
        instanceName,
        contacts: [
          {
            id: '5511999999999@c.us',
            name: 'Test Contact 1',
            profilePicUrl: 'https://example.com/pic1.jpg'
          },
          {
            id: '5511888888888@c.us',
            name: 'Test Contact 2',
            profilePicUrl: 'https://example.com/pic2.jpg'
          }
        ]
      });
    });

    // Group endpoints
    mockApiApp.post('/group/create/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      const { subject, description, participants } = req.body;

      if (!subject || !participants || !Array.isArray(participants)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'subject and participants array are required'
        });
      }

      res.status(201).json({
        groupId: `${Date.now()}@g.us`,
        instanceName,
        subject,
        description,
        participants: participants.map(p => ({ id: `${p}@c.us`, admin: false })),
        admins: [`${participants[0]}@c.us`],
        status: 'created'
      });
    });

    // Profile endpoints
    mockApiApp.get('/profile/fetchProfile/:instanceName', (req, res) => {
      const { instanceName } = req.params;

      res.json({
        instanceName,
        profile: {
          name: 'Test Profile',
          status: 'Available',
          picture: 'https://example.com/profile.jpg',
          business: {
            description: 'Test Business',
            category: 'Technology',
            email: 'test@business.com'
          }
        }
      });
    });

    // Webhook endpoints
    mockApiApp.post('/webhook/set/:instanceName', (req, res) => {
      const { instanceName } = req.params;
      const { enabled, url, events } = req.body;

      if (!url) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'webhook url is required'
        });
      }

      res.json({
        instanceName,
        webhook: {
          enabled: enabled !== false,
          url,
          events: events || ['MESSAGE_RECEIVED'],
          status: 'configured'
        }
      });
    });

    // Information endpoint
    mockApiApp.get('/', (req, res) => {
      res.json({
        version: '2.0.0',
        status: 'online',
        uptime: '1d 2h 30m',
        instances: 2,
        features: ['messages', 'groups', 'webhooks', 'profile']
      });
    });

    // Error simulation endpoints
    mockApiApp.get('/error/500', (req, res) => {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Simulated server error'
      });
    });

    mockApiApp.get('/error/timeout', (req, res) => {
      // Never respond to simulate timeout
    });

    mockApiApp.get('/error/rate-limit', (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: 60
      });
    });
  }

  describe('Instance Management Integration', () => {
    it('should create instance through complete flow', async () => {
      await mcpServer.initialize(configManager);
      
      const registry = mcpServer.getToolRegistry();
      const instanceTools = registry.getToolsByController('instance');
      const createTool = instanceTools.find(t => t.name.includes('create'));
      
      expect(createTool).toBeDefined();
      
      const result = await createTool?.handler(TestData.instance.create);
      expect(result?.success).toBe(true);
      expect(result?.data?.instanceName).toBe(TestData.instance.create.instanceName);
      expect(result?.data?.status).toBe('created');
    });

    it('should fetch instances list', async () => {
      const response = await httpClient.get('/instance/fetchInstances');
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data?.length).toBeGreaterThan(0);
      expect(response.data?.[0]).toHaveProperty('instanceName');
      expect(response.data?.[0]).toHaveProperty('status');
    });

    it('should connect to instance and get QR code', async () => {
      const response = await httpClient.get('/instance/connect/test-instance');
      
      expect(response.success).toBe(true);
      expect(response.data?.instanceName).toBe('test-instance');
      expect(response.data?.status).toBe('connecting');
      expect(response.data?.qrcode).toBeDefined();
    });

    it('should restart instance', async () => {
      const response = await httpClient.put('/instance/restart/test-instance');
      
      expect(response.success).toBe(true);
      expect(response.data?.instanceName).toBe('test-instance');
      expect(response.data?.status).toBe('restarting');
    });

    it('should delete instance', async () => {
      const response = await httpClient.delete('/instance/delete/test-instance');
      
      expect(response.success).toBe(true);
      expect(response.data?.instanceName).toBe('test-instance');
      expect(response.data?.status).toBe('deleted');
    });
  });

  describe('Message Sending Integration', () => {
    it('should send text message through complete flow', async () => {
      await mcpServer.initialize(configManager);
      
      const registry = mcpServer.getToolRegistry();
      const messageTools = registry.getToolsByController('message');
      const sendTextTool = messageTools.find(t => t.name.includes('text'));
      
      expect(sendTextTool).toBeDefined();
      
      const result = await sendTextTool?.handler(TestData.message.text);
      expect(result?.success).toBe(true);
      expect(result?.data?.messageId).toBeDefined();
      expect(result?.data?.status).toBe('sent');
    });

    it('should send media message', async () => {
      const response = await httpClient.post('/message/sendMedia/test-instance', TestData.message.media);
      
      expect(response.success).toBe(true);
      expect(response.data?.messageId).toBeDefined();
      expect(response.data?.media).toBe(TestData.message.media.media);
      expect(response.data?.status).toBe('sent');
    });

    it('should handle message delay parameter', async () => {
      const startTime = Date.now();
      const delayMs = 500;
      
      const response = await httpClient.post('/message/sendText/test-instance', {
        ...TestData.message.text,
        delay: delayMs
      });
      
      const endTime = Date.now();
      const actualDelay = endTime - startTime;
      
      expect(response.success).toBe(true);
      expect(actualDelay).toBeGreaterThanOrEqual(delayMs - 50); // Allow some tolerance
    });

    it('should validate required message parameters', async () => {
      const response = await httpClient.post('/message/sendText/test-instance', {
        number: '', // Invalid
        text: 'Test message'
      });
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Chat Management Integration', () => {
    it('should find messages with pagination', async () => {
      const response = await httpClient.get('/chat/findMessages/test-instance', { limit: 3 });
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data?.messages)).toBe(true);
      expect(response.data?.messages.length).toBeLessThanOrEqual(3);
      expect(response.data?.total).toBeDefined();
    });

    it('should find contacts', async () => {
      const response = await httpClient.get('/chat/findContacts/test-instance');
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data?.contacts)).toBe(true);
      expect(response.data?.contacts[0]).toHaveProperty('id');
      expect(response.data?.contacts[0]).toHaveProperty('name');
    });
  });

  describe('Group Management Integration', () => {
    it('should create group through complete flow', async () => {
      await mcpServer.initialize(configManager);
      
      const registry = mcpServer.getToolRegistry();
      const groupTools = registry.getToolsByController('group');
      const createGroupTool = groupTools.find(t => t.name.includes('create'));
      
      expect(createGroupTool).toBeDefined();
      
      const result = await createGroupTool?.handler(TestData.group.create);
      expect(result?.success).toBe(true);
      expect(result?.data?.groupId).toBeDefined();
      expect(result?.data?.subject).toBe(TestData.group.create.subject);
    });

    it('should validate group creation parameters', async () => {
      const response = await httpClient.post('/group/create/test-instance', {
        subject: '', // Invalid
        participants: []
      });
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Profile Management Integration', () => {
    it('should fetch profile information', async () => {
      const response = await httpClient.get('/profile/fetchProfile/test-instance');
      
      expect(response.success).toBe(true);
      expect(response.data?.profile).toBeDefined();
      expect(response.data?.profile.name).toBeDefined();
      expect(response.data?.profile.business).toBeDefined();
    });
  });

  describe('Webhook Management Integration', () => {
    it('should configure webhook', async () => {
      const response = await httpClient.post('/webhook/set/test-instance', TestData.webhook.config);
      
      expect(response.success).toBe(true);
      expect(response.data?.webhook.enabled).toBe(true);
      expect(response.data?.webhook.url).toBe(TestData.webhook.config.url);
    });

    it('should validate webhook URL', async () => {
      const response = await httpClient.post('/webhook/set/test-instance', {
        enabled: true,
        url: '', // Invalid
        events: ['MESSAGE_RECEIVED']
      });
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors', async () => {
      const unauthorizedClient = new EvolutionHttpClient({
        baseURL: mockApiUrl,
        apiKey: 'invalid-key',
        timeout: 5000
      });
      
      const response = await unauthorizedClient.get('/instance/fetchInstances');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(401);
      expect(response.error?.type).toBe('AUTHENTICATION_ERROR');
    });

    it('should handle server errors', async () => {
      const response = await httpClient.get('/error/500');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(500);
      expect(response.error?.type).toBe('API_ERROR');
    });

    it('should handle rate limiting', async () => {
      const response = await httpClient.get('/error/rate-limit');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(429);
      expect(response.error?.type).toBe('RATE_LIMIT_ERROR');
    });

    it('should handle timeout errors', async () => {
      const timeoutClient = new EvolutionHttpClient({
        baseURL: mockApiUrl,
        apiKey: 'test-api-key',
        timeout: 100 // Very short timeout
      });
      
      const response = await timeoutClient.get('/error/timeout');
      
      expect(response.success).toBe(false);
      expect(response.error?.type).toBe('TIMEOUT_ERROR');
    }, 10000);
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        httpClient.post('/message/sendText/test-instance', {
          ...TestData.message.text,
          text: `Concurrent message ${i}`
        })
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data?.text).toBe(`Concurrent message ${index}`);
      });
    });

    it('should handle rapid sequential requests', async () => {
      const results = [];
      
      for (let i = 0; i < 5; i++) {
        const result = await httpClient.post('/message/sendText/test-instance', {
          ...TestData.message.text,
          text: `Sequential message ${i}`
        });
        results.push(result);
      }
      
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data?.text).toBe(`Sequential message ${index}`);
      });
    });
  });

  describe('API Information and Health', () => {
    it('should get API information', async () => {
      const response = await httpClient.get('/');
      
      expect(response.success).toBe(true);
      expect(response.data?.version).toBeDefined();
      expect(response.data?.status).toBe('online');
      expect(response.data?.features).toBeDefined();
    });

    it('should perform health check', async () => {
      const health = await httpClient.healthCheck();
      
      expect(health.success).toBe(true);
      expect(health.data?.status).toBe('online');
    });
  });
});
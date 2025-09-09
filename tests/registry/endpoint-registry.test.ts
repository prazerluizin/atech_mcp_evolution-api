/**
 * Tests for Evolution API Endpoint Registry
 */

import { evolutionEndpointRegistry } from '../../src/registry';

describe('EvolutionEndpointRegistry', () => {
  describe('Basic functionality', () => {
    it('should have endpoints registered', () => {
      const endpoints = evolutionEndpointRegistry.getEndpoints();
      expect(endpoints.length).toBeGreaterThan(0);
    });

    it('should return all controller types', () => {
      const controllers = evolutionEndpointRegistry.getAllControllers();
      expect(controllers).toContain('instance');
      expect(controllers).toContain('message');
      expect(controllers).toContain('chat');
      expect(controllers).toContain('group');
      expect(controllers).toContain('profile');
      expect(controllers).toContain('webhook');
      expect(controllers).toContain('information');
    });

    it('should filter endpoints by controller', () => {
      const instanceEndpoints = evolutionEndpointRegistry.getEndpointsByController('instance');
      expect(instanceEndpoints.length).toBeGreaterThan(0);
      instanceEndpoints.forEach(endpoint => {
        expect(endpoint.controller).toBe('instance');
      });
    });

    it('should find specific endpoints by name', () => {
      const createInstance = evolutionEndpointRegistry.getEndpoint('create-instance');
      expect(createInstance).toBeDefined();
      expect(createInstance?.name).toBe('create-instance');
      expect(createInstance?.controller).toBe('instance');
    });
  });

  describe('Instance requirements', () => {
    it('should correctly identify endpoints that require instance', () => {
      const instanceRequired = evolutionEndpointRegistry.getInstanceRequiredEndpoints();
      const globalEndpoints = evolutionEndpointRegistry.getGlobalEndpoints();
      
      expect(instanceRequired.length).toBeGreaterThan(0);
      expect(globalEndpoints.length).toBeGreaterThan(0);
      
      // Check that create-instance doesn't require instance (it creates one)
      const createInstance = evolutionEndpointRegistry.getEndpoint('create-instance');
      expect(createInstance?.requiresInstance).toBe(false);
      
      // Check that send-text requires instance
      const sendText = evolutionEndpointRegistry.getEndpoint('send-text');
      expect(sendText?.requiresInstance).toBe(true);
    });
  });

  describe('Search functionality', () => {
    it('should search endpoints by name', () => {
      const results = evolutionEndpointRegistry.searchEndpoints('send');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(endpoint => {
        expect(endpoint.name.toLowerCase()).toContain('send');
      });
    });

    it('should search endpoints by description', () => {
      const results = evolutionEndpointRegistry.searchEndpoints('mensagem');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should provide registry statistics', () => {
      const stats = evolutionEndpointRegistry.getStats();
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byController.instance).toBeGreaterThan(0);
      expect(stats.byController.message).toBeGreaterThan(0);
      expect(stats.byMethod.GET).toBeGreaterThan(0);
      expect(stats.byMethod.POST).toBeGreaterThan(0);
      expect(stats.requiresInstance).toBeGreaterThan(0);
      expect(stats.global).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should validate registry structure', () => {
      const validation = evolutionEndpointRegistry.validateRegistry();
      
      if (!validation.valid) {
        console.log('Validation errors:', validation.errors);
      }
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have required properties for all endpoints', () => {
      const endpoints = evolutionEndpointRegistry.getEndpoints();
      
      endpoints.forEach(endpoint => {
        expect(endpoint.name).toBeDefined();
        expect(endpoint.path).toBeDefined();
        expect(endpoint.method).toBeDefined();
        expect(endpoint.description).toBeDefined();
        expect(endpoint.controller).toBeDefined();
        expect(endpoint.schema).toBeDefined();
        expect(Array.isArray(endpoint.parameters)).toBe(true);
        expect(typeof endpoint.requiresInstance).toBe('boolean');
      });
    });
  });

  describe('Specific endpoint tests', () => {
    it('should have correct instance endpoints', () => {
      const createInstance = evolutionEndpointRegistry.getEndpoint('create-instance');
      expect(createInstance?.path).toBe('/instance/create');
      expect(createInstance?.method).toBe('POST');
      
      const fetchInstances = evolutionEndpointRegistry.getEndpoint('fetch-instances');
      expect(fetchInstances?.path).toBe('/instance/fetchInstances');
      expect(fetchInstances?.method).toBe('GET');
    });

    it('should have correct message endpoints', () => {
      const sendText = evolutionEndpointRegistry.getEndpoint('send-text');
      expect(sendText?.path).toBe('/message/sendText/{instance}');
      expect(sendText?.method).toBe('POST');
      expect(sendText?.requiresInstance).toBe(true);
      
      const sendMedia = evolutionEndpointRegistry.getEndpoint('send-media');
      expect(sendMedia?.path).toBe('/message/sendMedia/{instance}');
      expect(sendMedia?.method).toBe('POST');
    });

    it('should have correct webhook endpoints', () => {
      const setWebhook = evolutionEndpointRegistry.getEndpoint('set-webhook');
      expect(setWebhook?.path).toBe('/webhook/set/{instance}');
      expect(setWebhook?.method).toBe('POST');
      
      const getWebhook = evolutionEndpointRegistry.getEndpoint('get-webhook');
      expect(getWebhook?.path).toBe('/webhook/find/{instance}');
      expect(getWebhook?.method).toBe('GET');
    });

    it('should have information endpoint', () => {
      const getInfo = evolutionEndpointRegistry.getEndpoint('get-information');
      expect(getInfo?.path).toBe('/get-information');
      expect(getInfo?.method).toBe('GET');
      expect(getInfo?.requiresInstance).toBe(false);
    });
  });
});
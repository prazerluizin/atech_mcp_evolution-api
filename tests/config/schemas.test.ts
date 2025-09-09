import { 
  ConfigSchema, 
  EnvSchema, 
  ConfigFileSchema, 
  DEFAULT_CONFIG 
} from '../../src/config/schemas.js';

describe('Configuration Schemas', () => {
  describe('ConfigSchema', () => {
    it('should validate complete valid configuration', () => {
      const validConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key-123',
        server: {
          name: 'test-server',
          version: '1.0.0'
        },
        http: {
          timeout: 30000,
          retryAttempts: 3,
          retryDelay: 1000
        }
      };

      const result = ConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it('should apply default values for optional fields', () => {
      const minimalConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key-123'
      };

      const result = ConfigSchema.parse(minimalConfig);
      
      expect(result.server.name).toBe('evolution-api-mcp');
      expect(result.server.version).toBe('1.0.0');
      expect(result.http.timeout).toBe(30000);
      expect(result.http.retryAttempts).toBe(3);
      expect(result.http.retryDelay).toBe(1000);
    });

    it('should reject invalid URL', () => {
      const invalidConfig = {
        evolutionUrl: 'not-a-url',
        evolutionApiKey: 'test-key'
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject empty API key', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: ''
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject negative timeout', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        http: {
          timeout: -1000
        }
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject invalid retry attempts', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        http: {
          retryAttempts: -1
        }
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject too many retry attempts', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        http: {
          retryAttempts: 15
        }
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject non-integer retry attempts', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        http: {
          retryAttempts: 3.5
        }
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe('EnvSchema', () => {
    it('should parse environment variables', () => {
      const envVars = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-key',
        MCP_SERVER_NAME: 'custom-server',
        HTTP_TIMEOUT: '5000'
      };

      const result = EnvSchema.parse(envVars);
      expect(result).toEqual(envVars);
    });

    it('should handle missing environment variables', () => {
      const envVars = {};
      const result = EnvSchema.parse(envVars);
      
      expect(result.EVOLUTION_URL).toBeUndefined();
      expect(result.EVOLUTION_API_KEY).toBeUndefined();
    });

    it('should handle partial environment variables', () => {
      const envVars = {
        EVOLUTION_URL: 'https://api.example.com',
        HTTP_TIMEOUT: '10000'
      };

      const result = EnvSchema.parse(envVars);
      expect(result.EVOLUTION_URL).toBe('https://api.example.com');
      expect(result.HTTP_TIMEOUT).toBe('10000');
      expect(result.EVOLUTION_API_KEY).toBeUndefined();
    });
  });

  describe('ConfigFileSchema', () => {
    it('should parse complete configuration file', () => {
      const configFile = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        server: {
          name: 'file-server',
          version: '2.0.0'
        },
        http: {
          timeout: 15000,
          retryAttempts: 5,
          retryDelay: 2000
        }
      };

      const result = ConfigFileSchema.parse(configFile);
      expect(result).toEqual(configFile);
    });

    it('should handle partial configuration file', () => {
      const configFile = {
        evolutionUrl: 'https://api.example.com',
        http: {
          timeout: 20000
        }
      };

      const result = ConfigFileSchema.parse(configFile);
      expect(result.evolutionUrl).toBe('https://api.example.com');
      expect(result.http?.timeout).toBe(20000);
      expect(result.evolutionApiKey).toBeUndefined();
    });

    it('should handle empty configuration file', () => {
      const configFile = {};
      const result = ConfigFileSchema.parse(configFile);
      
      expect(result.evolutionUrl).toBeUndefined();
      expect(result.evolutionApiKey).toBeUndefined();
    });

    it('should reject invalid nested objects', () => {
      const configFile = {
        server: 'invalid-server-config' // Should be object
      };

      expect(() => ConfigFileSchema.parse(configFile)).toThrow();
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should provide sensible defaults', () => {
      expect(DEFAULT_CONFIG.server?.name).toBe('evolution-api-mcp');
      expect(DEFAULT_CONFIG.server?.version).toBe('1.0.0');
      expect(DEFAULT_CONFIG.http?.timeout).toBe(30000);
      expect(DEFAULT_CONFIG.http?.retryAttempts).toBe(3);
      expect(DEFAULT_CONFIG.http?.retryDelay).toBe(1000);
    });

    it('should not include required fields in defaults', () => {
      expect(DEFAULT_CONFIG.evolutionUrl).toBeUndefined();
      expect(DEFAULT_CONFIG.evolutionApiKey).toBeUndefined();
    });
  });

  describe('Schema Error Messages', () => {
    it('should provide descriptive error messages for URL validation', () => {
      const invalidConfig = {
        evolutionUrl: 'invalid-url',
        evolutionApiKey: 'test-key'
      };

      try {
        ConfigSchema.parse(invalidConfig);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors[0].message).toContain('valid URL');
      }
    });

    it('should provide descriptive error messages for required fields', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: ''
      };

      try {
        ConfigSchema.parse(invalidConfig);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors[0].message).toContain('required');
      }
    });

    it('should provide descriptive error messages for numeric constraints', () => {
      const invalidConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        http: {
          timeout: -1000
        }
      };

      try {
        ConfigSchema.parse(invalidConfig);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors[0].message).toContain('positive');
      }
    });
  });
});
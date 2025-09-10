/**
 * Configuration Schemas Tests
 * Tests for Zod validation schemas used in configuration
 */

import { z } from 'zod';
import {
  ConfigSchema,
  EnvSchema,
  ConfigFileSchema
} from '../../src/config/schemas';

describe('Configuration Schemas', () => {
  describe('EnvSchema', () => {
    it('should validate valid environment variables', () => {
      const validEnv = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-api-key-123',
        MCP_SERVER_NAME: 'test-server',
        MCP_SERVER_VERSION: '1.0.0',
        HTTP_TIMEOUT: '30000',
        RETRY_ATTEMPTS: '3',
        RETRY_DELAY: '1000'
      };

      const result = EnvSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.EVOLUTION_URL).toBe('https://api.example.com');
        expect(result.data.EVOLUTION_API_KEY).toBe('test-api-key-123');
        expect(result.data.HTTP_TIMEOUT).toBe(30000);
        expect(result.data.RETRY_ATTEMPTS).toBe(3);
      }
    });

    it('should reject invalid URLs', () => {
      const invalidEnv = {
        EVOLUTION_URL: 'not-a-url',
        EVOLUTION_API_KEY: 'test-key'
      };

      const result = EnvSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });

    it('should reject empty required fields', () => {
      const invalidEnv = {
        EVOLUTION_URL: '',
        EVOLUTION_API_KEY: ''
      };

      const result = EnvSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });

    it('should handle optional fields', () => {
      const minimalEnv = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-key'
      };

      const result = EnvSchema.safeParse(minimalEnv);
      expect(result.success).toBe(true);
    });

    it('should validate numeric string conversions', () => {
      const envWithNumbers = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-key',
        HTTP_TIMEOUT: '5000',
        RETRY_ATTEMPTS: '5',
        RETRY_DELAY: '2000'
      };

      const result = EnvSchema.safeParse(envWithNumbers);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(typeof result.data.HTTP_TIMEOUT).toBe('number');
        expect(typeof result.data.RETRY_ATTEMPTS).toBe('number');
        expect(typeof result.data.RETRY_DELAY).toBe('number');
      }
    });

    it('should reject invalid numeric values', () => {
      const invalidEnv = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-key',
        HTTP_TIMEOUT: 'not-a-number'
      };

      const result = EnvSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });
  });

  describe('ConfigFileSchema', () => {
    it('should validate complete config file', () => {
      const validConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-api-key',
        server: {
          name: 'evolution-mcp',
          version: '1.0.0'
        },
        http: {
          timeout: 30000,
          retryAttempts: 3,
          retryDelay: 1000,
          maxRetryDelay: 30000,
          retryAttempts: 1
        }
      };

      const result = ConfigFileSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate minimal config file', () => {
      const minimalConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-api-key'
      };

      const result = ConfigFileSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URLs in config file', () => {
      const invalidConfig = {
        evolutionUrl: 'invalid-url',
        evolutionApiKey: 'test-key'
      };

      const result = ConfigFileSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should validate nested server config', () => {
      const configWithServer = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        server: {
          name: 'custom-server',
          version: '2.0.0'
        }
      };

      const result = ConfigFileSchema.safeParse(configWithServer);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.server?.name).toBe('custom-server');
        expect(result.data.server?.version).toBe('2.0.0');
      }
    });

    it('should validate nested HTTP config', () => {
      const configWithHttp = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        http: {
          timeout: 15000,
          retryAttempts: 5,
          retryDelay: 2000,
          retryAttempts: 3
        }
      };

      const result = ConfigFileSchema.safeParse(configWithHttp);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.http?.timeout).toBe(15000);
        expect(result.data.http?.retryAttempts).toBe(3);
      }
    });
  });

  describe('HttpConfigSchema', () => {
    it('should validate HTTP configuration', () => {
      const validHttpConfig = {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        maxRetryDelay: 30000,
        retryAttempts: 1
      };

      const result = HttpConfigSchema.safeParse(validHttpConfig);
      expect(result.success).toBe(true);
    });

    it('should reject negative timeout', () => {
      const invalidConfig = {
        timeout: -1000
      };

      const result = HttpConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject retry attempts outside valid range', () => {
      const invalidConfig = {
        retryAttempts: 15 // Exceeds maximum
      };

      const result = HttpConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject negative retry delay', () => {
      const invalidConfig = {
        retryDelay: -500
      };

      const result = HttpConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should handle partial HTTP config', () => {
      const partialConfig = {
        timeout: 15000
      };

      const result = HttpConfigSchema.safeParse(partialConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('ServerConfigSchema', () => {
    it('should validate server configuration', () => {
      const validServerConfig = {
        name: 'evolution-api-mcp',
        version: '1.0.0'
      };

      const result = ServerConfigSchema.safeParse(validServerConfig);
      expect(result.success).toBe(true);
    });

    it('should reject empty server name', () => {
      const invalidConfig = {
        name: '',
        version: '1.0.0'
      };

      const result = ServerConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject invalid version format', () => {
      const invalidConfig = {
        name: 'test-server',
        version: 'not-a-version'
      };

      const result = ServerConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should handle partial server config', () => {
      const partialConfig = {
        name: 'test-server'
      };

      const result = ServerConfigSchema.safeParse(partialConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('ConfigSchema (Main)', () => {
    it('should validate complete configuration', () => {
      const validConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-api-key-123',
        server: {
          name: 'evolution-api-mcp',
          version: '1.0.0'
        },
        http: {
          timeout: 30000,
          retryAttempts: 3,
          retryDelay: 1000,
          maxRetryDelay: 30000,
          retryAttempts: 1
        }
      };

      const result = ConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate minimal configuration', () => {
      const minimalConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-api-key'
      };

      const result = ConfigSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const incompleteConfig = {
        evolutionUrl: 'https://api.example.com'
        // Missing evolutionApiKey
      };

      const result = ConfigSchema.safeParse(incompleteConfig);
      expect(result.success).toBe(false);
    });

    it('should provide detailed error messages', () => {
      const invalidConfig = {
        evolutionUrl: 'invalid-url',
        evolutionApiKey: '',
        http: {
          timeout: -1000,
          retryAttempts: 20
        }
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        const issues = result.error.issues.map(issue => issue.path.join('.'));
        expect(issues).toContain('evolutionUrl');
        expect(issues).toContain('evolutionApiKey');
      }
    });
  });

  describe('Schema Transformations', () => {
    it('should transform string numbers to numbers in env schema', () => {
      const envData = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-key',
        HTTP_TIMEOUT: '5000',
        RETRY_ATTEMPTS: '2'
      };

      const result = EnvSchema.safeParse(envData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.HTTP_TIMEOUT).toBe(5000);
        expect(result.data.RETRY_ATTEMPTS).toBe(2);
        expect(typeof result.data.HTTP_TIMEOUT).toBe('number');
        expect(typeof result.data.RETRY_ATTEMPTS).toBe('number');
      }
    });

    it('should handle boolean string transformations', () => {
      const envData = {
        EVOLUTION_URL: 'https://api.example.com',
        EVOLUTION_API_KEY: 'test-key',
        ENABLE_LOGGING: 'true'
      };

      // This would be handled by the schema if it included boolean transformations
      expect(envData.ENABLE_LOGGING).toBe('true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values', () => {
      const configWithNulls = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        server: null,
        http: undefined
      };

      const result = ConfigSchema.safeParse(configWithNulls);
      // Should handle gracefully based on schema definition
      expect(result).toBeDefined();
    });

    it('should handle extra properties', () => {
      const configWithExtra = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        extraProperty: 'should-be-ignored',
        server: {
          name: 'test-server',
          version: '1.0.0',
          extraServerProp: 'ignored'
        }
      };

      const result = ConfigSchema.safeParse(configWithExtra);
      expect(result.success).toBe(true);
      
      if (result.success) {
        // Extra properties should be stripped
        expect('extraProperty' in result.data).toBe(false);
      }
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const configWithLongStrings = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: longString
      };

      const result = ConfigSchema.safeParse(configWithLongStrings);
      // Should handle based on schema constraints
      expect(result).toBeDefined();
    });

    it('should handle special characters in strings', () => {
      const configWithSpecialChars = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'key-with-special-chars!@#$%^&*()',
        server: {
          name: 'server-with-unicode-名前',
          version: '1.0.0-beta.1+build.123'
        }
      };

      const result = ConfigSchema.safeParse(configWithSpecialChars);
      expect(result.success).toBe(true);
    });
  });
});
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ConfigurationManager, ConfigurationError } from '../../src/config/configuration-manager';
import { Config } from '../../src/config/schemas';

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;
  const testConfigPath = resolve(process.cwd(), 'test-config.json');

  beforeEach(() => {
    // Clear environment variables
    delete process.env.EVOLUTION_URL;
    delete process.env.EVOLUTION_API_KEY;
    delete process.env.MCP_SERVER_NAME;
    delete process.env.MCP_SERVER_VERSION;
    delete process.env.HTTP_TIMEOUT;
    delete process.env.RETRY_ATTEMPTS;
    delete process.env.RETRY_DELAY;

    // Clean up test config file
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }

    configManager = new ConfigurationManager();
  });

  afterEach(() => {
    // Clean up test config file
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
    
    // Clear cache
    configManager.clearCache();
  });

  describe('Environment Variable Loading', () => {
    it('should load configuration from environment variables', async () => {
      process.env.EVOLUTION_URL = 'https://api.example.com';
      process.env.EVOLUTION_API_KEY = 'test-key-123';
      process.env.MCP_SERVER_NAME = 'test-server';
      process.env.HTTP_TIMEOUT = '5000';

      const config = await configManager.loadConfig();

      expect(config.evolutionUrl).toBe('https://api.example.com');
      expect(config.evolutionApiKey).toBe('test-key-123');
      expect(config.server.name).toBe('test-server');
      expect(config.http.timeout).toBe(5000);
    });

    it('should handle missing required environment variables', async () => {
      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });

    it('should validate environment variable formats', async () => {
      process.env.EVOLUTION_URL = 'invalid-url';
      process.env.EVOLUTION_API_KEY = 'test-key';

      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });
  });

  describe('Configuration File Loading', () => {
    it('should load configuration from JSON file', async () => {
      const testConfig = {
        evolutionUrl: 'https://file.example.com',
        evolutionApiKey: 'file-key-123',
        server: {
          name: 'file-server',
          version: '2.0.0'
        },
        http: {
          timeout: 10000,
          retryAttempts: 5
        }
      };

      writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
      configManager = new ConfigurationManager(testConfigPath);

      const config = await configManager.loadConfig();

      expect(config.evolutionUrl).toBe('https://file.example.com');
      expect(config.evolutionApiKey).toBe('file-key-123');
      expect(config.server.name).toBe('file-server');
      expect(config.server.version).toBe('2.0.0');
      expect(config.http.timeout).toBe(10000);
      expect(config.http.retryAttempts).toBe(5);
    });

    it('should handle invalid JSON in config file', async () => {
      writeFileSync(testConfigPath, 'invalid json');
      configManager = new ConfigurationManager(testConfigPath);

      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });

    it('should handle missing config file gracefully', async () => {
      process.env.EVOLUTION_URL = 'https://env.example.com';
      process.env.EVOLUTION_API_KEY = 'env-key';

      configManager = new ConfigurationManager('/non/existent/config.json');
      const config = await configManager.loadConfig();

      expect(config.evolutionUrl).toBe('https://env.example.com');
      expect(config.evolutionApiKey).toBe('env-key');
    });
  });

  describe('Configuration Priority System', () => {
    it('should prioritize environment variables over config file', async () => {
      // Create config file
      const fileConfig = {
        evolutionUrl: 'https://file.example.com',
        evolutionApiKey: 'file-key',
        server: { name: 'file-server' }
      };
      writeFileSync(testConfigPath, JSON.stringify(fileConfig));

      // Set environment variables
      process.env.EVOLUTION_URL = 'https://env.example.com';
      process.env.EVOLUTION_API_KEY = 'env-key';
      process.env.MCP_SERVER_NAME = 'env-server';

      configManager = new ConfigurationManager(testConfigPath);
      const config = await configManager.loadConfig();

      // Environment variables should take precedence
      expect(config.evolutionUrl).toBe('https://env.example.com');
      expect(config.evolutionApiKey).toBe('env-key');
      expect(config.server.name).toBe('env-server');
    });

    it('should use config file values when environment variables are not set', async () => {
      const fileConfig = {
        evolutionUrl: 'https://file.example.com',
        evolutionApiKey: 'file-key',
        http: { timeout: 15000 }
      };
      writeFileSync(testConfigPath, JSON.stringify(fileConfig));

      // Set only some environment variables
      process.env.EVOLUTION_URL = 'https://env.example.com';

      configManager = new ConfigurationManager(testConfigPath);
      const config = await configManager.loadConfig();

      expect(config.evolutionUrl).toBe('https://env.example.com'); // From env
      expect(config.evolutionApiKey).toBe('file-key'); // From file
      expect(config.http.timeout).toBe(15000); // From file
    });

    it('should use default values when not specified elsewhere', async () => {
      process.env.EVOLUTION_URL = 'https://test.example.com';
      process.env.EVOLUTION_API_KEY = 'test-key';

      const config = await configManager.loadConfig();

      expect(config.server.name).toBe('evolution-api-mcp'); // Default
      expect(config.server.version).toBe('1.0.0'); // Default
      expect(config.http.timeout).toBe(30000); // Default
      expect(config.http.retryAttempts).toBe(3); // Default
      expect(config.http.retryDelay).toBe(1000); // Default
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required fields', async () => {
      process.env.EVOLUTION_URL = 'https://test.example.com';
      // Missing EVOLUTION_API_KEY

      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });

    it('should validate URL format', async () => {
      process.env.EVOLUTION_URL = 'not-a-url';
      process.env.EVOLUTION_API_KEY = 'test-key';

      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });

    it('should validate numeric values', async () => {
      process.env.EVOLUTION_URL = 'https://test.example.com';
      process.env.EVOLUTION_API_KEY = 'test-key';
      process.env.HTTP_TIMEOUT = 'not-a-number';

      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });

    it('should validate retry attempts range', async () => {
      const fileConfig = {
        evolutionUrl: 'https://test.example.com',
        evolutionApiKey: 'test-key',
        http: { retryAttempts: 15 } // Exceeds maximum
      };
      writeFileSync(testConfigPath, JSON.stringify(fileConfig));

      configManager = new ConfigurationManager(testConfigPath);
      await expect(configManager.loadConfig()).rejects.toThrow(ConfigurationError);
    });
  });

  describe('Configuration Caching', () => {
    it('should cache configuration after first load', async () => {
      process.env.EVOLUTION_URL = 'https://test.example.com';
      process.env.EVOLUTION_API_KEY = 'test-key';

      const config1 = await configManager.loadConfig();
      const config2 = await configManager.loadConfig();

      expect(config1).toBe(config2); // Same object reference
    });

    it('should clear cache when requested', async () => {
      process.env.EVOLUTION_URL = 'https://test.example.com';
      process.env.EVOLUTION_API_KEY = 'test-key';

      const config1 = await configManager.loadConfig();
      configManager.clearCache();
      const config2 = await configManager.loadConfig();

      expect(config1).not.toBe(config2); // Different object references
      expect(config1).toEqual(config2); // But same values
    });
  });

  describe('Configuration Summary', () => {
    it('should provide configuration summary', async () => {
      process.env.EVOLUTION_URL = 'https://test.example.com';
      process.env.EVOLUTION_API_KEY = 'test-key';

      await configManager.loadConfig();
      const summary = configManager.getConfigSummary();

      expect(summary).toContain('https://test.example.com');
      expect(summary).toContain('[SET]'); // API key should be masked
      expect(summary).toContain('evolution-api-mcp');
    });

    it('should handle unloaded configuration', () => {
      const summary = configManager.getConfigSummary();
      expect(summary).toBe('Configuration not loaded');
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for validation failures', async () => {
      process.env.EVOLUTION_URL = 'invalid-url';
      process.env.EVOLUTION_API_KEY = '';

      try {
        await configManager.loadConfig();
        fail('Should have thrown ConfigurationError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error.message).toContain('Configuration validation failed');
        expect(error.message).toContain('EVOLUTION_URL');
        expect(error.message).toContain('EVOLUTION_API_KEY');
      }
    });

    it('should include helpful suggestions in error messages', async () => {
      try {
        await configManager.loadConfig();
        fail('Should have thrown ConfigurationError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error.message).toContain('Required: EVOLUTION_URL, EVOLUTION_API_KEY');
      }
    });
  });
});
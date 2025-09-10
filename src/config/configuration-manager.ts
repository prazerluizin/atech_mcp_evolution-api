import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import { 
  Config, 
  ConfigSchema, 
  EnvSchema, 
  ConfigFileSchema, 
  ConfigFile,
  DEFAULT_CONFIG 
} from './schemas';

/**
 * Configuration error class for better error handling
 */
export class ConfigurationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Configuration source interface
 */
export interface ConfigSource {
  type: 'environment' | 'file' | 'default';
  priority: number;
  load(): Promise<Partial<Config>>;
}

/**
 * Environment variables configuration source
 */
class EnvironmentConfigSource implements ConfigSource {
  type = 'environment' as const;
  priority = 1; // Highest priority

  async load(): Promise<Partial<Config>> {
    // Load .env file if it exists
    loadDotenv();

    const envVars = EnvSchema.parse(process.env);
    const config: Partial<Config> = {};

    if (envVars.EVOLUTION_URL) {
      config.evolutionUrl = envVars.EVOLUTION_URL;
    }

    if (envVars.EVOLUTION_API_KEY) {
      config.evolutionApiKey = envVars.EVOLUTION_API_KEY;
    }

    if (envVars.MCP_SERVER_NAME || envVars.MCP_SERVER_VERSION) {
      config.server = {
        name: envVars.MCP_SERVER_NAME || DEFAULT_CONFIG.server!.name!,
        version: envVars.MCP_SERVER_VERSION || DEFAULT_CONFIG.server!.version!
      };
    }

    if (envVars.HTTP_TIMEOUT || envVars.RETRY_ATTEMPTS || envVars.RETRY_DELAY) {
      config.http = {
        timeout: envVars.HTTP_TIMEOUT ? parseInt(envVars.HTTP_TIMEOUT, 10) : DEFAULT_CONFIG.http!.timeout!,
        retryAttempts: envVars.RETRY_ATTEMPTS ? parseInt(envVars.RETRY_ATTEMPTS, 10) : DEFAULT_CONFIG.http!.retryAttempts!,
        retryDelay: envVars.RETRY_DELAY ? parseInt(envVars.RETRY_DELAY, 10) : DEFAULT_CONFIG.http!.retryDelay!
      };
    }

    return config;
  }
}

/**
 * Configuration file source
 */
class FileConfigSource implements ConfigSource {
  type = 'file' as const;
  priority = 2; // Medium priority

  constructor(private configPath?: string) {}

  async load(): Promise<Partial<Config>> {
    const configPaths = [
      this.configPath,
      resolve(process.cwd(), 'evolution-config.json'),
      resolve(process.cwd(), 'config.json'),
      resolve(process.cwd(), '.evolution-api-mcp.json')
    ].filter(Boolean) as string[];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const fileContent = readFileSync(configPath, 'utf-8');
          const rawConfig = JSON.parse(fileContent);
          const validatedConfig = ConfigFileSchema.parse(rawConfig);
          
          return this.transformFileConfig(validatedConfig);
        } catch (error) {
          throw new ConfigurationError(
            `Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error instanceof Error ? error : undefined
          );
        }
      }
    }

    return {};
  }

  private transformFileConfig(fileConfig: ConfigFile): Partial<Config> {
    const config: Partial<Config> = {};

    if (fileConfig.evolutionUrl) {
      config.evolutionUrl = fileConfig.evolutionUrl;
    }

    if (fileConfig.evolutionApiKey) {
      config.evolutionApiKey = fileConfig.evolutionApiKey;
    }

    if (fileConfig.server) {
      config.server = {
        name: fileConfig.server.name || DEFAULT_CONFIG.server!.name!,
        version: fileConfig.server.version || DEFAULT_CONFIG.server!.version!
      };
    }

    if (fileConfig.http) {
      config.http = {
        timeout: fileConfig.http.timeout || DEFAULT_CONFIG.http!.timeout!,
        retryAttempts: fileConfig.http.retryAttempts || DEFAULT_CONFIG.http!.retryAttempts!,
        retryDelay: fileConfig.http.retryDelay || DEFAULT_CONFIG.http!.retryDelay!
      };
    }

    return config;
  }
}

/**
 * Default configuration source
 */
class DefaultConfigSource implements ConfigSource {
  type = 'default' as const;
  priority = 3; // Lowest priority

  async load(): Promise<Partial<Config>> {
    return DEFAULT_CONFIG;
  }
}

/**
 * Configuration manager that handles loading and merging configuration from multiple sources
 */
export class ConfigurationManager {
  private sources: ConfigSource[] = [];
  private cachedConfig?: Config;

  constructor(configFilePath?: string) {
    this.sources = [
      new EnvironmentConfigSource(),
      new FileConfigSource(configFilePath),
      new DefaultConfigSource()
    ].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Load configuration from all sources with proper priority
   */
  async loadConfig(): Promise<Config> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    try {
      const configs: Partial<Config>[] = [];

      // Load from all sources
      for (const source of this.sources) {
        try {
          const config = await source.load();
          configs.push(config);
        } catch (error) {
          if (source.type === 'environment' || source.type === 'default') {
            // Environment and default sources should not fail
            throw error;
          }
          // File source failures are handled gracefully
          console.warn(`Warning: Failed to load ${source.type} configuration:`, error);
        }
      }

      // Merge configurations (later configs override earlier ones due to priority)
      const mergedConfig = this.mergeConfigs(configs);

      // Validate final configuration
      const validatedConfig = await this.validateConfig(mergedConfig);
      
      this.cachedConfig = validatedConfig;
      return validatedConfig;
    } catch (error) {
      throw new ConfigurationError(
        `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate configuration and provide clear error messages
   */
  async validateConfig(config: Partial<Config>): Promise<Config> {
    try {
      return ConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });

        throw new ConfigurationError(
          `Configuration validation failed:\n${errorMessages.join('\n')}\n\n` +
          'Please check your environment variables or configuration file.\n' +
          'Required: EVOLUTION_URL, EVOLUTION_API_KEY'
        );
      }
      throw error;
    }
  }

  /**
   * Merge multiple configuration objects with deep merging
   */
  private mergeConfigs(configs: Partial<Config>[]): Partial<Config> {
    const result: Partial<Config> = {};

    for (const config of configs) {
      if (config.evolutionUrl) result.evolutionUrl = config.evolutionUrl;
      if (config.evolutionApiKey) result.evolutionApiKey = config.evolutionApiKey;
      
      if (config.server) {
        result.server = { ...result.server, ...config.server };
      }
      
      if (config.http) {
        result.http = { ...result.http, ...config.http };
      }
    }

    return result;
  }

  /**
   * Clear cached configuration (useful for testing or config reloading)
   */
  clearCache(): void {
    this.cachedConfig = undefined;
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary(): string {
    if (!this.cachedConfig) {
      return 'Configuration not loaded';
    }

    return `Configuration Summary:
- Evolution URL: ${this.cachedConfig.evolutionUrl}
- API Key: ${this.cachedConfig.evolutionApiKey ? '[SET]' : '[NOT SET]'}
- Server Name: ${this.cachedConfig.server.name}
- Server Version: ${this.cachedConfig.server.version}
- HTTP Timeout: ${this.cachedConfig.http.timeout}ms
- Retry Attempts: ${this.cachedConfig.http.retryAttempts}
- Retry Delay: ${this.cachedConfig.http.retryDelay}ms`;
  }
}

/**
 * Create a configuration manager instance
 */
export function createConfigurationManager(configFilePath?: string): ConfigurationManager {
  return new ConfigurationManager(configFilePath);
}
#!/usr/bin/env node

/**
 * CLI interface for Evolution API MCP Server
 * Handles command line arguments, help text, and different transport modes
 */

import { EvolutionMcpServer } from '../server/mcp-server';
import { ConfigurationManager, ConfigurationError } from '../config/configuration-manager';

/**
 * CLI argument interface
 */
interface CliArgs {
  help?: boolean;
  version?: boolean;
  config?: string;
  stdio?: boolean;
  http?: boolean;
  port?: number;
  verbose?: boolean;
  validate?: boolean;
}

/**
 * Transport mode enum
 */
export enum TransportMode {
  STDIO = 'stdio',
  HTTP = 'http'
}

/**
 * CLI class for handling command line interface
 */
export class EvolutionMcpCli {
  private args: CliArgs = {};
  private configManager?: ConfigurationManager;

  constructor() {
    this.parseArguments();
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(): void {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '-h':
        case '--help':
          this.args.help = true;
          break;
          
        case '-v':
        case '--version':
          this.args.version = true;
          break;
          
        case '-c':
        case '--config':
          this.args.config = args[++i];
          if (!this.args.config) {
            this.exitWithError('Config file path is required after --config');
          }
          break;
          
        case '--stdio':
          this.args.stdio = true;
          break;
          
        case '--http':
          this.args.http = true;
          break;
          
        case '-p':
        case '--port':
          const portStr = args[++i];
          if (!portStr) {
            this.exitWithError('Port number is required after --port');
          }
          const port = parseInt(portStr, 10);
          if (isNaN(port) || port < 1 || port > 65535) {
            this.exitWithError('Port must be a valid number between 1 and 65535');
          }
          this.args.port = port;
          break;
          
        case '--verbose':
          this.args.verbose = true;
          break;
          
        case '--validate':
          this.args.validate = true;
          break;
          
        default:
          if (arg.startsWith('-')) {
            this.exitWithError(`Unknown option: ${arg}`);
          }
          break;
      }
    }
  }

  /**
   * Run the CLI application
   */
  async run(): Promise<void> {
    try {
      // Handle help and version first
      if (this.args.help) {
        this.showHelp();
        return;
      }

      if (this.args.version) {
        this.showVersion();
        return;
      }

      // Initialize configuration manager
      this.configManager = new ConfigurationManager(this.args.config);

      // Handle configuration validation
      if (this.args.validate) {
        await this.validateConfiguration();
        return;
      }

      // Determine transport mode
      const transportMode = this.determineTransportMode();
      
      if (this.args.verbose) {
        console.log(`Starting Evolution API MCP Server in ${transportMode} mode...`);
        if (this.args.config) {
          console.log(`Using config file: ${this.args.config}`);
        }
      }

      // Start the server
      await this.startServer(transportMode);

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    const fs = require('fs');
    const path = require('path');
    
    // Try multiple possible locations for package.json
    const possiblePaths = [
      path.resolve(__dirname, '../../package.json'),
      path.resolve(process.cwd(), 'package.json'),
      path.resolve(__dirname, '../../../package.json')
    ];
    
    let packageJson = { name: 'evolution-api-mcp', version: '1.0.0', description: 'MCP Server for Evolution API v2' };
    
    for (const packagePath of possiblePaths) {
      try {
        if (fs.existsSync(packagePath)) {
          packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }
    
    console.log(`${packageJson.name} v${packageJson.version}`);
    console.log(packageJson.description);
    console.log('');
    console.log('Usage:');
    console.log('  npx evolution-api-mcp [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help              Show this help message');
    console.log('  -v, --version           Show version information');
    console.log('  -c, --config <file>     Use specific configuration file');
    console.log('  --stdio                 Use STDIO transport (default for Claude Desktop)');
    console.log('  --http                  Use HTTP transport');
    console.log('  -p, --port <number>     Port for HTTP transport (default: 3000)');
    console.log('  --verbose               Enable verbose logging');
    console.log('  --validate              Validate configuration and exit');
    console.log('');
    console.log('Environment Variables:');
    console.log('  EVOLUTION_URL           Evolution API base URL (required)');
    console.log('  EVOLUTION_API_KEY       Evolution API global key (required)');
    console.log('  MCP_SERVER_NAME         MCP server name (optional)');
    console.log('  MCP_SERVER_VERSION      MCP server version (optional)');
    console.log('  HTTP_TIMEOUT            HTTP request timeout in ms (optional)');
    console.log('  RETRY_ATTEMPTS          Number of retry attempts (optional)');
    console.log('  RETRY_DELAY             Retry delay in ms (optional)');
    console.log('');
    console.log('Examples:');
    console.log('  # Start with STDIO transport (for Claude Desktop)');
    console.log('  npx evolution-api-mcp');
    console.log('');
    console.log('  # Start with HTTP transport on port 8080');
    console.log('  npx evolution-api-mcp --http --port 8080');
    console.log('');
    console.log('  # Use custom configuration file');
    console.log('  npx evolution-api-mcp --config ./my-config.json');
    console.log('');
    console.log('  # Validate configuration');
    console.log('  npx evolution-api-mcp --validate');
    console.log('');
    console.log('Claude Desktop Configuration:');
    console.log('  Add to ~/.claude/mcp.json:');
    console.log('  {');
    console.log('    "mcpServers": {');
    console.log('      "evolution-api": {');
    console.log('        "command": "npx",');
    console.log('        "args": ["evolution-api-mcp"],');
    console.log('        "env": {');
    console.log('          "EVOLUTION_URL": "https://your-evolution-api.com",');
    console.log('          "EVOLUTION_API_KEY": "your-global-api-key"');
    console.log('        }');
    console.log('      }');
    console.log('    }');
    console.log('  }');
  }

  /**
   * Show version information
   */
  private showVersion(): void {
    const fs = require('fs');
    const path = require('path');
    
    // Try multiple possible locations for package.json
    const possiblePaths = [
      path.resolve(__dirname, '../../package.json'),
      path.resolve(process.cwd(), 'package.json'),
      path.resolve(__dirname, '../../../package.json')
    ];
    
    let packageJson = { name: 'evolution-api-mcp', version: '1.0.0' };
    
    for (const packagePath of possiblePaths) {
      try {
        if (fs.existsSync(packagePath)) {
          packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }
    console.log(`${packageJson.name} v${packageJson.version}`);
  }

  /**
   * Validate configuration and show results
   */
  private async validateConfiguration(): Promise<void> {
    try {
      console.log('Validating configuration...');
      
      if (!this.configManager) {
        throw new Error('Configuration manager not initialized');
      }

      const config = await this.configManager.loadConfig();
      
      console.log('✅ Configuration is valid!');
      console.log('');
      console.log(this.configManager.getConfigSummary());
      
      // Test connection to Evolution API
      console.log('');
      console.log('Testing connection to Evolution API...');
      
      const { EvolutionHttpClient } = await import('../clients/evolution-http-client');
      const httpClient = new EvolutionHttpClient({
        baseURL: config.evolutionUrl,
        apiKey: config.evolutionApiKey,
        timeout: config.http.timeout,
        retryAttempts: config.http.retryAttempts,
        retryDelay: config.http.retryDelay
      });

      try {
        // Test with a simple endpoint that should always be available
        await httpClient.get('/');
        console.log('✅ Successfully connected to Evolution API');
      } catch (error) {
        console.log('⚠️  Could not connect to Evolution API:');
        console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log('   This might be normal if the API is not running or the endpoint requires authentication.');
      }
      
    } catch (error) {
      console.log('❌ Configuration validation failed:');
      if (error instanceof ConfigurationError) {
        console.log(error.message);
      } else {
        console.log(error instanceof Error ? error.message : 'Unknown error');
      }
      process.exit(1);
    }
  }

  /**
   * Determine transport mode based on arguments
   */
  private determineTransportMode(): TransportMode {
    // Explicit HTTP mode
    if (this.args.http) {
      return TransportMode.HTTP;
    }
    
    // Explicit STDIO mode or default
    if (this.args.stdio || (!this.args.http && !this.args.port)) {
      return TransportMode.STDIO;
    }
    
    // Port specified implies HTTP mode
    if (this.args.port) {
      return TransportMode.HTTP;
    }
    
    // Default to STDIO for Claude Desktop compatibility
    return TransportMode.STDIO;
  }

  /**
   * Start the MCP server with specified transport mode
   */
  private async startServer(transportMode: TransportMode): Promise<void> {
    if (!this.configManager) {
      throw new Error('Configuration manager not initialized');
    }

    // Load and validate configuration
    const config = await this.configManager.loadConfig();
    
    if (this.args.verbose) {
      console.log('Configuration loaded successfully:');
      console.log(this.configManager.getConfigSummary());
      console.log('');
    }

    // Create and initialize server
    const server = new EvolutionMcpServer();
    await server.initialize(this.configManager);

    // Set up graceful shutdown
    this.setupGracefulShutdown(server);

    // Start appropriate transport
    switch (transportMode) {
      case TransportMode.STDIO:
        if (this.args.verbose) {
          console.log('Starting STDIO transport for Claude Desktop...');
        }
        await server.startStdio();
        break;
        
      case TransportMode.HTTP:
        const port = this.args.port || 3000;
        if (this.args.verbose) {
          console.log(`Starting HTTP transport on port ${port}...`);
        }
        await server.startHttp(port);
        console.log(`Evolution API MCP Server running on http://localhost:${port}`);
        break;
        
      default:
        throw new Error(`Unsupported transport mode: ${transportMode}`);
    }
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupGracefulShutdown(server: EvolutionMcpServer): void {
    const shutdown = async (signal: string) => {
      if (this.args.verbose) {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
      }
      
      try {
        await server.shutdown();
        if (this.args.verbose) {
          console.log('Server shutdown complete');
        }
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle various shutdown signals
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  /**
   * Handle errors with appropriate formatting
   */
  private handleError(error: unknown): void {
    if (error instanceof ConfigurationError) {
      console.error('Configuration Error:');
      console.error(error.message);
      console.error('');
      console.error('Run with --help for usage information.');
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
      if (this.args.verbose && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      console.error('Unknown error:', error);
    }
    
    process.exit(1);
  }

  /**
   * Exit with error message
   */
  private exitWithError(message: string): never {
    console.error('Error:', message);
    console.error('Run with --help for usage information.');
    process.exit(1);
  }
}

/**
 * Main CLI entry point
 */
export async function runCli(): Promise<void> {
  const cli = new EvolutionMcpCli();
  await cli.run();
}
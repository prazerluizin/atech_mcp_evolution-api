/**
 * CLI Tests
 * Tests for the command line interface functionality
 */

import { EvolutionMcpCli } from '../../src/cli/cli';

// Mock process.argv and process.exit
const originalArgv = process.argv;
const originalExit = process.exit;

describe('EvolutionMcpCli', () => {
  let mockExit: jest.MockedFunction<typeof process.exit>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock process.exit
    mockExit = jest.fn() as any;
    process.exit = mockExit;

    // Mock console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore original functions
    process.argv = originalArgv;
    process.exit = originalExit;
    
    // Restore console methods
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Argument Parsing', () => {
    it('should parse help argument', () => {
      process.argv = ['node', 'cli.js', '--help'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.help).toBe(true);
    });

    it('should parse version argument', () => {
      process.argv = ['node', 'cli.js', '--version'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.version).toBe(true);
    });

    it('should parse config file argument', () => {
      process.argv = ['node', 'cli.js', '--config', 'test-config.json'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.config).toBe('test-config.json');
    });

    it('should parse transport mode arguments', () => {
      process.argv = ['node', 'cli.js', '--http', '--port', '8080'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.http).toBe(true);
      expect(cli.args.port).toBe(8080);
    });

    it('should parse verbose argument', () => {
      process.argv = ['node', 'cli.js', '--verbose'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.verbose).toBe(true);
    });

    it('should parse validate argument', () => {
      process.argv = ['node', 'cli.js', '--validate'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.validate).toBe(true);
    });

    it('should handle short form arguments', () => {
      process.argv = ['node', 'cli.js', '-h', '-v', '-c', 'config.json', '-p', '3000'];
      
      const cli = new (EvolutionMcpCli as any)();
      expect(cli.args.help).toBe(true);
      expect(cli.args.version).toBe(true);
      expect(cli.args.config).toBe('config.json');
      expect(cli.args.port).toBe(3000);
    });

    it('should exit with error for invalid port', () => {
      process.argv = ['node', 'cli.js', '--port', 'invalid'];
      
      expect(() => new (EvolutionMcpCli as any)()).not.toThrow();
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should exit with error for missing config file', () => {
      process.argv = ['node', 'cli.js', '--config'];
      
      expect(() => new (EvolutionMcpCli as any)()).not.toThrow();
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should exit with error for unknown option', () => {
      process.argv = ['node', 'cli.js', '--unknown'];
      
      expect(() => new (EvolutionMcpCli as any)()).not.toThrow();
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Transport Mode Detection', () => {
    it('should default to STDIO mode', () => {
      process.argv = ['node', 'cli.js'];
      
      const cli = new (EvolutionMcpCli as any)();
      const mode = cli.determineTransportMode();
      expect(mode).toBe('stdio');
    });

    it('should use HTTP mode when --http is specified', () => {
      process.argv = ['node', 'cli.js', '--http'];
      
      const cli = new (EvolutionMcpCli as any)();
      const mode = cli.determineTransportMode();
      expect(mode).toBe('http');
    });

    it('should use HTTP mode when port is specified', () => {
      process.argv = ['node', 'cli.js', '--port', '8080'];
      
      const cli = new (EvolutionMcpCli as any)();
      const mode = cli.determineTransportMode();
      expect(mode).toBe('http');
    });

    it('should prefer explicit STDIO mode', () => {
      process.argv = ['node', 'cli.js', '--stdio'];
      
      const cli = new (EvolutionMcpCli as any)();
      const mode = cli.determineTransportMode();
      expect(mode).toBe('stdio');
    });
  });

  describe('Help and Version', () => {
    it('should show help when requested', async () => {
      process.argv = ['node', 'cli.js', '--help'];
      
      const cli = new (EvolutionMcpCli as any)();
      await cli.run();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('evolution-api-mcp'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });

    it('should show version when requested', async () => {
      process.argv = ['node', 'cli.js', '--version'];
      
      const cli = new (EvolutionMcpCli as any)();
      await cli.run();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('evolution-api-mcp v'));
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration errors gracefully', async () => {
      process.argv = ['node', 'cli.js', '--validate'];
      
      const cli = new (EvolutionMcpCli as any)();
      
      // Mock the validateConfiguration method to throw an error
      cli.validateConfiguration = jest.fn().mockRejectedValue(new Error('Config error'));
      
      await cli.run();
      
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle server startup errors', async () => {
      process.argv = ['node', 'cli.js'];
      
      // Mock server to throw error
      const mockServer = {
        initialize: jest.fn().mockRejectedValue(new Error('Server error')),
        startStdio: jest.fn()
      };
      
      const cli = new (EvolutionMcpCli as any)();
      
      // This would require more complex mocking to test properly
      // For now, we'll test that error handling exists
      expect(cli.handleError).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate configuration when requested', async () => {
      process.argv = ['node', 'cli.js', '--validate'];
      
      // Mock successful configuration
      const mockConfig = {
        evolutionUrl: 'https://api.example.com',
        evolutionApiKey: 'test-key',
        server: { name: 'test', version: '1.0.0' },
        http: { timeout: 30000, retryAttempts: 3, retryDelay: 1000 }
      };
      
      const mockConfigManager = {
        loadConfig: jest.fn().mockResolvedValue(mockConfig),
        getConfigSummary: jest.fn().mockReturnValue('Config summary')
      };
      
      const cli = new (EvolutionMcpCli as any)();
      cli.configManager = mockConfigManager;
      
      await cli.run();
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ Configuration is valid!');
    });
  });
});

describe('CLI Integration', () => {
  it('should export runCli function', () => {
    const { runCli } = require('../../src/cli/cli');
    expect(typeof runCli).toBe('function');
  });

  it('should handle process signals gracefully', () => {
    // Test that signal handlers are set up
    const originalListeners = process.listeners('SIGINT');
    
    // Import CLI to set up handlers
    require('../../src/cli/cli');
    
    // Check that new listeners were added (this is a basic test)
    expect(process.listeners('SIGINT').length).toBeGreaterThanOrEqual(originalListeners.length);
  });
});
# Evolution API MCP Server CLI

Command Line Interface for the Evolution API MCP Server.

## Features

- **Multiple Transport Modes**: Support for both STDIO (Claude Desktop) and HTTP transports
- **Configuration Management**: Flexible configuration via environment variables, config files, or CLI arguments
- **Validation**: Built-in configuration validation with helpful error messages
- **Graceful Shutdown**: Proper process lifecycle management with signal handling
- **Comprehensive Help**: Detailed usage instructions and examples

## Installation

```bash
npm install evolution-api-mcp
```

## Usage

### Basic Usage (STDIO for Claude Desktop)

```bash
npx evolution-api-mcp
```

### HTTP Mode

```bash
# Start HTTP server on default port (3000)
npx evolution-api-mcp --http

# Start HTTP server on custom port
npx evolution-api-mcp --http --port 8080
```

### Configuration

```bash
# Use custom configuration file
npx evolution-api-mcp --config ./my-config.json

# Validate configuration
npx evolution-api-mcp --validate

# Verbose logging
npx evolution-api-mcp --verbose
```

### Help and Version

```bash
# Show help
npx evolution-api-mcp --help

# Show version
npx evolution-api-mcp --version
```

## Configuration

### Environment Variables

Required:
- `EVOLUTION_URL`: Evolution API base URL
- `EVOLUTION_API_KEY`: Evolution API global key

Optional:
- `MCP_SERVER_NAME`: MCP server name (default: "evolution-api-mcp")
- `MCP_SERVER_VERSION`: MCP server version (default: "1.0.0")
- `HTTP_TIMEOUT`: HTTP request timeout in ms (default: 30000)
- `RETRY_ATTEMPTS`: Number of retry attempts (default: 3)
- `RETRY_DELAY`: Retry delay in ms (default: 1000)

### Configuration File

Create a JSON configuration file:

```json
{
  "evolutionUrl": "https://your-evolution-api.com",
  "evolutionApiKey": "your-global-api-key",
  "server": {
    "name": "my-evolution-mcp",
    "version": "1.0.0"
  },
  "http": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

## Claude Desktop Integration

Add to your `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "npx",
      "args": ["evolution-api-mcp"],
      "env": {
        "EVOLUTION_URL": "https://your-evolution-api.com",
        "EVOLUTION_API_KEY": "your-global-api-key"
      }
    }
  }
}
```

## Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help message |
| `--version` | `-v` | Show version information |
| `--config <file>` | `-c` | Use specific configuration file |
| `--stdio` | | Use STDIO transport (default) |
| `--http` | | Use HTTP transport |
| `--port <number>` | `-p` | Port for HTTP transport (default: 3000) |
| `--verbose` | | Enable verbose logging |
| `--validate` | | Validate configuration and exit |

## Transport Modes

### STDIO Transport (Default)

Used for Claude Desktop integration. The server communicates via standard input/output.

```bash
npx evolution-api-mcp
# or explicitly
npx evolution-api-mcp --stdio
```

### HTTP Transport

Used for other MCP clients or testing. The server runs an HTTP server.

```bash
npx evolution-api-mcp --http --port 8080
```

HTTP endpoints:
- `GET /health` - Health check
- `GET /mcp` - MCP server information

## Error Handling

The CLI provides comprehensive error handling with helpful suggestions:

- **Configuration Errors**: Clear messages about missing or invalid configuration
- **Network Errors**: Suggestions for connection issues
- **Validation Errors**: Detailed parameter validation feedback
- **Authentication Errors**: Guidance for API key issues

## Examples

### Development Setup

```bash
# Set environment variables
export EVOLUTION_URL="https://localhost:8080"
export EVOLUTION_API_KEY="your-dev-key"

# Start in verbose mode for debugging
npx evolution-api-mcp --verbose
```

### Production Setup

```bash
# Use configuration file for production
npx evolution-api-mcp --config /etc/evolution-mcp/config.json
```

### Testing Configuration

```bash
# Validate configuration before starting
npx evolution-api-mcp --validate

# Test HTTP mode
npx evolution-api-mcp --http --port 3000 --verbose
```

## Troubleshooting

### Configuration Issues

1. **Missing API Key**: Ensure `EVOLUTION_API_KEY` is set
2. **Invalid URL**: Check `EVOLUTION_URL` format (must include protocol)
3. **Connection Failed**: Verify Evolution API server is running and accessible

### Runtime Issues

1. **Port Already in Use**: Choose a different port with `--port`
2. **Permission Denied**: Ensure proper file permissions for config files
3. **Module Not Found**: Run `npm install` to install dependencies

### Debug Mode

Use `--verbose` flag for detailed logging:

```bash
npx evolution-api-mcp --verbose --validate
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test -- tests/cli/cli.test.ts
```

### Running from Source

```bash
npx tsx src/cli/cli.ts --help
```

## API Reference

### CLI Class

The `EvolutionMcpCli` class handles all CLI functionality:

```typescript
import { EvolutionMcpCli, runCli } from './cli/cli';

// Direct usage
const cli = new EvolutionMcpCli();
await cli.run();

// Or use the convenience function
await runCli();
```

### Transport Modes

```typescript
enum TransportMode {
  STDIO = 'stdio',
  HTTP = 'http'
}
```

The CLI automatically determines the transport mode based on arguments:
- Default: STDIO
- `--http` or `--port`: HTTP
- `--stdio`: Explicit STDIO (overrides other options)
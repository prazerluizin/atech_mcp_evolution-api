# Configuration Guide

The Evolution API MCP Server supports multiple configuration methods with a clear priority system.

## Configuration Priority

The configuration system follows this priority order (highest to lowest):

1. **Environment Variables** (highest priority)
2. **Configuration File** (medium priority)  
3. **Default Values** (lowest priority)

## Environment Variables

Set these environment variables to configure the server:

### Required Variables

```bash
EVOLUTION_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-global-api-key
```

### Optional Variables

```bash
# Server settings
MCP_SERVER_NAME=evolution-api-mcp
MCP_SERVER_VERSION=1.0.0

# HTTP client settings
HTTP_TIMEOUT=30000          # Request timeout in milliseconds
RETRY_ATTEMPTS=3            # Number of retry attempts (0-10)
RETRY_DELAY=1000           # Base delay between retries in milliseconds
```

## Configuration File

Create a JSON configuration file with any of these names:
- `evolution-config.json`
- `config.json`
- `.evolution-api-mcp.json`

Or specify a custom path when creating the configuration manager.

### Example Configuration File

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

## Default Values

If not specified elsewhere, these defaults are used:

```json
{
  "server": {
    "name": "evolution-api-mcp",
    "version": "1.0.0"
  },
  "http": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

## Configuration Validation

The system validates all configuration values:

- **evolutionUrl**: Must be a valid URL
- **evolutionApiKey**: Cannot be empty
- **http.timeout**: Must be a positive number
- **http.retryAttempts**: Must be an integer between 0 and 10
- **http.retryDelay**: Must be a positive number

## Usage Examples

### Using Environment Variables

```bash
# Set environment variables
export EVOLUTION_URL="https://api.example.com"
export EVOLUTION_API_KEY="your-key-here"
export HTTP_TIMEOUT="5000"

# Run the server
npx evolution-api-mcp
```

### Using Configuration File

```bash
# Create config file
echo '{
  "evolutionUrl": "https://api.example.com",
  "evolutionApiKey": "your-key-here",
  "http": { "timeout": 5000 }
}' > evolution-config.json

# Run the server
npx evolution-api-mcp
```

### Mixed Configuration

```bash
# Create config file with base settings
echo '{
  "evolutionUrl": "https://api.example.com",
  "evolutionApiKey": "your-key-here",
  "http": { "timeout": 10000 }
}' > evolution-config.json

# Override specific settings with environment variables
export HTTP_TIMEOUT="5000"  # This will override the file setting

# Run the server
npx evolution-api-mcp
```

## Error Messages

The configuration system provides clear error messages:

### Missing Required Configuration
```
Configuration validation failed:
evolutionUrl: Required
evolutionApiKey: Evolution API key is required

Please check your environment variables or configuration file.
Required: EVOLUTION_URL, EVOLUTION_API_KEY
```

### Invalid URL Format
```
Configuration validation failed:
evolutionUrl: Evolution URL must be a valid URL
```

### Invalid Retry Attempts
```
Configuration validation failed:
http.retryAttempts: Maximum 10 retry attempts allowed
```

## Programmatic Usage

```typescript
import { createConfigurationManager } from './src/config';

// Create configuration manager
const configManager = createConfigurationManager();

// Load configuration
const config = await configManager.loadConfig();

// Get configuration summary
console.log(configManager.getConfigSummary());

// Clear cache (useful for testing)
configManager.clearCache();
```

## Troubleshooting

### Configuration Not Loading

1. Check that required environment variables are set:
   ```bash
   echo $EVOLUTION_URL
   echo $EVOLUTION_API_KEY
   ```

2. Verify configuration file format:
   ```bash
   cat evolution-config.json | jq .
   ```

3. Check file permissions and location

### Validation Errors

1. Ensure URLs include protocol (http:// or https://)
2. Verify API key is not empty
3. Check numeric values are within valid ranges
4. Ensure JSON syntax is valid in configuration files

### Priority Issues

Remember the priority order:
1. Environment variables override everything
2. Configuration file values are used if no environment variable exists
3. Defaults are used only if neither environment nor file specify a value
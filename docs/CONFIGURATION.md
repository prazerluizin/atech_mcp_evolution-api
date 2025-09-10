# Configuration Reference

This document provides comprehensive information about configuring the Evolution API MCP Server.

## Table of Contents

- [Configuration Methods](#configuration-methods)
- [Environment Variables](#environment-variables)
- [Configuration File](#configuration-file)
- [Command Line Arguments](#command-line-arguments)
- [Claude Desktop Configuration](#claude-desktop-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Security Considerations](#security-considerations)

## Configuration Methods

The Evolution API MCP Server supports multiple configuration methods with the following priority order (highest to lowest):

1. **Command line arguments**
2. **Environment variables**
3. **Configuration file**
4. **Default values**

## Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EVOLUTION_URL` | Evolution API base URL | `https://api.example.com` | ✅ |
| `EVOLUTION_API_KEY` | Global API key for Evolution API | `your-api-key-here` | ✅ |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MCP_SERVER_NAME` | Name for the MCP server | `evolution-api-mcp` | `my-whatsapp-server` |
| `MCP_SERVER_VERSION` | Server version identifier | `1.0.0` | `1.2.3` |
| `HTTP_TIMEOUT` | Request timeout in milliseconds | `30000` | `60000` |
| `RETRY_ATTEMPTS` | Number of retry attempts for failed requests | `3` | `5` |
| `RETRY_DELAY` | Base delay between retries in milliseconds | `1000` | `2000` |
| `MAX_RETRY_DELAY` | Maximum delay between retries in milliseconds | `10000` | `30000` |
| `LOG_LEVEL` | Logging level | `info` | `debug` |
| `NODE_ENV` | Environment mode | `production` | `development` |

### Setting Environment Variables

**Linux/macOS:**
```bash
export EVOLUTION_URL="https://your-api.example.com"
export EVOLUTION_API_KEY="your-global-api-key"
export HTTP_TIMEOUT="60000"
```

**Windows Command Prompt:**
```cmd
set EVOLUTION_URL=https://your-api.example.com
set EVOLUTION_API_KEY=your-global-api-key
set HTTP_TIMEOUT=60000
```

**Windows PowerShell:**
```powershell
$env:EVOLUTION_URL="https://your-api.example.com"
$env:EVOLUTION_API_KEY="your-global-api-key"
$env:HTTP_TIMEOUT="60000"
```

### Using .env File

Create a `.env` file in your working directory:

```env
# Evolution API Configuration
EVOLUTION_URL=https://your-api.example.com
EVOLUTION_API_KEY=your-global-api-key

# Server Configuration
MCP_SERVER_NAME=my-whatsapp-server
MCP_SERVER_VERSION=1.0.0

# HTTP Configuration
HTTP_TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
MAX_RETRY_DELAY=10000

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

## Configuration File

### Basic Configuration File

Create a JSON configuration file (e.g., `evolution-config.json`):

```json
{
  "evolutionUrl": "https://your-api.example.com",
  "evolutionApiKey": "your-global-api-key",
  "server": {
    "name": "evolution-api-mcp",
    "version": "1.0.0"
  },
  "http": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "maxRetryDelay": 10000
  },
  "logging": {
    "level": "info"
  }
}
```

### Advanced Configuration File

```json
{
  "evolutionUrl": "https://your-api.example.com",
  "evolutionApiKey": "your-global-api-key",
  "server": {
    "name": "evolution-api-mcp",
    "version": "1.0.0",
    "description": "WhatsApp automation server"
  },
  "http": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "maxRetryDelay": 10000,
    "keepAlive": true,
    "maxSockets": 10
  },
  "logging": {
    "level": "info",
    "format": "json",
    "file": "/var/log/evolution-mcp.log"
  },
  "features": {
    "enableWebhooks": true,
    "enableMetrics": true,
    "enableHealthCheck": true
  },
  "security": {
    "validateSSL": true,
    "allowSelfSigned": false
  }
}
```

### Using Configuration File

```bash
# Specify configuration file
npx evolution-api-mcp --config ./evolution-config.json

# Use relative path
npx evolution-api-mcp --config ../configs/production.json

# Use absolute path
npx evolution-api-mcp --config /etc/evolution-mcp/config.json
```

## Command Line Arguments

### Available Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--config` | Path to configuration file | `--config ./config.json` |
| `--url` | Evolution API URL | `--url https://api.example.com` |
| `--key` | Evolution API key | `--key your-api-key` |
| `--timeout` | HTTP timeout in milliseconds | `--timeout 60000` |
| `--retries` | Number of retry attempts | `--retries 5` |
| `--log-level` | Logging level | `--log-level debug` |
| `--help` | Show help information | `--help` |
| `--version` | Show version information | `--version` |
| `--validate-config` | Validate configuration and exit | `--validate-config` |
| `--test-connection` | Test Evolution API connection | `--test-connection` |

### Examples

```bash
# Basic usage with command line arguments
npx evolution-api-mcp --url https://api.example.com --key your-api-key

# Override configuration file settings
npx evolution-api-mcp --config config.json --timeout 60000 --log-level debug

# Validate configuration without starting server
npx evolution-api-mcp --config config.json --validate-config

# Test connection to Evolution API
npx evolution-api-mcp --url https://api.example.com --key your-key --test-connection
```

## Claude Desktop Configuration

### Basic Claude Desktop Setup

Add to `~/.claude/mcp.json` (macOS/Linux) or `%APPDATA%\Claude\mcp.json` (Windows):

```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "npx",
      "args": ["evolution-api-mcp"],
      "env": {
        "EVOLUTION_URL": "https://your-api.example.com",
        "EVOLUTION_API_KEY": "your-global-api-key"
      }
    }
  }
}
```

### Advanced Claude Desktop Configuration

```json
{
  "mcpServers": {
    "evolution-api-production": {
      "command": "npx",
      "args": ["evolution-api-mcp"],
      "env": {
        "EVOLUTION_URL": "https://prod-api.example.com",
        "EVOLUTION_API_KEY": "prod-api-key",
        "HTTP_TIMEOUT": "60000",
        "RETRY_ATTEMPTS": "5",
        "LOG_LEVEL": "warn"
      }
    },
    "evolution-api-staging": {
      "command": "npx",
      "args": ["evolution-api-mcp", "--config", "/path/to/staging-config.json"],
      "env": {
        "NODE_ENV": "staging"
      }
    }
  }
}
```

### Using Configuration Files with Claude Desktop

```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "npx",
      "args": [
        "evolution-api-mcp",
        "--config",
        "/Users/username/.config/evolution-mcp/config.json"
      ]
    }
  }
}
```

### Development Configuration for Claude Desktop

```json
{
  "mcpServers": {
    "evolution-api-dev": {
      "command": "node",
      "args": ["/path/to/evolution-api-mcp/dist/index.js"],
      "env": {
        "EVOLUTION_URL": "http://localhost:8080",
        "EVOLUTION_API_KEY": "dev-api-key",
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Advanced Configuration

### HTTP Client Configuration

```json
{
  "http": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "maxRetryDelay": 10000,
    "keepAlive": true,
    "maxSockets": 10,
    "maxFreeSockets": 5,
    "headers": {
      "User-Agent": "Evolution-API-MCP/1.0.0"
    },
    "proxy": {
      "host": "proxy.example.com",
      "port": 8080,
      "auth": {
        "username": "proxy-user",
        "password": "proxy-pass"
      }
    }
  }
}
```

### Logging Configuration

```json
{
  "logging": {
    "level": "info",
    "format": "json",
    "file": "/var/log/evolution-mcp.log",
    "maxSize": "10MB",
    "maxFiles": 5,
    "compress": true,
    "datePattern": "YYYY-MM-DD",
    "console": {
      "enabled": true,
      "colorize": true,
      "timestamp": true
    }
  }
}
```

### Feature Flags

```json
{
  "features": {
    "enableWebhooks": true,
    "enableMetrics": true,
    "enableHealthCheck": true,
    "enableRateLimiting": true,
    "enableCaching": false,
    "enableCompression": true,
    "maxConcurrentRequests": 100
  }
}
```

### Security Configuration

```json
{
  "security": {
    "validateSSL": true,
    "allowSelfSigned": false,
    "ciphers": "ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS",
    "minVersion": "TLSv1.2",
    "maxVersion": "TLSv1.3",
    "requestSigning": {
      "enabled": false,
      "algorithm": "hmac-sha256",
      "secret": "your-signing-secret"
    }
  }
}
```

## Configuration Validation

### Validate Configuration

```bash
# Validate configuration file
npx evolution-api-mcp --config config.json --validate-config

# Validate environment variables
npx evolution-api-mcp --validate-config

# Test connection with configuration
npx evolution-api-mcp --config config.json --test-connection
```

### Configuration Schema

The server validates configuration against this schema:

```json
{
  "type": "object",
  "required": ["evolutionUrl", "evolutionApiKey"],
  "properties": {
    "evolutionUrl": {
      "type": "string",
      "format": "uri",
      "pattern": "^https?://"
    },
    "evolutionApiKey": {
      "type": "string",
      "minLength": 1
    },
    "server": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "version": {"type": "string"}
      }
    },
    "http": {
      "type": "object",
      "properties": {
        "timeout": {"type": "number", "minimum": 1000},
        "retryAttempts": {"type": "number", "minimum": 0},
        "retryDelay": {"type": "number", "minimum": 100}
      }
    }
  }
}
```

## Security Considerations

### Protecting API Keys

1. **Never commit API keys to version control**
2. **Use environment variables or secure configuration files**
3. **Set appropriate file permissions:**
   ```bash
   chmod 600 evolution-config.json
   ```
4. **Use secrets management systems in production**

### Network Security

1. **Always use HTTPS in production:**
   ```json
   {
     "evolutionUrl": "https://your-api.example.com"
   }
   ```

2. **Validate SSL certificates:**
   ```json
   {
     "security": {
       "validateSSL": true,
       "allowSelfSigned": false
     }
   }
   ```

3. **Use proxy servers when needed:**
   ```json
   {
     "http": {
       "proxy": {
         "host": "proxy.example.com",
         "port": 8080
       }
     }
   }
   ```

### Access Control

1. **Limit API key permissions in Evolution API**
2. **Use different API keys for different environments**
3. **Regularly rotate API keys**
4. **Monitor API usage and access logs**

## Environment-Specific Configurations

### Development Environment

```json
{
  "evolutionUrl": "http://localhost:8080",
  "evolutionApiKey": "dev-api-key",
  "http": {
    "timeout": 10000,
    "retryAttempts": 1
  },
  "logging": {
    "level": "debug"
  },
  "security": {
    "validateSSL": false,
    "allowSelfSigned": true
  }
}
```

### Staging Environment

```json
{
  "evolutionUrl": "https://staging-api.example.com",
  "evolutionApiKey": "staging-api-key",
  "http": {
    "timeout": 30000,
    "retryAttempts": 3
  },
  "logging": {
    "level": "info",
    "file": "/var/log/evolution-mcp-staging.log"
  }
}
```

### Production Environment

```json
{
  "evolutionUrl": "https://api.example.com",
  "evolutionApiKey": "prod-api-key",
  "http": {
    "timeout": 30000,
    "retryAttempts": 5,
    "keepAlive": true
  },
  "logging": {
    "level": "warn",
    "file": "/var/log/evolution-mcp.log",
    "maxSize": "50MB",
    "maxFiles": 10
  },
  "features": {
    "enableMetrics": true,
    "enableHealthCheck": true
  }
}
```

## Troubleshooting Configuration

### Common Configuration Issues

1. **Invalid JSON syntax:**
   ```bash
   # Validate JSON
   python -m json.tool config.json
   ```

2. **Missing required fields:**
   ```bash
   # Check configuration
   npx evolution-api-mcp --config config.json --validate-config
   ```

3. **Environment variable not loaded:**
   ```bash
   # Check environment
   echo $EVOLUTION_URL
   echo $EVOLUTION_API_KEY
   ```

4. **File permissions:**
   ```bash
   # Check file permissions
   ls -la config.json
   # Fix permissions
   chmod 644 config.json
   ```

### Configuration Debugging

Enable debug logging to troubleshoot configuration issues:

```bash
# Debug configuration loading
LOG_LEVEL=debug npx evolution-api-mcp --config config.json

# Test specific configuration
npx evolution-api-mcp --config config.json --test-connection --log-level debug
```

---

This configuration reference should help you set up the Evolution API MCP Server for any environment or use case. Start with basic configuration and add advanced features as needed.
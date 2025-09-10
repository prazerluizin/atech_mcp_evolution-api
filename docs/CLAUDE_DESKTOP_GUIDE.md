# Claude Desktop Integration Guide

This guide will walk you through setting up the Evolution API MCP Server with Claude Desktop step by step.

## Prerequisites

Before you begin, make sure you have:

- ✅ Claude Desktop installed on your computer
- ✅ An Evolution API v2 instance running
- ✅ Your Evolution API URL and global API key
- ✅ Node.js 18+ installed (for npx)

## Step 1: Verify Evolution API Access

First, let's make sure your Evolution API is accessible and your credentials work:

### Test API Connection

Open a terminal and test your API connection:

```bash
# Replace with your actual URL and API key
curl -H "apikey: YOUR_API_KEY" "https://your-evolution-api.com/instance/fetchInstances"
```

You should receive a JSON response with your instances (or an empty array if you have none yet).

### Common API URLs

- **Local Development**: `http://localhost:8080`
- **Docker**: `http://localhost:8080` or your configured port
- **Production**: `https://your-domain.com` or your server URL

## Step 2: Locate Claude Desktop Configuration

Claude Desktop uses a configuration file to manage MCP servers. The location depends on your operating system:

### macOS
```bash
~/.claude/mcp.json
```

### Windows
```bash
%APPDATA%\Claude\mcp.json
```

### Linux
```bash
~/.config/claude/mcp.json
```

## Step 3: Create or Update MCP Configuration

### If the file doesn't exist

Create the directory and file:

**macOS/Linux:**
```bash
mkdir -p ~/.claude
touch ~/.claude/mcp.json
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"
New-Item -ItemType File -Force -Path "$env:APPDATA\Claude\mcp.json"
```

### Basic Configuration

Add the following configuration to your `mcp.json` file:

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

### Advanced Configuration

For more control, you can add additional environment variables:

```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "npx",
      "args": ["evolution-api-mcp"],
      "env": {
        "EVOLUTION_URL": "https://your-evolution-api.com",
        "EVOLUTION_API_KEY": "your-global-api-key",
        "HTTP_TIMEOUT": "30000",
        "RETRY_ATTEMPTS": "3",
        "RETRY_DELAY": "1000"
      }
    }
  }
}
```

### Multiple Evolution API Instances

If you have multiple Evolution API instances, you can configure multiple servers:

```json
{
  "mcpServers": {
    "evolution-api-production": {
      "command": "npx",
      "args": ["evolution-api-mcp"],
      "env": {
        "EVOLUTION_URL": "https://prod-api.example.com",
        "EVOLUTION_API_KEY": "prod-api-key"
      }
    },
    "evolution-api-staging": {
      "command": "npx",
      "args": ["evolution-api-mcp"],
      "env": {
        "EVOLUTION_URL": "https://staging-api.example.com",
        "EVOLUTION_API_KEY": "staging-api-key"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

After updating the configuration:

1. **Completely close Claude Desktop** (make sure it's not running in the background)
2. **Restart Claude Desktop**
3. Wait for it to fully load

## Step 5: Verify the Integration

### Check MCP Server Status

In Claude Desktop, you should see an indicator that MCP servers are connected. Look for:

- A small icon or indicator showing MCP servers are active
- The ability to use Evolution API commands

### Test Basic Functionality

Try these commands in Claude Desktop to verify everything is working:

1. **List instances:**
   ```
   Can you show me all my WhatsApp instances?
   ```

2. **Get API information:**
   ```
   What's the status of my Evolution API?
   ```

3. **Create a test instance:**
   ```
   Create a new WhatsApp instance called 'test-instance'
   ```

## Step 6: First WhatsApp Connection

Once your MCP server is working, let's connect your first WhatsApp instance:

### Create an Instance

```
Create a new WhatsApp instance called 'my-whatsapp' with QR code enabled
```

### Connect to WhatsApp

```
Connect the instance 'my-whatsapp' and show me the QR code
```

Claude will provide you with a QR code that you can scan with your WhatsApp mobile app.

### Verify Connection

```
Check the status of instance 'my-whatsapp'
```

## Troubleshooting

### MCP Server Not Appearing

**Problem:** Claude Desktop doesn't show the Evolution API server as connected.

**Solutions:**
1. Check the `mcp.json` file syntax (use a JSON validator)
2. Verify file permissions (should be readable by your user)
3. Ensure npx is available in your PATH
4. Check Claude Desktop logs for error messages

### Connection Errors

**Problem:** "Connection to Evolution API failed"

**Solutions:**
1. Verify `EVOLUTION_URL` is correct and accessible
2. Test the URL in a browser or with curl
3. Check if Evolution API is running
4. Verify network connectivity and firewall settings

### Authentication Errors

**Problem:** "Authentication failed" or 401 errors

**Solutions:**
1. Double-check your `EVOLUTION_API_KEY`
2. Ensure the API key has the necessary permissions
3. Verify the API key format (no extra spaces or characters)
4. Check if the API key has expired

### NPX Issues

**Problem:** "npx command not found" or package download issues

**Solutions:**
1. Ensure Node.js 18+ is installed: `node --version`
2. Update npm: `npm install -g npm@latest`
3. Clear npx cache: `npx clear-npx-cache`
4. Try installing globally: `npm install -g evolution-api-mcp`

### Configuration File Issues

**Problem:** Configuration not loading or syntax errors

**Solutions:**
1. Validate JSON syntax using an online JSON validator
2. Check file encoding (should be UTF-8)
3. Ensure proper file permissions
4. Try creating a minimal configuration first

## Advanced Configuration

### Using Configuration Files

Instead of environment variables, you can use a configuration file:

1. Create `evolution-config.json`:
```json
{
  "evolutionUrl": "https://your-evolution-api.com",
  "evolutionApiKey": "your-global-api-key",
  "server": {
    "name": "evolution-api-mcp"
  },
  "http": {
    "timeout": 30000,
    "retryAttempts": 3
  }
}
```

2. Update your `mcp.json`:
```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "npx",
      "args": ["evolution-api-mcp", "--config", "/path/to/evolution-config.json"]
    }
  }
}
```

### Development Mode

For development, you might want to use a local build:

```json
{
  "mcpServers": {
    "evolution-api-dev": {
      "command": "node",
      "args": ["/path/to/evolution-api-mcp/dist/index.js"],
      "env": {
        "EVOLUTION_URL": "http://localhost:8080",
        "EVOLUTION_API_KEY": "your-dev-api-key"
      }
    }
  }
}
```

## Security Best Practices

### Protect Your API Keys

1. **Never commit API keys to version control**
2. **Use environment variables or secure configuration files**
3. **Regularly rotate your API keys**
4. **Limit API key permissions to what's necessary**

### Network Security

1. **Use HTTPS for production Evolution API instances**
2. **Consider using VPN or private networks for sensitive deployments**
3. **Implement proper firewall rules**
4. **Monitor API access logs**

## Next Steps

Once you have Claude Desktop integrated with Evolution API:

1. **Explore the available commands** - See [API_REFERENCE.md](./API_REFERENCE.md)
2. **Try common workflows** - See [EXAMPLES.md](./EXAMPLES.md)
3. **Set up webhooks** for real-time notifications
4. **Create automated workflows** using Claude's capabilities

## Getting Help

If you encounter issues:

1. **Check the logs** - Claude Desktop usually shows error messages
2. **Verify your configuration** - Double-check all URLs and API keys
3. **Test your Evolution API** independently
4. **Consult the troubleshooting guide** - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
5. **Open an issue** on GitHub with detailed error information

---

**Congratulations!** 🎉 You now have Claude Desktop integrated with Evolution API. You can start managing WhatsApp instances and sending messages directly through Claude.
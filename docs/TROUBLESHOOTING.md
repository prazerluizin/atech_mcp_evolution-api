# Troubleshooting Guide

This guide helps you resolve common issues when using the Evolution API MCP Server.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Connection Issues](#connection-issues)
- [Authentication Errors](#authentication-errors)
- [Instance Management Issues](#instance-management-issues)
- [Message Sending Problems](#message-sending-problems)
- [Claude Desktop Integration](#claude-desktop-integration)
- [Performance Issues](#performance-issues)
- [Debugging Tips](#debugging-tips)

## Installation Issues

### NPX Command Not Found

**Error:**
```
npx: command not found
```

**Solution:**
1. Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Verify installation: `node --version && npm --version`
3. Update npm: `npm install -g npm@latest`

### Package Download Fails

**Error:**
```
npm ERR! network request failed
```

**Solutions:**
1. Check internet connection
2. Clear npm cache: `npm cache clean --force`
3. Try different registry: `npm config set registry https://registry.npmjs.org/`
4. Use VPN if behind corporate firewall

### Permission Errors (Linux/macOS)

**Error:**
```
EACCES: permission denied
```

**Solutions:**
1. Don't use sudo with npx
2. Fix npm permissions: `npm config set prefix ~/.npm-global`
3. Add to PATH: `export PATH=~/.npm-global/bin:$PATH`

## Configuration Problems

### Environment Variables Not Loading

**Problem:** Server starts but can't connect to Evolution API

**Solutions:**
1. Check variable names (case-sensitive):
   ```bash
   echo $EVOLUTION_URL
   echo $EVOLUTION_API_KEY
   ```

2. For Windows Command Prompt:
   ```cmd
   echo %EVOLUTION_URL%
   echo %EVOLUTION_API_KEY%
   ```

3. Create `.env` file in working directory:
   ```env
   EVOLUTION_URL=https://your-api.com
   EVOLUTION_API_KEY=your-key
   ```

### Invalid Configuration File

**Error:**
```
Configuration validation failed
```

**Solutions:**
1. Validate JSON syntax using [jsonlint.com](https://jsonlint.com/)
2. Check required fields:
   ```json
   {
     "evolutionUrl": "https://your-api.com",
     "evolutionApiKey": "your-key"
   }
   ```
3. Verify file encoding is UTF-8
4. Check file permissions (readable)

### Configuration Priority Issues

**Problem:** Wrong configuration being used

**Priority Order (highest to lowest):**
1. Command line arguments
2. Environment variables
3. Configuration file
4. Default values

**Solution:** Use environment variables to override file settings.

## Connection Issues

### Evolution API Unreachable

**Error:**
```
Error: Connection to Evolution API failed
ECONNREFUSED 127.0.0.1:8080
```

**Diagnostic Steps:**
1. Test API directly:
   ```bash
   curl -I https://your-evolution-api.com
   ```

2. Check if Evolution API is running:
   ```bash
   # For Docker
   docker ps | grep evolution
   
   # For PM2
   pm2 list
   ```

3. Verify URL format:
   - ✅ `https://api.example.com`
   - ✅ `http://localhost:8080`
   - ❌ `api.example.com` (missing protocol)
   - ❌ `https://api.example.com/` (trailing slash)

### SSL/TLS Certificate Issues

**Error:**
```
Error: certificate verify failed
```

**Solutions:**
1. For development only (not recommended for production):
   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

2. Update certificates:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ca-certificates
   
   # CentOS/RHEL
   sudo yum update ca-certificates
   ```

3. Use HTTP for local development:
   ```env
   EVOLUTION_URL=http://localhost:8080
   ```

### Network Timeout Issues

**Error:**
```
Error: timeout of 30000ms exceeded
```

**Solutions:**
1. Increase timeout:
   ```env
   HTTP_TIMEOUT=60000
   ```

2. Check network latency:
   ```bash
   ping your-evolution-api.com
   ```

3. Test with curl:
   ```bash
   curl -w "@curl-format.txt" -o /dev/null -s "https://your-api.com"
   ```

## Authentication Errors

### Invalid API Key

**Error:**
```
Error: Authentication failed (401)
```

**Solutions:**
1. Verify API key format (no spaces, correct length)
2. Check Evolution API logs for authentication attempts
3. Test API key directly:
   ```bash
   curl -H "apikey: YOUR_KEY" "https://your-api.com/instance/fetchInstances"
   ```

4. Regenerate API key in Evolution API admin panel

### API Key Permissions

**Error:**
```
Error: Forbidden (403)
```

**Solutions:**
1. Check API key permissions in Evolution API
2. Ensure global API key is used (not instance-specific)
3. Verify API key hasn't expired

### Missing Authentication Header

**Error:**
```
Error: apikey header is required
```

**Solution:** This indicates a bug in the MCP server. Please report it with:
- Your configuration (without sensitive data)
- Steps to reproduce
- Full error message

## Instance Management Issues

### Instance Creation Fails

**Error:**
```
Error: Instance creation failed
```

**Common Causes:**
1. **Duplicate instance name:**
   ```
   Instance 'my-bot' already exists
   ```
   Solution: Use a different name or delete existing instance

2. **Invalid instance name:**
   ```
   Instance name contains invalid characters
   ```
   Solution: Use only letters, numbers, hyphens, and underscores

3. **Resource limits:**
   ```
   Maximum instances reached
   ```
   Solution: Delete unused instances or upgrade your plan

### QR Code Not Generating

**Problem:** Instance created but no QR code appears

**Solutions:**
1. Ensure `qrcode: true` in creation request
2. Check instance status: should be "connecting"
3. Wait 30-60 seconds for QR code generation
4. Restart instance if stuck

### Instance Connection Timeout

**Problem:** QR code generated but instance won't connect

**Solutions:**
1. Ensure QR code is scanned within 60 seconds
2. Check WhatsApp app is updated
3. Try restarting WhatsApp app
4. Delete and recreate instance if persistent

### Instance Status Issues

**Problem:** Instance shows wrong status

**Status Meanings:**
- `created`: Just created, not connected
- `connecting`: Waiting for QR code scan
- `open`: Connected and ready
- `close`: Disconnected
- `error`: Error state

**Solutions:**
1. Restart instance: `restart-instance`
2. Check Evolution API logs
3. Recreate instance if in error state

## Message Sending Problems

### Invalid Phone Number Format

**Error:**
```
Error: Invalid phone number format
```

**Solutions:**
1. Use international format without '+':
   - ✅ `5511999999999`
   - ❌ `+55 11 99999-9999`
   - ❌ `11999999999`

2. Validate number exists:
   ```json
   {
     "instance": "my-bot",
     "numbers": ["5511999999999"]
   }
   ```

### Message Delivery Failures

**Error:**
```
Error: Message not delivered
```

**Common Causes:**
1. **Number not on WhatsApp:**
   Solution: Use `check-is-whatsapp` first

2. **Instance disconnected:**
   Solution: Check instance status and reconnect

3. **Rate limiting:**
   Solution: Add delays between messages

4. **Blocked by recipient:**
   Solution: No technical solution, contact recipient

### Media Upload Issues

**Error:**
```
Error: Failed to upload media
```

**Solutions:**
1. **Check file size limits:**
   - Images: 16MB max
   - Videos: 64MB max
   - Documents: 100MB max

2. **Verify media URL accessibility:**
   ```bash
   curl -I https://your-media-url.com/image.jpg
   ```

3. **Check media format support:**
   - Images: JPG, PNG, GIF, WebP
   - Videos: MP4, AVI, MOV
   - Audio: MP3, AAC, OGG, WAV

4. **Use base64 for small files:**
   ```json
   {
     "media": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
   }
   ```

## Claude Desktop Integration

### MCP Server Not Appearing

**Problem:** Evolution API server doesn't show in Claude Desktop

**Solutions:**
1. **Check mcp.json syntax:**
   ```bash
   # Validate JSON
   python -m json.tool ~/.claude/mcp.json
   ```

2. **Verify file location:**
   - macOS: `~/.claude/mcp.json`
   - Windows: `%APPDATA%\Claude\mcp.json`
   - Linux: `~/.config/claude/mcp.json`

3. **Check file permissions:**
   ```bash
   ls -la ~/.claude/mcp.json
   chmod 644 ~/.claude/mcp.json
   ```

4. **Restart Claude Desktop completely**

### MCP Server Connection Failed

**Error in Claude Desktop:**
```
MCP server 'evolution-api' failed to start
```

**Solutions:**
1. **Test npx command manually:**
   ```bash
   EVOLUTION_URL=your-url EVOLUTION_API_KEY=your-key npx evolution-api-mcp
   ```

2. **Check Claude Desktop logs:**
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

3. **Use absolute paths:**
   ```json
   {
     "command": "/usr/local/bin/npx",
     "args": ["evolution-api-mcp"]
   }
   ```

### Environment Variables Not Working

**Problem:** Variables in mcp.json not being used

**Solutions:**
1. **Check variable syntax:**
   ```json
   {
     "env": {
       "EVOLUTION_URL": "https://api.example.com",
       "EVOLUTION_API_KEY": "your-key"
     }
   }
   ```

2. **Use configuration file instead:**
   ```json
   {
     "args": ["evolution-api-mcp", "--config", "/path/to/config.json"]
   }
   ```

## Performance Issues

### Slow Response Times

**Problem:** Commands take too long to execute

**Solutions:**
1. **Check network latency to Evolution API**
2. **Increase timeout values:**
   ```env
   HTTP_TIMEOUT=60000
   ```
3. **Use local Evolution API instance**
4. **Check Evolution API server resources**

### Memory Usage Issues

**Problem:** High memory consumption

**Solutions:**
1. **Restart MCP server periodically**
2. **Limit concurrent operations**
3. **Check for memory leaks in Evolution API**

### Rate Limiting

**Problem:** Too many requests error

**Solutions:**
1. **Add delays between operations:**
   ```json
   {
     "delay": 1000
   }
   ```
2. **Implement exponential backoff**
3. **Use batch operations when available**

## Debugging Tips

### Enable Debug Logging

Set environment variable:
```bash
export DEBUG=evolution-api-mcp:*
```

### Check Evolution API Logs

**Docker:**
```bash
docker logs evolution-api-container
```

**PM2:**
```bash
pm2 logs evolution-api
```

### Test API Endpoints Directly

```bash
# Test authentication
curl -H "apikey: YOUR_KEY" "https://your-api.com/instance/fetchInstances"

# Test instance creation
curl -X POST \
  -H "apikey: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"test"}' \
  "https://your-api.com/instance/create"
```

### Validate Configuration

```bash
# Test configuration loading
npx evolution-api-mcp --validate-config

# Test connection
npx evolution-api-mcp --test-connection
```

### Common Debug Commands

```bash
# Check Node.js version
node --version

# Check npm configuration
npm config list

# Clear npm cache
npm cache clean --force

# Check network connectivity
ping your-evolution-api.com
nslookup your-evolution-api.com

# Test SSL certificate
openssl s_client -connect your-api.com:443 -servername your-api.com
```

## Getting Help

If you can't resolve the issue:

1. **Gather information:**
   - Error messages (full text)
   - Configuration (remove sensitive data)
   - Steps to reproduce
   - Environment details (OS, Node.js version)

2. **Check existing issues:**
   - [GitHub Issues](https://github.com/your-repo/evolution-api-mcp/issues)
   - [Evolution API Issues](https://github.com/EvolutionAPI/evolution-api/issues)

3. **Create detailed bug report:**
   - Include all gathered information
   - Use issue templates
   - Add relevant logs

4. **Community support:**
   - Discord server
   - Stack Overflow (tag: evolution-api-mcp)
   - Reddit communities

## Preventive Measures

### Regular Maintenance

1. **Update dependencies regularly:**
   ```bash
   npm update -g evolution-api-mcp
   ```

2. **Monitor Evolution API health:**
   ```bash
   curl -H "apikey: YOUR_KEY" "https://your-api.com/get-information"
   ```

3. **Backup configurations:**
   ```bash
   cp ~/.claude/mcp.json ~/.claude/mcp.json.backup
   ```

### Best Practices

1. **Use environment variables for sensitive data**
2. **Implement proper error handling in your applications**
3. **Monitor API usage and limits**
4. **Keep Evolution API updated**
5. **Use HTTPS in production**
6. **Implement logging and monitoring**

---

**Still having issues?** Don't hesitate to reach out for help. The community is here to support you!
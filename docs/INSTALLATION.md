# Installation Guide

This guide provides detailed instructions for installing and setting up the Evolution API MCP Server in various environments.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Installation](#quick-installation)
- [Installation Methods](#installation-methods)
- [Evolution API Setup](#evolution-api-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (comes with Node.js)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+, CentOS 7+)
- **Memory**: 512 MB RAM available
- **Storage**: 100 MB free disk space
- **Network**: Internet connection for package downloads and Evolution API access

### Recommended Requirements

- **Node.js**: 20.0.0 or higher (LTS version)
- **npm**: 10.0.0 or higher
- **Memory**: 1 GB RAM available
- **Storage**: 500 MB free disk space
- **Network**: Stable broadband connection

### Evolution API Requirements

- **Evolution API**: v2.0.0 or higher
- **Global API Key**: Required for authentication
- **Network Access**: HTTP/HTTPS access to Evolution API instance

## Quick Installation

### Using NPX (Recommended)

The fastest way to get started is using npx, which doesn't require installation:

```bash
# Set your Evolution API credentials
export EVOLUTION_URL="https://your-evolution-api.com"
export EVOLUTION_API_KEY="your-global-api-key"

# Run the MCP server
npx evolution-api-mcp
```

**Windows (Command Prompt):**
```cmd
set EVOLUTION_URL=https://your-evolution-api.com
set EVOLUTION_API_KEY=your-global-api-key
npx evolution-api-mcp
```

**Windows (PowerShell):**
```powershell
$env:EVOLUTION_URL="https://your-evolution-api.com"
$env:EVOLUTION_API_KEY="your-global-api-key"
npx evolution-api-mcp
```

### Global Installation

For frequent use, install globally:

```bash
npm install -g evolution-api-mcp
evolution-api-mcp
```

## Installation Methods

### Method 1: NPX (No Installation)

**Pros:**
- No installation required
- Always uses latest version
- No global package pollution
- Easy to use different versions

**Cons:**
- Downloads package each time (first run)
- Requires internet connection
- Slightly slower startup

**Usage:**
```bash
npx evolution-api-mcp [options]
```

### Method 2: Global Installation

**Pros:**
- Faster startup after installation
- Works offline after installation
- Simple command usage

**Cons:**
- Requires manual updates
- Global package management
- Version conflicts possible

**Installation:**
```bash
npm install -g evolution-api-mcp
```

**Usage:**
```bash
evolution-api-mcp [options]
```

### Method 3: Local Project Installation

**Pros:**
- Version locked to project
- No global dependencies
- Easy to manage in teams

**Cons:**
- Requires project setup
- More complex usage

**Installation:**
```bash
mkdir my-whatsapp-project
cd my-whatsapp-project
npm init -y
npm install evolution-api-mcp
```

**Usage:**
```bash
npx evolution-api-mcp [options]
# or
./node_modules/.bin/evolution-api-mcp [options]
```

### Method 4: Development Installation

For contributing or customizing:

```bash
git clone https://github.com/your-repo/evolution-api-mcp.git
cd evolution-api-mcp
npm install
npm run build
npm link
```

## Evolution API Setup

### Prerequisites

Before installing the MCP server, you need a running Evolution API instance.

### Option 1: Docker Installation (Recommended)

```bash
# Pull the Evolution API image
docker pull atendai/evolution-api:v2.0.0

# Run Evolution API
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="your-global-api-key" \
  -e DATABASE_ENABLED=true \
  -e DATABASE_CONNECTION_URI="mongodb://localhost:27017/evolution" \
  atendai/evolution-api:v2.0.0
```

### Option 2: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:v2.0.0
    container_name: evolution-api
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=your-global-api-key
      - DATABASE_ENABLED=true
      - DATABASE_CONNECTION_URI=mongodb://mongodb:27017/evolution
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    container_name: evolution-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose up -d
```

### Option 3: Manual Installation

```bash
# Clone Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start the API
npm run start:prod
```

### Evolution API Configuration

Key environment variables for Evolution API:

```env
# Authentication
AUTHENTICATION_API_KEY=your-global-api-key

# Database
DATABASE_ENABLED=true
DATABASE_CONNECTION_URI=mongodb://localhost:27017/evolution

# Server
SERVER_PORT=8080
SERVER_URL=http://localhost:8080

# Webhooks (optional)
WEBHOOK_GLOBAL_ENABLED=false
WEBHOOK_GLOBAL_URL=https://your-webhook-url.com

# Logs
LOG_LEVEL=ERROR
LOG_COLOR=false
```

### Verify Evolution API

Test your Evolution API installation:

```bash
# Check API status
curl -H "apikey: your-global-api-key" "http://localhost:8080/instance/fetchInstances"

# Should return: []
```

## Installation Verification

### Step 1: Check Node.js Installation

```bash
node --version
# Should show v18.0.0 or higher

npm --version
# Should show 8.0.0 or higher
```

### Step 2: Test MCP Server Installation

```bash
# Test with npx
npx evolution-api-mcp --version

# Test with global installation
evolution-api-mcp --version
```

### Step 3: Validate Configuration

```bash
# Set environment variables
export EVOLUTION_URL="http://localhost:8080"
export EVOLUTION_API_KEY="your-global-api-key"

# Validate configuration
npx evolution-api-mcp --validate-config
```

### Step 4: Test Connection

```bash
# Test Evolution API connection
npx evolution-api-mcp --test-connection
```

Expected output:
```
✅ Configuration valid
✅ Evolution API connection successful
✅ Authentication successful
ℹ️  Evolution API version: 2.0.0
ℹ️  Available instances: 0
```

### Step 5: Test MCP Server

```bash
# Start MCP server
npx evolution-api-mcp

# Should show:
# Evolution API MCP Server v1.0.0
# Server initialized successfully
# Listening for MCP connections...
```

## Troubleshooting

### Node.js Installation Issues

**Problem:** `node: command not found`

**Solutions:**
1. **Install Node.js from official website:**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download LTS version for your OS
   - Follow installation instructions

2. **Using package managers:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
   sudo yum install -y nodejs

   # macOS (Homebrew)
   brew install node

   # Windows (Chocolatey)
   choco install nodejs
   ```

3. **Using Node Version Manager (nvm):**
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Restart terminal or source profile
   source ~/.bashrc

   # Install and use Node.js LTS
   nvm install --lts
   nvm use --lts
   ```

### NPM Permission Issues

**Problem:** `EACCES: permission denied`

**Solutions:**
1. **Fix npm permissions (Linux/macOS):**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Use npx instead of global installation:**
   ```bash
   npx evolution-api-mcp
   ```

### Package Download Issues

**Problem:** `npm ERR! network request failed`

**Solutions:**
1. **Check internet connection**
2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```
3. **Use different registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```
4. **Configure proxy (if behind corporate firewall):**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

### Evolution API Connection Issues

**Problem:** `Connection to Evolution API failed`

**Solutions:**
1. **Check Evolution API status:**
   ```bash
   curl -I http://localhost:8080
   ```

2. **Verify API key:**
   ```bash
   curl -H "apikey: your-key" "http://localhost:8080/instance/fetchInstances"
   ```

3. **Check firewall settings**
4. **Verify URL format (include http:// or https://)**

### Environment Variable Issues

**Problem:** Environment variables not loading

**Solutions:**
1. **Check variable names (case-sensitive)**
2. **Use .env file:**
   ```env
   EVOLUTION_URL=http://localhost:8080
   EVOLUTION_API_KEY=your-global-api-key
   ```
3. **Verify file location (same directory as command)**

### Windows-Specific Issues

**Problem:** `'npx' is not recognized as an internal or external command`

**Solutions:**
1. **Restart Command Prompt/PowerShell after Node.js installation**
2. **Add Node.js to PATH manually:**
   - Open System Properties → Environment Variables
   - Add Node.js installation path to PATH
   - Restart terminal

2. **Use full path:**
   ```cmd
   "C:\Program Files\nodejs\npx.exe" evolution-api-mcp
   ```

### macOS-Specific Issues

**Problem:** `command not found` after installation

**Solutions:**
1. **Check shell profile:**
   ```bash
   echo $SHELL
   # Add to appropriate file: ~/.bashrc, ~/.zshrc, etc.
   ```

2. **Reload shell configuration:**
   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

### Linux-Specific Issues

**Problem:** Permission denied errors

**Solutions:**
1. **Don't use sudo with npm:**
   ```bash
   # Wrong
   sudo npm install -g evolution-api-mcp

   # Right
   npm install -g evolution-api-mcp
   ```

2. **Fix npm permissions as described above**

## Next Steps

After successful installation:

1. **Configure Claude Desktop Integration:**
   - See [Claude Desktop Guide](./CLAUDE_DESKTOP_GUIDE.md)

2. **Explore Available Tools:**
   - See [API Reference](./API_REFERENCE.md)

3. **Try Example Workflows:**
   - See [Examples](./EXAMPLES.md)

4. **Set Up Production Environment:**
   - See [Configuration Guide](./CONFIGURATION.md)

5. **Join the Community:**
   - GitHub Discussions
   - Discord Server
   - Stack Overflow

## Getting Help

If you encounter issues during installation:

1. **Check the troubleshooting section above**
2. **Search existing GitHub issues**
3. **Create a new issue with:**
   - Operating system and version
   - Node.js and npm versions
   - Complete error messages
   - Steps to reproduce

4. **Join community discussions for help**

---

**Congratulations!** 🎉 You now have the Evolution API MCP Server installed and ready to use with Claude Desktop or other MCP clients.
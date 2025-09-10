# Evolution API MCP Server

[![npm version](https://badge.fury.io/js/evolution-api-mcp.svg)](https://badge.fury.io/js/evolution-api-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for Evolution API v2 integration. This server allows you to integrate WhatsApp functionality through the Evolution API directly into Claude Desktop and other MCP-compatible clients.

## 🚀 Quick Start

### Installation

The easiest way to use this MCP server is via npx (no installation required):

```bash
npx evolution-api-mcp
```

Or install globally:

```bash
npm install -g evolution-api-mcp
```

### Basic Configuration

Set the required environment variables:

```bash
export EVOLUTION_URL=https://your-evolution-api.com
export EVOLUTION_API_KEY=your-global-api-key
```

Or create a `.env` file:

```env
EVOLUTION_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-global-api-key
```

### Claude Desktop Integration

Add to your Claude Desktop MCP configuration (`~/.claude/mcp.json`):

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

## 📋 Features

### Instance Management
- ✅ Create and manage WhatsApp instances
- ✅ Connect instances with QR code generation
- ✅ Restart and delete instances
- ✅ Set presence status (online, offline, typing, etc.)

### Message Operations
- ✅ Send text messages
- ✅ Send media (images, videos, documents, audio)
- ✅ Send stickers and reactions
- ✅ Send location and contact information
- ✅ Send interactive messages (polls, lists, buttons)

### Chat Management
- ✅ Find and search messages
- ✅ Manage contacts and chats
- ✅ Mark messages as read/unread
- ✅ Archive and unarchive chats
- ✅ Check if number is on WhatsApp

### Group Operations
- ✅ Create and manage groups
- ✅ Update group settings (name, description, picture)
- ✅ Manage participants (add, remove, promote, demote)
- ✅ Generate and manage invite codes

### Profile & Settings
- ✅ Update profile information
- ✅ Manage privacy settings
- ✅ Configure webhooks
- ✅ Get API information and status

## 🛠️ Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EVOLUTION_URL` | ✅ | Evolution API base URL | `https://api.example.com` |
| `EVOLUTION_API_KEY` | ✅ | Global API key | `your-api-key-here` |
| `MCP_SERVER_NAME` | ❌ | Server name for MCP | `evolution-api-mcp` |
| `HTTP_TIMEOUT` | ❌ | Request timeout in ms | `30000` |
| `RETRY_ATTEMPTS` | ❌ | Number of retry attempts | `3` |
| `RETRY_DELAY` | ❌ | Delay between retries in ms | `1000` |

### Configuration File

You can also use a configuration file (`evolution-config.json`):

```json
{
  "evolutionUrl": "https://your-evolution-api.com",
  "evolutionApiKey": "your-global-api-key",
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

Then run with:

```bash
npx evolution-api-mcp --config evolution-config.json
```

## 📖 Usage Examples

### Basic Instance Management

```bash
# In Claude Desktop, you can ask:
"Create a new WhatsApp instance called 'my-bot'"
"Connect the instance 'my-bot' and show me the QR code"
"List all my WhatsApp instances"
```

### Sending Messages

```bash
# In Claude Desktop:
"Send a text message 'Hello World!' to +5511999999999 using instance 'my-bot'"
"Send an image from https://example.com/image.jpg to +5511999999999"
"Send a location (latitude: -23.5505, longitude: -46.6333) to +5511999999999"
```

### Group Management

```bash
# In Claude Desktop:
"Create a group called 'My Group' with participants +5511999999999 and +5511888888888"
"Add +5511777777777 to the group 'My Group'"
"Update the group description to 'Welcome to our group!'"
```

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Evolution API v2 instance

### Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/evolution-api-mcp.git
cd evolution-api-mcp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Evolution API credentials

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
evolution-api-mcp/
├── src/
│   ├── cli/                 # CLI interface
│   ├── clients/             # HTTP client for Evolution API
│   ├── config/              # Configuration management
│   ├── registry/            # Endpoint definitions
│   ├── server/              # MCP server implementation
│   └── utils/               # Utilities and helpers
├── tests/                   # Test files
├── bin/                     # Executable files
└── docs/                    # Documentation
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the project |
| `npm run dev` | Run in development mode |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm start` | Start the built server |

## 📚 Documentation

### Quick Start Guides
- [Installation Guide](./docs/INSTALLATION.md) - Detailed installation instructions
- [Claude Desktop Guide](./docs/CLAUDE_DESKTOP_GUIDE.md) - Step-by-step Claude Desktop setup
- [Configuration Guide](./docs/CONFIGURATION.md) - Complete configuration reference

### Reference Documentation
- [API Reference](./docs/API_REFERENCE.md) - Complete tool documentation
- [Examples](./docs/EXAMPLES.md) - Usage scenarios and workflows
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Developer Resources
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [Changelog](./CHANGELOG.md) - Version history and changes

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**
```
Error: Connection to Evolution API failed
```
- Check if `EVOLUTION_URL` is correct and accessible
- Verify `EVOLUTION_API_KEY` is valid
- Ensure Evolution API is running and healthy

**Instance Not Found**
```
Error: Instance 'my-instance' not found
```
- Check if the instance name is correct
- Verify the instance was created successfully
- List all instances to see available ones

**Authentication Error**
```
Error: Authentication failed
```
- Verify your `EVOLUTION_API_KEY` is correct
- Check if the API key has the necessary permissions
- Ensure the API key hasn't expired

For more troubleshooting information, see [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Evolution API](https://github.com/EvolutionAPI/evolution-api) - The WhatsApp API this server integrates with
- [Model Context Protocol](https://github.com/modelcontextprotocol) - The protocol specification
- [Claude Desktop](https://claude.ai/desktop) - Primary client for this MCP server

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/evolution-api-mcp/issues)
- 📖 Documentation: [Full Documentation](https://docs.example.com)

---

Made with ❤️ for the Evolution API and MCP community
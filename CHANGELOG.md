# Changelog

All notable changes to the Evolution API MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of Evolution API MCP Server
- Support for all Evolution API v2 endpoints
- Claude Desktop integration via STDIO transport
- Comprehensive error handling and retry logic
- Configuration management with multiple sources
- Complete test suite with unit, integration, and e2e tests
- Comprehensive documentation and examples

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- N/A (initial release)

## [1.0.0] - 2024-01-XX

### Added
- **Instance Management**
  - Create, connect, restart, and delete WhatsApp instances
  - QR code generation for WhatsApp pairing
  - Instance status monitoring and management
  - Presence status control (online, offline, typing, etc.)

- **Message Operations**
  - Send text messages with delay support
  - Send media messages (images, videos, documents, audio)
  - Send stickers and reactions
  - Send location and contact information
  - Send interactive messages (polls, lists, buttons)
  - Message delivery tracking and error handling

- **Chat Management**
  - Search and retrieve messages with filtering
  - Manage contacts and chat lists
  - Mark messages as read/unread
  - Archive and unarchive chats
  - Check if numbers are registered on WhatsApp
  - Send typing and recording indicators

- **Group Operations**
  - Create and manage WhatsApp groups
  - Update group settings (name, description, picture)
  - Manage group participants (add, remove, promote, demote)
  - Generate and manage group invite codes
  - Leave groups

- **Profile & Settings**
  - Update profile information (name, status, picture)
  - Manage privacy settings
  - Configure webhooks for real-time events
  - Get Evolution API information and status

- **MCP Integration**
  - Full MCP TypeScript SDK integration
  - STDIO transport for Claude Desktop
  - Automatic tool registration from endpoint definitions
  - Zod schema validation for all parameters
  - Structured error responses with suggestions

- **Configuration Management**
  - Environment variable support
  - JSON configuration files
  - Command line argument parsing
  - Configuration validation and testing
  - Multiple configuration source priority

- **HTTP Client**
  - Axios-based HTTP client with Evolution API integration
  - Automatic authentication header injection
  - Retry logic with exponential backoff
  - Request/response logging and debugging
  - Timeout and connection management

- **Error Handling**
  - Comprehensive error type definitions
  - User-friendly error messages with suggestions
  - Automatic retry for transient failures
  - Detailed error logging and debugging
  - Graceful degradation for network issues

- **Testing**
  - Unit tests for all core components
  - Integration tests with mock Evolution API
  - End-to-end tests for MCP protocol
  - Test utilities and fixtures
  - Comprehensive test coverage validation

- **Documentation**
  - Complete README with installation and setup
  - Step-by-step Claude Desktop integration guide
  - Comprehensive API reference for all tools
  - Usage examples and common workflows
  - Troubleshooting guide for common issues
  - Configuration reference documentation
  - Contributing guidelines for developers

- **Development Tools**
  - TypeScript configuration and build system
  - ESLint and Prettier for code quality
  - Jest testing framework setup
  - NPX executable configuration
  - Development and production build scripts

### Technical Details

- **Dependencies**
  - `@modelcontextprotocol/sdk`: ^1.17.5 - MCP TypeScript SDK
  - `axios`: ^1.11.0 - HTTP client for Evolution API
  - `zod`: ^3.25.76 - Schema validation
  - `dotenv`: ^17.2.2 - Environment variable loading
  - `express`: ^4.18.2 - HTTP server (for future HTTP transport)

- **Development Dependencies**
  - `typescript`: ^5.9.2 - TypeScript compiler
  - `jest`: ^30.1.3 - Testing framework
  - `tsx`: ^4.20.5 - TypeScript execution
  - Various type definitions and testing utilities

- **Node.js Compatibility**
  - Requires Node.js 18.0.0 or higher
  - Supports all major operating systems (Windows, macOS, Linux)
  - NPX compatible for easy installation and execution

- **Evolution API Compatibility**
  - Supports Evolution API v2.x
  - Compatible with all Evolution API deployment methods
  - Supports both HTTP and HTTPS connections
  - Works with Docker, PM2, and standalone deployments

### Breaking Changes
- N/A (initial release)

### Migration Guide
- N/A (initial release)

---

## Release Notes Format

Each release includes:

### Added
New features and capabilities

### Changed
Changes to existing functionality

### Deprecated
Features that will be removed in future versions

### Removed
Features that have been removed

### Fixed
Bug fixes and issue resolutions

### Security
Security-related changes and fixes

---

## Upcoming Features

Features planned for future releases:

### v1.1.0 (Planned)
- HTTP transport support for non-Claude MCP clients
- Webhook event forwarding to MCP clients
- Message templates and bulk operations
- Advanced filtering and search capabilities
- Performance metrics and monitoring

### v1.2.0 (Planned)
- Multi-instance load balancing
- Message scheduling and automation
- Integration with external CRM systems
- Advanced group management features
- Custom tool creation framework

### v2.0.0 (Future)
- Evolution API v3 support
- Breaking changes for improved architecture
- Enhanced security features
- Advanced analytics and reporting
- Plugin system for extensibility

---

## Support and Compatibility

### Supported Versions

| Version | Evolution API | Node.js | Support Status |
|---------|---------------|---------|----------------|
| 1.0.x   | 2.x          | 18+     | ✅ Active      |

### End of Life Policy

- **Major versions**: Supported for 2 years after release
- **Minor versions**: Supported until next major version
- **Patch versions**: Supported until next minor version

### Security Updates

Security updates are provided for:
- Current major version
- Previous major version (for 6 months after new major release)

---

For detailed information about any release, see the corresponding GitHub release notes and documentation.
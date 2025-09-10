# Implementation Plan

- [x] 1. Set up project structure and core dependencies





  - Create NPM package structure with TypeScript configuration
  - Install MCP TypeScript SDK and required dependencies (axios, zod, dotenv)
  - Configure build scripts and NPX executable entry point
  - Set up Jest testing framework and basic test structure
  - _Requirements: 1.1, 1.4_

- [x] 2. Implement configuration management system





  - Create configuration interfaces and schemas using Zod
  - Implement environment variable loading with dotenv
  - Add configuration file support (JSON format)
  - Implement configuration validation with clear error messages
  - Create configuration priority system (env vars > config file > defaults)
  - _Requirements: 2.1, 2.2, 2.3, 9.1, 9.2, 9.3, 9.4_

- [x] 3. Create Evolution API endpoint registry




  - Define endpoint information interfaces and types
  - Implement static endpoint registry with all Evolution API v2 endpoints
  - Add endpoint definitions for Instance Controller (create, connect, restart, delete, set-presence)
  - Add endpoint definitions for Message Controller (send-text, send-media, send-audio, send-sticker, send-location, send-contact, send-reaction, send-poll, send-list, send-button)
  - Add endpoint definitions for Chat Controller (find-messages, find-contacts, find-chats, mark-as-read, archive-chat, check-is-whatsapp, send-presence)
  - Add endpoint definitions for Group Controller (create, update-picture, update-subject, update-description, fetch-invite-code, update-participant, leave-group)
  - Add endpoint definitions for Profile Settings (fetch-profile, update-profile-name, update-profile-status, update-profile-picture, fetch-privacy-settings)
  - Add endpoint definitions for Webhook Management (set-webhook, get-webhook)
  - Add endpoint definitions for Get Information endpoint
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
- [x] 4. Implement HTTP client for Evolution API




- [ ] 4. Implement HTTP client for Evolution API

  - Create HTTP client class with axios integration
  - Implement automatic API key authentication in headers
  - Add request/response interceptors for logging and error handling
  - Implement retry logic with exponential backoff for network failures
  - Add timeout configuration and connection pooling
  - Create typed response interfaces for API responses
  - _Requirements: 4.1, 4.8, 4.9, 4.10, 4.11, 5.1, 5.3_

- [x] 5. Create MCP tool registry and tool generation





  - Implement tool registry class for managing MCP tools
  - Create tool factory functions for each Evolution API controller
  - Generate Zod schemas for tool parameters based on endpoint definitions
  - Implement dynamic tool registration from endpoint registry
  - Add tool validation and parameter transformation logic
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.7, 4.10_




- [ ] 6. Implement MCP server core with STDIO transport

  - Create main MCP server class using MCP TypeScript SDK
  - Implement STDIO transport for Claude Desktop integration
  - Add server initialization and tool registration logic


  - Implement request handlers for all registered tools

  - Add proper error handling and response formatting for Claude Desktop
  - _Requirements: 1.1, 1.2, 8.1, 8.2, 8.4_

- [ ] 7. Create tool implementations for Instance Controller

  - Implement create-instance tool with proper parameter validation


  - Implement fetch-instances tool to list all instances
  - Implement instance-connect tool for QR code generation
  - Implement restart-instance and delete-instance tools
  - Implement set-presence tool for online status management
  - Add proper error handling with user-friendly messages
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 6.1, 6.2, 7.1_

- [x] 8. Create tool implementations for Message Controller





  - Implement send-text-message tool with number and text validation
  - Implement send-media-message tool supporting images, videos, and documents
  - Implement send-audio-message tool for voice messages
  - Implement send-sticker, send-location, and send-contact tools
  - Implement send-reaction tool for message reactions
  - Implement send-poll, send-list, and send-button tools for interactive messages
  - Add delay parameter support for all message sending tools
  - _Requirements: 4.1, 4.3, 4.5, 4.6, 6.1, 6.2, 7.1_

- [x] 9. Create tool implementations for Chat Controller






  - Implement find-messages tool with filtering and pagination
  - Implement find-contacts and find-chats tools for data retrieval
  - Implement mark-as-read and mark-as-unread tools
  - Implement archive-chat tool for chat management
  - Implement check-is-whatsapp tool for number validation
  - Implement send-presence tool for typing indicators
  - _Requirements: 4.1, 4.4, 4.5, 4.6, 6.1, 6.2, 7.1_

- [ ] 10. Create tool implementations for Group Controller

  - Implement create-group tool with participant management
  - Implement update-group-picture, update-group-subject, and update-group-description tools
  - Implement fetch-invite-code and revoke-invite-code tools
  - Implement update-participant tool for adding/removing members
  - Implement leave-group tool
  - Add proper group JID parameter validation
  - _Requirements: 4.1, 4.5, 4.6, 6.1, 6.2, 7.2_

- [ ] 11. Create tool implementations for Profile and Webhook management

  - Implement fetch-profile and update-profile tools (name, status, picture)
  - Implement privacy-settings tools for profile privacy management
  - Implement set-webhook and get-webhook tools for webhook configuration
  - Implement get-information tool for API status and version
  - Add proper webhook URL validation and event configuration
  - _Requirements: 4.1, 4.5, 4.6, 6.1, 6.2, 7.3, 7.4_

- [x] 12. Implement comprehensive error handling system



  - Create error type definitions and error classes
  - Implement error mapping from HTTP status codes to user-friendly messages
  - Add specific error handling for authentication failures
  - Implement timeout and network error handling with retry suggestions
  - Create validation error messages with parameter correction hints
  - Add error logging and debugging information
  - _Requirements: 4.6, 4.9, 5.4, 6.2, 6.3, 6.4, 6.5, 8.4_

- [x] 13. Create NPX executable and CLI interface






  - Implement main CLI entry point with argument parsing
  - Add help command and usage instructions
  - Implement configuration validation on startup
  - Add support for different transport modes (STDIO vs HTTP)
  - Create proper process lifecycle management and graceful shutdown
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 8.1, 9.5_

- [x] 14. Add comprehensive testing suite





  - Create unit tests for configuration management
  - Add unit tests for HTTP client with mocked responses
  - Create unit tests for tool registry and tool generation
  - Add integration tests with mock Evolution API server
  - Create end-to-end tests for MCP protocol communication
  - Add tests for error scenarios and edge cases
  - _Requirements: All requirements validation_

- [x] 15. Create documentation and examples






  - Write comprehensive README with installation and setup instructions
  - Create Claude Desktop integration guide with step-by-step setup
  - Add API reference documentation for all available tools
  - Create example usage scenarios and common workflows
  - Add troubleshooting guide for common issues
  - Document environment variables and configuration options
  - _Requirements: 1.3, 8.2, 8.3, 9.1, 9.2, 9.4_

- [ ] 16. Implement package publishing and distribution




  - Configure package.json for NPM publishing
  - Set up GitHub Actions for automated testing and publishing
  - Create release workflow with semantic versioning
  - Add package keywords and metadata for discoverability
  - Test NPX installation and execution on different platforms
  - _Requirements: 1.1, 1.4_
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build Commands
- `npm run build` - Main build command (uses custom build.js due to UNC path issues)
- `npm run build:tsc` - TypeScript compilation only
- `npm start` - Start the built server

### Testing Commands
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run tests with coverage for CI

### Development Commands
- `npm run dev` - Run in development mode using tsx

### Linting
- `npm run lint` - Currently shows "Linting not configured yet"

## Architecture Overview

This is an MCP (Model Context Protocol) server that integrates WhatsApp functionality through Evolution API v2. The codebase follows a modular architecture:

### Core Components

**MCP Server (`src/server/`)**
- `mcp-server.ts` - Main MCP server implementation using @modelcontextprotocol/sdk
- `tool-generator.ts` - Dynamically generates MCP tools from endpoint registry
- `tool-registry.ts` - Manages registration and discovery of available tools
- `tool-factory.ts` - Creates tool instances with proper configuration

**HTTP Client (`src/clients/`)**
- `evolution-http-client.ts` - Axios-based client for Evolution API v2 communication
- Handles authentication, retries, and error handling

**Endpoint Registry (`src/registry/`)**
- `endpoint-registry.ts` - Central registry of all Evolution API endpoints
- `endpoints/` - Categorized endpoint definitions (chat, group, instance, etc.)
- Uses schema-based validation for request/response types

**Configuration (`src/config/`)**
- `configuration-manager.ts` - Multi-source configuration loading (env, file, defaults)
- `schemas.ts` - Zod schemas for configuration validation
- Supports environment variables and JSON config files

**CLI Interface (`src/cli/`)**
- `cli.ts` - Command-line interface for running the MCP server
- Entry point at `src/index.ts`

### Tool Architecture

The server dynamically generates MCP tools from endpoint definitions:
1. Endpoints are registered in the registry with schemas
2. Tool generator creates MCP-compliant tools with proper validation
3. Tools are executed via the HTTP client against Evolution API

### Key Configuration

**Required Environment Variables:**
- `EVOLUTION_URL` - Evolution API base URL
- `EVOLUTION_API_KEY` - Global API key

**Optional Configuration:**
- `HTTP_TIMEOUT` - Request timeout (default: 30000ms)
- `RETRY_ATTEMPTS` - Number of retry attempts (default: 3)
- `RETRY_DELAY` - Delay between retries (default: 1000ms)

### Testing Structure

Tests are organized by component in `tests/` directory:
- Unit tests for individual components
- Integration tests for end-to-end workflows
- Jest configuration with ts-jest preset
- Test setup file at `tests/setup.ts`

### Build Notes

- Uses custom `build.js` instead of direct TypeScript compilation due to UNC path issues
- Output goes to `dist/` directory
- Binary executable at `bin/evolution-api-mcp.js`
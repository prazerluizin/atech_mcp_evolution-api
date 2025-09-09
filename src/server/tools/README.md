# Evolution API MCP Tools

This directory contains the MCP tool implementations for the Evolution API v2.

## Instance Controller Tools

The Instance Controller tools provide complete management of WhatsApp instances through the Evolution API.

### Available Tools

1. **evolution_create_instance** - Create a new WhatsApp instance
   - Parameters: `instanceName`, `token` (optional), `qrcode` (optional), `webhook` (optional), `webhookByEvents` (optional), `webhookBase64` (optional), `events` (optional)
   - Creates a new WhatsApp instance with optional webhook configuration
   - Returns instance details and QR code if requested

2. **evolution_fetch_instances** - List all WhatsApp instances
   - Parameters: None
   - Returns a list of all instances with their current status
   - Provides a summary with connection status for each instance

3. **evolution_connect_instance** - Connect instance and get QR code
   - Parameters: `instance` (instance name)
   - Initiates connection for an instance and generates QR code
   - Returns QR code data for WhatsApp authentication

4. **evolution_restart_instance** - Restart a WhatsApp instance
   - Parameters: `instance` (instance name)
   - Restarts an instance to refresh its connection
   - Useful for fixing connection issues

5. **evolution_delete_instance** - Delete a WhatsApp instance
   - Parameters: `instance` (instance name)
   - Permanently deletes an instance and all its data
   - **Warning**: This action cannot be undone

6. **evolution_set_presence** - Set presence status
   - Parameters: `instance` (instance name), `presence` (status)
   - Sets the online presence status for an instance
   - Available statuses: `available`, `unavailable`, `composing`, `recording`, `paused`

### Features

- **Parameter Validation**: All tools use Zod schemas for strict parameter validation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support with proper type definitions
- **Integration**: Seamless integration with the MCP Tool Registry
- **Testing**: Complete test coverage with unit and integration tests

### Usage Example

```typescript
import { InstanceTools } from './instance-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

// Initialize HTTP client
const httpClient = new EvolutionHttpClient({
  baseURL: 'https://your-evolution-api.com',
  apiKey: 'your-api-key'
});

// Create instance tools
const instanceTools = new InstanceTools(httpClient);

// Get all tools
const tools = instanceTools.getAllTools();

// Use a specific tool
const createTool = tools.find(t => t.name === 'evolution_create_instance');
const result = await createTool.handler({
  instanceName: 'my_bot',
  qrcode: true,
  webhook: 'https://myapp.com/webhook'
});
```

### Integration with Tool Registry

```typescript
import { McpToolRegistry } from '../tool-registry';

const registry = new McpToolRegistry();
registry.registerInstanceTools(httpClient);

// Get instance tools
const instanceTools = registry.getToolsByController('instance');
```

### Error Handling

All tools provide comprehensive error handling for:

- **Authentication Errors**: Invalid API keys
- **Network Errors**: Connection issues
- **Timeout Errors**: Request timeouts
- **API Errors**: Evolution API specific errors
- **Validation Errors**: Invalid parameters
- **Rate Limiting**: Too many requests

Each error includes:
- Clear error message
- Error type classification
- Helpful suggestions for resolution
- Original error details for debugging

### Testing

The implementation includes:

- **Unit Tests**: Individual tool functionality testing
- **Integration Tests**: Tool registry integration testing
- **Error Scenario Tests**: Comprehensive error handling testing
- **Parameter Validation Tests**: Schema validation testing

Run tests with:
```bash
npm test tests/server/instance-tools.test.ts
npm test tests/server/instance-tools-integration.test.ts
```

### Files

- `instance-tools.ts` - Main implementation
- `instance-tools-demo.ts` - Usage examples and demo
- `../../../tests/server/instance-tools.test.ts` - Unit tests
- `../../../tests/server/instance-tools-integration.test.ts` - Integration tests

### Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **4.1**: HTTP requests to Evolution API v2 endpoints
- **4.2**: Instance Controller operations support
- **4.5**: Proper parameter validation
- **4.6**: Error handling with user-friendly messages
- **6.1**: Structured JSON responses
- **6.2**: Clear error messages and status codes
- **7.1**: Instance-specific operations support

### Next Steps

The Instance Controller tools are complete and ready for use. The next step would be to implement tools for other controllers (Message, Chat, Group, Profile, Webhook) following the same pattern established here.
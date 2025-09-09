# Evolution API HTTP Client

A robust HTTP client for the Evolution API v2 with built-in retry logic, error handling, and authentication management.

## Features

- **Automatic Authentication**: API key is automatically included in all requests
- **Retry Logic**: Exponential backoff retry for network failures and timeouts
- **Error Handling**: Comprehensive error categorization and user-friendly messages
- **Request/Response Interceptors**: Built-in logging and request/response transformation
- **Connection Pooling**: Efficient connection reuse for better performance
- **TypeScript Support**: Full type safety with Zod schema validation
- **Configuration Management**: Flexible configuration with validation

## Installation

The HTTP client is part of the Evolution API MCP package and uses axios as the underlying HTTP library.

```bash
npm install axios zod
```

## Basic Usage

```typescript
import { EvolutionHttpClient, type HttpClientConfig } from './evolution-http-client';

// Configure the client
const config: HttpClientConfig = {
  baseURL: 'https://your-evolution-api.com',
  apiKey: 'your-global-api-key',
  timeout: 30000,
  retryAttempts: 3,
  enableLogging: true
};

// Create client instance
const client = new EvolutionHttpClient(config);

// Make requests
const response = await client.get('/instance/fetchInstances');
if (response.success) {
  console.log('Data:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseURL` | string | - | Base URL of the Evolution API (required) |
| `apiKey` | string | - | Global API key for authentication (required) |
| `timeout` | number | 30000 | Request timeout in milliseconds |
| `retryAttempts` | number | 3 | Number of retry attempts for failed requests |
| `retryDelay` | number | 1000 | Initial delay between retries in milliseconds |
| `maxRetryDelay` | number | 30000 | Maximum delay between retries in milliseconds |
| `enableLogging` | boolean | false | Enable request/response logging |

## HTTP Methods

The client provides convenient methods for all HTTP verbs:

```typescript
// GET request
const response = await client.get('/path', { param: 'value' });

// POST request
const response = await client.post('/path', { data: 'value' });

// PUT request
const response = await client.put('/path', { data: 'value' });

// DELETE request
const response = await client.delete('/path');

// PATCH request
const response = await client.patch('/path', { data: 'value' });

// Generic request
const response = await client.request({
  method: 'POST',
  path: '/path',
  data: { key: 'value' },
  headers: { 'Custom-Header': 'value' }
});
```

## Response Format

All methods return a standardized response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  statusCode: number;
  headers?: Record<string, string>;
}
```

### Success Response
```typescript
{
  success: true,
  data: { /* API response data */ },
  statusCode: 200,
  headers: { /* response headers */ }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    type: 'AUTHENTICATION_ERROR',
    message: 'Authentication failed - check your API key',
    statusCode: 401,
    code: 'AUTH_FAILED',
    details: { /* additional error details */ }
  },
  statusCode: 401
}
```

## Error Types

The client categorizes errors into specific types for better handling:

- `CONFIGURATION_ERROR`: Invalid configuration or setup issues
- `AUTHENTICATION_ERROR`: API key authentication failures
- `API_ERROR`: General API errors (4xx/5xx responses)
- `NETWORK_ERROR`: Network connectivity issues
- `VALIDATION_ERROR`: Request parameter validation failures
- `TIMEOUT_ERROR`: Request timeout errors
- `RATE_LIMIT_ERROR`: Rate limiting errors (429 responses)

## Retry Logic

The client automatically retries requests in the following scenarios:

- Network errors (connection refused, timeout, etc.)
- Server errors (5xx responses)
- Rate limiting errors (429 responses)

**No retries for:**
- Authentication errors (401)
- Client errors (4xx except 429)
- Validation errors

### Retry Configuration

```typescript
const client = new EvolutionHttpClient({
  baseURL: 'https://api.example.com',
  apiKey: 'your-key',
  retryAttempts: 5,        // Retry up to 5 times
  retryDelay: 2000,        // Start with 2 second delay
  maxRetryDelay: 60000     // Cap delay at 60 seconds
});
```

## Authentication

The client automatically handles authentication by including the API key in the `apikey` header for all requests. No manual token management is required.

```typescript
// API key is automatically included in all requests
const response = await client.get('/protected-endpoint');
```

## Configuration Updates

You can update the client configuration at runtime:

```typescript
// Update specific configuration options
client.updateConfig({
  apiKey: 'new-api-key',
  timeout: 60000,
  enableLogging: true
});

// Get current configuration
const config = client.getConfig();
console.log('Current config:', config);
```

## Health Check

The client provides a built-in health check method:

```typescript
const healthResponse = await client.healthCheck();
if (healthResponse.success) {
  console.log('API is healthy');
} else {
  console.log('API health check failed:', healthResponse.error);
}
```

## Request Statistics

Track request statistics for monitoring:

```typescript
const stats = client.getStats();
console.log('Total requests made:', stats.requestCount);
```

## Error Handling Best Practices

```typescript
async function handleApiCall() {
  const response = await client.get('/some-endpoint');
  
  if (response.success) {
    // Handle successful response
    return response.data;
  }
  
  // Handle different error types
  switch (response.error?.type) {
    case 'AUTHENTICATION_ERROR':
      console.error('Please check your API key');
      break;
    case 'RATE_LIMIT_ERROR':
      console.error('Rate limited, retry after:', response.error.details?.retryAfter);
      break;
    case 'NETWORK_ERROR':
      console.error('Network issue, check connectivity');
      break;
    case 'TIMEOUT_ERROR':
      console.error('Request timed out, try again');
      break;
    default:
      console.error('API error:', response.error?.message);
  }
  
  throw new Error(response.error?.message || 'Unknown error');
}
```

## Custom Request Options

Override default options for specific requests:

```typescript
// Custom timeout for a specific request
const response = await client.get('/slow-endpoint', undefined, {
  timeout: 60000
});

// Custom headers
const response = await client.post('/endpoint', data, undefined, {
  headers: { 'Content-Type': 'application/xml' }
});

// Custom retry attempts
const response = await client.get('/unreliable-endpoint', undefined, {
  retries: 1
});
```

## Integration with Evolution API

The client is specifically designed for the Evolution API v2 and includes:

- Automatic `apikey` header management
- Proper error mapping for Evolution API responses
- Optimized retry logic for WhatsApp API characteristics
- Support for all Evolution API endpoints and parameters

## Testing

The HTTP client includes comprehensive tests covering:

- Configuration validation
- HTTP method functionality
- Error handling scenarios
- Retry logic behavior
- Authentication management
- Request/response interceptors

Run tests with:
```bash
npm test tests/clients/evolution-http-client.test.ts
```

## Examples

See `example.ts` for complete usage examples including:
- Basic API calls
- Error handling
- Configuration management
- Health checks
- Statistics tracking
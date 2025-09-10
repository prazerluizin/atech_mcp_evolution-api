# Error Handling System

This directory contains the comprehensive error handling system for the Evolution API MCP Server. The system provides structured error handling, validation, and user-friendly error messages with suggestions for correction.

## Components

### Error Handler (`error-handler.ts`)

The core error handling system that provides:

- **Error Type Definitions**: Comprehensive error types for different categories
- **Error Classes**: Specific error classes with detailed information
- **HTTP Status Mapping**: Automatic mapping from HTTP status codes to user-friendly messages
- **Authentication Handling**: Specific handling for authentication failures
- **Network & Timeout Handling**: Retry suggestions and timeout management
- **Validation Error Processing**: Detailed validation error messages with correction hints
- **Logging & Debugging**: Structured error logging with severity levels

#### Key Features

1. **Structured Error Types**
   ```typescript
   enum ErrorType {
     CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
     AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
     API_ERROR = 'API_ERROR',
     NETWORK_ERROR = 'NETWORK_ERROR',
     VALIDATION_ERROR = 'VALIDATION_ERROR',
     TIMEOUT_ERROR = 'TIMEOUT_ERROR',
     RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
     INSTANCE_ERROR = 'INSTANCE_ERROR',
     PERMISSION_ERROR = 'PERMISSION_ERROR',
     RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
     INTERNAL_ERROR = 'INTERNAL_ERROR'
   }
   ```

2. **Error Severity Levels**
   ```typescript
   enum ErrorSeverity {
     LOW = 'LOW',
     MEDIUM = 'MEDIUM',
     HIGH = 'HIGH',
     CRITICAL = 'CRITICAL'
   }
   ```

3. **Specific Error Classes**
   - `ConfigurationError`: For configuration-related issues
   - `AuthenticationError`: For authentication failures with API key suggestions
   - `ValidationError`: For parameter validation with detailed field-level errors
   - `NetworkError`: For network connectivity issues with retry suggestions
   - `TimeoutError`: For request timeouts with timeout adjustment suggestions
   - `RateLimitError`: For rate limiting with retry timing information
   - `InstanceError`: For Evolution API instance-related errors

4. **HTTP Status Code Mapping**
   - Automatic mapping from HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504)
   - User-friendly error messages for each status code
   - Context-aware suggestions for resolution

5. **Error Context**
   ```typescript
   interface ErrorContext {
     operation?: string;
     endpoint?: string;
     instance?: string;
     parameters?: any;
     requestId?: string;
     userId?: string;
     stackTrace?: string;
   }
   ```

#### Usage Examples

```typescript
import { ErrorHandler, ErrorUtils, McpError } from './error-handler';

// Create error handler
const errorHandler = new ErrorHandler({ enableLogging: true });

// Handle HTTP errors
try {
  const response = await httpClient.get('/api/endpoint');
} catch (error) {
  const mcpError = errorHandler.handleHttpError(error, {
    operation: 'fetch_data',
    endpoint: '/api/endpoint'
  });
  
  // Create tool response
  return errorHandler.createToolErrorResponse(mcpError);
}

// Create specific errors
const authError = ErrorUtils.authenticationError();
const validationError = ErrorUtils.validationError(zodError);
const instanceError = ErrorUtils.instanceError('my-instance');
```

### Validators (`validators.ts`)

Comprehensive validation system with user-friendly error messages:

#### Validation Schemas

1. **WhatsApp Number Validation**
   ```typescript
   ValidationSchemas.whatsappNumber // 10-15 digits, numbers only
   ```

2. **Instance Name Validation**
   ```typescript
   ValidationSchemas.instanceName // Alphanumeric, underscores, hyphens
   ```

3. **URL Validation**
   ```typescript
   ValidationSchemas.url // Valid HTTP/HTTPS URLs
   ```

4. **Group JID Validation**
   ```typescript
   ValidationSchemas.groupJid // WhatsApp group format: number-timestamp@g.us
   ```

5. **Message Text Validation**
   ```typescript
   ValidationSchemas.messageText // 1-4096 characters, non-empty
   ```

6. **Media Validation**
   ```typescript
   ValidationSchemas.media // URL or base64 encoded data
   ```

#### Parameter Validator

```typescript
import { ParameterValidator } from './validators';

// Validate single parameter
const result = ParameterValidator.validateWhatsAppNumber('5511999999999');
if (!result.success) {
  console.log(result.error.validationDetails);
}

// Validate complex object
const schema = z.object({
  instance: ValidationSchemas.instanceName,
  number: ValidationSchemas.whatsappNumber,
  text: ValidationSchemas.messageText
});

const result = ParameterValidator.validateMultiple(data, schema);
```

#### Validation Utils

```typescript
import { ValidationUtils } from './validators';

// Quick validation checks
ValidationUtils.isValidWhatsAppNumber('5511999999999'); // true
ValidationUtils.isValidInstanceName('my-instance'); // true

// Phone number utilities
ValidationUtils.sanitizePhoneNumber('+55 11 99999-9999'); // '5511999999999'
ValidationUtils.formatWhatsAppNumber('11999999999'); // '5511999999999'

// Error message utilities
const messages = ValidationUtils.extractValidationMessages(validationError);
const hints = ValidationUtils.createCorrectionHints(validationDetails);
```

## Integration with HTTP Client

The error handling system is fully integrated with the Evolution HTTP Client:

```typescript
import { EvolutionHttpClient } from '../clients/evolution-http-client';

const client = new EvolutionHttpClient({
  baseURL: 'https://api.evolution.com',
  apiKey: 'your-api-key',
  enableLogging: true
});

// All HTTP requests automatically use the error handling system
const response = await client.post('/message/sendText/instance', {
  number: '5511999999999',
  text: 'Hello World'
});

if (!response.success) {
  // response.error is a McpError with detailed information
  console.log(response.error.type); // Error type
  console.log(response.error.message); // User-friendly message
  console.log(response.error.suggestions); // Correction suggestions
  console.log(response.error.retryable); // Whether the operation can be retried
}
```

## Integration with MCP Tools

The error handling system provides standardized responses for MCP tools:

```typescript
import { ErrorHandler } from './error-handler';

const errorHandler = new ErrorHandler();

// In tool implementation
export const sendTextMessage = async (params: any) => {
  try {
    // Validate parameters
    const validation = ParameterValidator.validateMultiple(params, sendTextSchema);
    if (!validation.success) {
      return errorHandler.createToolErrorResponse(validation.error);
    }

    // Make API request
    const response = await httpClient.post('/message/sendText', validation.data);
    
    if (!response.success) {
      return errorHandler.createToolErrorResponse(response.error);
    }

    return errorHandler.createToolSuccessResponse(response.data);
  } catch (error) {
    const mcpError = errorHandler.handleHttpError(error, {
      operation: 'send_text_message',
      parameters: params
    });
    return errorHandler.createToolErrorResponse(mcpError);
  }
};
```

## Error Response Format

All errors follow a consistent format for MCP tools:

```typescript
// Error Response
{
  success: false,
  error: {
    type: 'VALIDATION_ERROR',
    message: 'Validation failed: number - Phone number must be at least 10 digits',
    code: 'VAL_001',
    suggestions: [
      'Use the format: country code + number (e.g., 5511999999999)',
      'Ensure the number contains only digits'
    ],
    retryable: false
  }
}

// Success Response
{
  success: true,
  data: {
    // Response data
  }
}
```

## Error Logging

The system provides structured logging with different severity levels:

```typescript
const errorHandler = new ErrorHandler({
  enableLogging: true,
  logLevel: 'error' // 'error' | 'warn' | 'info' | 'debug'
});

// Logs are automatically generated with:
// - Timestamp
// - Error type and severity
// - Context information
// - Stack traces (in debug mode)
// - Request IDs for tracing
```

## Best Practices

1. **Always Use Error Context**: Provide context information for better debugging
   ```typescript
   const context = {
     operation: 'send_message',
     endpoint: '/message/sendText',
     instance: 'my-instance',
     parameters: { number, text }
   };
   ```

2. **Validate Early**: Use parameter validation before making API requests
   ```typescript
   const validation = ParameterValidator.validate(params, schema);
   if (!validation.success) {
     return errorHandler.createToolErrorResponse(validation.error);
   }
   ```

3. **Provide Helpful Suggestions**: Include actionable suggestions in error messages
   ```typescript
   const error = new ValidationError('Invalid phone number', [], {
     suggestions: [
       'Use format: country code + number (e.g., 5511999999999)',
       'Remove any spaces, hyphens, or parentheses'
     ]
   });
   ```

4. **Use Appropriate Error Types**: Choose the most specific error type for better categorization
   ```typescript
   // Good
   throw new AuthenticationError('Invalid API key');
   
   // Less specific
   throw new McpError(ErrorType.API_ERROR, 'Invalid API key');
   ```

5. **Handle Retryable Errors**: Check the `retryable` flag for automatic retry logic
   ```typescript
   if (!response.success && response.error.retryable) {
     // Implement retry logic
   }
   ```

## Testing

The error handling system includes comprehensive tests:

- Unit tests for all error classes and utilities
- Integration tests with HTTP client
- Validation tests for all schemas
- Error mapping tests for HTTP status codes

Run tests with:
```bash
npm test tests/utils/
```

## Requirements Satisfied

This implementation satisfies the following task requirements:

- ✅ **Create error type definitions and error classes**
- ✅ **Implement error mapping from HTTP status codes to user-friendly messages**
- ✅ **Add specific error handling for authentication failures**
- ✅ **Implement timeout and network error handling with retry suggestions**
- ✅ **Create validation error messages with parameter correction hints**
- ✅ **Add error logging and debugging information**

The system provides comprehensive error handling that enhances the user experience by providing clear, actionable error messages and suggestions for resolution.
import { EvolutionHttpClient, type HttpClientConfig } from './evolution-http-client';

/**
 * Example usage of the EvolutionHttpClient
 * This file demonstrates how to use the HTTP client with the Evolution API
 */

async function exampleUsage() {
  // Configuration
  const config: HttpClientConfig = {
    baseURL: 'https://your-evolution-api.com',
    apiKey: 'your-global-api-key',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableLogging: true
  };

  // Create client instance
  const client = new EvolutionHttpClient(config);

  try {
    // Example 1: Health check
    console.log('Performing health check...');
    const healthResponse = await client.healthCheck();
    if (healthResponse.success) {
      console.log('API is healthy:', healthResponse.data);
    } else {
      console.error('Health check failed:', healthResponse.error);
    }

    // Example 2: Get instances
    console.log('Fetching instances...');
    const instancesResponse = await client.get('/instance/fetchInstances');
    if (instancesResponse.success) {
      console.log('Instances:', instancesResponse.data);
    } else {
      console.error('Failed to fetch instances:', instancesResponse.error);
    }

    // Example 3: Create instance
    console.log('Creating new instance...');
    const createResponse = await client.post('/instance/create', {
      instanceName: 'test-instance',
      qrcode: true,
      webhook: 'https://your-webhook-url.com/webhook'
    });
    
    if (createResponse.success) {
      console.log('Instance created:', createResponse.data);
    } else {
      console.error('Failed to create instance:', createResponse.error);
    }

    // Example 4: Send text message
    console.log('Sending text message...');
    const messageResponse = await client.post('/message/sendText/test-instance', {
      number: '5511999999999',
      text: 'Hello from Evolution API MCP!',
      delay: 1000
    });
    
    if (messageResponse.success) {
      console.log('Message sent:', messageResponse.data);
    } else {
      console.error('Failed to send message:', messageResponse.error);
    }

    // Example 5: Error handling demonstration
    console.log('Testing error handling...');
    const errorResponse = await client.get('/nonexistent/endpoint');
    if (!errorResponse.success) {
      console.log('Expected error caught:', {
        type: errorResponse.error?.type,
        message: errorResponse.error?.message,
        statusCode: errorResponse.error?.statusCode
      });
    }

    // Example 6: Configuration update
    console.log('Updating configuration...');
    client.updateConfig({
      timeout: 60000,
      enableLogging: false
    });
    console.log('Configuration updated:', client.getConfig());

    // Example 7: Request statistics
    const stats = client.getStats();
    console.log('Request statistics:', stats);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Export for potential use in other modules
export { exampleUsage };

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}
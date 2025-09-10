/**
 * Jest Test Setup
 * Global test configuration and setup
 */

// Set test timeout
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.EVOLUTION_URL = 'https://test-evolution-api.com';
process.env.EVOLUTION_API_KEY = 'test-api-key';
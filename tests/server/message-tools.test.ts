/**
 * Message Tools Test Suite
 * Tests for all message controller MCP tools
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { messageTools } from '../../src/server/tools/message-tools';
import { EvolutionHttpClient } from '../../src/clients/evolution-http-client';
import { createMockMcpError, createMockApiResponse, TestData } from '../helpers/test-utils';
import { ErrorType } from '../../src/utils/error-handler';

// Mock the HTTP client
jest.mock('../../src/clients/evolution-http-client');

describe('Message Tools', () => {
  let mockHttpClient: jest.Mocked<EvolutionHttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      healthCheck: jest.fn(),
      getConfig: jest.fn(),
      updateConfig: jest.fn(),
      getStats: jest.fn()
    } as any;
  });

  describe('sendTextMessage', () => {
    it('should send text message successfully', async () => {
      const mockResponse = createMockApiResponse({
        messageId: 'msg-123',
        status: 'sent'
      });
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await messageTools.sendTextMessage(mockHttpClient, TestData.message.text);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/message/sendText/${TestData.message.text.instance}`,
        {
          number: TestData.message.text.number,
          text: TestData.message.text.text,
          delay: TestData.message.text.delay
        }
      );
      expect(result.success).toBe(true);
      expect(result.data?.messageId).toBe('msg-123');
    });

    it('should handle validation errors', async () => {
      const invalidParams = {
        instance: '',
        number: '',
        text: ''
      };

      const result = await messageTools.sendTextMessage(mockHttpClient, invalidParams);
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    it('should handle API errors', async () => {
      const mockError = createMockApiResponse(undefined, {
        type: ErrorType.API_ERROR,
        statusCode: 500,
        message: 'Server error'
      });
      mockHttpClient.post.mockResolvedValue(mockError);

      const result = await messageTools.sendTextMessage(mockHttpClient, TestData.message.text);
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.API_ERROR);
    });
  });

  describe('sendMediaMessage', () => {
    it('should send media message successfully', async () => {
      const mockResponse = createMockApiResponse({
        messageId: 'media-123',
        status: 'sent'
      });
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await messageTools.sendMediaMessage(mockHttpClient, TestData.message.media);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/message/sendMedia/${TestData.message.media.instance}`,
        {
          number: TestData.message.media.number,
          media: TestData.message.media.media,
          caption: TestData.message.media.caption,
          fileName: TestData.message.media.fileName
        }
      );
      expect(result.success).toBe(true);
      expect(result.data?.messageId).toBe('media-123');
    });

    it('should validate media URL format', async () => {
      const invalidParams = {
        ...TestData.message.media,
        media: 'invalid-url'
      };

      const result = await messageTools.sendMediaMessage(mockHttpClient, invalidParams);
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });
});
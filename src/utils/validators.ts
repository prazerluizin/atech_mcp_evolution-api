/**
 * Validation utilities for Evolution API MCP Server
 * 
 * This module provides validation functions with detailed error messages
 * and suggestions for parameter correction.
 */

import { z } from 'zod';
import { ValidationError, ValidationErrorDetail, ErrorContext } from './error-handler';

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: ValidationError;
}

/**
 * Common validation schemas with user-friendly error messages
 */
export const ValidationSchemas = {
  /**
   * WhatsApp number validation
   */
  whatsappNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be no more than 15 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .refine(
      (val) => val.length >= 10 && val.length <= 15,
      'Phone number must be between 10-15 digits (country code + number)'
    ),

  /**
   * Instance name validation
   */
  instanceName: z.string()
    .min(1, 'Instance name is required')
    .max(50, 'Instance name must be no more than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Instance name can only contain letters, numbers, underscores, and hyphens')
    .refine(
      (val) => !val.startsWith('-') && !val.endsWith('-'),
      'Instance name cannot start or end with a hyphen'
    ),

  /**
   * URL validation
   */
  url: z.string()
    .url('Must be a valid URL')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'URL must start with http:// or https://'
    ),

  /**
   * API key validation
   */
  apiKey: z.string()
    .min(10, 'API key must be at least 10 characters')
    .max(200, 'API key must be no more than 200 characters')
    .refine(
      (val) => val.trim().length > 0,
      'API key cannot be empty or contain only whitespace'
    ),

  /**
   * Group JID validation
   */
  groupJid: z.string()
    .min(1, 'Group JID is required')
    .regex(/@g\.us$/, 'Group JID must end with @g.us')
    .refine(
      (val) => val.includes('-') && val.includes('@'),
      'Group JID must be in format: number-timestamp@g.us'
    ),

  /**
   * Message text validation
   */
  messageText: z.string()
    .min(1, 'Message text cannot be empty')
    .max(4096, 'Message text must be no more than 4096 characters')
    .refine(
      (val) => val.trim().length > 0,
      'Message text cannot contain only whitespace'
    ),

  /**
   * Media URL or base64 validation
   */
  media: z.string()
    .min(1, 'Media is required')
    .refine(
      (val) => {
        // Check if it's a URL
        try {
          new URL(val);
          return true;
        } catch {
          // Check if it's base64
          return /^data:/.test(val) || /^[A-Za-z0-9+/]+=*$/.test(val);
        }
      },
      'Media must be a valid URL or base64 encoded data'
    ),

  /**
   * Delay validation (in milliseconds)
   */
  delay: z.number()
    .min(0, 'Delay cannot be negative')
    .max(300000, 'Delay cannot be more than 5 minutes (300000ms)')
    .optional(),

  /**
   * Webhook events validation
   */
  webhookEvents: z.array(z.string())
    .min(1, 'At least one webhook event must be specified')
    .refine(
      (events) => events.every(event => typeof event === 'string' && event.length > 0),
      'All webhook events must be non-empty strings'
    )
};

/**
 * Validator class for parameter validation with detailed error reporting
 */
export class ParameterValidator {
  /**
   * Validate parameters against a Zod schema
   */
  static validate<T>(
    data: unknown,
    schema: z.ZodSchema<T>,
    context?: ErrorContext
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationDetails = this.extractZodErrorDetails(error);
        const validationError = new ValidationError(
          `Validation failed: ${validationDetails.map(d => d.message).join(', ')}`,
          validationDetails,
          { context }
        );

        return {
          success: false,
          error: validationError
        };
      }

      // Handle non-Zod errors
      const validationError = new ValidationError(
        'Validation failed due to unexpected error',
        [],
        { context, details: error }
      );

      return {
        success: false,
        error: validationError
      };
    }
  }

  /**
   * Extract detailed error information from Zod errors
   */
  private static extractZodErrorDetails(zodError: z.ZodError): ValidationErrorDetail[] {
    return zodError.errors.map(error => ({
      field: error.path.join('.') || 'root',
      value: (error as any).received || undefined,
      message: error.message,
      code: error.code,
      suggestion: this.getZodErrorSuggestion(error)
    }));
  }

  /**
   * Generate helpful suggestions for Zod validation errors
   */
  private static getZodErrorSuggestion(error: z.ZodIssue): string {
    const path = error.path.join('.');

    switch (error.code) {
      case 'invalid_type':
        return `Expected ${(error as any).expected}, but received ${(error as any).received}. Please provide a ${(error as any).expected} value.`;

      case 'too_small':
        if ((error as any).type === 'string') {
          return `Must be at least ${(error as any).minimum} characters long. Current length: ${(error as any).received?.length || 0}`;
        }
        if ((error as any).type === 'number') {
          return `Must be at least ${(error as any).minimum}. Current value: ${(error as any).received}`;
        }
        if ((error as any).type === 'array') {
          return `Must contain at least ${(error as any).minimum} items. Current count: ${(error as any).received?.length || 0}`;
        }
        return `Value is too small. Minimum: ${(error as any).minimum}`;

      case 'too_big':
        if ((error as any).type === 'string') {
          return `Must be no more than ${(error as any).maximum} characters long. Current length: ${(error as any).received?.length || 0}`;
        }
        if ((error as any).type === 'number') {
          return `Must be no more than ${(error as any).maximum}. Current value: ${(error as any).received}`;
        }
        if ((error as any).type === 'array') {
          return `Must contain no more than ${(error as any).maximum} items. Current count: ${(error as any).received?.length || 0}`;
        }
        return `Value is too big. Maximum: ${(error as any).maximum}`;

      case 'invalid_string':
        if ((error as any).validation === 'email') {
          return 'Must be a valid email address (e.g., user@example.com)';
        }
        if ((error as any).validation === 'url') {
          return 'Must be a valid URL starting with http:// or https://';
        }
        if ((error as any).validation === 'regex') {
          return this.getRegexSuggestion(path);
        }
        return 'Invalid string format';

      case 'invalid_literal':
        return `Must be exactly "${(error as any).expected}". Received: "${(error as any).received}"`;

      case 'unrecognized_keys':
        return `Unknown fields: ${(error as any).keys.join(', ')}. Please remove these fields.`;

      case 'invalid_union':
        return 'Value does not match any of the expected formats. Please check the documentation for valid formats.';

      case 'invalid_enum_value':
        return `Must be one of: ${(error as any).options.join(', ')}. Received: "${(error as any).received}"`;

      case 'custom':
        return error.message;

      default:
        return 'Please check the value and format, then try again.';
    }
  }

  /**
   * Get specific suggestions for regex validation failures
   */
  private static getRegexSuggestion(fieldPath: string): string {
    const field = fieldPath.toLowerCase();

    if (field.includes('number') || field.includes('phone')) {
      return 'Phone number must contain only digits (0-9) and be in format: country code + number (e.g., 5511999999999)';
    }
    if (field.includes('instance')) {
      return 'Instance name can only contain letters, numbers, underscores, and hyphens (e.g., my-instance_01)';
    }
    if (field.includes('jid') || field.includes('group')) {
      return 'Group JID must be in format: number-timestamp@g.us (e.g., 5511999999999-1234567890@g.us)';
    }
    if (field.includes('apikey') || field.includes('key')) {
      return 'API key must contain only valid characters (letters, numbers, and common symbols)';
    }

    return 'Value contains invalid characters. Please check the format requirements.';
  }

  /**
   * Validate WhatsApp number format
   */
  static validateWhatsAppNumber(number: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(number, ValidationSchemas.whatsappNumber, context);
  }

  /**
   * Validate instance name
   */
  static validateInstanceName(instanceName: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(instanceName, ValidationSchemas.instanceName, context);
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(url, ValidationSchemas.url, context);
  }

  /**
   * Validate API key
   */
  static validateApiKey(apiKey: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(apiKey, ValidationSchemas.apiKey, context);
  }

  /**
   * Validate group JID
   */
  static validateGroupJid(groupJid: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(groupJid, ValidationSchemas.groupJid, context);
  }

  /**
   * Validate message text
   */
  static validateMessageText(text: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(text, ValidationSchemas.messageText, context);
  }

  /**
   * Validate media (URL or base64)
   */
  static validateMedia(media: string, context?: ErrorContext): ValidationResult<string> {
    return this.validate(media, ValidationSchemas.media, context);
  }

  /**
   * Validate multiple parameters at once
   */
  static validateMultiple<T extends Record<string, any>>(
    data: T,
    schema: z.ZodSchema<T>,
    context?: ErrorContext
  ): ValidationResult<T> {
    return this.validate(data, schema, context);
  }
}

/**
 * Utility functions for common validation scenarios
 */
export const ValidationUtils = {
  /**
   * Check if a string is a valid WhatsApp number
   */
  isValidWhatsAppNumber(number: string): boolean {
    return ValidationSchemas.whatsappNumber.safeParse(number).success;
  },

  /**
   * Check if a string is a valid instance name
   */
  isValidInstanceName(instanceName: string): boolean {
    return ValidationSchemas.instanceName.safeParse(instanceName).success;
  },

  /**
   * Check if a string is a valid URL
   */
  isValidUrl(url: string): boolean {
    return ValidationSchemas.url.safeParse(url).success;
  },

  /**
   * Check if a string is a valid group JID
   */
  isValidGroupJid(groupJid: string): boolean {
    return ValidationSchemas.groupJid.safeParse(groupJid).success;
  },

  /**
   * Sanitize phone number (remove common formatting)
   */
  sanitizePhoneNumber(number: string): string {
    return number.replace(/[\s\-\(\)\+]/g, '');
  },

  /**
   * Format phone number for WhatsApp (ensure it has country code)
   */
  formatWhatsAppNumber(number: string, defaultCountryCode = '55'): string {
    const sanitized = this.sanitizePhoneNumber(number);
    
    // If number is 11 digits and starts with a mobile prefix, prepend country code
    if (sanitized.length === 11 && (sanitized.startsWith('11') || sanitized.startsWith('21'))) {
      return defaultCountryCode + sanitized;
    }
    
    // If number is too short, prepend default country code
    if (sanitized.length < 10) {
      return defaultCountryCode + sanitized;
    }
    
    return sanitized;
  },

  /**
   * Extract validation errors as user-friendly messages
   */
  extractValidationMessages(error: ValidationError): string[] {
    return error.validationDetails.map(detail => 
      `${detail.field}: ${detail.message}${detail.suggestion ? ` (${detail.suggestion})` : ''}`
    );
  },

  /**
   * Create parameter correction hints
   */
  createCorrectionHints(validationDetails: ValidationErrorDetail[]): Record<string, string> {
    const hints: Record<string, string> = {};
    
    validationDetails.forEach(detail => {
      if (detail.suggestion) {
        hints[detail.field] = detail.suggestion;
      }
    });
    
    return hints;
  }
};
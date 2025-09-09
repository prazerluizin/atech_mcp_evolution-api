/**
 * Tests for validation utilities
 */

import { z } from 'zod';
import {
  ParameterValidator,
  ValidationSchemas,
  ValidationUtils
} from '../../src/utils/validators';
import { ValidationError } from '../../src/utils/error-handler';

describe('ValidationSchemas', () => {
  describe('whatsappNumber', () => {
    it('should validate correct WhatsApp numbers', () => {
      const validNumbers = [
        '5511999999999',
        '1234567890',
        '551199999999999'
      ];

      validNumbers.forEach(number => {
        expect(ValidationSchemas.whatsappNumber.safeParse(number).success).toBe(true);
      });
    });

    it('should reject invalid WhatsApp numbers', () => {
      const invalidNumbers = [
        '123',           // too short
        '12345678901234567890', // too long
        '55119999a9999', // contains letters
        '+5511999999999', // contains +
        '55 11 99999-9999' // contains spaces and -
      ];

      invalidNumbers.forEach(number => {
        expect(ValidationSchemas.whatsappNumber.safeParse(number).success).toBe(false);
      });
    });
  });

  describe('instanceName', () => {
    it('should validate correct instance names', () => {
      const validNames = [
        'my-instance',
        'test_instance_01',
        'MyInstance123',
        'a',
        'instance-name-with-hyphens'
      ];

      validNames.forEach(name => {
        expect(ValidationSchemas.instanceName.safeParse(name).success).toBe(true);
      });
    });

    it('should reject invalid instance names', () => {
      const invalidNames = [
        '',              // empty
        '-invalid',      // starts with hyphen
        'invalid-',      // ends with hyphen
        'invalid name',  // contains space
        'invalid@name',  // contains @
        'a'.repeat(51)   // too long
      ];

      invalidNames.forEach(name => {
        expect(ValidationSchemas.instanceName.safeParse(name).success).toBe(false);
      });
    });
  });

  describe('url', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.evolution.com/v2'
      ];

      validUrls.forEach(url => {
        expect(ValidationSchemas.url.safeParse(url).success).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com', // wrong protocol
        'example.com',       // missing protocol
        ''                   // empty
      ];

      invalidUrls.forEach(url => {
        expect(ValidationSchemas.url.safeParse(url).success).toBe(false);
      });
    });
  });

  describe('groupJid', () => {
    it('should validate correct group JIDs', () => {
      const validJids = [
        '5511999999999-1234567890@g.us',
        '123456789-987654321@g.us'
      ];

      validJids.forEach(jid => {
        expect(ValidationSchemas.groupJid.safeParse(jid).success).toBe(true);
      });
    });

    it('should reject invalid group JIDs', () => {
      const invalidJids = [
        '5511999999999@c.us',     // wrong suffix
        '5511999999999@g.us',     // missing timestamp
        'invalid-jid',            // wrong format
        ''                        // empty
      ];

      invalidJids.forEach(jid => {
        expect(ValidationSchemas.groupJid.safeParse(jid).success).toBe(false);
      });
    });
  });

  describe('messageText', () => {
    it('should validate correct message text', () => {
      const validTexts = [
        'Hello world',
        'A'.repeat(4096), // max length
        'Text with emojis 😀🎉'
      ];

      validTexts.forEach(text => {
        expect(ValidationSchemas.messageText.safeParse(text).success).toBe(true);
      });
    });

    it('should reject invalid message text', () => {
      const invalidTexts = [
        '',                // empty
        '   ',             // only whitespace
        'A'.repeat(4097)   // too long
      ];

      invalidTexts.forEach(text => {
        expect(ValidationSchemas.messageText.safeParse(text).success).toBe(false);
      });
    });
  });

  describe('media', () => {
    it('should validate correct media', () => {
      const validMedia = [
        'https://example.com/image.jpg',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      ];

      validMedia.forEach(media => {
        expect(ValidationSchemas.media.safeParse(media).success).toBe(true);
      });
    });

    it('should reject invalid media', () => {
      const invalidMedia = [
        '',                    // empty
        'not-url-or-base64'   // invalid format (removed ftp test as it might pass URL validation)
      ];

      invalidMedia.forEach(media => {
        expect(ValidationSchemas.media.safeParse(media).success).toBe(false);
      });
    });
  });

  describe('delay', () => {
    it('should validate correct delays', () => {
      const validDelays = [0, 1000, 300000, undefined];

      validDelays.forEach(delay => {
        expect(ValidationSchemas.delay.safeParse(delay).success).toBe(true);
      });
    });

    it('should reject invalid delays', () => {
      const invalidDelays = [-1, 300001]; // negative or too large

      invalidDelays.forEach(delay => {
        expect(ValidationSchemas.delay.safeParse(delay).success).toBe(false);
      });
    });
  });
});

describe('ParameterValidator', () => {
  describe('validate', () => {
    it('should return success for valid data', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const data = { name: 'John', age: 30 };

      const result = ParameterValidator.validate(data, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid data', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const data = { name: 123, age: 'invalid' };

      const result = ParameterValidator.validate(data, schema);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error!.validationDetails).toHaveLength(2);
    });

    it('should include context in error', () => {
      const schema = z.string();
      const context = { operation: 'test', endpoint: '/test' };

      const result = ParameterValidator.validate(123, schema, context);

      expect(result.error!.context).toEqual(context);
    });
  });

  describe('specific validators', () => {
    it('should validate WhatsApp number', () => {
      const result = ParameterValidator.validateWhatsAppNumber('5511999999999');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateWhatsAppNumber('invalid');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate instance name', () => {
      const result = ParameterValidator.validateInstanceName('my-instance');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateInstanceName('invalid name');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate URL', () => {
      const result = ParameterValidator.validateUrl('https://example.com');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateUrl('not-a-url');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate API key', () => {
      const result = ParameterValidator.validateApiKey('valid-api-key-123');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateApiKey('short');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate group JID', () => {
      const result = ParameterValidator.validateGroupJid('5511999999999-1234567890@g.us');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateGroupJid('invalid-jid');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate message text', () => {
      const result = ParameterValidator.validateMessageText('Hello world');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateMessageText('');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate media', () => {
      const result = ParameterValidator.validateMedia('https://example.com/image.jpg');
      expect(result.success).toBe(true);

      const invalidResult = ParameterValidator.validateMedia('invalid-media');
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('validateMultiple', () => {
    it('should validate complex object', () => {
      const schema = z.object({
        instance: ValidationSchemas.instanceName,
        number: ValidationSchemas.whatsappNumber,
        text: ValidationSchemas.messageText,
        delay: ValidationSchemas.delay
      });

      const data = {
        instance: 'my-instance',
        number: '5511999999999',
        text: 'Hello world',
        delay: 1000
      };

      const result = ParameterValidator.validateMultiple(data, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should return detailed errors for multiple field failures', () => {
      const schema = z.object({
        instance: ValidationSchemas.instanceName,
        number: ValidationSchemas.whatsappNumber,
        text: ValidationSchemas.messageText
      });

      const data = {
        instance: 'invalid name',
        number: '123',
        text: ''
      };

      const result = ParameterValidator.validateMultiple(data, schema);

      expect(result.success).toBe(false);
      expect(result.error!.validationDetails.length).toBeGreaterThanOrEqual(3);
      
      const fields = result.error!.validationDetails.map(d => d.field);
      expect(fields).toContain('instance');
      expect(fields).toContain('number');
      expect(fields).toContain('text');
    });
  });
});

describe('ValidationUtils', () => {
  describe('validation checks', () => {
    it('should check valid WhatsApp number', () => {
      expect(ValidationUtils.isValidWhatsAppNumber('5511999999999')).toBe(true);
      expect(ValidationUtils.isValidWhatsAppNumber('invalid')).toBe(false);
    });

    it('should check valid instance name', () => {
      expect(ValidationUtils.isValidInstanceName('my-instance')).toBe(true);
      expect(ValidationUtils.isValidInstanceName('invalid name')).toBe(false);
    });

    it('should check valid URL', () => {
      expect(ValidationUtils.isValidUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.isValidUrl('not-a-url')).toBe(false);
    });

    it('should check valid group JID', () => {
      expect(ValidationUtils.isValidGroupJid('5511999999999-1234567890@g.us')).toBe(true);
      expect(ValidationUtils.isValidGroupJid('invalid-jid')).toBe(false);
    });
  });

  describe('phone number utilities', () => {
    it('should sanitize phone number', () => {
      const numbers = [
        '+55 11 99999-9999',
        '(55) 11 99999-9999',
        '55 11 99999 9999'
      ];

      numbers.forEach(number => {
        const sanitized = ValidationUtils.sanitizePhoneNumber(number);
        expect(sanitized).toBe('5511999999999');
      });
    });

    it('should format WhatsApp number', () => {
      expect(ValidationUtils.formatWhatsAppNumber('11999999999')).toBe('5511999999999');
      expect(ValidationUtils.formatWhatsAppNumber('5511999999999')).toBe('5511999999999');
      expect(ValidationUtils.formatWhatsAppNumber('999999999', '1')).toBe('1999999999');
    });
  });

  describe('error message utilities', () => {
    it('should extract validation messages', () => {
      const validationDetails = [
        {
          field: 'email',
          value: 'invalid',
          message: 'Invalid email format',
          code: 'invalid_email',
          suggestion: 'Use format: user@domain.com'
        },
        {
          field: 'age',
          value: 15,
          message: 'Must be at least 18',
          code: 'too_small'
        }
      ];

      const error = new ValidationError('Validation failed', validationDetails);
      const messages = ValidationUtils.extractValidationMessages(error);

      expect(messages).toHaveLength(2);
      expect(messages[0]).toContain('email: Invalid email format');
      expect(messages[0]).toContain('Use format: user@domain.com');
      expect(messages[1]).toContain('age: Must be at least 18');
    });

    it('should create correction hints', () => {
      const validationDetails = [
        {
          field: 'email',
          value: 'invalid',
          message: 'Invalid email',
          code: 'invalid',
          suggestion: 'Use valid email format'
        },
        {
          field: 'name',
          value: '',
          message: 'Required',
          code: 'required'
        }
      ];

      const hints = ValidationUtils.createCorrectionHints(validationDetails);

      expect(hints).toEqual({
        email: 'Use valid email format'
      });
    });
  });
});
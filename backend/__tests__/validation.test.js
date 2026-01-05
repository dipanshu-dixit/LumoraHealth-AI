import { chatMessageSchema, validate } from '../middleware/validation.js';

describe('Validation Middleware', () => {
  describe('chatMessageSchema', () => {
    test('accepts valid message', () => {
      const result = validate(chatMessageSchema, { message: 'I have a headache' });
      expect(result.message).toBe('I have a headache');
    });

    test('rejects empty message', () => {
      expect(() => validate(chatMessageSchema, { message: '' }))
        .toThrow('Message cannot be empty');
    });

    test('rejects message over 2000 chars', () => {
      expect(() => validate(chatMessageSchema, { message: 'x'.repeat(2001) }))
        .toThrow('Message too long');
    });

    test('rejects missing message field', () => {
      expect(() => validate(chatMessageSchema, {}))
        .toThrow('Invalid input');
    });

    test('trims whitespace', () => {
      const result = validate(chatMessageSchema, { message: '  test  ' });
      expect(result.message).toBe('test');
    });

    test('throws ValidationError with status 400', () => {
      try {
        validate(chatMessageSchema, { message: '' });
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.status).toBe(400);
      }
    });
  });
});

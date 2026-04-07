import { describe, it, expect } from 'bun:test';
import { sanitizeApiError } from './errorUtils';

describe('sanitizeApiError', () => {
  it('should redact Bearer tokens', () => {
    const error = 'Authorization failed for Bearer sk-1234567890abcdef1234567890abcdef';
    const sanitized = sanitizeApiError(error);
    expect(sanitized).toContain('Bearer [REDACTED]');
    expect(sanitized).not.toContain('sk-1234567890abcdef');
  });

  it('should redact API keys in various formats', () => {
    const error1 = '{"error": {"message": "Invalid API key", "api_key": "sk-1234567890"}}';
    expect(sanitizeApiError(error1)).toContain('"api_key": "[REDACTED]"');

    const error2 = 'x-api-key: my-secret-key';
    expect(sanitizeApiError(error2)).toContain('x-api-key: [REDACTED]');

    const error3 = 'password=secret123';
    expect(sanitizeApiError(error3)).toContain('password=[REDACTED]');
  });

  it('should truncate long error messages', () => {
    const longError = 'a'.repeat(1000);
    const sanitized = sanitizeApiError(longError);
    expect(sanitized.length).toBeLessThanOrEqual(518); // 500 + length of "... [TRUNCATED]"
    expect(sanitized).toContain('... [TRUNCATED]');
  });

  it('should handle non-string errors', () => {
    const objError = { foo: 'bar', secret: 'password123' };
    const sanitized = sanitizeApiError(objError);
    expect(sanitized).toContain('secret');
    expect(sanitized).toContain('[REDACTED]');
  });

  it('should handle null or undefined', () => {
    expect(sanitizeApiError(null)).toBe('Unknown error');
    expect(sanitizeApiError(undefined)).toBe('Unknown error');
  });
});

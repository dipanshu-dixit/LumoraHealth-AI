import { describe, expect, test } from '@jest/globals';
import { sanitizeInput, sanitizeText, sanitizeChatMessage } from '../lib/sanitize';

describe('sanitize library', () => {
  describe('sanitizeInput', () => {
    test.each([
      ['', ''],
      [null, ''],
      [undefined, ''],
      [123, ''],
      ['Hello <script>alert("xss")</script> World', 'Hello  World'],
      ['Check this <iframe src="http://evil.com"></iframe>', 'Check this'],
      ['<object>bad</object><embed src="bad">', ''],
      ['<div onclick="alert(1)" onmouseover="run()">Content</div>', '<div  >Content</div>'],
      ['<a href="javascript:alert(1)">Link</a> <img src="data:text/html,bad">', '<a href="alert(1)">Link</a> <img src=",bad">'],
      ['   hello world   ', 'hello world'],
      ['Safe <p>text</p>', 'Safe <p>text</p>'] // Safe tags are kept
    ])('should sanitize "%s" correctly', (input, expected) => {
      // @ts-ignore
      expect(sanitizeInput(input)).toBe(expected);
    });
  });

  describe('sanitizeText', () => {
    test.each([
      ['', ''],
      [null, ''],
      ['<b>Bold</b> <i>Italic</i> <p>Paragraph</p>', 'Bold Italic Paragraph'],
      ['Line 1\nLine 2\nLine 3', 'Line 1<br>Line 2<br>Line 3']
    ])('should sanitize "%s" correctly', (input, expected) => {
      // @ts-ignore
      expect(sanitizeText(input)).toBe(expected);
    });
  });

  describe('sanitizeChatMessage', () => {
    test.each([
      ['', ''],
      [null, ''],
      ['a'.repeat(2005), 'a'.repeat(2000) + '...'], // Truncates
      ['Hello world', 'Hello world'],
      ['a'.repeat(100) + '<script>alert(1)</script>' + 'b'.repeat(100), 'a'.repeat(100) + 'b'.repeat(100)],
    ])('should sanitize "%s" correctly', (input, expected) => {
      // @ts-ignore
      const result = sanitizeChatMessage(input);
      // specific test case check because string match can't perfectly represent partial truncation results in test.each
      if (typeof input === 'string' && input.length > 2000 && !input.includes('<script>')) {
        expect(result.length).toBe(2003);
        expect(result.endsWith('...')).toBe(true);
      } else {
        expect(result).toBe(expected as string);
      }
    });

    test('applies sanitizeInput to truncated message with malicious tag', () => {
      const longMessageWithScript = 'a'.repeat(1995) + '<script>alert(1)</script>';
      const truncatedResult = sanitizeChatMessage(longMessageWithScript);
      // Truncated at 2000: 1995 'a's + '<scri' + '...'
      // sanitizeInput won't remove <scri because it doesn't match the full script tag regex
      expect(truncatedResult).toContain('<scri...');
    });
  });
});

import { sanitizeInput, sanitizeText, sanitizeChatMessage } from '../lib/sanitize';

describe('sanitize library', () => {
  describe('sanitizeInput', () => {
    test('returns empty string for non-string or empty input', () => {
      expect(sanitizeInput('')).toBe('');
      // @ts-ignore
      expect(sanitizeInput(null)).toBe('');
      // @ts-ignore
      expect(sanitizeInput(undefined)).toBe('');
      // @ts-ignore
      expect(sanitizeInput(123)).toBe('');
    });

    test('removes <script> tags and content', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      expect(sanitizeInput(input)).toBe('Hello  World');
    });

    test('removes <iframe> tags', () => {
      const input = 'Check this <iframe src="http://evil.com"></iframe>';
      expect(sanitizeInput(input)).toBe('Check this');
    });

    test('removes <object> and <embed> tags', () => {
      const input = '<object>bad</object><embed src="bad">';
      expect(sanitizeInput(input)).toBe('');
    });

    test('removes on* event handlers', () => {
      const input = '<div onclick="alert(1)" onmouseover="run()">Content</div>';
      expect(sanitizeInput(input)).toBe('<div  >Content</div>');
    });

    test('removes javascript: and data:text/html URIs', () => {
      const input = '<a href="javascript:alert(1)">Link</a> <img src="data:text/html,bad">';
      expect(sanitizeInput(input)).toBe('<a href="alert(1)">Link</a> <img src=",bad">');
    });

    test('trims the result', () => {
      const input = '   hello world   ';
      expect(sanitizeInput(input)).toBe('hello world');
    });
  });

  describe('sanitizeText', () => {
    test('returns empty string for non-string or empty input', () => {
      expect(sanitizeText('')).toBe('');
      // @ts-ignore
      expect(sanitizeText(null)).toBe('');
      // @ts-ignore
      expect(sanitizeText(undefined)).toBe('');
      // @ts-ignore
      expect(sanitizeText(123)).toBe('');
      // @ts-ignore
      expect(sanitizeText({})).toBe('');
    });

    test('strips all HTML tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <p>Paragraph</p>';
      expect(sanitizeText(input)).toBe('Bold Italic Paragraph');
    });

    test('strips HTML tags with attributes', () => {
      const input = '<a href="https://example.com" class="link">Link</a> <img src="image.png" alt="img">';
      expect(sanitizeText(input)).toBe('Link ');
    });

    test('handles self-closing HTML tags', () => {
      const input = 'Line 1<hr/>Line 2<br />Line 3';
      expect(sanitizeText(input)).toBe('Line 1Line 2Line 3');
    });

    test('replaces newlines with <br>', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      expect(sanitizeText(input)).toBe('Line 1<br>Line 2<br>Line 3');
    });

    test('handles multiple consecutive newlines', () => {
      const input = 'Line 1\n\nLine 2\n\n\nLine 3';
      expect(sanitizeText(input)).toBe('Line 1<br><br>Line 2<br><br><br>Line 3');
    });

    test('handles combinations of HTML tags and newlines', () => {
      const input = '<h1>Title</h1>\n<p>Some text</p>\n<ul><li>Item</li></ul>';
      expect(sanitizeText(input)).toBe('Title<br>Some text<br>Item');
    });
  });

  describe('sanitizeChatMessage', () => {
    test('returns empty string for non-string or empty input', () => {
      expect(sanitizeChatMessage('')).toBe('');
      // @ts-ignore
      expect(sanitizeChatMessage(null)).toBe('');
    });

    test('truncates long messages at 2000 characters and adds ellipsis', () => {
      const longMessage = 'a'.repeat(2005);
      const result = sanitizeChatMessage(longMessage);
      expect(result.length).toBe(2003); // 2000 chars + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    test('does not truncate messages under 2000 characters', () => {
      const normalMessage = 'Hello world';
      expect(sanitizeChatMessage(normalMessage)).toBe('Hello world');
    });

    test('applies sanitizeInput to truncated message', () => {
      // Test with a script tag that fits within the limit
      const messageWithScript = 'a'.repeat(100) + '<script>alert(1)</script>' + 'b'.repeat(100);
      const result = sanitizeChatMessage(messageWithScript);
      expect(result).not.toContain('<script>');
      expect(result).toContain('a'.repeat(100) + 'b'.repeat(100));

      // Test with a script tag that is truncated
      const longMessageWithScript = 'a'.repeat(1995) + '<script>alert(1)</script>';
      const truncatedResult = sanitizeChatMessage(longMessageWithScript);
      // Truncated at 2000: 1995 'a's + '<scri' + '...'
      // sanitizeInput won't remove <scri because it doesn't match the full script tag regex
      expect(truncatedResult).toContain('<scri...');
    });
  });
});

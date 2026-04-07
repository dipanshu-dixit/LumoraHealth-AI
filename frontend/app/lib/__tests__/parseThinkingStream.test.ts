import { parseThinkingStream, parseThinkingBullets } from '../parseThinkingStream';

describe('parseThinkingStream', () => {
  describe('parseThinkingStream function', () => {
    it('handles null, undefined, or non-string inputs', () => {
      // @ts-ignore - testing invalid inputs
      expect(parseThinkingStream(null)).toEqual({ thinking: null, response: '' });
      // @ts-ignore
      expect(parseThinkingStream(undefined)).toEqual({ thinking: null, response: '' });
      // @ts-ignore
      expect(parseThinkingStream(123)).toEqual({ thinking: null, response: '' });
      // @ts-ignore
      expect(parseThinkingStream({})).toEqual({ thinking: null, response: '' });
    });

    it('handles empty strings', () => {
      expect(parseThinkingStream('')).toEqual({ thinking: null, response: '' });
      expect(parseThinkingStream('   ')).toEqual({ thinking: null, response: '' });
    });

    it('extracts strict XML <thinking> tags', () => {
      const input = '<thinking>This is my thought process</thinking>Here is the final answer';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'This is my thought process',
        response: 'Here is the final answer'
      });
    });

    it('handles <thinking> tags with newlines', () => {
      const input = `<thinking>
Thought 1
Thought 2
</thinking>
Final Answer`;
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought 1\nThought 2',
        response: 'Final Answer'
      });
    });

    it('extracts strict XML <thinking> tags when response precedes the tags', () => {
      const input = 'Here is the final answer<thinking>This is my thought process</thinking>';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'This is my thought process',
        response: 'Here is the final answer'
      });
    });

    it('extracts strict XML <thinking> tags when response surrounds the tags', () => {
      const input = 'Before<thinking>This is my thought process</thinking>After';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'This is my thought process',
        response: 'BeforeAfter'
      });
    });

    it('handles malformed XML - missing opening <', () => {
      const input = 'thinking>Thought</thinking>Response';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought',
        response: 'Response'
      });
    });

    it('handles malformed XML - missing closing <', () => {
      const input = '<thinking>Thought/thinking>Response';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought',
        response: 'Response'
      });
    });

    it('handles malformed XML - dash instead of <', () => {
      const input = '-thinking>Thought</-thinking>Response';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought',
        response: 'Response'
      });
    });

    it('handles malformed XML - square brackets', () => {
      const input = '[thinking]Thought[/thinking]Response';
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought',
        response: 'Response'
      });
    });

    it('handles "Thinking:" prefixed lines', () => {
      const input = `Thinking: Thought 1
Thinking: Thought 2
Response line 1
Response line 2`;
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought 1\nThought 2',
        response: 'Response line 1\nResponse line 2'
      });
    });

    it('handles "Thinking:" prefixed lines interspersed with empty lines', () => {
      const input = `Thinking: Thought 1

Thinking: Thought 2

Response line 1`;
      expect(parseThinkingStream(input)).toEqual({
        thinking: 'Thought 1\nThought 2',
        response: 'Response line 1'
      });
    });

    it('returns null thinking if no thinking content is detected', () => {
      const input = 'Just a regular response';
      expect(parseThinkingStream(input)).toEqual({
        thinking: null,
        response: 'Just a regular response'
      });
    });
  });

  describe('parseThinkingBullets function', () => {
    it('returns empty array for falsy input', () => {
      expect(parseThinkingBullets('')).toEqual([]);
      // @ts-ignore
      expect(parseThinkingBullets(null)).toEqual([]);
      // @ts-ignore
      expect(parseThinkingBullets(undefined)).toEqual([]);
    });

    it('splits into bullets and trims lines', () => {
      const input = `
        Point 1
        Point 2
      `;
      expect(parseThinkingBullets(input)).toEqual(['Point 1', 'Point 2']);
    });

    it('removes existing bullet markers', () => {
      const input = `
        - Point 1
        * Point 2
        • Point 3
      `;
      expect(parseThinkingBullets(input)).toEqual(['Point 1', 'Point 2', 'Point 3']);
    });

    it('handles bullet markers without space correctly', () => {
      // The current implementation is /^[-•*]\s*/ so it removes the bullet and optional space
      const input = `
        -Point 1
        *Point 2
        •Point 3
      `;
      expect(parseThinkingBullets(input)).toEqual(['Point 1', 'Point 2', 'Point 3']);
    });

    it('ignores non-bullet lines', () => {
      const input = `
        Point 1
        - Point 2
        Another point
      `;
      expect(parseThinkingBullets(input)).toEqual(['Point 1', 'Point 2', 'Another point']);
    });

    it('filters out empty lines', () => {
      const input = `
        - Point 1

        - Point 2
      `;
      expect(parseThinkingBullets(input)).toEqual(['Point 1', 'Point 2']);
    });
  });
});

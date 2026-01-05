/**
 * Parses LLM response stream to extract thinking process and final response
 * Prioritizes strict XML tags with graceful fallback handling
 */
export function parseThinkingStream(rawResponse: string): { thinking: string | null; response: string } {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return { thinking: null, response: '' };
  }

  const trimmedResponse = rawResponse.trim();
  
  // Priority 1: Handle strict XML <thinking>...</thinking> tags
  const strictXmlMatch = trimmedResponse.match(/<thinking>([\s\S]*?)<\/thinking>/);
  if (strictXmlMatch) {
    const thinking = strictXmlMatch[1].trim();
    const response = trimmedResponse.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
    
    return {
      thinking: thinking || null,
      response: response || trimmedResponse
    };
  }

  // Fallback 1: Handle malformed XML variations (missing <, >, etc.)
  const malformedXmlPatterns = [
    /thinking>([\s\S]*?)<\/thinking>/, // Missing opening <
    /<thinking>([\s\S]*?)\/thinking>/, // Missing closing <
    /-thinking>([\s\S]*?)<\/-thinking>/, // Dash instead of <
    /\[thinking\]([\s\S]*?)\[\/thinking\]/, // Square brackets
  ];

  for (const pattern of malformedXmlPatterns) {
    const match = trimmedResponse.match(pattern);
    if (match) {
      const thinking = match[1].trim();
      const response = trimmedResponse.replace(pattern, '').trim();
      
      return {
        thinking: thinking || null,
        response: response || trimmedResponse
      };
    }
  }

  // Fallback 2: Handle "Thinking:" prefixed lines
  if (trimmedResponse.includes('Thinking:')) {
    const lines = trimmedResponse.split('\n');
    const thinkingLines: string[] = [];
    const responseLines: string[] = [];
    let foundNonThinkingLine = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Thinking:') && !foundNonThinkingLine) {
        thinkingLines.push(trimmedLine.replace(/^Thinking:\s*/, ''));
      } else if (trimmedLine) {
        foundNonThinkingLine = true;
        responseLines.push(line);
      } else if (foundNonThinkingLine) {
        responseLines.push(line);
      }
    }

    if (thinkingLines.length > 0) {
      return {
        thinking: thinkingLines.join('\n').trim() || null,
        response: responseLines.join('\n').trim() || trimmedResponse
      };
    }
  }

  // No thinking content detected
  return {
    thinking: null,
    response: trimmedResponse
  };
}

/**
 * Parses thinking content into bullet points
 */
export function parseThinkingBullets(thinking: string): string[] {
  if (!thinking) return [];
  
  return thinking
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-•*]\s*/, '')); // Remove existing bullet markers
}
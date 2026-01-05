/**
 * Sanitizes user input to prevent XSS attacks in healthcare chat
 * Critical for protecting sensitive medical conversations
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Server-safe XSS protection - remove dangerous elements
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
}

/**
 * Sanitizes text for safe display in healthcare UI
 * Strips all HTML but preserves line breaks
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\n/g, '<br>');
}

/**
 * Validates and sanitizes medical chat messages
 * Ensures no malicious content in patient communications
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // Limit message length for healthcare context
  const maxLength = 2000;
  const truncated = message.length > maxLength ? 
    message.substring(0, maxLength) + '...' : message;

  return sanitizeInput(truncated);
}
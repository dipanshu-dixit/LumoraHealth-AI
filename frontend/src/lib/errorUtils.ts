/**
 * Sanitizes API error messages to prevent leakage of sensitive information
 * such as API keys, tokens, or excessive internal details.
 */
export function sanitizeApiError(error: unknown): string {
  if (!error) return 'Unknown error';

  let errorMessage = '';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    try {
      errorMessage = JSON.stringify(error);
    } catch {
      errorMessage = String(error);
    }
  }

  // Redact Bearer tokens (standard JWT/API token format)
  errorMessage = errorMessage.replace(/Bearer\s+[\w\-\.]+/gi, 'Bearer [REDACTED]');

  // Redact API keys in various formats (e.g., "api_key": "...", api-key: ..., etc.)
  errorMessage = errorMessage.replace(/(api[_-]?key|access[_-]?token|secret|password|auth[_-]?token|x-api-key)([:=]\s*|["']:\s*["'])[\w\-\._~\+\/]+/gi, '$1$2[REDACTED]');

  // Truncate to prevent log flooding and potential log injection issues
  const MAX_LENGTH = 500;
  if (errorMessage.length > MAX_LENGTH) {
    errorMessage = errorMessage.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
  }

  return errorMessage;
}

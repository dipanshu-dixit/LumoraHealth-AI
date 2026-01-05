# Lumora API Documentation

## Overview

The Lumora API provides endpoints for AI-powered health consultations with privacy-first security features including CSRF protection, rate limiting, and input sanitization.

**Base URL**: `http://localhost:5000` (development)

---

## Authentication

### CSRF Token

All POST requests require a valid CSRF token obtained from the `/api/csrf-token` endpoint.

**Token Characteristics:**
- Single-use only
- 15-minute TTL
- Automatically cleaned up when expired
- Must be included in `x-csrf-token` header

---

## Endpoints

### 1. Get CSRF Token

Obtain a CSRF token for protected requests.

**Endpoint**: `GET /api/csrf-token`

**Response**:
```json
{
  "csrfToken": "a1b2c3d4e5f6..."
}
```

**Status Codes**:
- `200 OK` - Token generated successfully

**Example**:
```bash
curl http://localhost:5000/api/csrf-token
```

---

### 2. Chat Endpoint

Send a message to the AI health assistant.

**Endpoint**: `POST /api/chat`

**Headers**:
```
Content-Type: application/json
x-csrf-token: <token-from-csrf-endpoint>
```

**Request Body**:
```json
{
  "message": "I have a headache that started this morning",
  "conversation": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant",
      "content": "Previous AI response"
    }
  ]
}
```

**Parameters**:
- `message` (string, required): User's health query (1-2000 characters)
- `conversation` (array, optional): Previous conversation context (last 6 messages)

**Response**:

Streaming text/plain response with AI-generated content.

**Status Codes**:
- `200 OK` - Successful response
- `400 Bad Request` - Invalid message format
- `403 Forbidden` - Invalid or expired CSRF token
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Example**:
```bash
# Get CSRF token
TOKEN=$(curl -s http://localhost:5000/api/csrf-token | jq -r .csrfToken)

# Send chat message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -d '{
    "message": "I have a headache",
    "conversation": []
  }'
```

---

### 3. Health Check

Check server status and availability.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok"
}
```

**Status Codes**:
- `200 OK` - Server is healthy

**Example**:
```bash
curl http://localhost:5000/health
```

---

## Rate Limiting

### Global Rate Limit
- **Limit**: 120 requests per minute per IP
- **Window**: 60 seconds
- **Response**: `429 Too Many Requests`
- **Header**: `Retry-After` (seconds until reset)

### Chat Endpoint Rate Limit
- **Limit**: 20 requests per minute per IP
- **Window**: 60 seconds
- **Response**: `429 Too Many Requests`
- **Header**: `Retry-After` (seconds until reset)

**Example Rate Limit Response**:
```json
{
  "error": "Too many requests"
}
```

**Headers**:
```
Retry-After: 45
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common Errors

#### 400 Bad Request
```json
{
  "error": "Message required"
}
```

**Causes**:
- Empty or missing message
- Message exceeds 2000 characters
- Invalid JSON format

#### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

**Causes**:
- Missing CSRF token
- Expired CSRF token
- Already-used CSRF token

#### 429 Too Many Requests
```json
{
  "error": "Too many requests"
}
```

**Causes**:
- Exceeded rate limit
- Too many requests from same IP

---

## Security Features

### Input Sanitization

All user input is sanitized to prevent XSS attacks:

**Backend Sanitization**:
- HTML entity escaping
- Maximum length enforcement (1000 characters)
- Whitespace trimming

**Frontend Sanitization**:
- DOMPurify for HTML content
- Zod schema validation
- Type checking

### CORS Policy

**Allowed Origins**:
- `http://localhost:3000` (development)
- Production domain (configured via environment)

**Allowed Methods**:
- `GET`, `POST`

**Allowed Headers**:
- `Content-Type`
- `x-csrf-token`

---

## Best Practices

### 1. Token Management

```javascript
// Always fetch a fresh token before POST requests
const getCSRFToken = async () => {
  const response = await fetch('/api/csrf-token');
  const { csrfToken } = await response.json();
  return csrfToken;
};

// Use token immediately (single-use)
const token = await getCSRFToken();
await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token
  },
  body: JSON.stringify({ message: 'Hello' })
});
```

### 2. Error Handling

```javascript
try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.log(`Rate limited. Retry after ${retryAfter}s`);
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('Chat API error:', error);
  // Show user-friendly error message
}
```

### 3. Conversation Context

```javascript
// Keep last 6 messages for context
const conversation = messages
  .slice(-6)
  .map(m => ({
    role: m.isUser ? 'user' : 'assistant',
    content: m.content
  }));

await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token
  },
  body: JSON.stringify({
    message: newMessage,
    conversation
  })
});
```

---

## Support

For API issues or questions:
- **GitHub Issues**: [Report a bug](https://github.com/yourusername/lumora/issues)
- **Documentation**: [Full docs](../README.md)
- **Email**: api-support@lumora.health
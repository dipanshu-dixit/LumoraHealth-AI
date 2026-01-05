import express from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';
import { errorHandler, asyncHandler, logger } from './middleware/errorHandler.js';
import { httpsEnforcement, securityHeaders } from './middleware/security-headers.js';
import { chatMessageSchema, validate } from './middleware/validation.js';
import { performanceMonitoring, getMetricsSummary } from './middleware/performance.js';

const app = express();
const PORT = 5000;

// Security first
app.use(httpsEnforcement);
app.use(securityHeaders);
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.use(performanceMonitoring);

// Simple in-memory rate limiter factory
const rateLimit = ({ windowMs = 60 * 1000, max = 60 } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    try {
      const key = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const entry = hits.get(key) || { count: 0, reset: now + windowMs };

      if (now > entry.reset) {
        entry.count = 0;
        entry.reset = now + windowMs;
      }

      entry.count += 1;
      hits.set(key, entry);

      if (entry.count > max) {
        const retryAfter = Math.ceil((entry.reset - now) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: 'Too many requests' });
      }

      next();
    } catch (err) {
      next();
    }
  };
};

// Apply a moderate global rate limit and a stricter limit for chat
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// CSRF protection with TTL
// Map token -> expiry timestamp
const csrfTokens = new Map();
const CSRF_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Periodic cleanup of expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of csrfTokens) {
    if (exp <= now) csrfTokens.delete(t);
  }
}, 60 * 1000);

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = randomBytes(32).toString('hex');
  const expiry = Date.now() + CSRF_TTL_MS;
  csrfTokens.set(token, expiry);
  res.json({ csrfToken: token });
});

const validateCSRF = (req, res, next) => {
  const token = req.headers['x-csrf-token'];
  if (!token) {
    return res.status(403).json({ error: 'CSRF token required' });
  }
  if (!csrfTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  const expiry = csrfTokens.get(token);
  if (Date.now() > expiry) {
    csrfTokens.delete(token);
    return res.status(403).json({ error: 'CSRF token expired' });
  }
  // single-use token
  csrfTokens.delete(token);
  next();
};

// Secure chat endpoint with Zod validation
app.post('/api/chat', rateLimit({ windowMs: 60 * 1000, max: 20 }), validateCSRF, asyncHandler(async (req, res) => {
  // Zod validation - fail fast with clear errors
  const { message } = validate(chatMessageSchema, req.body);

  logger.info('Chat request received', { 
    messageLength: message.length,
    ip: req.ip 
  });

  const responses = [
    "Thank you for describing your symptoms. Can you provide more details about when these began?",
    "I understand your health concern. Have you noticed any patterns or triggers?",
    "Based on your description, I recommend discussing this with your healthcare provider. Can you tell me about the severity?",
    "This information is helpful for assessment. Have you experienced similar symptoms before?"
  ];
  
  res.json({ response: responses[Math.floor(Math.random() * responses.length)] });
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const summary = getMetricsSummary();
  res.json(summary);
});

// Add error handling middleware
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});

app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
});
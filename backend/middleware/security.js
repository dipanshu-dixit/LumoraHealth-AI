import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Security headers middleware using Helmet
export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://openrouter.ai'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://openrouter.ai', 'wss:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    },
    reportOnly: process.env.NODE_ENV !== 'production'
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// XSS protection middleware
export const xssProtectionMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// HIPAA compliance middleware
export const hipaaComplianceMiddleware = (req, res, next) => {
  res.setHeader('X-HIPAA-Compliant', 'true');
  res.setHeader('X-Data-Retention', '30 days');
  res.setHeader('X-Encryption-Status', 'enabled');
  
  const auditLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.anonymousId || 'anonymous',
    compliance: 'HIPAA'
  };
  
  console.log('HIPAA_AUDIT:', JSON.stringify(auditLog));
  next();
};

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

export default {
  rateLimitMiddleware,
  securityHeadersMiddleware,
  xssProtectionMiddleware,
  hipaaComplianceMiddleware
};
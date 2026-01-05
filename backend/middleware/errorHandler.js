// Central error handling middleware for Lumora survivability
const logger = {
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn', 
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message, 
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

// Never leak raw errors to users
const sanitizeError = (error, req) => {
  const errorId = Date.now().toString(36);
  
  // Log full error details internally
  logger.error('Request failed', {
    errorId,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Return safe error to user
  if (error.name === 'ValidationError') {
    return { error: 'Invalid input provided', errorId };
  }
  
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return { error: 'Service temporarily unavailable', errorId };
  }

  if (error.status === 429) {
    return { error: 'Too many requests, please try again later', errorId };
  }

  // Default safe error
  return { error: 'Something went wrong, please try again', errorId };
};

// Central error middleware
const errorHandler = (error, req, res, next) => {
  const safeError = sanitizeError(error, req);
  const statusCode = error.status || error.statusCode || 500;
  
  res.status(statusCode).json(safeError);
};

// Async wrapper to catch promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { errorHandler, asyncHandler, logger };
import { logger } from './errorHandler.js';

// Track API performance
export const performanceMonitoring = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode
      });
    }

    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode
      });
    }

    // Track metrics
    trackMetric('api_request', duration, {
      method: req.method,
      endpoint: req.url,
      status: res.statusCode
    });

    return originalSend.call(this, data);
  };

  next();
};

// In-memory metrics storage
const metrics = {
  requests: [],
  errors: [],
  performance: []
};

const MAX_METRICS = 1000;

const trackMetric = (type, value, metadata) => {
  const metric = {
    type,
    value,
    metadata,
    timestamp: Date.now()
  };

  if (!metrics[type]) {
    metrics[type] = [];
  }

  metrics[type].push(metric);

  if (metrics[type].length > MAX_METRICS) {
    metrics[type].shift();
  }
};

// Get metrics summary
export const getMetricsSummary = () => {
  const summary = {
    requests: {
      total: metrics.requests?.length || 0,
      avgDuration: calculateAverage(metrics.requests, 'value'),
      slowest: findSlowest(metrics.requests)
    },
    errors: {
      total: metrics.errors?.length || 0,
      recent: metrics.errors?.slice(-5) || []
    }
  };

  return summary;
};

const calculateAverage = (arr, key) => {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, item) => acc + (item[key] || 0), 0);
  return Math.round(sum / arr.length);
};

const findSlowest = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr.reduce((max, item) => 
    (item.value > (max?.value || 0)) ? item : max
  , null);
};

export { trackMetric };

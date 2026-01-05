import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  const { name, value, rating, delta, id } = metric;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, {
      value: Math.round(value),
      rating,
      delta: Math.round(delta)
    });
  }

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const body = JSON.stringify({
      name,
      value: Math.round(value),
      rating,
      delta: Math.round(delta),
      id,
      url: window.location.href,
      timestamp: Date.now()
    });

    try {
      navigator.sendBeacon('/api/analytics/vitals', body);
    } catch (error) {
      console.error('[Performance] Failed to send beacon:', error);
    }
  }
};

export const initPerformanceMonitoring = () => {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
};

export const trackMetric = (name: string, value: number, metadata: any = {}) => {
  const metric = {
    name,
    value,
    metadata,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : ''
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Custom Metric] ${name}:`, value, metadata);
  }

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      navigator.sendBeacon('/api/analytics/custom', JSON.stringify(metric));
    } catch (error) {
      console.error('[Custom Metric] Failed to send beacon:', error);
    }
  }
};

export const trackAPICall = (endpoint: string, duration: number, status: string) => {
  trackMetric('api_call', duration, { endpoint, status });
};

export const trackInteraction = (action: string, duration: number) => {
  trackMetric('user_interaction', duration, { action });
};

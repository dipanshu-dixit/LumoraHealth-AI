import { useEffect, useRef } from 'react';
import { trackMetric, trackInteraction } from '../lib/performance';

// Track component mount time
export const usePerformanceMonitor = (componentName: string) => {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - mountTime.current;
    trackMetric('component_render', renderTime, { component: componentName });

    return () => {
      const lifetime = Date.now() - mountTime.current;
      trackMetric('component_lifetime', lifetime, { component: componentName });
    };
  }, [componentName]);
};

// Track user interactions
export const useInteractionTracking = () => {
  const trackClick = (action: string) => {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      trackInteraction(action, duration);
    };
  };

  return { trackClick };
};

// Track API calls
export const useAPITracking = () => {
  const trackAPI = async (endpoint: string, fetchFn: () => Promise<any>) => {
    const start = Date.now();
    try {
      const result = await fetchFn();
      const duration = Date.now() - start;
      trackMetric('api_call', duration, { endpoint, status: 'success' });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      trackMetric('api_call', duration, { endpoint, status: 'error' });
      throw error;
    }
  };

  return { trackAPI };
};

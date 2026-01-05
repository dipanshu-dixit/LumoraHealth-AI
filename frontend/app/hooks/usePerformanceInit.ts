'use client';

import { useEffect } from 'react';

export function usePerformanceInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Simple Web Vitals tracking
    const trackVital = (name: string, value: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}:`, Math.round(value));
      }
      
      // Send to analytics
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', JSON.stringify({
          name,
          value: Math.round(value),
          timestamp: Date.now(),
          url: window.location.href
        }));
      }
    };

    // Track LCP
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      trackVital('LCP', lastEntry.startTime);
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support
    }

    return () => {
      observer.disconnect();
    };
  }, []);
}

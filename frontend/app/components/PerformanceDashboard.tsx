'use client';

import { useEffect, useState } from 'react';
import { Activity, Zap, Clock, TrendingUp, Eye } from 'lucide-react';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export default function PerformanceDashboard() {
  const [vitals, setVitals] = useState<WebVital[]>([]);
  const [apiMetrics, setApiMetrics] = useState({ total: 0, avgDuration: 0 });
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    // Capture Web Vitals using the Web Vitals API
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        const handleVital = (metric: any) => {
          const value = metric.value;
          let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
          
          // Rating thresholds based on Web Vitals standards
          if (metric.name === 'CLS') {
            rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
          } else if (metric.name === 'INP') {
            rating = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
          } else if (metric.name === 'LCP') {
            rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
          } else if (metric.name === 'FCP') {
            rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
          } else if (metric.name === 'TTFB') {
            rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
          }

          setVitals(prev => {
            const filtered = prev.filter(v => v.name !== metric.name);
            return [...filtered, { name: metric.name, value, rating }];
          });
        };

        onCLS(handleVital);
        onFCP(handleVital);
        onLCP(handleVital);
        onTTFB(handleVital);
        onINP(handleVital);
      });
    }

    // Fetch API metrics
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/analytics/vitals');
        const data = await res.json();
        setApiMetrics({
          total: data.total || 0,
          avgDuration: data.avgDuration || 0
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        const usedMB = Math.round(mem.usedJSHeapSize / 1048576);
        setMemoryUsage(usedMB);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(memoryInterval);
    };
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'needs-improvement': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'poor': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') return value.toFixed(3);
    return Math.round(value) + 'ms';
  };

  return (
    <div className="space-y-4">
      {/* Web Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {vitals.map(vital => (
          <div key={vital.name} className={`border rounded-lg p-4 ${getRatingColor(vital.rating)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold opacity-70">{vital.name}</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{formatValue(vital.name, vital.value)}</div>
            <div className="text-xs mt-1 capitalize">{vital.rating.replace('-', ' ')}</div>
          </div>
        ))}
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Total Metrics</span>
          </div>
          <div className="text-2xl font-bold text-black">{apiMetrics.total}</div>
        </div>

        {memoryUsage > 0 && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-zinc-400">Memory Usage</span>
            </div>
            <div className="text-2xl font-bold text-black">{memoryUsage} MB</div>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Live monitoring active</span>
      </div>
    </div>
  );
}

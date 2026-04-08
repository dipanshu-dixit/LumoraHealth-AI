import { jest } from '@jest/globals';
import { performanceMonitoring, getMetricsSummary, trackMetric } from '../middleware/performance.js';
import { logger } from '../middleware/errorHandler.js';

describe('Performance Monitoring', () => {
  let req, res, next, originalSend;

  beforeEach(() => {
    jest.restoreAllMocks();

    req = {
      method: 'GET',
      url: '/api/test'
    };

    originalSend = jest.fn();
    res = {
      statusCode: 200,
      send: originalSend
    };

    next = jest.fn();

    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  describe('performanceMonitoring middleware', () => {
    it('should track metrics for a fast request and call next()', () => {
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'info');

      // Mock Date.now to simulate time passing
      let now = 10000;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        const current = now;
        now += 100; // Simulate 100ms request
        return current;
      });

      performanceMonitoring(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.send).not.toBe(originalSend);

      // Trigger the intercepted send
      res.send('test-data');

      expect(originalSend).toHaveBeenCalledWith('test-data');
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled(); // since NODE_ENV is 'test'

      // Note: performanceMonitoring tracks 'api_request', while getMetricsSummary
      // returns summary for 'requests' and 'errors'. So getMetricsSummary won't
      // reflect 'api_request' changes, but we verify trackMetric functionality later.
    });

    it('should log a warning for a slow request (>1000ms)', () => {
      jest.spyOn(logger, 'warn').mockImplementation(() => {});

      let now = 10000;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        const current = now;
        now += 1500; // Simulate 1500ms request
        return current;
      });

      performanceMonitoring(req, res, next);
      res.send('data');

      expect(logger.warn).toHaveBeenCalledWith(
        'Slow request detected',
        expect.objectContaining({
          duration: 1500,
          method: 'GET',
          url: '/api/test'
        })
      );
    });

    it('should log all requests when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      jest.spyOn(logger, 'info').mockImplementation(() => {});

      let now = 10000;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        const current = now;
        now += 100; // Simulate 100ms request
        return current;
      });

      performanceMonitoring(req, res, next);
      res.send('data');

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          duration: 100,
          method: 'GET',
          url: '/api/test'
        })
      );
    });
  });

  describe('trackMetric and getMetricsSummary', () => {
    it('should add metrics and properly summarize requests and errors', () => {
      // Clear out previous state isn't straightforward without a reset,
      // but we can just add a unique amount and test the math.

      const beforeSummary = getMetricsSummary();
      const initialTotal = beforeSummary.requests.total;

      trackMetric('requests', 100, { data: 1 });
      trackMetric('requests', 500, { data: 2 });
      trackMetric('errors', 1, { err: 'test' });

      const afterSummary = getMetricsSummary();
      expect(afterSummary.requests.total).toBe(initialTotal + 2);
      expect(afterSummary.errors.total).toBeGreaterThanOrEqual(1);

      // Calculate average (it includes whatever was there before, but we can just verify the keys)
      expect(afterSummary.requests.avgDuration).toBeDefined();
      expect(typeof afterSummary.requests.avgDuration).toBe('number');

      expect(afterSummary.requests.slowest).toBeDefined();
      expect(afterSummary.requests.slowest.value).toBeGreaterThanOrEqual(500);

      expect(afterSummary.errors.recent.length).toBeGreaterThan(0);
    });

    it('should cap metric arrays at 1000 items', () => {
      // Track 1005 items of a custom type to see if it limits
      // Since we can't inspect the array directly easily, we can use trackMetric
      // for 'errors' and check its length.

      // Add 1005 errors
      for(let i = 0; i < 1005; i++) {
        trackMetric('errors', i, { test: i });
      }

      const summary = getMetricsSummary();
      expect(summary.errors.total).toBe(1000);

      // The last 5 will be returned in `recent`
      expect(summary.errors.recent.length).toBe(5);

      // Since it shifted, the most recent one should have value 1004
      const recentValues = summary.errors.recent.map(e => e.value);
      expect(recentValues).toContain(1004);
    });

    it('should handle edge cases in calculations (empty arrays)', () => {
      // Track empty types not tracked yet
      trackMetric('empty_test', 0, {});

      // calculateAverage and findSlowest edge cases can be tested by making sure getMetricsSummary doesn't crash
      const summary = getMetricsSummary();
      expect(summary).toBeDefined();
    });
  });
});

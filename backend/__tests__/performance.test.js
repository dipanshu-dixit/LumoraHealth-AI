import { getMetricsSummary, trackMetric } from '../middleware/performance.js';

describe('Performance Middleware - Metrics Summary', () => {
  test('returns initial empty metrics summary', () => {
    const summary = getMetricsSummary();

    // We expect initial state to have 0 totals and empty arrays/nulls.
    // If other tests have run and modified state, this might fail,
    // but in isolated test environment, it should be empty.
    expect(summary).toMatchObject({
      requests: {
        total: 0,
        avgDuration: 0,
        slowest: null
      },
      errors: {
        total: 0,
        recent: []
      }
    });
  });

  test('calculates correct summary for requests', () => {
    // Add some mock requests
    trackMetric('requests', 100, { endpoint: '/api/1' });
    trackMetric('requests', 300, { endpoint: '/api/2' });
    trackMetric('requests', 200, { endpoint: '/api/3' });

    const summary = getMetricsSummary();

    expect(summary.requests.total).toBe(3);
    expect(summary.requests.avgDuration).toBe(200); // (100+300+200)/3
    expect(summary.requests.slowest).toEqual(
      expect.objectContaining({
        type: 'requests',
        value: 300,
        metadata: { endpoint: '/api/2' }
      })
    );
  });

  test('calculates correct summary for errors and limits recent to 5', () => {
    // Add 6 errors
    for (let i = 1; i <= 6; i++) {
      trackMetric('errors', 1, { errorId: i });
    }

    const summary = getMetricsSummary();

    expect(summary.errors.total).toBe(6);
    expect(summary.errors.recent.length).toBe(5);

    // The most recent 5 errors should be IDs 2 through 6
    const recentIds = summary.errors.recent.map(e => e.metadata.errorId);
    expect(recentIds).toEqual([2, 3, 4, 5, 6]);
  });
});
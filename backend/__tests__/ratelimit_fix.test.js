import { test, expect } from 'bun:test';

// Simple mock of the rate limiter factory logic
const createRateLimit = ({ windowMs = 100, max = 2 } = {}) => {
  const hits = new Map();
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now > entry.reset) hits.delete(key);
    }
  }, windowMs);

  return {
    hits,
    interval,
    handle: (ip) => {
      const now = Date.now();
      const entry = hits.get(ip) || { count: 0, reset: now + windowMs };
      if (now > entry.reset) {
        entry.count = 0;
        entry.reset = now + windowMs;
      }
      entry.count += 1;
      hits.set(ip, entry);
      return entry.count <= max;
    }
  };
};

test('rate limiter cleanup works', async () => {
  const { hits, interval, handle } = createRateLimit({ windowMs: 100, max: 2 });

  handle('1.1.1.1');
  expect(hits.has('1.1.1.1')).toBe(true);

  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 250));

  expect(hits.has('1.1.1.1')).toBe(false);
  clearInterval(interval);
});

test('rate limiter limiting works', () => {
  const { hits, interval, handle } = createRateLimit({ windowMs: 1000, max: 2 });

  expect(handle('2.2.2.2')).toBe(true);
  expect(handle('2.2.2.2')).toBe(true);
  expect(handle('2.2.2.2')).toBe(false); // Third hit blocked

  clearInterval(interval);
});

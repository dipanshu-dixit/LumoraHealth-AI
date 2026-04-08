import request from 'supertest';
import express from 'express';
import { rateLimitMiddleware } from '../middleware/security.js';

describe('rateLimitMiddleware', () => {
  let app;
  let server;

  beforeAll((done) => {
    app = express();
    // Trust proxy to allow req.ip to be read easily if needed
    app.set('trust proxy', 1);

    app.use(rateLimitMiddleware);

    app.get('/api/test', (req, res) => {
      res.json({ message: 'Success' });
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('should allow requests under the limit and set rate limit headers', async () => {
    const response = await request(server).get('/api/test');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Success');

    // Express-rate-limit standard headers
    expect(response.headers['ratelimit-limit']).toBe('100');
    expect(response.headers['ratelimit-remaining']).toBeDefined();
    expect(response.headers['ratelimit-reset']).toBeDefined();
  });

  test('should block requests over the limit (100 per 15 minutes)', async () => {
    const MAX_REQUESTS = 100;

    // We already made 1 request in the previous test from the same IP (supertest defaults to 127.0.0.1).
    // So we need 99 more to hit the limit. Wait, express-rate-limit resets per IP. Let's ensure we hit it.
    // To be safe and deterministic, we'll send 100 requests.
    const requests = Array.from({ length: MAX_REQUESTS }).map(() => request(server).get('/api/test'));
    await Promise.all(requests);

    // The next request should be blocked
    const blockedResponse = await request(server).get('/api/test');

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body).toEqual({
      error: 'Too many requests from this IP',
      retryAfter: 900
    });

    expect(blockedResponse.headers['retry-after']).toBeDefined();
  });

  test('should skip rate limiting for /health endpoint', async () => {
    const MAX_REQUESTS = 105;

    const requests = Array.from({ length: MAX_REQUESTS }).map(() => request(server).get('/health'));
    const responses = await Promise.all(requests);

    responses.forEach(res => {
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    expect(responses[0].headers['ratelimit-limit']).toBeUndefined();
  });

  test('should skip rate limiting for /api/health endpoint', async () => {
    const MAX_REQUESTS = 105;

    const requests = Array.from({ length: MAX_REQUESTS }).map(() => request(server).get('/api/health'));
    const responses = await Promise.all(requests);

    responses.forEach(res => {
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});

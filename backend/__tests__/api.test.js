import request from 'supertest';
import express from 'express';
import { errorHandler } from '../middleware/errorHandler.js';
import { securityHeaders } from '../middleware/security-headers.js';

// Mock server for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(securityHeaders);
  
  // Test routes
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  
  app.use(errorHandler);
  return app;
};

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    test('returns 200 and status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Security Headers', () => {
    test('includes security headers', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});

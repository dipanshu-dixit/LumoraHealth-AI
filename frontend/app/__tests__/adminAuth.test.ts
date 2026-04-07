import { describe, test, expect, beforeEach, afterAll, mock } from 'bun:test';

// Mock next/server BEFORE importing the route
mock.module('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

// Use dynamic import to ensure the mock is applied
const { POST } = await import('../api/admin/login/route');

describe('Admin Login API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns 500 if ADMIN_PASSWORD is not set', async () => {
    delete process.env.ADMIN_PASSWORD;

    const req = {
      json: async () => ({ password: 'any' }),
    } as any;

    const response = await POST(req);
    const data = await (response as any).json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Authentication service misconfigured');
  });

  test('returns 200 and success for correct password', async () => {
    process.env.ADMIN_PASSWORD = 'secret_password';

    const req = {
      json: async () => ({ password: 'secret_password' }),
    } as any;

    const response = await POST(req);
    const data = await (response as any).json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Admin access granted');
  });

  test('returns 401 for incorrect password', async () => {
    process.env.ADMIN_PASSWORD = 'secret_password';

    const req = {
      json: async () => ({ password: 'wrong_password' }),
    } as any;

    const response = await POST(req);
    const data = await (response as any).json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid password');
  });

  test('returns 400 for invalid request body', async () => {
    process.env.ADMIN_PASSWORD = 'secret_password';

    const req = {
      json: async () => { throw new Error('Invalid JSON'); },
    } as any;

    const response = await POST(req);
    const data = await (response as any).json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid request');
  });
});

import { describe, it, expect, afterAll } from 'vitest';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from '../helpers/create-test-app';

describe('Health (e2e)', () => {
  let app: NestFastifyApplication;

  // Note: This test requires DATABASE_URL to be set.
  // In CI without a real DB, it will be skipped or marked as integration test.

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it.skip('GET /api/health should return status', async () => {
    app = await createTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.data).toHaveProperty('status');
    expect(body.data).toHaveProperty('version');
    expect(body.data).toHaveProperty('uptime');
    expect(body.data).toHaveProperty('database');
    expect(body.data).toHaveProperty('timestamp');
  });
});

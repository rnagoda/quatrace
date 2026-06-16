import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { db } from '../../src/config/db.js';

afterAll(async () => {
  // Release the connection pool so the test process exits cleanly.
  await db.destroy();
});

describe('GET /api/health', () => {
  it('should return 200 with the success envelope when the database is reachable', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      data: { status: 'ok', db: 'ok' },
      meta: null,
      error: null,
    });
    expect(typeof res.body.data.uptime).toBe('number');
    expect(typeof res.body.data.timestamp).toBe('string');
  });

  it('should return 404 with the error envelope when the route is unknown', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
  });
});

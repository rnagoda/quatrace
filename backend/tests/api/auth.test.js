import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { app } from '../../src/app.js';
import { db } from '../../src/config/db.js';
import { createLoginRateLimiter } from '../../src/middleware/rateLimit.js';

const PASSWORD = 'Password123';
let counter = 0;

function uniqueEmail() {
  counter += 1;
  return `authtest_${Date.now()}_${counter}@example.test`;
}

function registerBody(overrides = {}) {
  return {
    email: uniqueEmail(),
    password: PASSWORD,
    first_name: 'AuthTest',
    last_name: 'User',
    ...overrides,
  };
}

// Returns the "refresh_token=<value>" cookie pair from a response, or null.
function refreshCookie(res) {
  const cookies = res.headers['set-cookie'] || [];
  const found = cookies.find((c) => c.startsWith('refresh_token='));
  return found ? found.split(';')[0] : null;
}

afterAll(async () => {
  // Registration names each org "AuthTest's Organization"; deleting them cascades
  // to the users and refresh tokens created during these tests.
  await db('organizations').where('name', 'like', 'AuthTest%').del();
  await db.destroy();
});

describe('POST /api/auth/register', () => {
  it('should create a tester account, set an httpOnly refresh cookie, and return an access token', async () => {
    const res = await request(app).post('/api/auth/register').send(registerBody());

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('tester');
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.accessToken).toBeTruthy();
    const cookies = (res.headers['set-cookie'] || []).join('; ');
    expect(refreshCookie(res)).toBeTruthy();
    expect(cookies).toMatch(/HttpOnly/i);
  });

  it('should return 409 when the email is already registered', async () => {
    const body = registerBody();
    await request(app).post('/api/auth/register').send(body);
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should return 400 with details when the password is too weak', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(registerBody({ password: 'short' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/login', () => {
  it('should return an access token and refresh cookie for valid credentials', async () => {
    const body = registerBody();
    await request(app).post('/api/auth/register').send(body);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: body.email, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(refreshCookie(res)).toBeTruthy();
  });

  it('should return 401 for a wrong password', async () => {
    const body = registerBody();
    await request(app).post('/api/auth/register').send(body);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: body.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('should return 401 for an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail(), password: PASSWORD });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return the current user when given a valid access token', async () => {
    const reg = await request(app).post('/api/auth/register').send(registerBody());
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBeTruthy();
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer nonsense');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should rotate the refresh token and reject the old one', async () => {
    const reg = await request(app).post('/api/auth/register').send(registerBody());
    const cookieA = refreshCookie(reg);

    const rotated = await request(app).post('/api/auth/refresh').set('Cookie', cookieA);
    expect(rotated.status).toBe(200);
    expect(rotated.body.data.accessToken).toBeTruthy();
    const cookieB = refreshCookie(rotated);
    expect(cookieB).toBeTruthy();
    expect(cookieB).not.toBe(cookieA);

    // The rotated-away token must no longer be accepted.
    const reuse = await request(app).post('/api/auth/refresh').set('Cookie', cookieA);
    expect(reuse.status).toBe(401);
  });

  it('should return 401 when no refresh cookie is present', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should revoke the refresh token so it can no longer be refreshed', async () => {
    const reg = await request(app).post('/api/auth/register').send(registerBody());
    const cookie = refreshCookie(reg);

    const out = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(out.status).toBe(200);

    const after = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(after.status).toBe(401);
  });
});

describe('login rate limiting', () => {
  it('should return 429 in the error envelope once the max is exceeded', async () => {
    const limited = express();
    limited.post('/x', createLoginRateLimiter({ max: 2 }), (req, res) =>
      res.status(200).json({ ok: true }),
    );

    await request(limited).post('/x');
    await request(limited).post('/x');
    const third = await request(limited).post('/x');

    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe('RATE_LIMITED');
  });
});

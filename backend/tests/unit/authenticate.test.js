import { describe, it, expect, vi } from 'vitest';
import { authenticate } from '../../src/middleware/authenticate.js';
import { signAccessToken } from '../../src/utils/tokens.js';

describe('authenticate', () => {
  it('should attach req.user for a valid Bearer token', () => {
    const token = signAccessToken({ userId: 'u1', role: 'tester', organizationId: 'o1' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = vi.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual({ id: 'u1', role: 'tester', organizationId: 'o1' });
  });

  it('should throw 401 when the Authorization header is missing', () => {
    let error;
    try {
      authenticate({ headers: {} }, {}, vi.fn());
    } catch (e) {
      error = e;
    }
    expect(error?.status).toBe(401);
  });

  it('should throw 401 when the token is invalid', () => {
    let error;
    try {
      authenticate({ headers: { authorization: 'Bearer garbage' } }, {}, vi.fn());
    } catch (e) {
      error = e;
    }
    expect(error?.status).toBe(401);
  });
});

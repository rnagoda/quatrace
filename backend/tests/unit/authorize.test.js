import { describe, it, expect, vi } from 'vitest';
import { authorize } from '../../src/middleware/authorize.js';

describe('authorize (RBAC)', () => {
  it('should call next when the user has an allowed role', () => {
    const next = vi.fn();
    authorize('admin', 'tester')({ user: { role: 'tester' } }, {}, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('should throw 403 when the role is not allowed', () => {
    let error;
    try {
      authorize('admin')({ user: { role: 'tester' } }, {}, vi.fn());
    } catch (e) {
      error = e;
    }
    expect(error?.status).toBe(403);
    expect(error?.code).toBe('FORBIDDEN');
  });

  it('should throw 401 when there is no authenticated user', () => {
    let error;
    try {
      authorize('admin')({}, {}, vi.fn());
    } catch (e) {
      error = e;
    }
    expect(error?.status).toBe(401);
  });
});

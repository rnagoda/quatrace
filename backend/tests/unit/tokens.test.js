import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenTtlMs,
} from '../../src/utils/tokens.js';

describe('tokens', () => {
  it('should round-trip the access token payload when signed and verified', () => {
    const token = signAccessToken({ userId: 'u1', role: 'tester', organizationId: 'o1' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('u1');
    expect(payload.role).toBe('tester');
    expect(payload.org).toBe('o1');
  });

  it('should throw when verifying an invalid token', () => {
    expect(() => verifyAccessToken('not-a-token')).toThrow();
  });

  it('should generate a refresh token whose stored hash matches hashToken(raw)', () => {
    const { raw, hash } = generateRefreshToken();
    expect(raw).toHaveLength(64);
    expect(hash).toBe(hashToken(raw));
    expect(hash).not.toBe(raw);
  });

  it('should compute a positive refresh TTL in milliseconds', () => {
    expect(refreshTokenTtlMs()).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/utils/password.js';

describe('password hashing', () => {
  it('should produce a hash that differs from the plaintext', async () => {
    const hash = await hashPassword('Password123');
    expect(hash).not.toBe('Password123');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('should verify the correct password and reject a wrong one', async () => {
    const hash = await hashPassword('Password123');
    expect(await verifyPassword('Password123', hash)).toBe(true);
    expect(await verifyPassword('WrongPassword1', hash)).toBe(false);
  });
});

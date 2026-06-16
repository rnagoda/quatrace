import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../src/validators/authSchemas.js';

const validRegistration = {
  email: 'a@b.co',
  password: 'Password1',
  first_name: 'Ada',
  last_name: 'Lovelace',
};

describe('auth schemas', () => {
  it('should accept a valid registration', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it('should reject a password without a number', () => {
    const result = registerSchema.safeParse({ ...validRegistration, password: 'PasswordOnly' });
    expect(result.success).toBe(false);
  });

  it('should reject a too-short password', () => {
    expect(registerSchema.safeParse({ ...validRegistration, password: 'Pw1' }).success).toBe(false);
  });

  it('should reject an invalid email', () => {
    expect(registerSchema.safeParse({ ...validRegistration, email: 'nope' }).success).toBe(false);
  });

  it('should require a non-empty login password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

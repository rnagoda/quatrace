// Password hashing. Uses bcryptjs (pure JS — no native build) so it works
// identically in dev, CI, and on the hosting platform.
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config/constants.js';

export function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

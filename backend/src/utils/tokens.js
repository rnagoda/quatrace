// Token helpers.
//
// Access tokens are short-lived JWTs the SPA holds in memory and sends as a
// Bearer header. Refresh tokens are opaque random strings — only their SHA-256
// hash is stored in the database, so a database leak does not expose usable
// tokens. The raw refresh token lives only in an httpOnly cookie.
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken({ userId, role, organizationId }) {
  return jwt.sign({ role, org: organizationId }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRY,
  });
}

/**
 * Verify an access token.
 * @returns the decoded payload.
 * @throws if the token is invalid or expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generate a new opaque refresh token.
 * @returns {{ raw: string, hash: string }} raw goes in the cookie; hash is stored.
 */
export function generateRefreshToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
}

/** Refresh-token lifetime in milliseconds, derived from the configured duration. */
export function refreshTokenTtlMs() {
  return parseDurationMs(env.JWT_REFRESH_EXPIRY);
}

// Minimal duration parser supporting the suffixes we use (s, m, h, d).
function parseDurationMs(value) {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) throw new Error(`Unsupported duration: ${value}`);
  const amount = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
  return amount * unit;
}

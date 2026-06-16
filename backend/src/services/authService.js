// Authentication business logic. Controllers stay thin and call into here; all
// DB access goes through the model layer. Returns plain data (and the raw refresh
// token, which the controller places in an httpOnly cookie).
import { db } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenTtlMs,
} from '../utils/tokens.js';
import * as users from '../models/userModel.js';
import * as orgs from '../models/organizationModel.js';
import * as refreshTokens from '../models/refreshTokenModel.js';

// Issue an access token plus a fresh, persisted refresh token for a user.
async function issueSession(user, trx = db) {
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    organizationId: user.organization_id,
  });
  const refresh = generateRefreshToken();
  await refreshTokens.insertRefreshToken(
    {
      userId: user.id,
      tokenHash: refresh.hash,
      expiresAt: new Date(Date.now() + refreshTokenTtlMs()),
    },
    trx,
  );
  return { accessToken, refreshToken: refresh.raw };
}

function publicUser(user) {
  // Drop the password hash and anything else not client-safe.
  const { password_hash, ...rest } = user;
  return rest;
}

/**
 * Register a new learner: creates a private Pro organization and a tester-role
 * account, then opens a session. Full onboarding (project, NPC team, seed) is a
 * separate increment.
 */
export async function register({ email, password, first_name, last_name }) {
  return db.transaction(async (trx) => {
    const existing = await users.findByEmail(email, trx);
    if (existing) {
      throw AppError.conflict('An account with that email already exists.');
    }

    const org = await orgs.insertOrganization(
      { name: `${first_name}'s Organization`, subscription_tier: 'pro', is_learner_org: true },
      trx,
    );

    const created = await users.insertUser(
      {
        organization_id: org.id,
        email,
        password_hash: await hashPassword(password),
        first_name,
        last_name,
        role: 'tester',
      },
      trx,
    );

    const session = await issueSession(created, trx);
    return { user: created, ...session };
  });
}

/** Authenticate by email + password. Generic 401 to avoid user enumeration. */
export async function login({ email, password }) {
  const user = await users.findByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw AppError.unauthorized('Invalid email or password.');
  }
  const session = await issueSession(user);
  return { user: publicUser(user), ...session };
}

/**
 * Rotate a refresh token: validate the presented token, revoke it, and issue a
 * new session. Reusing a revoked/expired/unknown token is rejected.
 */
export async function refresh(rawToken) {
  if (!rawToken) throw AppError.unauthorized('No refresh token provided.');

  return db.transaction(async (trx) => {
    const record = await refreshTokens.findActiveByHash(hashToken(rawToken), trx);
    if (!record) throw AppError.unauthorized('Invalid or expired session.');

    await refreshTokens.revokeById(record.id, trx);

    const user = await users.findById(record.user_id, trx);
    if (!user) throw AppError.unauthorized('Invalid or expired session.');

    const session = await issueSession(user, trx);
    return { user, ...session };
  });
}

/** Revoke the presented refresh token. Idempotent — safe to call when logged out. */
export async function logout(rawToken) {
  if (!rawToken) return;
  const record = await refreshTokens.findActiveByHash(hashToken(rawToken));
  if (record) await refreshTokens.revokeById(record.id);
}

/** Current user's public profile. */
export async function getCurrentUser(userId) {
  const user = await users.findById(userId);
  if (!user) throw AppError.unauthorized('Account no longer exists.');
  return user;
}

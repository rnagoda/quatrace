// Thin auth controllers: call the service, manage the refresh cookie, and return
// the response envelope. The access token goes in the body (SPA holds it in
// memory); the refresh token goes in an httpOnly cookie.
import * as authService from '../services/authService.js';
import { ok } from '../utils/response.js';
import { isProduction } from '../config/env.js';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../config/constants.js';
import { refreshTokenTtlMs } from '../utils/tokens.js';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction, // off over http on localhost (dev/test/CI)
    path: REFRESH_COOKIE_PATH,
  };
}

function setRefreshCookie(res, rawToken) {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, {
    ...refreshCookieOptions(),
    maxAge: refreshTokenTtlMs(),
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
}

export async function register(req, res) {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json(ok({ user, accessToken }));
}

export async function login(req, res) {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(200).json(ok({ user, accessToken }));
}

export async function refresh(req, res) {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.refresh(raw);
  setRefreshCookie(res, refreshToken);
  res.status(200).json(ok({ user, accessToken }));
}

export async function logout(req, res) {
  await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);
  res.status(200).json(ok({ loggedOut: true }));
}

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json(ok(user));
}

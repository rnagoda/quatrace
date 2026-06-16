// Base API client. All network access goes through here — components never call
// fetch() directly. Unwraps the { data, meta, error } envelope and throws a typed
// ApiError on failure. The access token lives in memory only (not localStorage)
// for XSS safety; on a 401 the client transparently tries one silent refresh.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

async function rawRequest(path, options = {}, useAuth = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (useAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { credentials: 'include', ...options, headers });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Unable to reach the server.');
  }
  const body = await res.json().catch(() => null);
  return { res, body };
}

function unwrap({ res, body }) {
  if (!res.ok || body?.error) {
    const err = body?.error ?? {};
    throw new ApiError(
      err.code ?? 'INTERNAL_ERROR',
      err.message ?? 'Request failed.',
      err.details ?? [],
    );
  }
  return body?.data;
}

/**
 * Attempt a silent refresh using the httpOnly refresh cookie. Updates the
 * in-memory access token. Returns the session data ({ user, accessToken }) on
 * success, or null. Never triggers its own retry, so it cannot loop.
 */
export async function tryRefresh() {
  const { res, body } = await rawRequest('/auth/refresh', { method: 'POST' }, false);
  if (res.ok && body?.data?.accessToken) {
    setAccessToken(body.data.accessToken);
    return body.data;
  }
  setAccessToken(null);
  return null;
}

async function request(path, options = {}, { retryOn401 = true } = {}) {
  const first = await rawRequest(path, options);
  if (first.res.status === 401 && retryOn401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return unwrap(await rawRequest(path, options));
    }
  }
  return unwrap(first);
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) =>
    request(path, {
      method: 'POST',
      body: data != null ? JSON.stringify(data) : undefined,
    }),
};

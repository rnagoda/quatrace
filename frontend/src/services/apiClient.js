// Base API client. All network access goes through here — components never call
// fetch() directly. Unwraps the { data, meta, error } envelope and throws a typed
// ApiError on failure so callers handle errors uniformly.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Unable to reach the server.');
  }

  const body = await res.json().catch(() => null);

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

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
};

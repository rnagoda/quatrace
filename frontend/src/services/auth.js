// Auth API service. Keeps the in-memory access token in sync via the client.
import { apiClient, setAccessToken, tryRefresh } from './apiClient.js';

export async function register(payload) {
  const data = await apiClient.post('/auth/register', payload);
  setAccessToken(data.accessToken);
  return data;
}

export async function login(payload) {
  const data = await apiClient.post('/auth/login', payload);
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
  setAccessToken(null);
}

export function getMe() {
  return apiClient.get('/auth/me');
}

// On app load: exchange the httpOnly refresh cookie for a session, if one exists.
export function restoreSession() {
  return tryRefresh();
}

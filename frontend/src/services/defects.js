// Defects API service.
import { apiClient } from './apiClient.js';

export function listDefects(projectId, params = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const query = qs.toString();
  return apiClient.get(`/projects/${projectId}/defects${query ? `?${query}` : ''}`);
}

export function getDefect(projectId, defectId) {
  return apiClient.get(`/projects/${projectId}/defects/${defectId}`);
}

export function createDefect(projectId, body) {
  return apiClient.post(`/projects/${projectId}/defects`, body);
}

export function transitionDefect(projectId, defectId, status) {
  return apiClient.post(`/projects/${projectId}/defects/${defectId}/transition`, { status });
}

export function addComment(projectId, defectId, body) {
  return apiClient.post(`/projects/${projectId}/defects/${defectId}/comments`, { body });
}

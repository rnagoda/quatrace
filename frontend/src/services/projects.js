// Projects API service (read-only for now). Returns the unwrapped data payload.
import { apiClient } from './apiClient.js';

export function listProjects() {
  return apiClient.get('/projects');
}

export function getProject(id) {
  return apiClient.get(`/projects/${id}`);
}

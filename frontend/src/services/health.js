// Health API service. Wraps the /health endpoint through the shared client.
import { apiClient } from './apiClient.js';

export function getHealth() {
  return apiClient.get('/health');
}

// Onboarding API service.
import { apiClient } from './apiClient.js';

export function completeOnboarding(payload) {
  return apiClient.post('/onboarding', payload);
}

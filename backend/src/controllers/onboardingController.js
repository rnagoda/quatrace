// Thin onboarding controller.
import * as onboardingService from '../services/onboardingService.js';
import { ok } from '../utils/response.js';

export async function complete(req, res) {
  const result = await onboardingService.completeOnboarding(req.user, req.body);
  res.status(201).json(ok(result));
}

import { describe, it, expect } from 'vitest';
import { onboardingSchema } from '../../src/validators/onboardingSchema.js';
import { PROJECT_TYPE_LABELS } from '../../src/domain/onboarding.js';
import { PROJECT_TYPES } from '../../src/domain/enums.js';

describe('onboarding schema', () => {
  it('should accept a valid project type', () => {
    expect(onboardingSchema.safeParse({ project_type: 'web' }).success).toBe(true);
  });

  it('should reject an unknown or missing project type', () => {
    expect(onboardingSchema.safeParse({ project_type: 'spaceship' }).success).toBe(false);
    expect(onboardingSchema.safeParse({}).success).toBe(false);
  });

  it('should have a display label for every project type', () => {
    for (const type of PROJECT_TYPES) {
      expect(PROJECT_TYPE_LABELS[type]).toBeTruthy();
    }
  });
});

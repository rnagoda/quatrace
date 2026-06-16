import { z } from 'zod';
import { PROJECT_TYPES } from '../domain/enums.js';

export const onboardingSchema = z.object({
  project_type: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: 'Choose a valid project type.' }),
  }),
});

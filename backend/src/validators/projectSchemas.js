import { z } from 'zod';
import { PROJECT_TYPES, PROJECT_STATUSES } from '../domain/enums.js';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required.'),
  description: z.string().trim().optional(),
  project_type: z.enum(PROJECT_TYPES).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name cannot be empty.').optional(),
    description: z.string().trim().optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const addMemberSchema = z.object({
  user_id: z.string().uuid('A valid user_id is required.'),
});

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  sort: z.enum(['name', '-name', 'created_at', '-created_at']).optional(),
});

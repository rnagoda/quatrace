import { z } from 'zod';
import { DEFECT_STATUSES, DEFECT_SEVERITIES, DEFECT_PRIORITIES } from '../domain/enums.js';

export const createDefectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().optional(),
  severity: z.enum(DEFECT_SEVERITIES),
  priority: z.enum(DEFECT_PRIORITIES),
  assignee_id: z.string().uuid().optional(),
  environment_id: z.string().uuid().optional(),
  build_id: z.string().uuid().optional(),
});

export const updateDefectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty.').optional(),
    description: z.string().trim().optional(),
    severity: z.enum(DEFECT_SEVERITIES).optional(),
    priority: z.enum(DEFECT_PRIORITIES).optional(),
    assignee_id: z.string().uuid().nullable().optional(),
    environment_id: z.string().uuid().nullable().optional(),
    build_id: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const transitionSchema = z.object({
  status: z.enum(DEFECT_STATUSES),
});

export const addCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment body is required.'),
  parent_comment_id: z.string().uuid().optional(),
});

export const listDefectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().optional(),
  status: z.enum(DEFECT_STATUSES).optional(),
  severity: z.enum(DEFECT_SEVERITIES).optional(),
  priority: z.enum(DEFECT_PRIORITIES).optional(),
  assignee_id: z.string().uuid().optional(),
  sort: z.string().optional(),
});

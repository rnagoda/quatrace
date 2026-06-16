import { describe, it, expect } from 'vitest';
import {
  createDefectSchema,
  updateDefectSchema,
  transitionSchema,
  addCommentSchema,
} from '../../src/validators/defectSchemas.js';

const validCreate = { title: 'Bug', severity: 'high', priority: 'p2' };

describe('defect schemas', () => {
  it('should require title, severity, and priority to create', () => {
    expect(createDefectSchema.safeParse(validCreate).success).toBe(true);
    expect(createDefectSchema.safeParse({ title: 'Bug' }).success).toBe(false);
    expect(createDefectSchema.safeParse({ ...validCreate, severity: 'nope' }).success).toBe(false);
  });

  it('should reject a non-uuid assignee', () => {
    expect(createDefectSchema.safeParse({ ...validCreate, assignee_id: 'x' }).success).toBe(false);
  });

  it('should require at least one field to update', () => {
    expect(updateDefectSchema.safeParse({}).success).toBe(false);
    expect(updateDefectSchema.safeParse({ severity: 'low' }).success).toBe(true);
  });

  it('should validate a transition status', () => {
    expect(transitionSchema.safeParse({ status: 'open' }).success).toBe(true);
    expect(transitionSchema.safeParse({ status: 'nope' }).success).toBe(false);
  });

  it('should require a non-empty comment body', () => {
    expect(addCommentSchema.safeParse({ body: '' }).success).toBe(false);
    expect(addCommentSchema.safeParse({ body: 'Looks good' }).success).toBe(true);
  });
});

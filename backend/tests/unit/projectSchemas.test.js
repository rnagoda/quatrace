import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  listProjectsQuerySchema,
} from '../../src/validators/projectSchemas.js';

describe('project schemas', () => {
  it('should require a name to create a project', () => {
    expect(createProjectSchema.safeParse({}).success).toBe(false);
    expect(createProjectSchema.safeParse({ name: 'Checkout' }).success).toBe(true);
  });

  it('should accept a valid project_type and reject an invalid one', () => {
    expect(createProjectSchema.safeParse({ name: 'X', project_type: 'web' }).success).toBe(true);
    expect(createProjectSchema.safeParse({ name: 'X', project_type: 'nope' }).success).toBe(false);
  });

  it('should require at least one field to update', () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(false);
    expect(updateProjectSchema.safeParse({ status: 'archived' }).success).toBe(true);
    expect(updateProjectSchema.safeParse({ status: 'bogus' }).success).toBe(false);
  });

  it('should require a uuid for addMember', () => {
    expect(addMemberSchema.safeParse({ user_id: 'not-a-uuid' }).success).toBe(false);
  });

  it('should coerce and validate list-query params', () => {
    expect(
      listProjectsQuerySchema.safeParse({
        page: '2',
        perPage: '10',
        status: 'active',
        sort: '-created_at',
      }).success,
    ).toBe(true);
    expect(listProjectsQuerySchema.safeParse({ sort: 'weird' }).success).toBe(false);
  });
});

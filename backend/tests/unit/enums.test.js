import { describe, it, expect } from 'vitest';
import * as enums from '../../src/domain/enums.js';

describe('domain enums', () => {
  it('should define the five user roles in priority order', () => {
    expect(enums.USER_ROLES).toEqual([
      'admin',
      'manager',
      'developer',
      'tester',
      'viewer',
    ]);
  });

  it('should exclude viewer from assignable roles, and keep them a subset of roles', () => {
    expect(enums.ASSIGNABLE_ROLES).not.toContain('viewer');
    expect(enums.ASSIGNABLE_ROLES.every((r) => enums.USER_ROLES.includes(r))).toBe(true);
  });

  it('should reference only valid statuses in the defect transition map', () => {
    const valid = new Set(enums.DEFECT_STATUSES);
    for (const [from, targets] of Object.entries(enums.DEFECT_STATUS_TRANSITIONS)) {
      expect(valid.has(from)).toBe(true);
      for (const to of targets) expect(valid.has(to)).toBe(true);
    }
  });

  it('should include not_run among the five test result values', () => {
    expect(enums.TEST_RESULTS).toHaveLength(5);
    expect(enums.TEST_RESULTS).toContain('not_run');
  });

  it('should define the three subscription tiers', () => {
    expect(enums.SUBSCRIPTION_TIERS).toEqual(['free', 'pro', 'enterprise']);
  });
});

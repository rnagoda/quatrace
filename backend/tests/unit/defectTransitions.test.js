import { describe, it, expect } from 'vitest';
import { canTransition, DEFECT_STATUSES } from '../../src/domain/enums.js';

describe('defect status transitions', () => {
  it('should allow the valid transitions from the PRD workflow', () => {
    expect(canTransition('new', 'open')).toBe(true);
    expect(canTransition('open', 'in_progress')).toBe(true);
    expect(canTransition('open', 'wont_fix')).toBe(true);
    expect(canTransition('in_progress', 'in_testing')).toBe(true);
    expect(canTransition('in_testing', 'resolved')).toBe(true);
    expect(canTransition('in_testing', 'in_progress')).toBe(true);
    expect(canTransition('resolved', 'closed')).toBe(true);
    expect(canTransition('closed', 'open')).toBe(true);
  });

  it('should reject invalid transitions', () => {
    expect(canTransition('new', 'resolved')).toBe(false);
    expect(canTransition('new', 'closed')).toBe(false);
    expect(canTransition('open', 'in_testing')).toBe(false);
    expect(canTransition('closed', 'in_progress')).toBe(false);
  });

  it('should reject a transition from an unknown status', () => {
    expect(canTransition('bogus', 'open')).toBe(false);
  });

  it('should never allow a status to transition to itself', () => {
    for (const status of DEFECT_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });
});

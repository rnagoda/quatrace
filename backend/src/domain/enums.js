// Canonical sets of constrained domain values. These mirror the CHECK constraints
// in the database migrations exactly — one source of truth for the service layer,
// validation, and tests. If a CHECK list changes, update it here too.

export const SUBSCRIPTION_TIERS = ['free', 'pro', 'enterprise'];

export const USER_ROLES = ['admin', 'manager', 'developer', 'tester', 'viewer'];

// Roles permitted to be a defect assignee/reporter (everyone except viewer).
export const ASSIGNABLE_ROLES = ['admin', 'manager', 'developer', 'tester'];

export const NPC_PERSONAS = [
  'product_owner',
  'developer',
  'qa_lead',
  'scrum_master',
  'qa_engineer',
];

export const PROJECT_TYPES = ['mobile', 'web', 'api', 'ecommerce', 'internal'];

export const PROJECT_STATUSES = ['active', 'archived'];

export const DEFECT_STATUSES = [
  'new',
  'open',
  'in_progress',
  'in_testing',
  'resolved',
  'closed',
  'wont_fix',
];

export const DEFECT_SEVERITIES = ['critical', 'high', 'medium', 'low'];

export const DEFECT_PRIORITIES = ['p1', 'p2', 'p3', 'p4'];

export const TEST_CASE_PRIORITIES = ['high', 'medium', 'low'];

export const TEST_CASE_STATUSES = ['active', 'draft', 'deprecated'];

export const TEST_RUN_STATUSES = ['planned', 'in_progress', 'completed', 'aborted'];

export const TEST_RESULTS = ['pass', 'fail', 'blocked', 'skipped', 'not_run'];

// Allowed defect status transitions (PRD §5.2). Enforced in the service layer
// when defect endpoints are built; defined here so the rule has one home.
export const DEFECT_STATUS_TRANSITIONS = {
  new: ['open'],
  open: ['in_progress', 'wont_fix'],
  in_progress: ['in_testing'],
  in_testing: ['resolved', 'in_progress'],
  resolved: ['closed', 'open'],
  closed: ['open'],
  wont_fix: ['open'],
};

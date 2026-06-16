// Onboarding seed definitions: the virtual team, sibling projects, and default
// environments/builds provisioned for a new learner. Kept here so the event
// engine and later increments can reuse the NPC roster.

export const PROJECT_TYPE_LABELS = {
  mobile: 'Mobile App',
  web: 'Web Application',
  api: 'API / Backend Service',
  ecommerce: 'E-commerce Platform',
  internal: 'Internal Tools',
};

// The learner's virtual team. `persona` is the simulated job; `role` is the
// in-app RBAC role that persona maps to.
export const NPC_TEAM = [
  { persona: 'product_owner', role: 'manager', first_name: 'Maya', last_name: 'Chen' },
  { persona: 'developer', role: 'developer', first_name: 'Diego', last_name: 'Santos' },
  { persona: 'qa_lead', role: 'manager', first_name: 'Aisha', last_name: 'Khan' },
  { persona: 'scrum_master', role: 'viewer', first_name: 'Tom', last_name: 'Becker' },
  { persona: 'qa_engineer', role: 'tester', first_name: 'Lena', last_name: 'Park' },
];

// Read-only sibling projects seeded in the learner's org (they are not a member),
// giving them other teams' projects to view (PRD §3.2).
export const SIBLING_PROJECTS = [
  { name: 'Billing Service', project_type: 'api' },
  { name: 'Marketing Site', project_type: 'web' },
];

export const DEFAULT_ENVIRONMENTS = ['Dev', 'QA', 'Staging'];

export const DEFAULT_BUILDS = [
  { name: 'v1.0.0', release_notes: 'Initial release.' },
  { name: 'v1.1.0', release_notes: 'Sprint 1 features.' },
  { name: 'v1.2.0', release_notes: 'Sprint 2 features.' },
];

// A starter set of defects so the learner's project feels alive on first login.
// `assignee_persona` (when set) is mapped to the seeded NPC; `environment` to the
// seeded environment by name. The learner is the reporter.
export const DEFAULT_DEFECTS = [
  {
    title: 'Login button unresponsive on slow networks',
    description: 'The login button does nothing for ~5s on a throttled connection.',
    status: 'open',
    severity: 'high',
    priority: 'p2',
    assignee_persona: 'developer',
    environment: 'QA',
  },
  {
    title: 'Password reset email is never delivered',
    description: 'Requesting a reset returns success but no email arrives.',
    status: 'in_progress',
    severity: 'critical',
    priority: 'p1',
    assignee_persona: 'developer',
    environment: 'QA',
  },
  {
    title: 'Dashboard chart misaligned on small screens',
    status: 'new',
    severity: 'low',
    priority: 'p4',
    environment: 'Dev',
  },
  {
    title: 'Search returns stale results after an update',
    status: 'in_testing',
    severity: 'medium',
    priority: 'p3',
    assignee_persona: 'developer',
    environment: 'Staging',
  },
  {
    title: 'Session expires sooner than configured',
    status: 'open',
    severity: 'medium',
    priority: 'p2',
    environment: 'QA',
  },
  {
    title: 'Typo on the account settings page',
    status: 'resolved',
    severity: 'low',
    priority: 'p4',
    environment: 'Dev',
  },
];

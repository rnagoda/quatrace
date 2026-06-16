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

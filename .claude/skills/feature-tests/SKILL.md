---
name: feature-tests
description: Scaffold the full QuaTrace test matrix (unit + API + E2E + accessibility) for a feature, endpoint, or user flow. Use when adding or changing functionality so the change meets the Definition of Done before its PR. Follows the conventions in CLAUDE.md and PRD §9.
---

# feature-tests — scaffold the full test matrix

QuaTrace's Definition of Done (CLAUDE.md) requires every feature to ship with unit, API, E2E,
and accessibility tests. This skill scaffolds all four layers for a given feature so nothing is
missed. The PRD (`quatrace-prd.md` §9.2) is the canonical source for tools and locations.

## Inputs to establish first
Before writing anything, determine:
1. **What changed** — the service/util functions, endpoint(s), and UI surface(s) involved.
2. **Which roles** touch it — every endpoint enforces RBAC (Admin, Manager, Developer, Tester,
   Viewer); identify who is allowed and who must be rejected.
3. **Which feature gates** apply — does it interact with a Free/Pro/Enterprise plan limit?
4. **Which user flow(s)** it belongs to — see the critical-flows list in PRD §9.4.

## The four layers

### 1. Unit tests (Vitest) — `*.test.js` beside the code
- Cover every new/changed **service** and **util** function — target 80%+ line coverage.
- Use factory functions for test data (not fixture files); no shared mutable state.
- Test names: `"should [expected behavior] when [condition]"`.
- Include the unhappy paths: invalid input, boundary values, and any business-rule branches
  (e.g. invalid defect status transitions, plan-limit math).

### 2. API tests (Supertest + Vitest) — `backend/tests/api/`
For **every** new or changed endpoint, at minimum:
- **Happy path** — valid request returns the correct status and `{ data, meta, error }` shape.
- **≥2 error cases** — always include (a) a validation failure (Zod → 400) and (b) an
  authz failure (401 unauthenticated and/or 403 wrong role). Add domain-specific errors
  (404 not found, 409 conflict, feature-gate 4xx) where relevant.
- Assert the response envelope and the `error.code`/`error.message` so learners have a model.
- Seed the dedicated test DB before the suite; clean after.

### 3. E2E tests (Playwright) — `e2e/tests/<domain>/`
- Cover the affected critical user flow(s) end-to-end (see PRD §9.4).
- Always include an **RBAC path** (a forbidden role is blocked in the UI) and, where relevant,
  a **feature-gate path** (limit reached → gated error shown).
- Reset state via API in `test.beforeEach` — never depend on a prior test's leftovers.

### 4. Accessibility tests — see the `/a11y-audit` skill
- Add `@axe-core/playwright` assertions (tagged `@a11y`) for every new/changed page and key UI
  state; zero violations is a gate.
- Add component-level a11y assertions for new components.
- Run `/a11y-audit` to complete the manual WCAG 2.2 AA checklist for the surface.

## Output
- Create the test files in the locations above with real, runnable assertions (not TODO stubs).
- List any gaps you could not cover and why.
- Confirm the Definition-of-Done testing checklist items are now satisfied.

## Scale tip
For a change spanning many endpoints/flows, consider fanning out the API and E2E authoring across
parallel subagents (one per endpoint/flow), then consolidating — but every file still lands in
the conventional location with the conventions above.

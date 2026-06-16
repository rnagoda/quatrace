# QuaTrace

> A fictional B2B SaaS platform for QA ticket tracking and test management,
> built as a teaching tool for the UnderstandQA content brand.

_The application is still being scaffolded. This README grows with every PR (per the project's
Git conventions in `CLAUDE.md`); setup commands will be filled in once `backend/`, `frontend/`,
and `e2e/` land._

## Documentation

- **`quatrace-prd.md`** — the product requirements document (canonical for the domain, learner
  model, scenario engine, API map, and seed data).
- **`CLAUDE.md`** — the engineering reference: tech stack, coding standards, Git workflow, and
  the Definition of Done.

## Engineering standards in force

These apply from the first line of application code:

- **SOLID** — all code follows the SOLID principles, applied pragmatically for a beginner
  audience (see `CLAUDE.md` → Coding Standards → Design Principles).
- **Definition of Done** — a feature is not done until it ships its full test matrix
  (**unit + API + E2E + accessibility**) and meets the accessibility bar below
  (see `CLAUDE.md` → Definition of Done).
- **Accessibility: WCAG 2.2 AA** — proven by automated `@axe-core/playwright` scans plus a
  documented manual checklist per feature.
- **Git workflow** — all work on `feature/*` or `fix/*` branches; changes reach `main`/`buggy`
  only via PR; merges are performed by the maintainer; no secrets committed.

## Helper skills

Project skills under `.claude/skills/` assist with the standards above:

- **`/feature-tests`** — scaffold the full unit + API + E2E + a11y test matrix for a feature.
- **`/a11y-audit`** — run the WCAG 2.2 AA pass (automated axe + manual checklist).

## Continuous integration

`.github/workflows/ci.yml` runs the unit, API, E2E, and accessibility suites on every PR to a
protected branch. It is a green-ready skeleton today (each job no-ops until its package is
present) and becomes blocking as the corresponding code lands.

## Test commands (available once the app is scaffolded)

```bash
# Backend unit tests
cd backend && npm run test:unit

# Backend API tests (requires the test database)
cd backend && npm run test:api

# Backend tests with coverage
cd backend && npm run test:coverage

# Frontend component tests
cd frontend && npm run test

# E2E + accessibility tests (requires both servers running)
cd e2e && npx playwright test
```

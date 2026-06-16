# QuaTrace

> A fictional B2B SaaS platform for QA ticket tracking and test management,
> built as a teaching tool for the UnderstandQA content brand.

The codebase is being built incrementally. This is the **walking skeleton**: a runnable,
fully-tested slice (Express + Knex + Postgres backend, React + Vite frontend, Playwright E2E +
axe accessibility) with a `/api/health` endpoint and CI green end-to-end. Domain features land in
subsequent increments, starting with the database schema.

## Documentation

- **`quatrace-prd.md`** — product requirements (canonical for the domain, learner model,
  scenario engine, API map, and seed data).
- **`CLAUDE.md`** — engineering reference: tech stack, coding standards, Git workflow, and the
  Definition of Done.

## Repository layout

```
backend/    Express + Knex API (ES modules)
frontend/   React + Vite app (Tailwind, Zustand, TanStack Query)
e2e/        Playwright end-to-end + axe accessibility tests
db/init/    Postgres init scripts (dev + test databases)
```

## Prerequisites

- Node.js 20 (LTS)
- Docker + Docker Compose **or** a local PostgreSQL 16 instance (see note below)

## Local development

```bash
# 1. Start PostgreSQL (creates the quatrace and quatrace_test databases)
docker compose up -d

# 2. Backend: install, migrate, run
cd backend
cp ../.env.example .env        # adjust if needed
npm install
npm run db:migrate
npm run dev                    # http://localhost:3000  (GET /api/health)

# 3. Frontend (new terminal)
cd frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env
npm install
npm run dev                    # http://localhost:5173
```

> **No Docker?** Point `DATABASE_URL` / `TEST_DATABASE_URL` in `backend/.env` at any reachable
> PostgreSQL and create two databases (`quatrace`, `quatrace_test`). Everything else is identical.

## Authentication

The API exposes `POST /api/auth/{register,login,logout,refresh}` and `GET /api/auth/me`. Auth uses
short-lived JWT access tokens (sent as a `Bearer` header, held in memory by the SPA) plus rotated,
opaque refresh tokens stored as hashes and delivered in an httpOnly cookie. New accounts are
created with the `tester` role in a private Pro organization (full onboarding is a later
increment). The frontend has `/login` and `/register` pages and a protected home route.

`JWT_SECRET` and `JWT_REFRESH_SECRET` are **required in production**; in development and test they
fall back to an insecure default so local runs and CI need no extra configuration. See
`.env.example` for all auth variables.

> **Production cookie note:** the refresh cookie is `SameSite=Lax`, which works when the frontend
> and backend share a site (local dev). A cross-site production deployment (e.g. Vercel + Railway
> on different domains) will need `SameSite=None; Secure` or a same-domain proxy.

## Projects & the access model

`GET/POST /api/projects`, `GET/PATCH /api/projects/:id`, and
`GET/POST/DELETE /api/projects/:id/members` are the first resource endpoints. They establish the
**access model** reused by every project-scoped resource:

- All endpoints require authentication and are **organization-scoped** — a project in another org
  (or a missing id) returns **404**, never 403, so cross-org existence isn't leaked.
- **Reads** are open to any member of the org (the read-only-other-projects rule); **writes**
  (create/update/archive, member management) require the **Manager/Admin** role.
- List endpoints follow the pagination convention: `?page` (1-based) and `?perPage` (default 20,
  max 100), with `{ page, perPage, total }` in the response `meta`. Projects also accept `?status`
  and `?sort`.

Since learners are `tester`s, the Projects UI (`/projects`, `/projects/:id`) is **read-only**; it
is populated by onboarding (below).

## Onboarding

On first login a learner is routed through a guided wizard (`/onboarding`): choose a project type
→ confirm their QA Engineer (Tester) role → meet their team. `POST /api/onboarding` then provisions
the workspace in one transaction — a personal project, the 5-NPC virtual team, two read-only
sibling projects, three environments (Dev/QA/Staging), and a few builds — and stamps
`users.onboarded_at`. A `RequireOnboarded` gate redirects un-onboarded users to the wizard and
onboarded users away from it. (Defects/test-cases/runs are seeded by their own later increments;
the post-onboarding landing is Home until the Scenario Dashboard ships.)

## Defects

`/api/projects/:id/defects` (list/create), `/api/projects/:id/defects/:defectId` (get/patch),
`POST .../transition`, and `.../comments` (list/add) are the defect-tracking endpoints — the first
primary QA module and the learner's first write surface. They introduce the **membership write
gate**: defect *reads* are open to any org member, but *writes* (create/transition/comment) require
the caller to be a **member of the project and not a viewer** — so a `tester` manages defects on
their active project but is read-only elsewhere.

Status changes go through a dedicated **transition** endpoint that enforces the defect
state-machine (`DEFECT_STATUS_TRANSITIONS` in `domain/enums.js`); an illegal move returns
`422 INVALID_TRANSITION`. The UI (`/projects/:id/defects`, `/projects/:id/defects/:defectId`) only
offers valid transitions and shows write controls when the project is the learner's. Onboarding now
seeds ~6 sample defects so the module is populated on first login.

## Running tests

```bash
# Backend unit tests
cd backend && npm run test:unit

# Backend API tests (requires the test database)
cd backend && npm run test:api

# Backend unit coverage
cd backend && npm run test:coverage

# Frontend component tests
cd frontend && npm run test

# E2E + accessibility (builds & previews the frontend automatically)
cd e2e && npm install && npx playwright install chromium && npx playwright test

# Accessibility tests only
cd e2e && npx playwright test --grep @a11y
```

## Engineering standards

Enforced from the first line of code (see `CLAUDE.md`):

- **SOLID**, applied pragmatically for a beginner audience.
- **Definition of Done** — every feature ships unit + API + E2E + accessibility tests.
- **Accessibility: WCAG 2.2 AA** — automated `@axe-core/playwright` scans + a documented manual
  checklist per feature.
- **Git workflow** — feature branches → PRs; the maintainer merges; no secrets committed.

Helper skills live under `.claude/skills/`: **`/feature-tests`** (scaffold the test matrix) and
**`/a11y-audit`** (run the WCAG 2.2 AA pass). CI (`.github/workflows/ci.yml`) runs all suites on
every PR.

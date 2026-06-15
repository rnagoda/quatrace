# CLAUDE.md — QuaTrace

This file is the canonical reference for Claude Code when working on the QuaTrace project.
Read it fully before taking any action.

---

## What Is QuaTrace?

QuaTrace is a **fictional B2B SaaS platform** for QA ticket tracking and test management — think
a lightweight hybrid of Jira and TestRail. Teams use it to log defects, organize test cases into
suites, execute test runs, and track quality metrics across releases. It sells its own subscription
plans and includes a marketplace of integrations.

It exists as a **teaching tool** for the UnderstandQA content brand, giving learners a realistic,
fully realized application to practice testing against — one that also introduces them to the
kinds of tools they will use on the job. Learners are not just testing an app; they are testing
the *type* of app QA professionals use every day.

The app is intentionally significant in scope: large seeded datasets, multiple API endpoints,
role-based access, billing logic, and a marketplace. This is by design. Learners need surface
area to test.

There are **two versions** of the codebase, maintained as separate Git branches:

- `main` — the clean reference implementation (correct behavior, passing tests)
- `buggy` — a version with intentional defects seeded throughout, used for exercises

---

## Project Structure

```
quatrace/
├── CLAUDE.md                  # This file
├── README.md                  # Setup and deployment guide
├── docker-compose.yml         # Local development environment
├── .env.example               # Environment variable template
│
├── backend/                   # Node.js / Express API
│   ├── src/
│   │   ├── app.js             # Express app entry point
│   │   ├── config/            # DB config, environment, constants
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── routes/            # Route definitions (one file per domain)
│   │   ├── controllers/       # Request/response handling
│   │   ├── services/          # Business logic layer
│   │   ├── models/            # Data models (using Knex.js)
│   │   └── utils/             # Shared helpers
│   ├── db/
│   │   ├── migrations/        # Knex migrations (versioned, sequential)
│   │   └── seeds/             # Seed data (Faker.js generated)
│   └── tests/
│       ├── unit/              # Unit tests (Vitest)
│       └── api/               # API/integration tests (Supertest + Vitest)
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── main.jsx           # App entry point
│   │   ├── App.jsx            # Root component and routing
│   │   ├── components/        # Shared/reusable components
│   │   ├── pages/             # Page-level components (one per route)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client functions
│   │   ├── store/             # State management (Zustand)
│   │   └── utils/             # Frontend helpers
│   └── tests/
│       └── unit/              # Component unit tests (Vitest + Testing Library)
│
└── e2e/                       # End-to-end and cross-cutting tests
    ├── playwright.config.js
    ├── tests/
    │   ├── auth/              # Login, logout, session, permissions
    │   ├── defects/           # Defect creation, triage, status workflows
    │   ├── test-cases/        # Test case authoring and suite management
    │   ├── test-runs/         # Executing runs, recording results
    │   ├── billing/           # Plan upgrades, invoices, feature gates
    │   ├── admin/             # User management, org settings
    │   └── marketplace/       # Integration installs and configuration
    ├── fixtures/              # Shared test data and helpers
    └── visual/                # Visual regression baselines
```

---

## Tech Stack

### Backend
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Query builder:** Knex.js (migrations + seeds + queries — no ORM)
- **Auth:** JWT (access tokens) + refresh tokens stored in httpOnly cookies
- **Validation:** Zod
- **Seed data:** Faker.js

### Frontend
- **Framework:** React (Vite)
- **Routing:** React Router v6
- **State:** Zustand
- **Data fetching:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **Component testing:** Vitest + React Testing Library

### Testing
- **Unit tests:** Vitest
- **API tests:** Supertest + Vitest
- **E2E tests:** Playwright
- **Accessibility:** axe-core via @axe-core/playwright
- **Visual regression:** Playwright (screenshot comparison)
- **Code coverage:** V8 via Vitest

### Infrastructure
- **Local dev:** Docker Compose (Node API + PostgreSQL)
- **Hosting (current):** Railway (backend + PostgreSQL) + Vercel (frontend)
- **Hosting (planned migration):** AWS (EC2 + RDS + S3 + CloudFront)
- **CI/CD:** GitHub Actions
- **Environment management:** dotenv + Railway/Vercel environment variables

---

## Application Domain

### Core Concepts
QuaTrace models the QA workflow most learners will encounter in real jobs:

- **Defects** — bugs logged against a project, with severity, priority, status, and assignee
- **Test Cases** — individual test scenarios with steps, expected results, and metadata
- **Test Suites** — logical groupings of test cases (e.g. "Regression Suite", "Smoke Tests")
- **Test Runs** — an execution of a suite against a specific build/environment, with pass/fail/blocked results per test case
- **Projects** — the top-level container; each organization has multiple projects
- **Environments** — named targets for test runs (e.g. Staging, Production, QA)
- **Builds/Releases** — versioned snapshots test runs are executed against

### Data Scale (seeded)
- **Users:** 500+ across four roles (admin, manager, tester, viewer)
- **Organizations:** 50+ with realistic team structures
- **Projects:** 100+ active projects across organizations
- **Defects:** 1,000+ with varied statuses, severities, and assignees
- **Test Cases:** 2,000+ across multiple suites and projects
- **Test Runs:** 500+ with per-case results (pass, fail, blocked, skipped)
- **Environments:** 3–5 per project (Dev, QA, Staging, Production)
- **Subscriptions:** 3 tiers — Free, Pro, Enterprise — with feature gates
- **Marketplace integrations:** 15 purchasable add-ons (Slack, GitHub, CI tools, etc.)
- **Billing records:** invoices and payment history per organization

### API Surface (~40–45 endpoints)
Domains: `auth`, `users`, `organizations`, `projects`, `defects`, `test-cases`,
`test-suites`, `test-runs`, `environments`, `subscriptions`, `billing`, `marketplace`,
`admin`, `health`

Every endpoint must have:
- Correct HTTP status codes
- Consistent JSON response shape (`{ data, meta, error }`)
- Role-based access enforcement
- Input validation (Zod schemas)
- Error messages suitable for display in tests

### Subscription Tiers
| Feature | Free | Pro | Enterprise |
|---|---|---|---|
| Projects | 2 | 20 | Unlimited |
| Team members | 3 | 25 | Unlimited |
| Test cases | 500 | 10,000 | Unlimited |
| Test runs / month | 10 | 500 | Unlimited |
| API access | No | Yes | Yes |
| Marketplace add-ons | No | Yes | Yes |
| Audit log | No | No | Yes |
| Custom environments | No | Yes | Yes |

---

## Coding Standards

### General
- All code in **JavaScript** (no TypeScript — learners are beginners and TS adds noise)
- ES modules throughout (`import`/`export`, not `require`)
- `async/await` only — no raw Promise chains or callbacks
- No `console.log` left in committed code — use the logger utility
- All environment-specific values via `process.env` — never hardcoded

### Backend
- Controllers are thin: validate input, call a service, return the response
- Services contain all business logic — controllers never touch the DB directly
- All DB access goes through service functions — never raw queries in routes
- Migrations are immutable once committed — never edit an existing migration
- Seeds must be idempotent — running them twice must not create duplicates

### Frontend
- One component per file
- No inline styles — Tailwind classes only
- All API calls go through `src/services/` — never `fetch()` directly in a component
- Use custom hooks to encapsulate stateful logic

### Error handling
- All Express route handlers wrapped in a `asyncHandler` utility
- A global error middleware catches everything and returns consistent JSON
- Frontend catches API errors at the service layer and throws typed error objects

---

## Test Suite Architecture

### Philosophy
There are two test suite configurations:

1. **Reference suite** (`main` branch) — tests are correct, comprehensive, and pass against
   the clean app. Used as answer keys and examples in lessons.
2. **Exercise suite** (`buggy` branch) — the app has seeded defects; learners are given
   blank or partial test files and asked to find and document failures.

### Test conventions
- Test files live alongside what they test (`*.test.js`) for unit tests
- API and E2E tests live in their own top-level directories (`backend/tests/api/`, `e2e/`)
- Every test file has a descriptive top-level `describe` block
- Test names follow the pattern: `"should [expected behavior] when [condition]"`
- No shared mutable state between tests — each test sets up and tears down its own data
- Use factory functions (not fixtures files) to create test data — keeps tests readable

### Test data strategy
- Unit tests: use inline mock data or factory functions
- API tests: use a dedicated test database; seed before each suite, clean after
- E2E tests: use Playwright's `test.beforeEach` to reset relevant state via API calls —
  never rely on leftover state from a prior test

### Coverage targets (reference suite)
- Unit: 80%+ line coverage on services and utils
- API: 100% of documented endpoints covered (happy path + at least 2 error cases each)
- E2E: all critical user flows covered (auth, defect lifecycle, test case authoring, test run execution, billing)

---

## Environment Variables

```
# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://quatrace:quatrace@localhost:5432/quatrace
JWT_SECRET=change-this-in-production
JWT_REFRESH_SECRET=change-this-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
```

---

## Local Development Setup

```bash
# 1. Start the database
docker-compose up -d

# 2. Install backend dependencies and run migrations + seeds
cd backend
npm install
npm run db:migrate
npm run db:seed

# 3. Start the backend API
npm run dev         # runs on http://localhost:3000

# 4. In a new terminal, start the frontend
cd ../frontend
npm install
npm run dev         # runs on http://localhost:5173
```

---

## Running Tests

```bash
# Backend unit tests
cd backend && npm run test:unit

# Backend API tests (requires test DB to be running)
cd backend && npm run test:api

# All backend tests with coverage
cd backend && npm run test:coverage

# Frontend component tests
cd frontend && npm run test

# E2E tests (requires both servers running)
cd e2e && npx playwright test

# E2E with UI mode (for development/debugging)
cd e2e && npx playwright test --ui

# Visual regression (update baselines)
cd e2e && npx playwright test --update-snapshots
```

---

## Git Conventions

### Branches
- `main` — clean, always-passing reference implementation. **Protected.**
- `buggy` — defect-seeded exercise version (rebased from main periodically). **Protected.**
- Feature branches: `feature/[short-description]`
- Fix branches: `fix/[short-description]`

### Workflow (required)
- **All work happens on a feature or fix branch — never commit directly to `main` or `buggy`.**
  Before starting any task, create or switch to an appropriate branch. If you find yourself on
  `main` or `buggy` with uncommitted work, stop and move it to a branch first.
- **Every change reaches `main`/`buggy` only through a Pull Request.** Open the PR against the
  target branch; do not merge it.
- **Merges are performed by the human maintainer only.** Claude Code never merges, squashes,
  fast-forwards, or pushes to a protected branch — even if asked. Claude's job ends at "PR opened."
- Commit messages: imperative present tense — `Add billing endpoint` not `Added billing endpoint`.
- Keep PRs focused — one logical change per PR where practical.

### Pull Request requirements
Every PR must:
- Target a protected branch from a `feature/*` or `fix/*` branch — never the reverse.
- Include a clear description: what changed, why, and how it was tested.
- **Update `README.md` with any pertinent details introduced by the change** (new setup steps,
  new env vars, new endpoints/scripts, changed commands, new dependencies). A PR that changes
  behavior or setup but leaves the README stale is incomplete — treat the README update as part
  of the work, not an afterthought.

### Secrets
- **No secrets, credentials, tokens, or environment-specific values are ever committed.**
- Real secrets live in `.env` files and deployment-platform dashboards (Railway/Vercel) only.
- `.env` and any local secret files must be listed in `.gitignore`; only `.env.example`
  (with placeholder values) is committed.
- Before committing, verify no secret material is staged. If a secret is ever committed by
  mistake, treat it as compromised: rotate it and scrub history — do not just delete the file.

---

## Deployment

### Railway (current)
- Backend and PostgreSQL are deployed as Railway services in the same project
- Environment variables set in the Railway dashboard — never committed to the repo
- Deploys trigger automatically on push to `main`
- Database migrations run as a Railway release command: `npm run db:migrate`

### Vercel (frontend)
- Connected to the GitHub repo; deploys automatically on push to `main`
- `VITE_API_URL` set to the Railway backend URL in Vercel environment settings

### AWS (planned)
- Architecture: EC2 (API) + RDS PostgreSQL + S3 (static assets) + CloudFront (frontend CDN)
- Infrastructure as code: AWS CDK (JavaScript) — scripts will live in `infra/`
- Migration will be documented step-by-step as a lesson series

---

## What Claude Code Should Never Do

- Never commit directly to `main` or `buggy` — always work on a `feature/*` or `fix/*` branch
- Never merge, squash, or push to a protected branch — open a PR and let the maintainer merge
- Never open a PR without updating `README.md` for any pertinent changes it introduces
- Never commit a `.env` file or any secret — only `.env.example` with placeholders is committed
- Never edit migration files that have already been committed and run
- Never hardcode secrets, credentials, or environment-specific URLs
- Never write raw SQL in controllers or routes — use service functions
- Never install TypeScript or convert files to `.ts` — this is intentionally plain JavaScript
- Never add `console.log` for debugging — use the logger
- Never assume the `buggy` branch behavior is a bug to fix — the defects are intentional
- Never run `db:seed` against a production database

---

## Open Questions / Future Work

- [ ] Native mobile app (React Native) — planned after web version is stable
- [ ] AWS migration — when audience and budget justify it
- [ ] Performance test suite (k6 or Artillery) — planned as an advanced lesson module
- [ ] Contract testing (Pact) — planned as a lesson on consumer-driven contracts
- [ ] Paid product integration — QuaTrace may eventually tie into the UnderstandQA course monetization funnel

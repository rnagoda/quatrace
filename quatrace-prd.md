# Product Requirements Document

## QuaTrace — QA Ticket Tracking & Test Management Platform

**Version:** 0.3 (Draft) **Owner:** UnderstandQA **Status:** In Review **Last Updated:** June 2026

---

## 1. Overview

### 1.1 Purpose of This Document

This PRD defines the requirements for QuaTrace, a fictional B2B SaaS application built as the primary practice environment for the UnderstandQA content brand. It is intended to guide development, inform the test suite architecture, and serve as a reference for content creation across the blog, podcast, and YouTube channel.

### 1.2 What Is QuaTrace?

QuaTrace is a fictional QA ticket tracking and test management platform — a lightweight hybrid of tools like Jira and TestRail. It gives software teams a single place to log defects, author and organize test cases, execute test runs, and track quality metrics across builds and releases.

QuaTrace is not a real commercial product. It is a teaching tool, purpose-built to give QA learners a realistic, fully realized application to practice against. The design goal is believability: QuaTrace should feel like something a learner might encounter on their first day in a QA role.

### 1.3 Strategic Purpose

The QA industry gives beginners very little to actually practice on. Third-party demo apps exist, but they are generic, poorly documented, and disconnected from QA-specific tooling and workflows. QuaTrace solves this by giving UnderstandQA full control over the practice environment — including the ability to introduce intentional defects for exercises, control the data model, and tie the app's features directly to the curriculum.

The secondary benefit is that QuaTrace itself introduces learners to the category of tools they will use professionally. By the time a learner finishes the curriculum, they will have hands-on experience with a QA management platform — not just generic CRUD testing.

### 1.4 Two-Component Architecture

QuaTrace consists of two distinct but tightly connected components:

- **QuaTrace Core** — the QA tracking application itself: defects, test cases, test runs, projects, organizations, billing, and the marketplace. This is what learners test against.  
- **QuaTrace Scenarios** — the simulation layer built on top of Core: the learner onboarding flow, the scenario dashboard, the event engine, and the virtual team NPC system. This is what makes QuaTrace a guided learning environment rather than a static demo app.

These components share the same database and API but are developed and documented separately. Claude Code must treat them as architecturally distinct — Scenarios depends on Core, not the other way around.

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Provide a realistic, fully featured QA SaaS application for learners to practice against  
- Cover enough surface area to support unit tests, API tests, E2E tests, accessibility tests, visual regression tests, and (eventually) performance tests  
- Introduce learners to real QA domain concepts: defect tracking, test case management, test runs, environments, and release management  
- Simulate a realistic workplace environment through virtual teams and scenario-driven events  
- Be runnable locally via Docker and deployable to a hosted environment at quatrace.com  
- Exist in two maintained versions: a clean reference implementation and a defect-seeded exercise version  
- Serve as a content asset — the app's features and scenarios map directly to lessons and exercises in the UnderstandQA curriculum

### 2.2 Non-Goals

- QuaTrace is not intended to compete with or replicate real tools like Jira, TestRail, or Linear  
- QuaTrace is not a production SaaS product and will not be monetized directly  
- QuaTrace does not need to handle real payments, real email delivery, or real third-party integrations  
- QuaTrace does not need to be optimized for performance at scale — it needs to be realistic, not enterprise-grade  
- QuaTrace will not use TypeScript — plain JavaScript is intentional to reduce the learning barrier for beginners  
- Virtual teammate NPC responses will not be AI-generated at launch — pre-scripted responses are sufficient; AI generation is a future enhancement

---

## 3. Learners & Roles

### 3.1 Learners

The people interacting with QuaTrace are UnderstandQA learners — beginners and career changers with little or no technical background. The term "learner" is used throughout this document and the codebase in preference to "user" when referring to real people interacting with QuaTrace.

Learners access QuaTrace in one of two ways:

- As a **hosted instance** at quatrace.com — no setup required, available immediately on signup  
- As a **local installation** — cloned from GitHub and run via Docker Compose

### 3.2 Learner Experience Model

Each learner is provisioned their **own dedicated private organization** on the hosted instance. Within that organization:

- They are a **member of one active project** — their own, assigned during onboarding  
- They can **view all other projects** in the organization in read-only mode — these are seeded NPC-owned sibling projects within their private org, not other learners' work  
- They have a **virtual team** of seeded NPC teammates on their active project  
- Their active project comes pre-populated with a baseline set of realistic data

This mirrors the real workplace experience: a QA engineer on a team has full visibility into their own project but only read access to other teams' work in tools like Jira. Learners encounter the same permission model they will see on the job. Because each learner's organization is private and isolated, one learner's actions can never affect another's data (see Section 6.6).

### 3.3 Fictional Roles (In-App)

Within the QuaTrace application, five roles exist. Learners are assigned the Tester role by default during onboarding, which reflects the most common entry-level QA position.

| Role | Description |
| :---- | :---- |
| **Admin** | Full access to all features, user management, billing, and org settings |
| **Manager** | Can create and manage projects, assign defects, view reports |
| **Developer** | Responds to and transitions defects, pushes builds, comments. Individual-contributor role focused on the dev workflow; cannot manage users, billing, or projects |
| **Tester** | Can create and execute test cases and test runs, log defects |
| **Viewer** | Read-only access to all project data |

Role-based access control (RBAC) must be enforced at the API layer on every endpoint. This is a deliberate design choice — RBAC testing is a core skill for QA professionals, and learners should encounter it here.

### 3.4 Virtual Teams (NPCs)

Each learner's active project has a virtual team of seeded NPC accounts filling the surrounding roles. A typical virtual team includes:

| NPC Role | In-App Role | Purpose |
| :---- | :---- | :---- |
| Product Owner | Manager | Assigns stories, introduces epics, reviews completed work |
| Developer | Developer | Responds to defects, moves tickets, pushes builds |
| QA Lead | Manager | Reviews test runs, provides feedback, assigns test cases |
| Scrum Master | Viewer | Sends sprint summaries, facilitates process events |
| QA Engineer | Tester | Tests tickets |

NPCs are persistent seeded accounts — they are not dynamically generated per learner. Each NPC has a name, avatar, role, and a pre-scripted response library used by the event engine.

---

## 4. Onboarding Flow

When a learner creates a QuaTrace account for the first time, they go through a short onboarding sequence before reaching the main application.

### 4.1 Onboarding Steps

1. **Account creation** — email, password, first name, last name  
     
2. **Project type selection** — the learner chooses what kind of software their fictional team is building. This determines the flavor of seed data loaded into their project.  
     
   Available project types (examples):  
     
   - Mobile App (iOS/Android)  
   - Web Application  
   - API / Backend Service  
   - E-commerce Platform  
   - Internal Tools / Dashboard

   

3. **Role confirmation** — learners are informed they are joining as a QA Engineer (Tester role) on their selected project type. This is not a choice — it reflects the target job role the curriculum prepares them for.  
     
4. **Virtual team introduction** — a brief screen introduces the learner's virtual teammates by name, role, and avatar. Sets the simulation context before they enter the app.  
     
5. **Dashboard landing** — the learner lands on the Scenario Dashboard (see Section 6), not the main project view. Their first action is to select a scenario or begin free exploration.

### 4.2 Project Seeding on Onboarding

When a learner completes onboarding, the system:

- Creates a learner account with the Tester role  
- Provisions a dedicated private organization for the learner, defaulted to the **Pro** subscription tier (so the virtual team fits the member limit and marketplace + custom environments are available for exercises)  
- Creates their personal project (named after their chosen project type)  
- Seeds a few read-only NPC-owned sibling projects in the org, so the learner has other projects to view (matching the read-only visibility described in Section 3.2)  
- Seeds the personal project with a baseline dataset appropriate to the project type: a small number of open defects, a starter test suite, a few builds, and a set of environments (Dev, QA, Staging)  
- Associates the NPC virtual team with the project

The baseline seed data is lightweight — enough to feel real, not overwhelming. Scenarios layer additional data on top when launched.

---

## 5. Core Features (QuaTrace Core)

### 5.1 Authentication & Session Management

Learners can register, log in, and log out. Sessions are managed via JWT access tokens (short-lived) and refresh tokens stored in httpOnly cookies. The auth flow is a teaching surface — learners will write tests for login, logout, token expiry, and unauthorized access.

Key behaviors:

- Registration requires email, password, first name, and last name  
- Passwords must meet minimum complexity requirements  
- Login returns an access token; refresh tokens are rotated on use  
- Failed login attempts are rate-limited  
- Accessing protected routes without a valid token returns 401  
- Accessing routes without sufficient role permissions returns 403

### 5.2 Defect Tracking

The defect tracker is one of the two primary modules. Learners can log, triage, assign, and resolve defects against their active project. This is intentionally modeled on how real defect tracking works in tools like Jira.

Each defect has:

| Field | Values |
| :---- | :---- |
| Title | Free text, required |
| Description | Rich text / markdown |
| Status | New, Open, In Progress, In Testing, Resolved, Closed, Won't Fix |
| Severity | Critical, High, Medium, Low |
| Priority | P1, P2, P3, P4 |
| Assignee | Any member with the Tester, Developer, Manager, or Admin role (i.e. not Viewer) |
| Reporter | Any member with the Tester, Developer, Manager, or Admin role (i.e. not Viewer) |
| Environment | Linked to a project environment |
| Build/Release | Optional link to a build |
| Attachments | File references (simulated — no real file storage) |
| Comments | Threaded comments with timestamps |
| Created / Updated | Timestamps |

Status transitions follow a defined workflow. Not all transitions are valid — this is an intentional test surface for state machine testing exercises.

Valid transitions:

- New → Open  
- Open → In Progress, Won't Fix  
- In Progress → In Testing  
- In Testing → Resolved, In Progress (failed testing — triggers NPC event, see Section 6.4)  
- Resolved → Closed, Open (reopened)  
- Closed → Open (reopened)  
- Won't Fix → Open (reconsidered)

Note: The "In Testing → In Progress" transition is a key scenario trigger. When a learner moves a defect back to In Progress because it failed testing, the assigned developer NPC responds with a pre-scripted comment and acknowledgement.

### 5.3 Test Case Management

The test case module allows learners to author, organize, and manage test cases. Each project contains one or more test suites, and each suite contains test cases.

Each test case has:

| Field | Values |
| :---- | :---- |
| Title | Free text, required |
| Description | Context and objective |
| Preconditions | What must be true before executing |
| Steps | Ordered list of actions |
| Expected Result | What a passing execution looks like |
| Suite | Parent test suite |
| Priority | High, Medium, Low |
| Status | Active, Draft, Deprecated |
| Tags | Free-form labels |
| Created / Updated | Timestamps |

Test suites are containers with a name, description, and ordered list of test cases. Common suite examples in seed data: Smoke Tests, Regression Suite, Onboarding Flow, API Contract Tests.

### 5.4 Test Run Execution

A test run is an execution of a test suite against a specific environment and build. Learners work through each test case in the run and record a result.

Each test run has:

- Name (e.g. "Sprint 14 Regression")  
- Linked test suite  
- Target environment  
- Target build/release  
- Status: Planned, In Progress, Completed, Aborted  
- Per-case results: Pass, Fail, Blocked, Skipped, Not Run  
- Notes per result (free text)  
- Overall pass rate (calculated)  
- Started / Completed timestamps

Test runs are append-only in terms of results — learners record results as they go; they do not edit prior results within an active run.

### 5.5 Projects & Organizations

Organizations are the top-level billing and access control boundary. Each organization has multiple projects. Learners belong to one organization, are members of one active project, and have read-only visibility across all other projects in the org.

Projects contain all domain objects: defects, test suites, test cases, test runs, environments, and builds. Projects have a name, description, status (Active, Archived), and a member list.

### 5.6 Environments & Builds

Environments are named targets for test execution within a project. Each learner project ships with three default environments (Dev, QA, Staging). Additional environments (e.g. Production) are custom environments, available on the Pro and Enterprise tiers.

Builds are lightweight version markers — a name/number and optional release notes — used to associate defects and test runs with a specific point in time.

### 5.7 Subscription & Billing

QuaTrace operates on a three-tier subscription model. Billing is simulated — no real payments are processed, but the billing UI, invoices, and feature gates behave exactly as they would in a real SaaS product. Billing flows are an important and commonly untested surface that learners rarely get to practice elsewhere.

| Feature | Free | Pro | Enterprise |
| :---- | :---- | :---- | :---- |
| Projects | 2 | 20 | Unlimited |
| Team members | 3 | 25 | Unlimited |
| Test cases | 500 | 10,000 | Unlimited |
| Test runs / month | 10 | 500 | Unlimited |
| API access | No | Yes | Yes |
| Marketplace add-ons | No | Yes | Yes |
| Custom environments | No | Yes | Yes |
| Audit log | No | No | Yes |
| Priority support | No | No | Yes |

Feature gates must be enforced at the API layer. Attempting to exceed a plan limit returns a structured error response that learners can write assertions against.

Learner organizations default to the **Pro** tier (see Section 4.2) so that the virtual team fits within the member limit and marketplace add-ons and custom environments are available for exercises. To let learners still practice testing Free-tier feature gates, a dedicated billing scenario provisions or temporarily applies a Free-tier context, then walks the learner through hitting a limit and upgrading. Feature-gate exercises are driven through that scenario rather than by putting the learner's own org on Free.

### 5.8 Marketplace

The marketplace contains 15 fictional integrations that organizations on Pro or Enterprise can install. Integrations are not real but the install, configure, and uninstall flows are fully functional API surfaces.

Example integrations: Slack Notifications, GitHub Sync, Jenkins CI, CircleCI, PagerDuty Alerts, CSV Export, JIRA Import, Email Digest, Webhook Triggers, Custom Branding, SSO (Enterprise only), Advanced Reporting, Test Coverage Dashboard, Load Test Runner, Mobile Device Farm.

### 5.9 Admin Panel

Admins have access to organization settings: invite/remove users, change roles, manage billing, view the audit log (Enterprise only), and configure organization-wide defaults.

The audit log is an append-only record of significant actions with timestamp and actor.

### 5.10 Reporting & Dashboard

Each project has a summary dashboard showing:

- Open defect count by severity  
- Test run pass rate trend (last 10 runs)  
- Test case count by status  
- Recent activity feed

Metrics are calculated server-side from real seed data, making them valid targets for API response assertions.

---

## 6. Scenario Engine (QuaTrace Scenarios)

The Scenario Engine is the simulation layer built on top of QuaTrace Core. It transforms the app from a static practice environment into a guided, reactive workplace simulation.

### 6.1 Scenario Dashboard

The Scenario Dashboard is the learner's home screen in QuaTrace. It is the first thing they see after onboarding and after logging in on return visits.

The dashboard shows:

- **Active scenario** — the currently running scenario, its progress, and a resume button  
- **Available scenarios** — a catalog of scenarios the learner can launch, organized by topic and difficulty  
- **Completed scenarios** — a history of finished scenarios with completion date  
- **Project controls** — buttons to reset project data to the baseline or clear all data

Scenarios are organized to align with the UnderstandQA curriculum. A learner progressing through the curriculum will naturally encounter scenarios in the appropriate order.

### 6.2 Scenario Structure

Each scenario is a self-contained learning exercise with a defined start state, a set of objectives, and a sequence of events that fire based on learner actions.

A scenario definition includes:

| Field | Description |
| :---- | :---- |
| ID | Unique identifier |
| Title | Human-readable name (e.g. "Your First Bug Report") |
| Description | What the learner will do and learn |
| Difficulty | Beginner, Intermediate, Advanced |
| Estimated time | Expected duration |
| Prerequisites | Scenario IDs that should be completed first |
| Seed data spec | What data to load when the scenario starts |
| Event chain | Ordered list of events and their triggers |
| Objectives | Checklist of actions the learner must complete |
| Completion condition | What marks the scenario as done |

### 6.3 Scenario Lifecycle

1. **Launch** — learner selects a scenario from the dashboard. The system clears the current scenario state, loads the scenario's seed data into the learner's project, and fires the opening event (typically a message from the Product Owner NPC).  
     
2. **Active** — the learner works through the scenario by taking actions in the app. Events fire in response to their actions. Progress is saved continuously.  
     
3. **Resume** — if the learner leaves and returns, the scenario resumes from where they left off. The event chain remembers which events have fired.  
     
4. **Complete** — when all objectives are met and the completion condition is satisfied, the scenario is marked complete. The learner is returned to the dashboard with a summary.  
     
5. **Restart** — the learner can restart any scenario at any time from the dashboard. This reseeds the project data and resets the event chain to its initial state.

### 6.4 Event Engine

The Event Engine is the mechanism that makes virtual teammates feel alive. It listens for learner actions within an active scenario and fires pre-scripted NPC responses based on defined triggers.

**Event trigger types:**

| Trigger Type | Example |
| :---- | :---- |
| Defect status change | Learner moves defect from In Testing → In Progress |
| Test run completed | Learner completes a test run with failures |
| Test case created | Learner authors their first test case |
| Comment added | Learner comments on a defect |
| Time elapsed | 30 minutes pass with no activity (idle nudge) |
| Objective completed | Learner checks off a scenario objective |
| Manual / opening | Fires immediately when the scenario launches |

**Event delivery:**

When an event fires, the NPC delivers a response through two channels simultaneously, mirroring how real tools like Jira work:

1. **In-app notification** — appears in the QuaTrace notification center, attributed to the NPC. May include actions such as a ticket being assigned or a comment being posted by the NPC.  
2. **Simulated email** — delivered to an in-app inbox (not the learner's real email). The email is styled to look like a real tool notification and is attributed to the NPC.

NPC responses at launch are pre-scripted — fixed text per trigger, written to feel natural and contextually appropriate. AI-generated responses are a planned future enhancement.

**Example event chain for "Your First Bug Report" scenario:**

| Step | Trigger | NPC | Response |
| :---- | :---- | :---- | :---- |
| 1 | Scenario launch | Product Owner | "Welcome to Sprint 3. We've got a new build ready for testing — can you start with the login flow?" |
| 2 | Learner creates first defect | Developer | "Thanks for logging this. I'll take a look." (assigns defect to themselves) |
| 3 | Learner moves defect In Testing → In Progress | Developer | "Just pushed a fix for this. Can you retest on the QA environment?" |
| 4 | Learner re-tests and resolves the defect | QA Lead | "Nice work. Go ahead and mark it resolved and we'll close it after sign-off." |
| 5 | Learner closes the defect | Product Owner | "Great — that was the last blocker for this story. Scenario complete." |

### 6.5 Learner Progress & State

Scenario progress is persisted per learner in the database. The state record includes:

- Current scenario ID  
- Which events in the chain have fired  
- Which objectives have been completed  
- Timestamps for start, last activity, and completion  
- Whether the scenario has been completed before (for replay tracking)

Progress is never lost on navigation away. The only way to reset progress is an explicit "Restart Scenario" action from the dashboard.

### 6.6 Project Data Controls

From the dashboard, learners have three data control actions available at all times:

| Action | Effect |
| :---- | :---- |
| **Reset to baseline** | Clears scenario data and reloads the default baseline seed for their project type. Cancels any active scenario. |
| **Clear all data** | Removes all data from their project (empty slate for free exploration). |
| **Restart scenario** | Reseeds the current scenario's starting data and resets the event chain. |

These controls only affect the learner's own project data. The broader org data (other teams' projects, the seeded organization) is never affected.

---

## 7. API Design

### 7.1 Conventions

All API responses follow a consistent envelope:

```json
{
  "data": {},
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 143
  },
  "error": null
}
```

On error:

```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": []
  }
}
```

All list endpoints support pagination via `?page=` and `?perPage=` query parameters, plus basic filtering and sorting relevant to their domain.

### 7.2 Endpoint Domains

| Domain | Prefix | Notes |
| :---- | :---- | :---- |
| Auth | `/api/auth` | Register, login, logout, refresh, me |
| Users | `/api/users` | CRUD, role management |
| Organizations | `/api/orgs` | CRUD, member management |
| Projects | `/api/projects` | CRUD, archive |
| Defects | `/api/projects/:id/defects` | Full defect lifecycle |
| Test Cases | `/api/projects/:id/test-cases` | Authoring, bulk import |
| Test Suites | `/api/projects/:id/test-suites` | Suite management |
| Test Runs | `/api/projects/:id/test-runs` | Run creation, result recording |
| Environments | `/api/projects/:id/environments` | CRUD |
| Builds | `/api/projects/:id/builds` | CRUD |
| Subscriptions | `/api/subscriptions` | Plan info, upgrade |
| Billing | `/api/billing` | Invoices, history, contact |
| Marketplace | `/api/marketplace` | List, install, configure, uninstall |
| Admin | `/api/admin` | User management, audit log |
| Health | `/api/health` | Liveness and readiness checks |
| Scenarios | `/api/scenarios` | List, launch, progress, restart |
| Events | `/api/events` | Trigger log, NPC response delivery |
| Notifications | `/api/notifications` | In-app notification feed |
| Inbox | `/api/inbox` | Simulated email inbox |

---

## 8. Data & Seed Requirements

### 8.1 Global Seed Data

The hosted instance must feel populated and real. Seed data is generated with Faker.js and must be deterministic (seeded random — same output every time `db:seed` is run).

This global seed populates the shared demo dataset for the hosted instance. It is separate from the per-learner provisioning described in Sections 4.2 and 8.2: each onboarded learner is *additionally* given a fresh private organization (their personal project, read-only NPC sibling projects, and NPC team), which keeps every learner's data isolated from the global dataset and from other learners.

| Entity | Seeded Count |
| :---- | :---- |
| Organizations | 50 |
| Users (NPCs + global) | 500+ |
| Projects | 100+ |
| Defects | 1,000+ |
| Test Cases | 2,000+ |
| Test Suites | 200+ |
| Test Runs | 500+ |
| Test Run Results | 10,000+ |
| Environments | 3–5 per project |
| Builds | 5–10 per project |
| Invoices | 3–12 per org |
| Marketplace installs | Varied per org |
| Audit log entries | 5,000+ |

### 8.2 Learner Project Seed Data (Baseline)

When a learner completes onboarding, their project is seeded with a lightweight baseline appropriate to their chosen project type. This is separate from the global seed.

| Entity | Baseline Count |
| :---- | :---- |
| Defects | 8–12 (mix of open and resolved) |
| Test Cases | 15–20 (across 2 suites) |
| Test Suites | 2 (Smoke Tests, Regression) |
| Test Runs | 2 (one completed, one planned) |
| Environments | 3 (Dev, QA, Staging) |
| Builds | 3 (representing recent sprint history) |
| NPC team members | 5 (Product Owner, Developer, QA Lead, Scrum Master, QA Engineer) |

### 8.3 Scenario Seed Data

Each scenario definition includes its own seed spec — the data loaded when the scenario launches. Scenario data layers on top of the learner's current project state; it does not replace the baseline unless the learner explicitly resets first.

---

## 9. Test Suite Requirements

### 9.1 Two-Branch Strategy

The repository maintains two long-lived branches:

- `main` — the clean reference implementation. All tests pass. Used as answer keys and worked examples in lessons.  
- `buggy` — a defect-seeded version rebased periodically from `main`. Defects are intentional and documented in `BUGS.md` (not visible to learners until after exercises). Learners are given partial or blank test files and asked to find and document failures.

### 9.2 Test Types & Tooling

| Test Type | Tool | Location |
| :---- | :---- | :---- |
| Unit tests | Vitest | `backend/src/**/*.test.js`, `frontend/src/**/*.test.jsx` |
| API tests | Supertest + Vitest | `backend/tests/api/` |
| E2E tests | Playwright | `e2e/tests/` |
| Accessibility | axe-core + Playwright | `e2e/tests/` (tagged `@a11y`) |
| Visual regression | Playwright | `e2e/visual/` |
| Performance (planned) | k6 or Artillery | `perf/` (future) |
| Contract (planned) | Pact | `backend/tests/contract/` (future) |

### 9.3 Coverage Targets (Reference Suite)

- Unit: 80%+ line coverage on all service and utility modules  
- API: 100% of documented endpoints with at least one happy path and two error cases each  
- E2E: full coverage of all critical user flows (see below)

### 9.4 Critical User Flows (E2E)

**Core flows:**

- Learner registration and login  
- Password requirements enforcement  
- Role-based access (viewer cannot create; tester cannot manage users)  
- Create, update, and close a defect through all valid status transitions  
- Attempt an invalid status transition and assert the error  
- Author a test case and add it to a suite  
- Create and execute a test run; record pass, fail, and blocked results  
- In the billing scenario (Free-tier context), attempt to exceed a plan limit and assert the feature gate error  
- Upgrade subscription (Free → Pro) and verify previously gated features are now accessible  
- Install a marketplace integration and verify configuration is persisted  
- Admin invites a new user; user receives role and can log in  
- Audit log reflects a sequence of actions in correct order

**Scenario engine flows:**

- Learner completes onboarding and lands on the Scenario Dashboard  
- Learner launches a scenario; correct seed data loads and opening event fires  
- NPC response appears in notification center and in-app inbox  
- Learner action triggers an event; NPC response is delivered  
- Learner navigates away and returns; scenario progress is preserved  
- Learner restarts a scenario; data reseeds and event chain resets  
- Learner resets project to baseline; scenario data is cleared

---

## 10. Infrastructure & Deployment

### 10.1 Local Development

Learners and contributors can run the full stack locally using Docker Compose. The setup must be achievable in under five minutes with no prior cloud account or configuration required.

Requirements:

- Docker and Docker Compose are the only prerequisites  
- A single `docker-compose up` starts the database  
- `npm run db:migrate && npm run db:seed` populates the global seed data  
- The API and frontend each start with `npm run dev`  
- Full setup is documented in `README.md` with copy-pasteable commands

### 10.2 Hosted Deployment (Current — Railway + Vercel)

The hosted instance at quatrace.com is the default environment for learners who do not want to run the app locally.

- **Frontend:** Deployed to Vercel; auto-deploys on push to `main`  
- **Backend API:** Deployed to Railway; auto-deploys on push to `main`  
- **Database:** PostgreSQL managed by Railway; migrations run as a release command  
- **Environment variables:** Managed in Railway and Vercel dashboards; never committed to the repo

### 10.3 Planned Migration — AWS

When audience scale and budget justify it, QuaTrace will migrate to AWS:

- EC2 (API server)  
- RDS PostgreSQL (managed database)  
- S3 (static asset storage)  
- CloudFront (frontend CDN)  
- Infrastructure as code: AWS CDK in JavaScript, living in `infra/`

The migration will be documented step-by-step and published as a lesson series.

---

## 11. Constraints & Principles

- **Plain JavaScript only.** No TypeScript. The audience is beginners; TypeScript adds a learning barrier before they have written a single test assertion.  
- **No real external services.** Marketplace integrations, email, payments, and file storage are all simulated. The app must work fully offline after initial setup.  
- **Deterministic seed data.** Running `db:seed` twice must produce the same dataset. Tests that depend on seed data must be predictable.  
- **Beginner-legible code.** Code organization, naming, and patterns should be things a beginner can follow and learn from — not showcases of clever abstractions.  
- **Scenario data is isolated per learner.** One learner's scenario actions must never affect another learner's project data on the hosted instance.  
- **NPC responses are pre-scripted at launch.** AI-generated responses are a future enhancement and must not be designed in as a dependency for v1.  
- **The buggy branch defects are intentional and must never be "fixed" by Claude Code.** See CLAUDE.md for the full list of constraints on automated tooling.

---

## 12. Future Work & Open Questions

| Item | Notes |
| :---- | :---- |
| React Native mobile app | Planned after web version is stable; shares business logic |
| AWS migration | When audience and budget justify it; will be a lesson series |
| Performance test suite | k6 or Artillery; planned as an advanced module |
| Contract testing | Pact; planned lesson on consumer-driven contracts |
| AI-generated NPC responses | Replace pre-scripted text with context-aware Claude responses |
| Course monetization tie-in | QuaTrace may become a gated resource in a paid tier |
| `BUGS.md` documentation | Full catalog of intentional defects in the `buggy` branch |
| CI/CD pipeline | GitHub Actions for automated test runs on PRs |
| Accessibility audit | Baseline axe-core scan and remediation before launch |
| Scenario authoring tool | Internal tool to create and manage scenario definitions without code |
| Learner analytics | Aggregate data on which scenarios are completed, time spent, common failure points |

---

## 13. Revision History

| Version | Date | Author | Notes |
| :---- | :---- | :---- | :---- |
| 0.1 | June 2026 | UnderstandQA | Initial draft |
| 0.2 | June 2026 | UnderstandQA | Added virtual teams, onboarding flow, scenario engine, NPC event system, learner data model, in-app inbox |
| 0.3 | June 2026 | UnderstandQA | Five-role model (added Developer), Pro default tier, private-org-per-learner isolation, consistency + formatting pass |


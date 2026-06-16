---
name: a11y-audit
description: Run QuaTrace's WCAG 2.2 AA accessibility pass on a page, component, or flow — automated axe checks plus the documented manual checklist. Use when adding or changing any UI surface, or to verify accessibility before a PR. Required by the Definition of Done in CLAUDE.md.
---

# a11y-audit — WCAG 2.2 AA accessibility pass

QuaTrace must conform to **WCAG 2.2 Level AA**. Automated tools catch only a portion of the
success criteria (roughly a third to a half), so conformance is proven by **automated axe checks
plus a documented manual checklist**. This skill runs both for a given surface.

## Part 1 — Automated (the always-green gate)
- **E2E:** add/run `@axe-core/playwright` scans against the page and each key UI state
  (loading, empty, error, modal open, form invalid). Tag the tests `@a11y`. Target **zero
  violations** — that is a hard gate.
- **Component:** assert accessibility on individual components in Vitest + Testing Library.
- Configure axe to the **wcag22aa** rule set.
- Run the existing accessibility tests and capture the result:
  - `cd e2e && npx playwright test --grep @a11y`
- Treat any violation as a defect to fix (on `main`), not to suppress.

## Part 2 — Manual WCAG 2.2 AA checklist (document the result in the PR)
Automated scans cannot verify these — check each by hand and record pass/fail with notes:

- [ ] **Keyboard only:** every interactive element reachable and operable with keyboard alone;
      no keyboard traps; logical tab order.
- [ ] **Visible focus:** focus indicator is clearly visible on every focusable element
      (WCAG 2.2 *Focus Appearance*).
- [ ] **Focus management:** opening/closing modals, menus, and route changes move focus
      sensibly; focus is not lost to the document body.
- [ ] **Meaningful sequence & headings:** DOM/reading order matches visual order; heading levels
      are logical; landmarks present.
- [ ] **Names, roles, values:** controls have accessible names; form fields have associated
      labels; icon-only buttons have text alternatives; images have appropriate alt text.
- [ ] **Color & contrast:** text meets AA contrast; information is never conveyed by color alone
      (e.g. defect status, pass/fail results carry text/icons too).
- [ ] **Target size (2.2):** interactive targets meet the minimum size / spacing.
- [ ] **Pointer/dragging alternatives (2.2):** any drag interaction (e.g. reordering test steps)
      has a single-pointer alternative.
- [ ] **Errors:** form errors are announced, programmatically associated, and describe how to fix.
- [ ] **Screen reader pass:** spot-check the flow with a screen reader; dynamic updates
      (notifications, NPC events) are announced via live regions.

## Output
- A short report: automated result (violation count by page/state) + the completed manual
  checklist with notes.
- A list of any failures with the specific WCAG success criterion and a suggested fix.
- Confirmation of WCAG 2.2 AA conformance for the surface, or the blocking issues that prevent it.

Paste the report into the PR so the Definition-of-Done accessibility item is evidenced.

<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 4) on 2026-07-09. -->

# Trakio — Full App Page Audit

**Report generator:** `my-playwright-project/generate-report.js`
**Report output:** `my-playwright-project/trakio-qa-report.html` *(generated, not committed)*
**Screenshots dir:** `my-playwright-project/trakio-screenshots/`
**Site:** `trakio.brillmark.com` (Brillmark's internal LOE / task tracking app)
**Test date:** May 4, 2026
**Test type:** Playwright screenshot capture + manual visual review → HTML bug report
**Scope:** 11 pages across the full sidebar navigation

### Page Status Results

| Page | URL | Status | Issue |
|------|-----|--------|-------|
| Dashboard | `/dashboard` | ❌ 404 | BUG-01 Critical |
| My Tasks | `/tasks` | ✅ Works | — |
| Worklogs | `/worklogs` | ✅ Works | BUG-08, BUG-09 (medium) |
| My Spaces | `/spaces` | ✅ Works | — |
| Projects | `/projects` | ⚠️ Empty table | BUG-04 Critical |
| Invoices | `/invoices` | ❌ 404 | BUG-02 High |
| Clients | `/clients` | ⚠️ Empty table | BUG-05 Critical |
| Employee Worklogs | `/employee-worklogs` | ✅ Works | — |
| Reports | `/reports` | ✅ Works | BUG-07 (high), UX-06 |
| LOE Approvals | `/loe-approvals` | ❌ 404 | BUG-03 Critical |
| Settings | `/settings` | ✅ Works | UX-02, UX-03, UX-04 |

### All Bugs Found

**P0 — Critical**

| ID | Page | Issue |
|----|------|-------|
| BUG-01 | /dashboard | Dashboard returns bare Next.js 404 — first nav item, home page broken. No app chrome, no sidebar. |
| BUG-03 | /loe-approvals | LOE Approvals returns 404 — the primary purpose of the app (LOE approval workflow) has no working page. |
| BUG-04 | /projects | Projects table renders 10 completely blank rows despite summary stats at top showing real data (5,088 hrs budget, 3,025 hrs logged, 2 at-risk projects). |
| BUG-05 | /clients | Clients table renders with headers but all rows blank. 6 clients visible in My Spaces confirming data exists. |

**P1 — High**

| ID | Page | Issue |
|----|------|-------|
| BUG-02 | /invoices | Invoices returns 404 — sidebar link leads nowhere. |
| BUG-06 | Multiple | LOE data inconsistency: "CLS audit + remediation" (PSA / Hardy Party) shows `0h / 6h` on My Tasks but `8h / 6h` on My Spaces. Same task, same app, completely different numbers. |
| BUG-07 | Multiple | At-risk project count differs: Projects page shows 2, Reports page shows 3 (same definition: burn > 85% or over budget). |

**P2 — Medium**

| ID | Page | Issue |
|----|------|-------|
| BUG-08 | /worklogs | Active timer shows `01:34:47` counting up but simultaneously shows hint "Press Space to start" — contradictory state. Timer running but no task assigned to it. |
| BUG-09 | /worklogs | Weekly progress header shows "logged 0h / remaining 40h / 0%" but calendar shows historical entries (Apr 23=8h, Apr 24=7h, Apr 25=6.5h, etc.). Date range mismatch or query bug. |
| BUG-10 | /tasks + others | Sidebar workspace name and profile avatar remain as loading skeleton and never resolve on some pages. |

**P3 — UX / Copy**

| ID | Location | Issue |
|----|----------|-------|
| UX-01 | All pages (sidebar) | "Upgrade to Pro" banner copy says "Unlock unlimited chatbots" — chatbots are not a Trakio feature. Leftover template copy from a different product. |
| UX-02 | /settings | Workspace name input field is blank — current name not pre-populated. |
| UX-03 | /settings | Workspace domain field shows only placeholder `e.g., acme-team` — current slug not shown. |
| UX-04 | /settings | Logo/avatar area in settings stays as a grey loading skeleton that never resolves. |
| UX-05 | /dashboard, /invoices, /loe-approvals | 404 pages are bare Next.js default pages — no app layout, no sidebar, no back button. Users are stranded. |
| UX-06 | /reports | "Checkout Extensibility" project is 25× over budget (10h estimated / 250h actual, +240h) but gets only a small orange accuracy badge. Needs a more prominent visual alert. |

### What works well (reference for regression testing)

- **My Tasks** — Task list with project badge, status, priority, LOE progress bar, due date. Tab filters (Open / Due This Week / LOE Pending / Billable / All).
- **Worklogs** — Day-picker calendar, quick-add input, keyboard shortcuts (N, Space, S, ← →).
- **My Spaces** — Client → Project → Task hierarchy with LOE bars, assignee avatars, status badges.
- **Employee Worklogs** — Per-member daily hours, weekly LOE Est/Actual, accuracy %.
- **Reports** — KPI cards (Total Hours, Billable Ratio, LOE Accuracy, At-Risk), per-project breakdown.
- **Auth flow** — Passwordless magic link + Google OAuth, "Check your inbox" feedback.

### Screenshots captured

`trakio-screenshots/` directory contains 12 screenshots referenced in the report:
`01-login-page.png`, `page-01-dashboard.png`, `page-02-my-tasks.png`, `page-03-worklogs.png`,
`page-04-my-spaces.png`, `page-05-projects.png`, `page-06-invoices.png`, `page-07-clients.png`,
`page-08-employee-worklogs.png`, `page-09-reports.png`, `page-10-loe-approvals.png`, `page-11-settings.png`

### Additional test cases to consider for future app audits

- [ ] All sidebar nav links resolve to valid pages (no 404s)
- [ ] Custom 404 page renders within app layout with a "Go home" CTA
- [ ] Data consistency across pages (same metric on two pages shows same value)
- [ ] Table rows not blank when API confirms data exists (check network response vs rendered DOM)
- [ ] Timer state is correct (running = task assigned, stopped = no task)
- [ ] Date ranges on aggregated stats match their labels
- [ ] Skeleton loaders resolve within a timeout (3s max)
- [ ] Pro upgrade copy matches the actual product's feature set
- [ ] Settings forms pre-populate current values on load
- [ ] At-risk / budget calculations use the same formula on all pages
- [ ] Pagination on tables works (next page loads correctly)
- [ ] Search / filter on each table works and updates results
- [ ] Mobile responsive check on each page (sidebar collapses, tables scroll horizontally)
- [ ] Auth: logging out redirects to login, protected routes block unauthenticated access



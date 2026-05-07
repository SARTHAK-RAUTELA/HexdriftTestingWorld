const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'trakio-screenshots');
const OUTPUT = path.join(__dirname, 'trakio-qa-report.html');

function imgB64(filename) {
  const fp = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(fp)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
}

const ss = {
  login:      imgB64('01-login-page.png'),
  tasks:      imgB64('page-02-my-tasks.png'),
  worklogs:   imgB64('page-03-worklogs.png'),
  spaces:     imgB64('page-04-my-spaces.png'),
  projects:   imgB64('page-05-projects.png'),
  invoices:   imgB64('page-06-invoices.png'),
  clients:    imgB64('page-07-clients.png'),
  emplog:     imgB64('page-08-employee-worklogs.png'),
  reports:    imgB64('page-09-reports.png'),
  loeappr:   imgB64('page-10-loe-approvals.png'),
  settings:   imgB64('page-11-settings.png'),
  dashboard:  imgB64('page-01-dashboard.png'),
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Trakio QA Report — May 4, 2026</title>
<style>
  :root {
    --green:#1a6b50;--green-light:#e6f4ef;--red:#c0392b;--red-light:#fdf0ef;
    --orange:#d35400;--orange-light:#fef5e7;--blue:#1a5276;--blue-light:#eaf2fb;
    --grey:#f8f9fa;--border:#dee2e6;--text:#212529;--muted:#6c757d;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--text);background:#fff;font-size:15px;line-height:1.6}
  a{color:var(--green)}

  /* ── COVER ── */
  .cover{background:linear-gradient(135deg,#0d4a35 0%,#1a6b50 60%,#2e8b67 100%);color:#fff;padding:60px 48px 48px;display:flex;flex-direction:column;gap:12px}
  .cover-logo{font-size:28px;font-weight:800;letter-spacing:-0.5px;opacity:.9}
  .cover h1{font-size:42px;font-weight:800;line-height:1.15;margin-top:8px}
  .cover .meta{display:flex;gap:32px;flex-wrap:wrap;margin-top:16px;opacity:.85;font-size:14px}
  .cover .meta span{display:flex;align-items:center;gap:6px}
  .badge-cover{display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:4px 14px;font-size:13px;margin-top:8px;backdrop-filter:blur(4px)}

  /* ── LAYOUT ── */
  .container{max-width:1100px;margin:0 auto;padding:0 32px 64px}
  h2{font-size:22px;font-weight:700;color:var(--green);margin:48px 0 16px;padding-bottom:8px;border-bottom:2px solid var(--green-light)}
  h3{font-size:16px;font-weight:700;margin:24px 0 8px}
  p{margin-bottom:10px}
  ul{padding-left:20px;margin-bottom:10px}
  ul li{margin-bottom:4px}
  code{background:#f1f3f5;border-radius:4px;padding:1px 6px;font-size:13px;font-family:'SF Mono','Consolas',monospace}

  /* ── STATUS SUMMARY TABLE ── */
  .summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:20px 0}
  .scard{border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
  .scard.ok{background:var(--green-light);border:1px solid #b2dfcc}
  .scard.bug{background:var(--red-light);border:1px solid #f5c6cb}
  .scard.warn{background:var(--orange-light);border:1px solid #fad7a0}
  .scard .page-name{font-weight:700;font-size:14px}
  .scard .page-url{font-size:12px;color:var(--muted);font-family:monospace}
  .scard .status-pill{margin-top:6px;font-size:12px;font-weight:600;padding:2px 10px;border-radius:20px;display:inline-block;width:fit-content}
  .ok .status-pill{background:#1a6b50;color:#fff}
  .bug .status-pill{background:#c0392b;color:#fff}
  .warn .status-pill{background:#d35400;color:#fff}

  /* ── BUG CARDS ── */
  .bug-card{border-radius:12px;padding:22px 24px;margin-bottom:20px;border-left:5px solid}
  .bug-card.critical{background:#fff8f8;border-color:#c0392b}
  .bug-card.high{background:#fffaf5;border-color:#d35400}
  .bug-card.medium{background:#fffef5;border-color:#f39c12}
  .bug-card.low{background:#f5f9ff;border-color:#2980b9}
  .bug-card.good{background:#f0faf5;border-color:#1a6b50}
  .bug-header{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
  .bug-id{font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;background:#333;color:#fff;letter-spacing:.5px}
  .bug-id.critical{background:#c0392b}
  .bug-id.high{background:#d35400}
  .bug-id.medium{background:#f39c12}
  .bug-id.low{background:#2980b9}
  .bug-title{font-size:16px;font-weight:700}
  .bug-row{display:flex;gap:8px;margin-bottom:6px;font-size:14px}
  .bug-label{font-weight:600;min-width:100px;color:var(--muted)}

  /* ── SCREENSHOT ── */
  .ss-wrap{margin:16px 0;border-radius:10px;overflow:hidden;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .ss-wrap img{width:100%;display:block}
  .ss-caption{font-size:12px;color:var(--muted);padding:8px 12px;background:var(--grey);border-top:1px solid var(--border)}

  /* ── PRIORITY TABLE ── */
  table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14px}
  th{background:var(--green);color:#fff;padding:10px 14px;text-align:left;font-weight:600}
  td{padding:10px 14px;border-bottom:1px solid var(--border)}
  tr:nth-child(even) td{background:var(--grey)}
  .p0{background:#fdf0ef!important;font-weight:700;color:#c0392b}
  .p1{background:#fef8f0!important;color:#d35400}
  .p-tag{display:inline-block;padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px}
  .p-tag.p0{background:#c0392b;color:#fff}
  .p-tag.p1{background:#d35400;color:#fff}
  .p-tag.p2{background:#f39c12;color:#fff}
  .p-tag.p3{background:#2980b9;color:#fff}

  /* ── SECTION DIVIDER ── */
  .section-intro{background:var(--grey);border-radius:10px;padding:16px 20px;margin-bottom:24px;font-size:14px;color:var(--muted)}

  /* ── TOC ── */
  .toc{background:var(--green-light);border:1px solid #b2dfcc;border-radius:10px;padding:20px 24px;margin:32px 0}
  .toc h3{color:var(--green);margin:0 0 12px}
  .toc ol{padding-left:20px}
  .toc li{margin-bottom:6px}
  .toc a{color:var(--green);text-decoration:none;font-weight:500}
  .toc a:hover{text-decoration:underline}

  /* ── WORKS WELL LIST ── */
  .works-list{list-style:none;padding:0}
  .works-list li{padding:10px 14px;margin-bottom:8px;background:var(--green-light);border-radius:8px;border-left:4px solid var(--green);font-size:14px}
  .works-list li::before{content:"✓ ";font-weight:700;color:var(--green)}

  /* ── FOOTER ── */
  .footer{text-align:center;color:var(--muted);font-size:13px;padding:32px;border-top:1px solid var(--border);margin-top:64px}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">T Trakio</div>
  <h1>QA Report</h1>
  <div><span class="badge-cover">Chrome Desktop · Playwright Automated + Visual Review</span></div>
  <div class="meta">
    <span>📅 May 4, 2026</span>
    <span>🔗 trakio.brillmark.com</span>
    <span>👤 Sarthak Rautela's Workspace</span>
    <span>🧪 11 pages tested</span>
    <span>🐛 10 bugs found · 6 UX issues</span>
  </div>
</div>

<div class="container">

<!-- TOC -->
<div class="toc">
  <h3>Contents</h3>
  <ol>
    <li><a href="#overview">Page Status Overview</a></li>
    <li><a href="#critical">Critical Bugs (P0)</a></li>
    <li><a href="#high">High Severity (P1)</a></li>
    <li><a href="#medium">Medium Severity (P2)</a></li>
    <li><a href="#ux">UX Issues (P3)</a></li>
    <li><a href="#works">What Works Well</a></li>
    <li><a href="#priority">Priority Fix Table</a></li>
    <li><a href="#screenshots">All Page Screenshots</a></li>
  </ol>
</div>

<!-- OVERVIEW -->
<h2 id="overview">Page Status Overview</h2>
<div class="section-intro">11 pages tested across the full sidebar navigation. 3 return 404, 2 render with empty data tables, 6 work correctly.</div>
<div class="summary-grid">
  <div class="scard bug"><span class="page-name">Dashboard</span><span class="page-url">/dashboard</span><span class="status-pill">❌ 404 Not Found</span></div>
  <div class="scard ok"><span class="page-name">My Tasks</span><span class="page-url">/tasks</span><span class="status-pill">✅ Works</span></div>
  <div class="scard ok"><span class="page-name">Worklogs</span><span class="page-url">/worklogs</span><span class="status-pill">✅ Works</span></div>
  <div class="scard ok"><span class="page-name">My Spaces</span><span class="page-url">/spaces</span><span class="status-pill">✅ Works</span></div>
  <div class="scard warn"><span class="page-name">Projects</span><span class="page-url">/projects</span><span class="status-pill">⚠️ Empty Table</span></div>
  <div class="scard bug"><span class="page-name">Invoices</span><span class="page-url">/invoices</span><span class="status-pill">❌ 404 Not Found</span></div>
  <div class="scard warn"><span class="page-name">Clients</span><span class="page-url">/clients</span><span class="status-pill">⚠️ Empty Table</span></div>
  <div class="scard ok"><span class="page-name">Employee Worklogs</span><span class="page-url">/employee-worklogs</span><span class="status-pill">✅ Works</span></div>
  <div class="scard ok"><span class="page-name">Reports</span><span class="page-url">/reports</span><span class="status-pill">✅ Works</span></div>
  <div class="scard bug"><span class="page-name">LOE Approvals</span><span class="page-url">/loe-approvals</span><span class="status-pill">❌ 404 Not Found</span></div>
  <div class="scard ok"><span class="page-name">Settings</span><span class="page-url">/settings</span><span class="status-pill">✅ Works</span></div>
</div>

<!-- CRITICAL -->
<h2 id="critical">🔴 Critical Bugs</h2>
<div class="section-intro">These pages are listed in the main sidebar navigation but are completely broken. Users will hit these immediately.</div>

<div class="bug-card critical">
  <div class="bug-header"><span class="bug-id critical">BUG-01</span><span class="bug-title">Dashboard returns 404 — no app layout</span></div>
  <div class="bug-row"><span class="bug-label">URL</span><code>/sarthak-rautelas-workspace/dashboard</code></div>
  <div class="bug-row"><span class="bug-label">Impact</span>The first nav item and home page of the app is broken. Every new user's first click breaks the experience.</div>
  <div class="bug-row"><span class="bug-label">What happens</span>Clicking "Dashboard" in the sidebar loads a bare Next.js <code>404 | This page could not be found.</code> with no app chrome, no sidebar, and no way back into the app.</div>
  <div class="bug-row"><span class="bug-label">Expected</span>A dashboard with summary widgets — recent tasks, hours logged this week, project status, at-risk projects, etc.</div>
  <div class="ss-wrap"><img src="${ss.dashboard}" alt="Dashboard 404"/><div class="ss-caption">Dashboard at /dashboard → bare 404 with no navigation</div></div>
</div>

<div class="bug-card critical">
  <div class="bug-header"><span class="bug-id critical">BUG-02</span><span class="bug-title">Invoices returns 404</span></div>
  <div class="bug-row"><span class="bug-label">URL</span><code>/sarthak-rautelas-workspace/invoices</code></div>
  <div class="bug-row"><span class="bug-label">Impact</span>Invoicing is listed as a core feature in the sidebar but is completely non-functional.</div>
  <div class="bug-row"><span class="bug-label">What happens</span>Same bare 404 — no layout, no sidebar, user is stranded.</div>
  <div class="ss-wrap"><img src="${ss.invoices}" alt="Invoices 404"/><div class="ss-caption">Invoices at /invoices → 404</div></div>
</div>

<div class="bug-card critical">
  <div class="bug-header"><span class="bug-id critical">BUG-03</span><span class="bug-title">LOE Approvals returns 404 — core feature broken</span></div>
  <div class="bug-row"><span class="bug-label">URL</span><code>/sarthak-rautelas-workspace/loe-approvals</code></div>
  <div class="bug-row"><span class="bug-label">Impact</span>LOE approval workflow is the primary purpose of this app. The dedicated page for it is broken.</div>
  <div class="bug-row"><span class="bug-label">What happens</span>Same bare 404. The sidebar link leads nowhere.</div>
  <div class="ss-wrap"><img src="${ss.loeappr}" alt="LOE Approvals 404"/><div class="ss-caption">LOE Approvals at /loe-approvals → 404</div></div>
</div>

<!-- HIGH -->
<h2 id="high">🟠 High Severity Bugs</h2>
<div class="section-intro">Pages load but show incorrect or inconsistent data — directly affecting user trust and core workflows.</div>

<div class="bug-card high">
  <div class="bug-header"><span class="bug-id high">BUG-04</span><span class="bug-title">Projects table renders empty despite data existing</span></div>
  <div class="bug-row"><span class="bug-label">URL</span><code>/projects</code></div>
  <div class="bug-row"><span class="bug-label">What happens</span>The summary stats at the top correctly show 5,088 hrs budget, 3,025 hrs logged this month, 91% billable, 2 at-risk projects — the data exists. But the table below shows 10 completely blank rows. No project names, no clients, nothing.</div>
  <div class="bug-row"><span class="bug-label">Evidence</span>My Spaces and Reports both correctly display project data (11 projects across 6 clients), confirming the data is in the system.</div>
  <div class="bug-row"><span class="bug-label">Expected</span>Table lists all 11 active projects with name, client, status, budget, billable hours, total burn, and created date.</div>
  <div class="ss-wrap"><img src="${ss.projects}" alt="Projects empty table"/><div class="ss-caption">Projects — stats show data exists but all table rows are blank</div></div>
</div>

<div class="bug-card high">
  <div class="bug-header"><span class="bug-id high">BUG-05</span><span class="bug-title">Clients table renders empty</span></div>
  <div class="bug-row"><span class="bug-label">URL</span><code>/clients</code></div>
  <div class="bug-row"><span class="bug-label">What happens</span>The table structure and headers (Client, Status, Type, Logged/Budget, Projects, Members, Labels, Next Billing) load correctly, but all rows are blank. 6 clients are clearly visible in My Spaces.</div>
  <div class="bug-row"><span class="bug-label">Expected</span>Active clients listed: Wild Brands, Hardy Party, Powergoat, Tooth and Nail, Koda Outdoors, Fieldview Co.</div>
  <div class="ss-wrap"><img src="${ss.clients}" alt="Clients empty table"/><div class="ss-caption">Clients — table structure loads but all rows are blank (20 empty rows)</div></div>
</div>

<div class="bug-card high">
  <div class="bug-header"><span class="bug-id high">BUG-06</span><span class="bug-title">LOE data inconsistency: same task shows different values on two pages</span></div>
  <div class="bug-row"><span class="bug-label">Task</span>"CLS audit + remediation" (PSA / Hardy Party)</div>
  <div class="bug-row"><span class="bug-label">My Tasks shows</span><code>0h / 6h</code> logged (0% burn)</div>
  <div class="bug-row"><span class="bug-label">My Spaces shows</span><code>8h / 6h</code> logged (over budget)</div>
  <div class="bug-row"><span class="bug-label">Impact</span>One view says 0h logged, another says 8h. For a LOE-tracking app this is the most critical type of data bug — users can't trust the numbers.</div>
</div>

<div class="bug-card high">
  <div class="bug-header"><span class="bug-id high">BUG-07</span><span class="bug-title">"At Risk" project count inconsistent across pages</span></div>
  <div class="bug-row"><span class="bug-label">Projects page</span>Shows AT RISK: <strong>2</strong> (Burn &gt; 85% or over budget)</div>
  <div class="bug-row"><span class="bug-label">Reports page</span>Shows AT-RISK PROJECTS: <strong>3</strong> (same definition)</div>
  <div class="bug-row"><span class="bug-label">Impact</span>Management-level dashboards show conflicting risk data from the same underlying dataset.</div>
</div>

<!-- MEDIUM -->
<h2 id="medium">🟡 Medium Severity Bugs</h2>

<div class="bug-card medium">
  <div class="bug-header"><span class="bug-id medium">BUG-08</span><span class="bug-title">Active timer running without an assigned task</span></div>
  <div class="bug-row"><span class="bug-label">Page</span>Worklogs</div>
  <div class="bug-row"><span class="bug-label">What happens</span>The "Active Timer" panel shows <code>01:34:47</code> counting up, but the hint text simultaneously says "Press Space to start · S to switch task" — contradictory state.</div>
  <div class="bug-row"><span class="bug-label">Expected</span>Either no timer shown (if nothing is running), or timer shown with the task name it is attributed to.</div>
  <div class="ss-wrap"><img src="${ss.worklogs}" alt="Worklogs timer"/><div class="ss-caption">Worklogs — timer shows 01:34:47 running but no task is assigned to it</div></div>
</div>

<div class="bug-card medium">
  <div class="bug-header"><span class="bug-id medium">BUG-09</span><span class="bug-title">Weekly progress shows 0h logged despite historical entries</span></div>
  <div class="bug-row"><span class="bug-label">Page</span>Worklogs</div>
  <div class="bug-row"><span class="bug-label">What happens</span>Header shows "Weekly goal 40h · logged 0h · remaining 40h · 0%" yet the calendar clearly displays past hours: Apr 23=8h, Apr 24=7h, Apr 25=6.5h, Apr 26=8.25h, Apr 27=4h, Apr 28=1.5h.</div>
  <div class="bug-row"><span class="bug-label">Expected</span>Weekly summary should reflect hours logged in the current week, or clearly label its date range.</div>
</div>

<div class="bug-card medium">
  <div class="bug-header"><span class="bug-id medium">BUG-10</span><span class="bug-title">Sidebar workspace name and avatar fail to load on some pages</span></div>
  <div class="bug-row"><span class="bug-label">Pages affected</span>My Tasks (confirmed), possibly others</div>
  <div class="bug-row"><span class="bug-label">What happens</span>The top-left sidebar area shows a grey loading skeleton instead of "Sarthak Rautela's workspace" + profile photo. It never resolves.</div>
  <div class="bug-row"><span class="bug-label">Expected</span>Consistent workspace info rendered on all pages.</div>
  <div class="ss-wrap"><img src="${ss.tasks}" alt="My Tasks skeleton"/><div class="ss-caption">My Tasks — workspace name and avatar remain as loading skeleton (top-left)</div></div>
</div>

<!-- UX -->
<h2 id="ux">🔵 UX / Copy Issues</h2>

<div class="bug-card low">
  <div class="bug-header"><span class="bug-id low">UX-01</span><span class="bug-title">"Upgrade to Pro" banner mentions "unlimited chatbots"</span></div>
  <div class="bug-row"><span class="bug-label">Location</span>Bottom of sidebar on every page</div>
  <div class="bug-row"><span class="bug-label">Issue</span>Copy reads: <em>"You're on the free plan. Unlock unlimited chatbots, advanced analytics, and more."</em> Trakio is a task/LOE tracking app — not a chatbot platform. This is leftover placeholder copy from a different product template.</div>
  <div class="bug-row"><span class="bug-label">Fix</span>Update to reflect actual Pro features e.g. <em>"Unlock unlimited projects, advanced reports, team roles, and priority support."</em></div>
</div>

<div class="bug-card low">
  <div class="bug-header"><span class="bug-id low">UX-02</span><span class="bug-title">Settings — Workspace name input not pre-filled</span></div>
  <div class="bug-row"><span class="bug-label">Page</span>Settings → General</div>
  <div class="bug-row"><span class="bug-label">Issue</span>The "Workspace name" input field is blank. The current name ("Sarthak Rautela's workspace") is not pre-populated, making it appear the data failed to load.</div>
  <div class="ss-wrap"><img src="${ss.settings}" alt="Settings"/><div class="ss-caption">Settings — Workspace name and domain fields are empty; logo area shows loading skeleton</div></div>
</div>

<div class="bug-card low">
  <div class="bug-header"><span class="bug-id low">UX-03</span><span class="bug-title">Settings — Workspace domain not pre-filled</span></div>
  <div class="bug-row"><span class="bug-label">Page</span>Settings → General</div>
  <div class="bug-row"><span class="bug-label">Issue</span>Domain field shows only placeholder <code>e.g., acme-team</code>. Current slug (<code>sarthak-rautelas-workspace</code>) is not shown.</div>
</div>

<div class="bug-card low">
  <div class="bug-header"><span class="bug-id low">UX-04</span><span class="bug-title">Settings — Workspace logo area stuck in loading skeleton</span></div>
  <div class="bug-row"><span class="bug-label">Page</span>Settings → General</div>
  <div class="bug-row"><span class="bug-label">Issue</span>The logo/avatar area at the top of the settings form renders as a grey placeholder box that never resolves.</div>
</div>

<div class="bug-card low">
  <div class="bug-header"><span class="bug-id low">UX-05</span><span class="bug-title">404 pages have no app layout — users are stranded</span></div>
  <div class="bug-row"><span class="bug-label">Affects</span>Dashboard, Invoices, LOE Approvals</div>
  <div class="bug-row"><span class="bug-label">Issue</span>The 404 is a bare Next.js default error page. No sidebar, no header, no "Go back" button. Users have to use the browser's Back button to recover.</div>
  <div class="bug-row"><span class="bug-label">Fix</span>Implement a custom 404 page that renders within the app layout with a back-to-home CTA.</div>
</div>

<div class="bug-card low">
  <div class="bug-header"><span class="bug-id low">UX-06</span><span class="bug-title">Reports — "Checkout Extensibility" shows +240h over budget with no prominent alert</span></div>
  <div class="bug-row"><span class="bug-label">Page</span>Reports</div>
  <div class="bug-row"><span class="bug-label">Issue</span>CE project shows 10h estimated / 250h actual (+240h, 0% accuracy). This severely over-budget project gets only a small orange accuracy badge. A project 25× over estimate warrants a more prominent visual warning.</div>
  <div class="ss-wrap"><img src="${ss.reports}" alt="Reports"/><div class="ss-caption">Reports — Checkout Extensibility at +240h over budget, 0% accuracy, with minimal visual callout</div></div>
</div>

<!-- WORKS WELL -->
<h2 id="works">✅ What Works Well</h2>
<ul class="works-list">
  <li><strong>My Tasks</strong> — Clean list with task name, project badge, status, priority, LOE progress bar (My LOE / Est), and due date. Tab filters (Open / Due This Week / LOE Pending / Billable / All) are a solid UX pattern.</li>
  <li><strong>Worklogs</strong> — Scrollable day-picker calendar with past entry hours, quick-add input bar, and keyboard shortcuts (N, Space, S, ← →) are excellent for power users.</li>
  <li><strong>My Spaces</strong> — Best page in the app. Clear Client → Project → Task hierarchy with LOE progress bars, assignee avatars, and status badges all rendering correctly.</li>
  <li><strong>Employee Worklogs</strong> — Team status view (Active / Light Day), daily hours, weekly LOE Est/Actual, and accuracy % per person is exactly what a manager needs.</li>
  <li><strong>Reports</strong> — KPI cards (Total Hours, Billable Ratio, LOE Accuracy, At-Risk) are clear. Per-project breakdown with Estimated/Actual/Δ/Billable/Accuracy is very useful.</li>
  <li><strong>Settings</strong> — Comprehensive sub-navigation: General, Members &amp; Roles, Roles &amp; Permissions, Notifications, Integrations, Billing &amp; Usages, API &amp; Webhooks.</li>
  <li><strong>Overall design</strong> — Consistent typography, green brand color, status badge system (blue=In Progress, orange=Review, purple=LOE Pending), and sidebar layout. App feels polished where it works.</li>
  <li><strong>Auth flow</strong> — Passwordless magic link with Google OAuth fallback is a modern, secure pattern. Post-submit feedback ("Check your inbox") is clear.</li>
</ul>

<!-- PRIORITY TABLE -->
<h2 id="priority">Priority Fix Table</h2>
<table>
  <thead><tr><th>Priority</th><th>ID</th><th>Issue</th><th>Page</th></tr></thead>
  <tbody>
    <tr class="p0"><td><span class="p-tag p0">P0</span></td><td>BUG-01</td><td>Dashboard returns 404 (home page broken)</td><td>/dashboard</td></tr>
    <tr class="p0"><td><span class="p-tag p0">P0</span></td><td>BUG-03</td><td>LOE Approvals returns 404 (core feature missing)</td><td>/loe-approvals</td></tr>
    <tr class="p0"><td><span class="p-tag p0">P0</span></td><td>BUG-04</td><td>Projects table renders completely empty</td><td>/projects</td></tr>
    <tr class="p0"><td><span class="p-tag p0">P0</span></td><td>BUG-05</td><td>Clients table renders completely empty</td><td>/clients</td></tr>
    <tr><td><span class="p-tag p1">P1</span></td><td>BUG-02</td><td>Invoices returns 404</td><td>/invoices</td></tr>
    <tr><td><span class="p-tag p1">P1</span></td><td>BUG-06</td><td>LOE value mismatch: My Tasks vs My Spaces (0h vs 8h)</td><td>Multiple</td></tr>
    <tr><td><span class="p-tag p1">P1</span></td><td>BUG-07</td><td>At-risk project count differs: Reports (3) vs Projects (2)</td><td>Multiple</td></tr>
    <tr><td><span class="p-tag p2">P2</span></td><td>BUG-08</td><td>Timer running without an assigned task</td><td>/worklogs</td></tr>
    <tr><td><span class="p-tag p2">P2</span></td><td>BUG-09</td><td>Weekly logged hours shows 0h despite historical entries</td><td>/worklogs</td></tr>
    <tr><td><span class="p-tag p2">P2</span></td><td>BUG-10</td><td>Sidebar skeleton doesn't resolve on some pages</td><td>/tasks + others</td></tr>
    <tr><td><span class="p-tag p3">P3</span></td><td>UX-01</td><td>"Upgrade to Pro" copy mentions chatbots (wrong product)</td><td>All pages</td></tr>
    <tr><td><span class="p-tag p3">P3</span></td><td>UX-02/03/04</td><td>Settings inputs not pre-filled; logo skeleton stuck</td><td>/settings</td></tr>
    <tr><td><span class="p-tag p3">P3</span></td><td>UX-05</td><td>404 pages have no app layout or back navigation</td><td>3 pages</td></tr>
    <tr><td><span class="p-tag p3">P3</span></td><td>UX-06</td><td>Severely over-budget project lacks prominent visual alert</td><td>/reports</td></tr>
  </tbody>
</table>

<!-- ALL SCREENSHOTS -->
<h2 id="screenshots">All Page Screenshots</h2>

<h3>Login Page</h3>
<div class="ss-wrap"><img src="${ss.login}" alt="Login"/><div class="ss-caption">Login — Passwordless magic link + Google OAuth. Clean, well-branded.</div></div>

<h3>My Tasks</h3>
<div class="ss-wrap"><img src="${ss.tasks}" alt="My Tasks"/><div class="ss-caption">My Tasks — 10 open tasks with LOE bars, status badges, priority, and due dates.</div></div>

<h3>Worklogs</h3>
<div class="ss-wrap"><img src="${ss.worklogs}" alt="Worklogs"/><div class="ss-caption">Worklogs — Day picker, time entry, active timer panel, recent tasks, keyboard shortcuts.</div></div>

<h3>My Spaces</h3>
<div class="ss-wrap"><img src="${ss.spaces}" alt="My Spaces"/><div class="ss-caption">My Spaces — Best page: Client → Project → Task hierarchy with LOE progress and assignees.</div></div>

<h3>Projects (empty table bug)</h3>
<div class="ss-wrap"><img src="${ss.projects}" alt="Projects"/><div class="ss-caption">Projects — Stats load correctly but all table rows are blank. BUG-04.</div></div>

<h3>Clients (empty table bug)</h3>
<div class="ss-wrap"><img src="${ss.clients}" alt="Clients"/><div class="ss-caption">Clients — Table headers render but all rows are blank. BUG-05.</div></div>

<h3>Employee Worklogs</h3>
<div class="ss-wrap"><img src="${ss.emplog}" alt="Employee Worklogs"/><div class="ss-caption">Employee Worklogs — 8 members, per-day hours, weekly LOE Est/Actual, accuracy %.</div></div>

<h3>Reports</h3>
<div class="ss-wrap"><img src="${ss.reports}" alt="Reports"/><div class="ss-caption">Reports — KPI summary + per-project breakdown with LOE accuracy and billable split.</div></div>

<h3>Settings</h3>
<div class="ss-wrap"><img src="${ss.settings}" alt="Settings"/><div class="ss-caption">Settings — Workspace name and domain not pre-filled; logo area stuck as skeleton. UX-02/03/04.</div></div>

<div class="footer">
  Trakio QA Report · Generated May 4, 2026 · Playwright Chrome Desktop · trakio.brillmark.com
</div>

</div>
</body>
</html>`;

fs.writeFileSync(OUTPUT, html, 'utf8');
const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
console.log(`Report generated: ${OUTPUT}`);
console.log(`File size: ${sizeKB} KB`);

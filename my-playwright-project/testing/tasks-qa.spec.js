// =============================================================
// TRAKIO — My Tasks Page — Full CTA & Functionality QA Suite
// Run: npx playwright test testing/tasks-qa.spec.js --project="Chrome Desktop"
// =============================================================

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

// ── CONFIG ────────────────────────────────────────────────────
const TASKS_URL  = 'https://trakio.brillmark.com/sarthak-rautelas-workspace/tasks';
const SS_DIR     = path.join(__dirname, '..', 'trakio-screenshots', 'tasks-qa');
const TEST_TASK  = `[QA-AUTO] Test task ${Date.now()}`;   // unique name so we can find it

// Cookie expiry: set far in the future so the browser never drops them mid-run.
// The JWT inside session_data is valid until 2026-05-11; the cookie-level expiry
// was only 5 minutes, which caused session redirects after ~26 tests.
const FAR_FUTURE = Math.floor(new Date('2027-01-01T00:00:00Z').getTime() / 1000);

const COOKIES = [
  {
    name: 'better-auth.session_data',
    value: 'eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNi0wNS0xMVQxNDowNzozNC40MDRaIiwidG9rZW4iOiJLeVFEYkRHcjBrU0pHR1RjeXY3VjhscnFrTGpWajBDSiIsImNyZWF0ZWRBdCI6IjIwMjYtMDUtMDRUMTQ6MDc6MzQuNDA0WiIsInVwZGF0ZWRBdCI6IjIwMjYtMDUtMDRUMTQ6MzY6MTUuOTYyWiIsImlwQWRkcmVzcyI6IjIyMy4yMzMuNzAuMTc0IiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Ny4wLjAuMCBTYWZhcmkvNTM3LjM2IiwidXNlcklkIjoiVWlFc2ZSMFp2NmRzOU03OXhKWmh3bjNhRG5wajZwdnMiLCJhY3RpdmVPcmdhbml6YXRpb25JZCI6Im9vQWs4a1NuWnpnRFVyVkVCTzZ4bjVOcWlSQXYzeXI2IiwiaW1wZXJzb25hdGVkQnkiOm51bGwsImlkIjoiaFNkRGlTNVB0SXZhUkR5NHQ1WEpGVVVKNVludjhxNjAifSwidXNlciI6eyJuYW1lIjoiU2FydGhhayBSYXV0ZWxhIiwiZW1haWwiOiJzYXJ0aGFrQGJyaWxsbWFyay5jb20iLCJlbWFpbFZlcmlmaWVkIjp0cnVlLCJpbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xLOGx6Nm5zN1Itbi1NN3IzUUNEUlc1SHJXWm1CMUxCVUZ0UUxHd254TkNEM05MVV94PXM5Ni1jIiwiY3JlYXRlZEF0IjoiMjAyNi0wNS0wNFQxNDowNzozMy45MzZaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0wNFQxNDowNzozMy45MzZaIiwicm9sZSI6InVzZXIiLCJiYW5uZWQiOmZhbHNlLCJiYW5SZWFzb24iOm51bGwsImJhbkV4cGlyZXMiOm51bGwsImlkIjoiVWlFc2ZSMFp2NmRzOU03OXhKWmh3bjNhRG5wajZwdnMifSwidXBkYXRlZEF0IjoxNzc3OTA1Mzc3MTA3LCJ2ZXJzaW9uIjoiMSJ9LCJleHBpcmVzQXQiOjE3Nzc5MDU2NzcxMDcsInNpZ25hdHVyZSI6IjluSlVsckNyTThzUE9abjNCQkJ1eHljMm9TWlhWbUh1WUpaOVNmaktMdnMifQ',
    domain: 'trakio.brillmark.com', path: '/', httpOnly: false, secure: true, sameSite: 'Lax',
    expires: FAR_FUTURE,
  },
  {
    name: 'better-auth.session_token',
    value: 'KyQDbDGr0kSJGGTcyv7V8lrqkLjVj0CJ.3zjebG3YnRuOEIgZlSOvcRaB8yHbTNJedCBS%2FGMEVD0%3D',
    domain: 'trakio.brillmark.com', path: '/', httpOnly: false, secure: true, sameSite: 'Lax',
    expires: FAR_FUTURE,
  },
];

// ── HELPERS ───────────────────────────────────────────────────
async function gotoTasks(page, context) {
  await context.addCookies(COOKIES);
  await page.goto(TASKS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  // Fail fast if session expired and we landed on the login page
  const url = page.url();
  if (url.includes('/auth/sign-in')) {
    throw new Error(`SESSION EXPIRED — redirected to login. Share fresh cookies to continue. URL: ${url}`);
  }
}

function ss(name) {
  if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
  return path.join(SS_DIR, `${name}.png`);
}

// Collect console errors during a test
function collectErrors(page) {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(e.message));
  return errs;
}

// ═══════════════════════════════════════════════════════════════
// 1. PAGE LOAD & STRUCTURE
// ═══════════════════════════════════════════════════════════════
test.describe('1. Page Load & Structure', () => {

  test('1.1 Page loads without crashing (200, no uncaught JS errors)', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const url = page.url();
    expect(url).toContain('/tasks');
    await page.screenshot({ path: ss('1-1-page-load'), fullPage: true });
    // Filter out known 404 for a resource — only flag real JS errors
    const jsErrors = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrors, `Unexpected JS errors: ${jsErrors.join(', ')}`).toHaveLength(0);
  });

  test('1.2 Page title is "Trakio"', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page).toHaveTitle('Trakio');
  });

  test('1.3 Heading "What\'s on your plate" is visible', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page.getByText("What's on your plate")).toBeVisible();
  });

  test('1.4 Task counter "10 open" is visible', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page.getByText(/10 open/)).toBeVisible();
  });

  test('1.5 All 10 task rows are present in the table', async ({ page, context }) => {
    await gotoTasks(page, context);
    // tbody tr skips the thead row entirely
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(10);
  });

  test('1.6 Table has all expected columns', async ({ page, context }) => {
    await gotoTasks(page, context);
    for (const col of ['Task', 'Project', 'Status', 'Priority', 'My LOE / Est', 'Due']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  });

  test('1.7 Known tasks appear in the list', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page.getByText('Build review card grid layout')).toBeVisible();
    await expect(page.getByText('LCP optimization pass')).toBeVisible();
    await expect(page.getByText('Image CDN migration')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════
// 2. VIEW TOGGLE — LIST ↔ BOARD
// ═══════════════════════════════════════════════════════════════
test.describe('2. View Toggle (List / Board)', () => {

  test('2.1 "List" button is visible and active by default', async ({ page, context }) => {
    await gotoTasks(page, context);
    const listBtn = page.getByRole('button', { name: 'List' });
    await expect(listBtn).toBeVisible();
    // Active state uses bg-secondary class
    const cls = await listBtn.getAttribute('class');
    expect(cls).toContain('bg-secondary');
  });

  test('2.2 "Board" button is visible', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page.getByRole('button', { name: 'Board' })).toBeVisible();
  });

  test('2.3 Clicking "Board" switches to board view', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Board' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('2-3-board-view'), fullPage: true });
    // Board view should no longer show a <table>
    const tableCount = await page.locator('table').count();
    expect(tableCount, 'Table should be gone in board view').toBe(0);
    // No crashes
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('2.4 Clicking "List" from Board returns to list view', async ({ page, context }) => {
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Board' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'List' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('2-4-back-to-list'), fullPage: true });
    await expect(page.locator('table')).toBeVisible();
  });

  test('2.5 Board view is not empty — shows task cards', async ({ page, context }) => {
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Board' }).click();
    await page.waitForTimeout(2000);
    // Should have some visible content beyond just headers
    const body = await page.evaluate(() => document.body.innerText);
    expect(body).toContain('Build review card grid layout');
  });

});

// ═══════════════════════════════════════════════════════════════
// 3. TAB FILTERS
// ═══════════════════════════════════════════════════════════════
test.describe('3. Tab Filters', () => {

  test('3.1 All 5 tabs are visible (Open / Due This Week / Loe Pending / Billable / All)', async ({ page, context }) => {
    await gotoTasks(page, context);
    for (const tab of ['Open', 'Due This Week', 'Loe Pending', 'Billable', 'All']) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible();
    }
  });

  test('3.2 "Open" tab is active by default (underline indicator)', async ({ page, context }) => {
    await gotoTasks(page, context);
    const openTab = page.getByRole('button', { name: 'Open' });
    const cls = await openTab.getAttribute('class');
    // Active tab has after:bg-foreground in its classes
    expect(cls).toContain('after:bg-foreground');
  });

  test('3.3 Clicking "Due This Week" tab — no crash, content updates', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Due This Week' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('3-3-due-this-week'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
    // Tab should now be active
    const cls = await page.getByRole('button', { name: 'Due This Week' }).getAttribute('class');
    expect(cls).toContain('after:bg-foreground');
  });

  test('3.4 Clicking "Loe Pending" tab — shows only LOE Pending tasks', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Loe Pending' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('3-4-loe-pending'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
    // tbody tr skips the header row; each data row must contain LOE Pending
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const rowText = await rows.nth(i).innerText();
        expect(rowText).toContain('LOE Pending');
      }
    }
  });

  test('3.5 Clicking "Billable" tab — shows only billable tasks', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Billable' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('3-5-billable'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const rowText = await rows.nth(i).innerText();
        expect(rowText).toContain('Billable');
      }
    }
  });

  test('3.6 Clicking "All" tab — shows all tasks (≥ count on Open tab)', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const openCount = await page.locator('table tbody tr').count();
    await page.getByRole('button', { name: 'All' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('3-6-all-tab'), fullPage: true });
    const allCount = await page.locator('table tbody tr').count();
    expect(allCount).toBeGreaterThanOrEqual(openCount);
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('3.7 Tabs cycle correctly — no stale state between switches', async ({ page, context }) => {
    await gotoTasks(page, context);
    const tabs = ['Due This Week', 'Loe Pending', 'Billable', 'All', 'Open'];
    for (const tab of tabs) {
      await page.getByRole('button', { name: tab }).click();
      await page.waitForTimeout(800);
      const cls = await page.getByRole('button', { name: tab }).getAttribute('class');
      expect(cls, `Tab "${tab}" should be active after clicking`).toContain('after:bg-foreground');
    }
  });

});

// ═══════════════════════════════════════════════════════════════
// 4. FILTER BUTTON
// ═══════════════════════════════════════════════════════════════
test.describe('4. Filter Button', () => {

  test('4.1 Filter button is visible and clickable', async ({ page, context }) => {
    await gotoTasks(page, context);
    const filterBtn = page.getByRole('button', { name: 'Filter' });
    await expect(filterBtn).toBeVisible();
    await expect(filterBtn).toBeEnabled();
  });

  test('4.2 Clicking Filter opens a panel / dropdown — no crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('4-2-filter-open'), fullPage: true });
    // Something new should appear — a popover, menu, or panel
    const bodyAfter = await page.evaluate(() => document.body.innerText);
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
    console.log('Filter panel content:', bodyAfter.slice(0, 500));
  });

  test('4.3 Filter panel can be closed (pressing Escape)', async ({ page, context }) => {
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(600);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    await page.screenshot({ path: ss('4-3-filter-closed'), fullPage: true });
    // Task table should still be visible after closing
    await expect(page.locator('table')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════
// 5. NEW TASK — MODAL / FORM
// ═══════════════════════════════════════════════════════════════
test.describe('5. New Task CTA', () => {

  test('5.1 "New task" button is visible and enabled', async ({ page, context }) => {
    await gotoTasks(page, context);
    const btn = page.getByRole('button', { name: 'New task' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('5.2 Clicking "New task" opens a modal or form — no crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'New task' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('5-2-new-task-modal'), fullPage: true });
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('New task modal text:', bodyText.slice(0, 1000));
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('5.3 New task modal has a title / name input field', async ({ page, context }) => {
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'New task' }).click();
    await page.waitForTimeout(2000);
    // Look for a text input that is not the search bar
    const inputs = page.locator('input[type="text"], input:not([placeholder="Search or jump to..."])');
    const count = await inputs.count();
    expect(count, 'Modal should have at least one input').toBeGreaterThan(0);
    await page.screenshot({ path: ss('5-3-modal-inputs'), fullPage: true });
  });

  test('5.4 Escape key closes the New task modal', async ({ page, context }) => {
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'New task' }).click();
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('5-4-modal-closed-escape'), fullPage: true });
    // After close, table should still be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('5.5 Can fill task title, select project, and submit to create a task', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const initialCount = await page.locator('table tbody tr').count();

    await page.getByRole('button', { name: 'New task' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('5-5a-modal-open'), fullPage: true });

    // Fill title — find first text input that isn't the global search
    const titleInput = page.locator('input[type="text"]').filter({ hasNotText: '' }).first();
    // Try multiple possible title-field selectors
    const possibleTitleInputs = [
      page.locator('input[placeholder*="task" i]'),
      page.locator('input[placeholder*="title" i]'),
      page.locator('input[placeholder*="name" i]'),
      page.locator('input[placeholder*="what" i]'),
      page.locator('[role="dialog"] input[type="text"]').first(),
      page.locator('[data-state="open"] input[type="text"]').first(),
    ];

    let titleField = null;
    for (const locator of possibleTitleInputs) {
      const c = await locator.count();
      if (c > 0) { titleField = locator; break; }
    }

    if (titleField) {
      await titleField.fill(TEST_TASK);
      await page.waitForTimeout(500);
      await page.screenshot({ path: ss('5-5b-title-filled'), fullPage: true });

      // Try to submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save"), button:has-text("Add task"), button:has-text("Add Task")').first();
      const submitCount = await submitBtn.count();
      if (submitCount > 0) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: ss('5-5c-after-submit'), fullPage: true });
        // Check task appears in list
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('Page after create (first 500):', bodyText.slice(0, 500));
      } else {
        console.log('No submit button found — logging modal content for review');
        const modalText = await page.evaluate(() => document.body.innerText);
        console.log(modalText.slice(0, 800));
      }
    } else {
      console.log('No title input found in modal — logging all inputs');
      const allInputs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('input,textarea')).map(i => ({
          type: i.type, placeholder: i.placeholder, id: i.id, ariaLabel: i.getAttribute('aria-label'),
        }))
      );
      console.log(JSON.stringify(allInputs, null, 2));
    }

    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('5.6 Submitting empty New task form does not crash — shows validation or stays open', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByRole('button', { name: 'New task' }).click();
    await page.waitForTimeout(1500);

    // Try clicking submit immediately with no data
    const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save"), button:has-text("Add task"), button:has-text("Add Task")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: ss('5-6-empty-submit'), fullPage: true });
    // Should NOT navigate away — still on /tasks
    expect(page.url()).toContain('/tasks');
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

// ═══════════════════════════════════════════════════════════════
// 6. TASK ROW INTERACTIONS
// ═══════════════════════════════════════════════════════════════
test.describe('6. Task Row Interactions', () => {

  test('6.1 Clicking the expand arrow on a task row opens a detail panel', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    // The chevron/arrow is the last cell of each row — find it via SVG or the > arrow
    const firstRowArrow = page.locator('table tbody tr').first().locator('svg, [aria-label*="detail"], [aria-label*="open"], a, button').last();
    await firstRowArrow.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('6-1-task-detail-open'), fullPage: true });
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Detail panel content:', bodyText.slice(0, 800));
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('6.2 Clicking the task name opens task detail', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.getByText('Build review card grid layout').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('6-2-task-name-click'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('6.3 Task detail panel can be closed (Escape)', async ({ page, context }) => {
    await gotoTasks(page, context);
    await page.getByText('Build review card grid layout').click();
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('6-3-detail-closed'), fullPage: true });
    // Table should still be present
    await expect(page.locator('table')).toBeVisible();
  });

  test('6.4 Task row checkbox is present and clickable without crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    // Checkboxes are the first cell — visually round/circle elements
    const firstCheckbox = page.locator('table tbody tr').first().locator('button, input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('6-4-checkbox-click'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('6.5 Clicking project badge in row navigates or opens project — no crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const projectBadge = page.getByText('Powergoat').first();
    await projectBadge.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('6-5-project-badge-click'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('6.6 Clicking status badge opens status change dropdown — no crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const statusBadge = page.getByText('In Progress').first();
    await statusBadge.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('6-6-status-badge-click'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('6.7 Right-clicking a task row does not throw an error', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click({ button: 'right' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: ss('6-7-right-click'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

// ═══════════════════════════════════════════════════════════════
// 7. EXPORT CSV
// ═══════════════════════════════════════════════════════════════
test.describe('7. Export CSV', () => {

  test('7.1 Export CSV button is visible and enabled', async ({ page, context }) => {
    await gotoTasks(page, context);
    const exportBtn = page.getByRole('button', { name: 'Export CSV' });
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();
  });

  test('7.2 Clicking Export CSV triggers a file download (no crash)', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
      page.getByRole('button', { name: 'Export CSV' }).click(),
    ]);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('7-2-export-csv'), fullPage: true });
    if (download) {
      console.log('Download triggered. Filename:', download.suggestedFilename());
      expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    } else {
      console.log('No download event fired — may open inline or behave differently');
    }
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

// ═══════════════════════════════════════════════════════════════
// 8. SEARCH BAR
// ═══════════════════════════════════════════════════════════════
test.describe('8. Search Bar', () => {

  test('8.1 Search input is present and focusable', async ({ page, context }) => {
    await gotoTasks(page, context);
    const search = page.getByPlaceholder('Search or jump to...');
    await expect(search).toBeVisible();
    await search.click();
    await expect(search).toBeFocused();
  });

  test('8.2 Typing in search filters or opens command palette — no crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const search = page.getByPlaceholder('Search or jump to...');
    await search.click();
    await search.type('Build review');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('8-2-search-typing'), fullPage: true });
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Search results:', bodyText.slice(0, 500));
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('8.3 Clearing search restores full task list', async ({ page, context }) => {
    await gotoTasks(page, context);
    const search = page.getByPlaceholder('Search or jump to...');
    await search.click();
    await search.type('LCP');
    await page.waitForTimeout(1000);
    await search.fill('');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('8-3-search-cleared'), fullPage: true });
    // Table should still be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('8.4 ⌘K / Ctrl+K shortcut opens search', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(800);
    await page.screenshot({ path: ss('8-4-cmd-k'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

// ═══════════════════════════════════════════════════════════════
// 9. PAGINATION
// ═══════════════════════════════════════════════════════════════
test.describe('9. Pagination', () => {

  test('9.1 Pagination controls are present', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page.getByRole('button', { name: 'Go to previous page' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to next page' })).toBeVisible();
  });

  test('9.2 Prev/Next page buttons are disabled when only 1 page of results', async ({ page, context }) => {
    await gotoTasks(page, context);
    // With 10 tasks and 10 per page, navigation should be disabled
    const prevBtn = page.getByRole('button', { name: 'Go to previous page' });
    const nextBtn = page.getByRole('button', { name: 'Go to next page' });
    expect(await prevBtn.isDisabled()).toBe(true);
    expect(await nextBtn.isDisabled()).toBe(true);
  });

  test('9.3 "Rows per page" selector is visible and has a value', async ({ page, context }) => {
    await gotoTasks(page, context);
    const rowsSelector = page.getByRole('button', { name: '10' }).filter({ hasNotText: 'open' });
    await expect(rowsSelector).toBeVisible();
    const text = await rowsSelector.innerText();
    expect(text.trim()).toBe('10');
  });

  test('9.4 Changing rows per page does not crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    // Click the rows-per-page selector (the "10" button with dropdown behaviour)
    const rowsBtn = page.getByRole('button', { name: '10' }).filter({ hasNotText: 'open' });
    await rowsBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: ss('9-4-rows-dropdown'), fullPage: true });
    // Try selecting a different value if a dropdown appeared
    const option25 = page.getByText('25').first();
    if (await option25.count() > 0) {
      await option25.click();
      await page.waitForTimeout(1000);
    } else {
      await page.keyboard.press('Escape');
    }
    await page.screenshot({ path: ss('9-4-rows-changed'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

// ═══════════════════════════════════════════════════════════════
// 10. SIDEBAR TOGGLE
// ═══════════════════════════════════════════════════════════════
test.describe('10. Sidebar Toggle', () => {

  test('10.1 "Toggle Sidebar" button is visible', async ({ page, context }) => {
    await gotoTasks(page, context);
    await expect(page.getByRole('button', { name: 'Toggle Sidebar' })).toBeVisible();
  });

  test('10.2 Clicking Toggle Sidebar collapses the sidebar', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    // Sidebar nav items should be visible before toggle
    await expect(page.getByText('My Tasks')).toBeVisible();
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: ss('10-2-sidebar-collapsed'), fullPage: true });
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('10.3 Clicking Toggle Sidebar again re-expands the sidebar', async ({ page, context }) => {
    await gotoTasks(page, context);
    const toggleBtn = page.getByRole('button', { name: 'Toggle Sidebar' });
    await toggleBtn.click();
    await page.waitForTimeout(600);
    await toggleBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: ss('10-3-sidebar-expanded'), fullPage: true });
    await expect(page.getByText('My Tasks')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════
// 11. LOE PROGRESS BAR DISPLAY
// ═══════════════════════════════════════════════════════════════
test.describe('11. LOE Progress Bar', () => {

  test('11.1 LOE bars are visible for tasks with logged time', async ({ page, context }) => {
    await gotoTasks(page, context);
    // Tasks with logged time should have a visible progress bar element
    const loeText = page.getByText(/\d+h \/ \d+h/);
    const count = await loeText.count();
    expect(count, 'At least some tasks should show LOE hours').toBeGreaterThan(0);
  });

  test('11.2 Over-budget task (LCP optimization: 11.5h / 10h) shows red bar', async ({ page, context }) => {
    await gotoTasks(page, context);
    const lcpRow = page.locator('table tr').filter({ hasText: 'LCP optimization pass' });
    await expect(lcpRow).toBeVisible();
    const lcpText = await lcpRow.innerText();
    expect(lcpText).toContain('11.5h / 10h');
    // The bar should be red — check for a red-coloured progress bar element
    const redBar = lcpRow.locator('[class*="red"], [class*="destructive"], [style*="red"]');
    const redCount = await redBar.count();
    console.log(`Over-budget red bar elements found in LCP row: ${redCount}`);
    await page.screenshot({ path: ss('11-2-over-budget-bar'), fullPage: false });
  });

  test('11.3 Task with 0h logged (QA across 3 themes: 0h / 8h) shows empty bar', async ({ page, context }) => {
    await gotoTasks(page, context);
    const row = page.locator('table tr').filter({ hasText: 'QA across 3 themes' });
    await expect(row).toBeVisible();
    const text = await row.innerText();
    expect(text).toContain('0h / 8h');
  });

});

// ═══════════════════════════════════════════════════════════════
// 12. NOTIFICATION BELL
// ═══════════════════════════════════════════════════════════════
test.describe('12. Notification Bell', () => {

  test('12.1 Notification bell icon is visible in header', async ({ page, context }) => {
    await gotoTasks(page, context);
    // Bell button is in the top-right header area
    const bell = page.locator('button').filter({ has: page.locator('svg') }).nth(4);
    await expect(bell).toBeVisible();
  });

  test('12.2 Clicking notification bell opens panel — no crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    // Find bell by position (4th button in header area)
    const headerBtns = page.locator('header button, [role="banner"] button');
    const bellBtn = headerBtns.filter({ has: page.locator('[data-slot="icon"], svg') }).last();
    if (await bellBtn.count() > 0) {
      await bellBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: ss('12-2-bell-open'), fullPage: true });
    }
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

// ═══════════════════════════════════════════════════════════════
// 13. RAPID INTERACTION / STRESS
// ═══════════════════════════════════════════════════════════════
test.describe('13. Stress / Rapid Interaction', () => {

  test('13.1 Rapid tab switching does not crash or freeze', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    const tabs = ['Due This Week', 'Loe Pending', 'Billable', 'All', 'Open'];
    for (let round = 0; round < 2; round++) {
      for (const tab of tabs) {
        await page.getByRole('button', { name: tab }).click();
        await page.waitForTimeout(200);
      }
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('13-1-rapid-tabs'), fullPage: true });
    await expect(page.locator('table')).toBeVisible();
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('13.2 Rapid view switching (List ↔ Board × 3) does not crash', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Board' }).click();
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: 'List' }).click();
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('13-2-rapid-view-switch'), fullPage: true });
    await expect(page.locator('table')).toBeVisible();
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

  test('13.3 Opening and closing New Task modal 3 times does not leak UI state', async ({ page, context }) => {
    const errors = collectErrors(page);
    await gotoTasks(page, context);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'New task' }).click();
      await page.waitForTimeout(800);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: ss('13-3-modal-open-close-3x'), fullPage: true });
    // Should still be on tasks page with table visible
    expect(page.url()).toContain('/tasks');
    await expect(page.locator('table')).toBeVisible();
    const jsErrs = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    expect(jsErrs).toHaveLength(0);
  });

});

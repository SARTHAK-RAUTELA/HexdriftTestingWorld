# WinkBeds — Client Notes (cross-test quirks)

**Client:** WinkBeds
**Site:** winkbeds.com (shop-winkbed Buy Box page)
**A/B platform:** Convert.com (preview via `?convert_action=convert_vpreview&convert_e=<id>&convert_v=<id>`)
**Tests done:** [cre-t-253 — Buy Box sub-total line](cre-t-253-buybox-subtotal.md)

## Environment / site quirks (apply to every winkbeds.com test)

- **Playwright automation needs a `navigator.webdriver` override.** The Buy Box (`#orderForm`) does not render
  under vanilla Playwright, headless or headed — the site withholds it when `navigator.webdriver` reads `true`
  (Playwright/CDP's default). Fix: add this at the top of `gotoAndWaitReady()`/equivalent, before `page.goto()`:
  ```js
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  ```
  This is legitimate first-party QA of our own variation script, not third-party evasion. With this in place the
  full 6-browser Playwright matrix runs normally — see `winkbeds/cre-t-253-buybox-subtotal.md` for the working
  spec. Also use `waitUntil: 'domcontentloaded'` (not the default `'load'`) on `page.goto()` — the page is heavy
  enough (1.6-1.8MB DOM) that the `load` event can exceed a 45s timeout.
- **Intermittent popups intercept pointer events on Buy Box buttons.** A "try before you buy" retention overlay
  (button text "OK, GOT IT") and a third coexisting CRO test's timed modal (`cre-wb-test-28-popup`) can both pop
  up unpredictably and block Playwright's normal actionability-checked `.click()`. Fix: use a raw DOM click —
  `page.evaluate((sel) => document.querySelector(sel).click(), selector)` — which bypasses occlusion checks
  entirely. Also needed for WebKit specifically: `scrollIntoViewIfNeeded()` can loop indefinitely on "element is
  not stable" (the page has continuous micro re-layout after first render) — use
  `page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({block:'center'}), selector)` instead.
- **Prefer polling assertions (`expect(...).toHaveText(...)`) over fixed `waitForTimeout()` after any Buy Box
  interaction.** The variation re-renders on a 300ms interval, but a fixed wait (even 500-700ms) can still race
  it under load — seen as flaky failures on whichever browser happened to be slowest that run, not a real bug.
- **Convert.com preview cookie persists across navigation.** Visiting the `convert_vpreview` URL once sets a
  session cookie that keeps activating the live experiment class/variation on subsequent page loads in that same
  browser session — even a fresh `page.goto()` with no query params will show the variation active. Don't assume
  a plain reload gives you "control" once you've hit a preview link in that browser session.
- **Coexisting tests share the Buy Box:** at time of testing, `cre-t-202` (a mattress price box variant) was live
  alongside `cre-t-253`. Body class list included both. CSS must account for coexistence (see the `.cre-t-202.cre-t-253`
  compound selector in `cre-t-253`'s CSS for an `order` override).
- **Mattress Setup/Removal is a 3-tier modal**, not a simple toggle: "Mattress Setup & Removal" (combo), "Mattress
  Setup" only, "Mattress Removal" only — each independently addable/removable, plus optional +$50/+$25 add-on
  checkboxes inside the modal. The collapsed summary badge (`.order-form__loadup-button-price`) reflects whichever
  tier is selected, but **does not update when an add-on checkbox inside the modal is checked** — see BUG-01 in
  the cre-t-253 test file.

## Test files

| Test | File |
|------|------|
| cre-t-253 — Buy Box sub-total line | [cre-t-253-buybox-subtotal.md](cre-t-253-buybox-subtotal.md) |

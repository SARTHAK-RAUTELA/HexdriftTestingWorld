# AFP — Client Notes (cross-test quirks)

**Client:** AFP (Association for Financial Professionals)
**Sites:** `www.financialprofessionals.org` + `conference.financialprofessionals.org`
**A/B platform:** VWO (`window.VWO` events)
**Tests done:** AFP08, AFP09, AFP10, AFP13, AFP15, AFP18, AFP19 (variation classes `cre-t-8` … `cre-t-19`)

## Environment / site quirks (apply to every AFP test)

- **Mock HTML must include BOTH header navs:** `#global-login` (guests) and `#global-logout` (logged-in). Variations loop over both; missing one hides injection bugs (see AFP10 TC-15/16 count=2 issue).
- **Firefox CSP blocks `addStyleTag`** on the live URLs — always wrap in try/catch and fall back to `page.evaluate()` creating a `<style>` element manually.
- **Use `page.addInitScript({ content: JS })`, not `page.evaluate()`** — matches how VWO injects before DOM parse (AFP13 pattern).
- **Edge requires `channel: 'msedge'`** in the Playwright project config.
- **Desktop-only variations are the norm** — breakpoints seen: 1024px (modals AFP08/09), 1199/1200px (nav button AFP10). Always test the exact breakpoint edge.
- **Timed modals persist timer in `sessionStorage.startTime`** across same-domain navigation. AFP08 = 15s + `sessionStorage.modalTriggered` guard; AFP09 = 30s + exit intent + `exit_popup_dismissed` **cookie** guard (clear with `max-age=0` between tests).
- **Blur targets differ per test:** AFP08 blurs `.mm-page`; AFP09 blurs `#site-header` + `#site-main`. Check the variation code, don't assume.
- **Nav uses `[type="button"]` elements, not `<button>`** — dropdown clicks may need `scrollIntoViewIfNeeded()` + `click({ force: true })` + JS-dispatch fallback (AFP15).
- **`test.fail(true, reason)`** is the established way to document known Figma-vs-code bugs while keeping `describe.serial` suites running (AFP15 BUG-01/02).

## Known content risk

Copy is frequently carried over from earlier AFP tests (AFP05 → AFP10 stale button text). **Always diff variation copy against the current Figma, never against previous code.**

## Test files

| Test | File |
|------|------|
| AFP08 — 15s timed modal | [afp08-timed-modal.md](afp08-timed-modal.md) |
| AFP09 — 30s timed modal + exit intent | [afp09-timed-modal-exit-intent.md](afp09-timed-modal-exit-intent.md) |
| AFP10 — Nav CTA button | [afp10-nav-cta-button.md](afp10-nav-cta-button.md) |
| AFP13 — Register & Save button | [afp13-register-save-button.md](afp13-register-save-button.md) |
| AFP15 — Events nav dropdown | [afp15-events-nav.md](afp15-events-nav.md) |
| AFP18 — Download summary nav link | [afp18-download-summary-link.md](afp18-download-summary-link.md) |
| AFP19 — Compensation survey hero | [afp19-compensation-survey-hero.md](afp19-compensation-survey-hero.md) |
| AFP21 — Join AFP membership page redesign | [afp21-membership-page-redesign.md](afp21-membership-page-redesign.md) |

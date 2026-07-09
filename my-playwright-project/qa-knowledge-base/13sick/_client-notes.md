# 13sick / DoctorDoctor — Client Notes (cross-test quirks)

**Client:** 13SICK (National Home Doctor) / DoctorDoctor
**Sites:** `app.13sick.com.au` (production booking flow) + `stg-patient.doctordoctor.com.au` (staging)
**A/B platform:** Convert.com (`?_conv_eforce=<experiment>.<variation>` force URLs, `window._conv_q` goals)
**Tests done:** SIC-19, SIC-21, SIC-24, SIC-27

## Environment / site quirks (apply to every 13sick test)

- **WAF rate-limiting:** run with `workers: 1` (sequential) — parallel workers get blocked. This is why the repo's `playwright.config.js` uses `workers: 1`.
- **Staging app runs inside `iframe#mobile-viewport`** (doctordoctor staging) — scope all selectors through `page.frameLocator('iframe#mobile-viewport')`, or `iframeEl.contentFrame()` for direct DOM work.
- **DOB field is a MUI DatePicker** (`#secondaryUserName`): `.fill()` does NOT work. Use `.type('20041969', { delay: 50 })` — no slashes, the picker inserts them.
- **Confirm dialogs are MUI modals:** scope buttons via `[aria-modal="true"] button` to avoid clicking hidden duplicates still in the DOM.
- **Staging test credentials:** mobile `0499999999`, DOB `20/04/1969`, OTP `12312` (fill across `input[inputmode="numeric"]`).
- **Multi-step funnel:** write a diagnostic single-test spec first to map steps/selectors (SIC-24 pattern), give the runner a long timeout (300s), and build a `reachStepX()` helper that detects the current step by body text and progresses.
- **Booking flow step targeting:** step pages are identified by `body[data-telehealth="step_N_Name"]` attributes (e.g. `step_4_Verify`).
- **Red error color check:** assert computed style `rgb(234, 72, 72)`, not class presence alone — class can apply while CSS fails to load.

## Test files

| Test | File |
|------|------|
| SIC-19 — earlier A/B test (partial record) | [sic19-ab-test.md](sic19-ab-test.md) |
| SIC-21 — Step 4 form validation | [sic21-form-validation.md](sic21-form-validation.md) |
| SIC-24 — Queue page custom block (staging) | [sic24-queue-page.md](sic24-queue-page.md) |
| SIC-27 — Step 4 verify clinic field | [sic27-verify-clinic-field.md](sic27-verify-clinic-field.md) |

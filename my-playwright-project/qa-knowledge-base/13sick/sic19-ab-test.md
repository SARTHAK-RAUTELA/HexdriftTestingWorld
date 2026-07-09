<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 3) on 2026-07-09. -->

# SIC-19 — 13sick.com.au A/B Test

**Test file:** `my-playwright-project/testing/sic-19.spec.js` *(removed)*
**Reporter stub:** `my-playwright-project/sic-19-reporter.js` *(still exists — no-op stub)*
**Site:** `app.13sick.com.au`
**Test date:** Before May 2026

### What is known

The `sic-19-reporter.js` no-op reporter stub still exists in the repo, confirming a SIC-19 test suite was built and run. The spec file was deleted. Based on the SIC naming convention (SIC = 13Sick) this was an A/B test on a different step of the 13sick telehealth booking flow.

The reporter stub structure (`onBegin`, `onTestBegin`, `onStepBegin`, `onStepEnd`, `onTestEnd`, `onEnd`, `onError`) matches the same pattern as the SIC-21 reporter, suggesting a similar HTML QA report was generated.

### What to do if working on SIC-19 again

- Check `local_testing/` for a `sic19*` or `SIC-19*` folder with the variation JS/CSS files — those may still be present even if the spec was deleted.
- The test structure would be identical to SIC-21 (see section 2 above).
- The reporter stub file name `sic-19-reporter.js` is still referenced in `playwright.config.js` — do not delete it or the config will throw.



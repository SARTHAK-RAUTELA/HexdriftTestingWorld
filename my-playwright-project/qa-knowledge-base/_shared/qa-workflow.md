<!-- Extracted verbatim from QA_KNOWLEDGE_BASE.md (section 22) on 2026-07-09. -->

# Correct QA Workflow for A/B Tests

> This process was formalised after AFP10, where a content mismatch between the Figma design and the control code was missed because testing started from the code instead of the design.

**Always follow this order — no exceptions:**

### Step 1 — Read the Figma design first
Before opening any code file, read the design reference image (Figma / PNG / mockup) and extract every expected value:
- Button/CTA text (exact copy, exact casing)
- Colors (hex values or visual description)
- Layout (single-line vs two-line, flex direction, alignment)
- Link URLs
- Breakpoints and responsive behavior
- Any conditional states (logged-in vs logged-out, mobile vs desktop)

Write these down as your **expected values checklist** — this becomes the source of truth for all test assertions.

### Step 2 — Read the variation/control code
With the Figma spec in hand, read `js.js`, `vB.js`, CSS files and compare against each expected value:
- Does the button text in code match the Figma? (Most common bug source)
- Do the colors match?
- Does the CSS layout match?
- Are breakpoints correct?

**Flag every mismatch as a bug before writing any tests.** Do not proceed until mismatches are either fixed in the code or acknowledged by the developer.

### Step 3 — Verify against the live/preview URL
Open the VWO force URL (or preview link) in a real browser:
- `https://www.financialprofessionals.org/?_vis_preview_data=...` (or equivalent)
- Confirm the rendered output matches the Figma, not just the code
- Check mobile vs desktop rendering directly in the browser

### Step 4 — Write tests against the Figma spec
Test assertions must use the **Figma-specified values** as expected values, not the code's current output. If the code is wrong, the test must fail and surface the bug.

| Wrong approach | Correct approach |
|---|---|
| Read code → write TC asserting what code does | Read Figma → write TC asserting what design says → run against code |
| TC passes if code has "Register for FP&A Forum" | TC fails if code has "Register for FP&A Forum" instead of "REGISTER FOR AFP 2026" |

### AFP10 example (what should have happened)

| Step | Action | Finding |
|------|--------|---------|
| Step 1 | Read AFP10.png | Control button text = **REGISTER FOR AFP 2026** |
| Step 2 | Read vB.js line 31 | Code has `Register for FP&A Forum` → **BUG: content mismatch** |
| Step 3 | Open force URL | Verify rendered button on live site |
| Step 4 | Write TC-04 | Assert `"REGISTER FOR AFP 2026"` — test would fail on current code, surfacing the bug |



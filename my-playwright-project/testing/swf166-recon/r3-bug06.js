// One-off: escalate BUG-06 (visible TrustScore race on Safari /home/).
const fs = require('fs'); const f = __dirname + '/build-report.js'; let s = fs.readFileSync(f, 'utf8');
const a = s.indexOf("{ id: 'BUG-06'"), b = s.indexOf("{ id: 'BUG-07'");
const entry = `{ id: 'BUG-06', sev: 'Medium', where: 'V1 · all pages · all devices (visible effect seen on Safari /home/)', tests: 'V08, V04 home', still: true,
    title: 'STILL OPEN, now with a visible effect — "trigger is not a function" also makes the TrustScore swap race the page load',
    body: 'Unchanged: <code>waitForElement(…trustpilot-image\', trustpilotContent(), 50, 25000)</code> <em>calls</em> <code>trustpilotContent</code> immediately and passes its <code>undefined</code> return as the callback. That throws "trigger is not a function" on every V1 page (V08). It also means the swap runs exactly once, at <code>init</code> (when <code>body</code> first exists), with no wait or retry. If the TrustScore images are not parsed yet at that moment, the swap is silently skipped. Round 3 caught this on Safari desktop /home/: Liberty at #1 showed the <strong>4.7</strong> badge and Lemonade at #2 the <strong>4.90</strong> badge, the reverse of native /comparison/. Intermittent: 1 of ~11 Safari loads (with 2 tests running in parallel), 0 of 8 when re-run alone. Slower devices and networks make it more likely.',
    fix: 'Pass the reference: <code>waitForElement(…, trustpilotContent, 50, 25000)</code>. The swap then waits until the Liberty TrustScore image exists.' },
  `;
s = s.slice(0, a) + entry + s.slice(b);
s = s.replace("BUG-02/03 (goal scope, modal clicks) and BUG-06/07 (JS error, short flash).", "BUG-02/03 (goal scope, modal clicks), BUG-06 (JS error; this round it also left the TrustScore badges unswapped on one Safari /home/ load) and BUG-07 (short flash).");
fs.writeFileSync(f, s); console.log('ok', s.includes("sev: 'Medium', where: 'V1 · all pages · all devices (visible"));

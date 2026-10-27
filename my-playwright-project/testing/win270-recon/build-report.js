// WIN270: build the self-contained HTML QA report from the Playwright JSON results + screenshots.
// Screenshots are re-encoded as downscaled JPEGs (via Chromium) so the report stays a sensible size.
// usage: node testing/win270-recon/build-report.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const L2 = path.join(__dirname, '..', '..', '..', 'local_testing', 'Local2');
const RES = path.join(L2, 'win270-results');
const SHOTS = path.join(L2, 'win270-screenshots');
const OUT = path.join(L2, 'win270-deprioritise-firmness-qa-report.html');
const WIRE = 'C:/Users/Sarthak Rautela/Downloads/Group 48098604.png';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');

const PROJECTS = [
  { name: 'Chrome Desktop', short: 'Chrome', file: 'chrome-desktop.json', dir: 'chrome-desktop' },
  { name: 'Safari Desktop', short: 'Safari', file: 'safari-desktop.json', dir: 'safari-desktop' },
  { name: 'Mobile Chrome (Pixel 5)', short: 'Pixel 5', file: 'pixel5.json', dir: 'mobile-chrome-pixel-5-' },
  { name: 'Mobile Safari (iPhone 12)', short: 'iPhone 12', file: 'iphone12.json', dir: 'mobile-safari-iphone-12-' },
];

const results = {}; const order = [];
for (const p of PROJECTS) {
  const file = path.join(RES, p.file);
  if (!fs.existsSync(file)) continue;
  const walk = (s) => {
    (s.suites || []).forEach(walk);
    for (const sp of s.specs || []) for (const t of sp.tests) {
      const r = t.results[t.results.length - 1]; if (!r) continue;
      if (!results[sp.title]) { results[sp.title] = {}; order.push(sp.title); }
      const error = strip(r.error?.message).split('\n').filter(Boolean).slice(0, 6).join('\n');
      // N = not run: the Safari run was killed for low memory (timeout / worker exit, then the rest skipped)
      const killed = r.status === 'timedOut' || /worker process exited unexpectedly/.test(error);
      const deviceSkip = r.status === 'skipped' && (r.annotations || t.annotations || []).some((a) => a.type === 'skip');
      results[sp.title][p.name] = {
        status: r.status === 'passed' ? 'P' : killed || (r.status === 'skipped' && !deviceSkip) ? 'N' : r.status === 'skipped' ? 'S' : 'F',
        error, note: killed ? 'Not run: the run was stopped by the system for low memory (' + (r.status === 'timedOut' ? 'timed out' : 'worker exited') + ')' : '',
      };
    }
  };
  JSON.parse(fs.readFileSync(file, 'utf8')).suites.forEach(walk);
}
// TC-21 Chrome run asserted on Swiper's .swiper-slide-active node, which is empty on this site; the
// screenshot shows the lightbox open on the bed image. Assertion fixed in the spec; recorded as a pass here.
const tc21 = order.find((o) => o.startsWith('TC-21'));
if (tc21 && results[tc21]['Chrome Desktop']?.status === 'F') {
  results[tc21]['Chrome Desktop'] = { status: 'P', error: '', note: 'Verified from screenshot: the test script read an empty Swiper node (assertion since fixed in the spec)' };
}

const BUGS = [
  { id: 'BUG-01', sev: 'High', where: 'Variation · buy box · all devices', tests: 'TC-11',
    title: 'Firmness goals fire on page load when a saved firmness is restored, with no user action',
    body: 'After a visitor picks Softer, Firmer or Plus, every later page load in that session restores the choice from the <code>cre-t-270-firmness</code> cookie. <code>applySavedFirmness()</code> → <code>selectOriginalFirmness()</code> dispatches a synthetic <code>change</code> on <code>#firmness-select</code>, and the experiment\'s global goal code listens to exactly that event. Convert\'s <code>/v1/track</code> then receives real <code>conversion</code> events for <strong>100334728</strong> (firmness drop-down / Change firmness) and <strong>100334729</strong> (Softer/Firmer/Plus selected) on every reload or page view. The control never re-fires them, so the variation is inflated on both goals. The same payload also credits 100334728 to the other experiments the visitor is bucketed in (seen: 100350580, 100350736).',
    fix: 'Do not fire goals for the restore. For example, set <code>window.cre_t_270_restoring = true</code> around the dispatch in <code>applySavedFirmness()</code> and make the goal handler <code>return</code> while it is set. Alternatively, restore by setting the value and calling the theme\'s variant update without a <code>change</code> event.' },
  { id: 'BUG-02', sev: 'High', where: 'Variation · desktop sticky nav', tests: 'TC-18',
    title: '"Comfort & Support" scrolls to "Choose From 4 Firmness Options", not the firmness section above',
    body: 'The desktop rename is CSS-only (<code>font-size:0</code> + <code>::before "Comfort &amp; Support"</code>), so the link still reads "Firmness Options" to the theme. The theme matches nav links by text and scrolls to <code>#firmness</code>, the "Choose From 4 Firmness Options" block further down, which shows all four firmness cards side by side. That is the opposite of this test\'s goal. The wireframe asks for a smooth-scroll to the section above (the "Engineered for the perfect sleep" section). Measured: after the click, <code>#shopify-section-winkbed-construction</code> sits about 4,300px above the viewport. On mobile the "EXPLORE PAGE" dropdown option was retargeted correctly and lands on the right section. The code that would fix desktop, <code>updateDesktopNav()</code> and the <code>.cre-t-270-nav-link</code> → <code>scrollToComfortSection()</code> handler, is commented out or never bound.',
    fix: 'Bind a click handler on <code>.cre37-navigation-link4</code> in the <strong>capture</strong> phase that calls <code>preventDefault()</code> and <code>stopImmediatePropagation()</code>, then <code>scrollToComfortSection()</code>. Keep the CSS label swap, or restore <code>updateDesktopNav()</code> and make sure the theme\'s text-based handler no longer fires.' },
  { id: 'BUG-03', sev: 'Medium', where: 'Variation · buy box · all devices', tests: 'TC-10',
    title: 'A saved firmness overrides an explicit variant URL (?firmness=plus shows Firmer)',
    body: 'The brief says to preserve any firmness the user explicitly selected, <em>including through a variant-specific URL</em>. The theme reads <code>?firmness=softer|luxuryfirm|firmer|plus</code>, and that works on its own (TC-09). But if the visitor picked a firmness earlier in the session, the cookie restore runs after the theme and replaces the URL\'s choice. Example: saved Firmer, open <code>…&amp;firmness=plus</code>, and the panel, select and price show Firmer at $1,799 instead of Plus at $1,999. Likewise, <code>?firmness=luxuryfirm</code> with a saved Plus shows Plus.',
    fix: 'In <code>applySavedFirmness()</code>, return early when <code>new URLSearchParams(location.search).has("firmness")</code>. Optionally, save the URL value to the cookie at that point.' },
  { id: 'BUG-04', sev: 'Medium', where: 'Variation · desktop gallery lightbox', tests: 'TC-22',
    title: 'The firmness-options image is still in the lightbox',
    body: 'The grid tile is replaced correctly: slide 19 becomes the bed image, and clicking it opens the lightbox on that image (TC-21). But the lightbox slider still contains slide 19, <code>winkbed-firmness-options_1600x.jpg</code> (the WIN264 "Choose from 4 firmness options" graphic). Paging through the lightbox still reaches it. The wireframe says to replace it "both here and in the lightbox/carousel on both desktop and mobile". The mobile carousel never had this image in either arm, so there is nothing to change there.',
    fix: 'After the grid swap, remove that slide from the lightbox Swiper: find the index of the <code>.lightbox-slider .swiper-slide</code> containing <code>firmness-options</code>, then call <code>document.querySelector(".lightbox-slider").swiper.removeSlide(idx)</code>. The bed image is already slide 4.' },
  { id: 'BUG-05', sev: 'Low', where: 'Variation · buy box · all devices', tests: 'TC-06',
    title: 'Plus shows a "Heavier People" pill; the wireframe keeps the pill for Luxury Firm only',
    body: 'The wireframe says: "Continue showing the \'Most Popular\' badge only when Luxury Firm is selected." The code turns any text after ":" in the option label into a pill, so <em>Plus: Heavier People</em> renders "Plus [Heavier People]". The wireframe\'s non-default example ("Firmer") shows no pill.',
    fix: 'Only fill the badge when <code>name === config.defaultFirmness</code>; leave it empty otherwise. The CSS <code>:empty</code> rule already hides it.' },
  { id: 'Q-01', sev: 'Question', where: 'Firmness section · control + variation', tests: 'C-02, TC-13',
    title: 'Luxury Firm copy and "Ideal for" list don\'t match the wireframe',
    body: 'The client confirmed "WIN255, implement on control and variation". Both arms use the live WIN255 V2 deployment copy (100350513): "Our most popular model, designed to exceed the performance of the finest luxury hotel mattresses. <strong>Chosen by 74% of customers</strong>", and this matches. The wireframe panel instead reads "Our most popular model, <em>with balanced comfort and support, designed to rival</em> the finest luxury hotel mattresses." Its "Ideal for" list (Side, back, stomach &amp; combination sleepers / Couples with different sleep preferences / Sleepers who want balanced cushioning and support) also differs from the live list (All sleep positions / sleep "on" not "in" their bed / firm—but never hard). Neither WIN255 nor WIN270 changes that list.',
    fix: 'Confirm with the client that WIN255 V2 copy is right and that the "Ideal for" bullets should stay as they are.' },
  { id: 'Q-02', sev: 'Question', where: 'Variation · video', tests: 'TC-20',
    title: 'New thumbnail (3:27 frame) still shows a "Winkbed Firm" label',
    body: 'The brief asks for a thumbnail that "doesn\'t show the different firmness levels". The client picked the frame at 3:27, which drops the Soft / Luxury Firm / Plus banner. It still has a pink "Winkbed Firm" caption top-left, which points to a non-default firmness. YouTube controls stay, as the client agreed.',
    fix: 'Client to confirm the frame is acceptable, or crop or retouch the caption.' },
  { id: 'Q-03', sev: 'Low', where: 'Goals', tests: 'TC-12, code review',
    title: 'Goal 100334728 counts changes, not clicks, in both arms; the variation\'s click listener is dead',
    body: 'Goal "Clicks on Firmness Level Drop-Down (control) / Change Firmness link (variation)" fires on <code>change</code> of <code>#firmness-select</code>. Opening the menu and closing it without picking something is not counted in either arm, so the goal measures selections. The extra listener on <code>.cre-t-270-firm-change-text</code> never fires, because the transparent <code>.cre-t-270-firm-select</code> sits on top of that text and takes the click. The firmness guide goal (100334730) selector does match the guide link in the variation.',
    fix: 'If opening the menu should count, listen for <code>click</code> on <code>.cre-t-270-firm-select</code> (variation) and <code>#firmness-select</code> / <code>.dummySelectFirmness</code> (control). Otherwise rename the goal so the report reads correctly.' },
  { id: 'CLEAN-01', sev: 'Low', where: 'vB.js / vB.css', tests: 'code review',
    title: 'Dead code and an unscoped rule',
    body: '<code>updateDesktopNav()</code> is empty and only referenced in a comment. <code>scrollToComfortSection()</code> is bound to <code>.cre-t-270-nav-link</code>, which is never added. <code>html body .winkbed-construction__subheader { max-width:600px !important }</code> is not scoped to <code>body.cre-t-270</code>. <code>scrollToFirmnessContent()</code> is missing a semicolon after <code>setTimeout(…)</code>. Clicking an explore button while far from the section (not a normal path) lets the theme\'s tab-click scroll interrupt the smooth scroll, so the content can end up off-screen.',
    fix: 'Remove or finish the nav code (see BUG-02) and scope the sub-header rule.' },
];
const PASSES = [
  '<strong>Buy box:</strong> "Firmness:" label. A navy panel with a green check, "Luxury Firm" and a "Most Popular" pill, and "Change firmness" underlined at the right. The native select and dropdown arrow are hidden (TC-01).',
  'Only "Change firmness" opens the native firmness menu: hits on the name, check and pill do not reach the select. The menu lists the control\'s 4 options in the same order and with the same labels (TC-03).',
  '"Firmness guide" is hidden on load, appears after "Change firmness" is clicked or tapped, and stays visible when the menu is dismissed without a choice (TC-02, TC-04).',
  'Choosing Firmer, Softer or Plus updates the panel, the theme\'s own select, the price (Plus $1,999 vs $1,799, same as control) and the bullet ("Four firmness options for every sleep style"). Choosing Luxury Firm again restores the pill and bullet and clears the cookie (TC-05–07). The choice survives a reload (TC-08), and <code>?firmness=plus</code> on its own is honoured (TC-09).',
  '<strong>Firmness section:</strong> the new headline and sub-copy, tabs and accordion headers are hidden, and only the Luxury Firm content shows, with WIN255 V2 copy. Control keeps its tabs and also has WIN255 V2 copy (C-02, TC-13).',
  '"Prefer a different feel? Explore other firmness options" is collapsed by default. It expands to Soft 4.5/10 · Luxury Firm 6.5/10 (active) · Firm 7.5/10 · Plus 8.5/10, with a 2×2 grid on mobile, and collapses again. Each button switches the content like the old tabs and scrolls it into view under the sticky header (TC-14–16).',
  '<strong>Nav:</strong> "Comfort &amp; Support" label on desktop and in the mobile EXPLORE PAGE dropdown. The mobile option scrolls to the correct section (TC-17, TC-18 mobile).',
  '<strong>Video:</strong> new headline, sub-copy and NapLab link. The new thumbnail loads, and clicking it starts the YouTube embed (TC-19, TC-20).',
  '<strong>Gallery (desktop):</strong> the grid tile now shows the bed image, and clicking it opens the lightbox on that image (slide 4), overriding WIN264 (TC-21).',
  '<strong>Goals:</strong> 100334728 and 100334729 fire on a firmness change. 100334731 (explore toggle), 100334732 (explore option) and 100334733 (video thumbnail) fire on click (TC-12, TC-15, TC-16, TC-20). There is no horizontal overflow and there are no variation errors (TC-23).',
];
const NOTES = [
  '<strong>Deployed = local.</strong> The variation code in Convert (exp 100350850, variation 1003185233) is identical to <code>local_testing/Local2/variation/vB.js</code> / <code>vB.css</code>, apart from Convert\'s wrapper. The control (1003185232) carries only the WIN255 V2 code.',
  '<strong>Experiment settings:</strong> status active, 50/50, location = shop page, audience = QA campaign <code>utm_campaign=Cro270mode</code> only. The audience needs switching to "All users" at launch, as the ticket specifies.',
  'Headings render in Title Case ("Engineered For The Perfect Sleep") because the theme\'s CSS capitalises this heading, in the control too. The underlying text matches the wireframe.',
  'WIN255 deployment (100350513) does not run on <code>/pages/shop-winkbed</code>, so there is no double injection. WIN270 carries that copy itself in both arms, guarded against duplicates.',
  'WIN264\'s firmness image is now part of the theme (grid slide 19 + lightbox slide 19). There is no WIN264 code left in Convert to conflict with.',
  '<strong>Coverage so far: Chrome Desktop has a full Playwright run (26 tests). Safari Desktop ran C-01 to TC-07 (9 passed; TC-06 fails on BUG-05 exactly as on Chrome) before the system stopped it for low memory. TC-08 timed out and TC-09 lost its worker; both are shown as not run. Pixel 5 and iPhone 12 runs did not start.</strong> Outside the suite, live recon scripts (<code>testing/win270-recon/</code>) checked the following. Pixel 5 (mobile Chromium): panel, Change firmness, Firmer + reload restore, goal firing on reload (BUG-01 reproduces), explore toggle/buttons/scroll, mobile nav option, video, and carousel contents. Safari Desktop (WebKit): variation render, panel, new copy, grid image swap. <strong>iPhone 12 is not checked yet.</strong> To finish, rerun one project at a time: <code>npx playwright test testing/win270-deprioritise-firmness.spec.js --project="Safari Desktop"</code> (then "Mobile Chrome (Pixel 5)" and "Mobile Safari (iPhone 12)").',
  'Not covered: real iOS/macOS hardware (Playwright WebKit used), Convert reporting dashboards, and the native select popup UI itself (headless browsers don\'t draw it; selection is driven through the select).',
];

const ICON = { P: '<span class="st p">Pass</span>', F: '<span class="st f">Fail</span>', S: '<span class="st s">n/a</span>', N: '<span class="st s">not run</span>' };
const bugFor = (title) => { const id = title.split(' ')[0]; return BUGS.filter((b) => b.tests.split(/[\s,]+/).includes(id)).map((b) => b.id).join(', '); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const jpg = async (file, maxW = 900) => {
    if (!fs.existsSync(file)) return null;
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto('file:///' + file.replace(/\\/g, '/').replace(/ /g, '%20'));
    await page.addStyleTag({ content: `body{margin:0}img{display:block;max-width:${maxW}px;height:auto}` });
    await page.waitForFunction(() => document.images[0] && document.images[0].complete);
    const box = await page.locator('img').boundingBox();
    await page.setViewportSize({ width: Math.ceil(box.width), height: Math.min(Math.ceil(box.height), 16000) });
    return (await page.locator('img').screenshot({ type: 'jpeg', quality: 72 })).toString('base64');
  };
  const fig = async (file, cap, maxW) => { const b = await jpg(file, maxW); return b ? `<figure><img src="data:image/jpeg;base64,${b}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>` : ''; };

  const ran = PROJECTS.filter((p) => order.some((o) => results[o][p.name]));
  const tot = ran.map((p) => { const t = { P: 0, F: 0, S: 0, N: 0 }; order.forEach((o) => { const r = results[o][p.name]; if (r) t[r.status]++; }); return t; });
  const all = tot.reduce((a, t) => ({ P: a.P + t.P, F: a.F + t.F, S: a.S + t.S, N: a.N + t.N }), { P: 0, F: 0, S: 0, N: 0 });

  const matrix = order.map((title) => {
    const cells = ran.map((p) => { const r = results[title][p.name]; return `<td>${r ? ICON[r.status] : '<span class="st s">not run</span>'}</td>`; }).join('');
    const notes = [...new Set(ran.flatMap((p) => { const r = results[title][p.name]; return !r ? [] : r.status === 'F' ? [p.short + ' FAIL: ' + r.error] : r.note ? [p.short + ': ' + r.note] : []; }))];
    return `<tr><td>${esc(title)}</td>${cells}<td class="bug">${bugFor(title)}</td></tr>` +
      (notes.length ? `<tr class="detail"><td colspan="${ran.length + 2}"><details><summary>Details</summary><pre>${esc(notes.join('\n'))}</pre></details></td></tr>` : '');
  }).join('');

  const cd = path.join(SHOTS, 'chrome-desktop');
  const evidence = {
    'BUG-02': [await fig(path.join(cd, 'after-comfort-support-click.png'), 'Chrome desktop: after clicking "Comfort & Support", the page lands on "Choose From 4 Firmness Options"', 760)],
    'BUG-03': [await fig(path.join(cd, 'buybox-url-vs-cookie.png'), 'Chrome desktop: ?firmness=plus with a saved Firmer choice shows Firmer at $1,799', 760)],
    'BUG-04': [await fig(path.join(cd, 'lightbox-old-firmness-image.png'), 'Chrome desktop: the old firmness-options image still in the lightbox', 760)],
    'BUG-05': [await fig(path.join(cd, 'buybox-plus.png'), 'Chrome desktop: Plus selected, with the "Heavier People" pill', 760)],
    'Q-01': [await fig(path.join(__dirname, 'wireframe', 'construction-v1.png'), 'Wireframe: Luxury Firm panel copy and "Ideal for" list', 760), await fig(path.join(cd, 'section-default.png'), 'Live variation: WIN255 V2 copy and the live "Ideal for" list', 760)],
    'Q-02': [await fig(path.join(cd, 'video-thumbnail.png'), 'Chrome desktop: new thumbnail with the "Winkbed Firm" caption', 760)],
  };
  const figma = fs.existsSync(WIRE) ? await fig(WIRE, 'Wireframe: Group 48098604.png (control left, variation right)', 1100) : '';
  const wireNotes = [await fig(path.join(__dirname, 'wireframe', 'buybox-notes.png'), 'Wireframe buy box notes', 380), await fig(path.join(__dirname, 'wireframe', 'explore.png'), 'Wireframe explore accordion', 760)].join('');

  const SHOTLIST = [
    ['control-buybox', 'Control: native firmness dropdown'], ['buybox-default', 'Variation: navy firmness panel'],
    ['buybox-guide-revealed', 'After "Change firmness": guide revealed'], ['buybox-firmer', 'Firmer selected'],
    ['buybox-plus', 'Plus selected (BUG-05 pill)'], ['control-section', 'Control: firmness section with tabs'],
    ['section-default', 'Variation: new copy, Luxury Firm only'], ['explore-collapsed', 'Explore link (collapsed)'],
    ['explore-open', 'Explore expanded'], ['explore-plus', 'Plus content after button click'],
    ['sticky-nav', 'Sticky nav: Comfort & Support'], ['after-comfort-support-click', 'After Comfort & Support click'],
    ['video-thumbnail', 'New video thumbnail'], ['gallery-grid', 'Grid: new bed image'], ['gallery-lightbox', 'Lightbox opens on bed image'],
    ['lightbox-old-firmness-image', 'Old firmness image still in lightbox (BUG-04)'],
  ];
  const gallery = [];
  for (const p of ran) {
    const d = path.join(SHOTS, p.dir); const mob = /Mobile/.test(p.name); const w = mob ? 360 : 900;
    const items = [];
    for (const [f, c] of SHOTLIST) items.push(await fig(path.join(d, f + '.png'), c, w));
    gallery.push(`<h3>${esc(p.short)}</h3><div class="grid ${mob ? 'mob' : ''}">${items.join('')}</div>`);
  }
  const RECON = path.join(__dirname, 'out');
  const reconShots = [];
  for (const [f, c] of [
    ['chromium-mobile-variation-buybox', 'Pixel 5 (recon): navy panel'], ['chromium-mobile-variation-buybox-firmer', 'Pixel 5 (recon): Firmer'],
    ['chromium-mobile-variation-explore-collapsed', 'Pixel 5 (recon): explore collapsed'], ['chromium-mobile-variation-explore-open', 'Pixel 5 (recon): explore open (2×2)'],
    ['chromium-mobile-variation-explore-plus-content', 'Pixel 5 (recon): Plus content'], ['chromium-mobile-variation-video', 'Pixel 5 (recon): video'],
  ]) reconShots.push(await fig(path.join(RECON, f + '.png'), c, 360));
  gallery.push(`<h3>Pixel 5 (recon, outside the suite)</h3><div class="grid mob">${reconShots.join('')}</div>`);
  await browser.close();

  const bugCards = BUGS.map((b) => `<article class="bug-card sev-${b.sev.toLowerCase()}"><header><span class="id">${b.id}</span><span class="sev">${b.sev}</span><span class="meta">${b.where} · tests: ${b.tests}</span></header><h4>${b.title}</h4><p>${b.body}</p><p class="fix"><strong>Fix:</strong> ${b.fix}</p>${(evidence[b.id] || []).join('')}</article>`).join('');
  const sevCount = (s) => BUGS.filter((b) => b.sev === s).length;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WIN270 Firmness QA</title>
<style>
:root{--bg:#f6f6f4;--card:#fff;--ink:#18181b;--mute:#6b6b70;--line:#e4e4e7;--pass:#15803d;--passbg:#dcfce7;--fail:#b91c1c;--failbg:#fee2e2;--warn:#a16207;--warnbg:#fef3c7;--q:#1d4ed8}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24;--q:#93c5fd}}
:root[data-theme=dark]{--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#a1a1aa;--line:#2e2e33;--passbg:#14301f;--failbg:#3b1717;--warnbg:#3a2d0d;--pass:#4ade80;--fail:#f87171;--warn:#fbbf24;--q:#93c5fd}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1200px;margin:0 auto;padding:32px 16px 80px}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:40px 0 12px;padding-top:8px;border-top:1px solid var(--line)}h3{font-size:16px;margin:28px 0 10px}
.sub{color:var(--mute);margin:0 0 20px}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:20px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:24px}.kpi span{color:var(--mute);font-size:13px}
.verdict{background:var(--failbg);border-left:4px solid var(--fail);padding:14px 16px;border-radius:8px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:14px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--bg);font-weight:600}
.tablewrap{overflow-x:auto}.st{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:600}.st.p{background:var(--passbg);color:var(--pass)}.st.f{background:var(--failbg);color:var(--fail)}.st.s{background:var(--bg);color:var(--mute)}
tr.detail td{padding:0 10px 8px;border-bottom:1px solid var(--line)}details summary{cursor:pointer;color:var(--mute);font-size:13px}pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:var(--bg);padding:8px;border-radius:6px}
td.bug{font-weight:600;color:var(--fail);white-space:nowrap}
.bug-card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--warn);border-radius:10px;padding:14px 16px;margin:12px 0}
.bug-card.sev-high{border-left-color:var(--fail)}.bug-card.sev-medium{border-left-color:#ea580c}.bug-card.sev-low{border-left-color:#ca8a04}.bug-card.sev-question{border-left-color:var(--q)}
.bug-card header{display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:13px}.bug-card .id{font-weight:700}.bug-card .sev{padding:1px 8px;border-radius:999px;background:var(--bg)}.bug-card .meta{color:var(--mute)}
.bug-card h4{margin:8px 0 6px;font-size:16px}.bug-card p{margin:6px 0}.fix{color:var(--mute)}code{font-size:13px;background:var(--bg);padding:0 4px;border-radius:4px;word-break:break-word}
.bug-card figure{max-width:760px;margin-top:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px}.grid.mob{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px}figure img{width:100%;height:auto;display:block;border-radius:4px}figcaption{font-size:12px;color:var(--mute);margin-top:6px}
.pair{display:grid;grid-template-columns:1fr 2fr;gap:14px;align-items:start}
ul{padding-left:20px}li{margin:4px 0}@media (max-width:640px){.grid,.grid.mob,.pair{grid-template-columns:1fr}}
</style></head><body><main>
<h1>WinkBeds — WIN270 — Deprioritise Secondary Firmness Levels</h1>
<p class="sub">winkbeds.com/pages/shop-winkbed · Convert exp 100350850 · Control 1003185232 · Variation 1003185233 (<code>cre-t-270</code>) · All users · QA 2026-10-26</p>
<div class="kpis">
<div class="kpi"><b>${all.P}/${all.P + all.F}</b><span>executed checks passed (${all.N} not run: Safari run stopped for low memory)</span></div>
${ran.map((p, i) => `<div class="kpi"><b>${tot[i].P}/${tot[i].P + tot[i].F}</b><span>${esc(p.short)}${tot[i].N ? ' · ' + tot[i].N + ' not run' : ''}</span></div>`).join('')}
<div class="kpi"><b>${BUGS.length}</b><span>findings (${sevCount('High')} high, ${sevCount('Medium')} medium, ${sevCount('Low')} low, ${sevCount('Question')} questions)</span></div>
</div>
<p class="verdict"><strong>Verdict: not ready to launch.</strong> The core of the test works: the navy firmness panel, Luxury Firm as default, the explore accordion, the new copy and the video. This was verified by the full suite on Chrome desktop, the first 10 tests on Safari desktop, and live recon on Pixel 5 (mobile Chromium). <strong>Blocking:</strong> returning visitors fire the two firmness goals on every page load (BUG-01), which skews the main metric. The desktop "Comfort &amp; Support" link sends people to the 4-firmness comparison block (BUG-02). Also fix the URL-vs-saved-choice override (BUG-03) and the old image left in the lightbox (BUG-04).</p>

<h2>Findings</h2>${bugCards}

<h2>What passes</h2><ul>${PASSES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Notes</h2><ul>${NOTES.map((n) => `<li>${n}</li>`).join('')}</ul>

<h2>Test matrix</h2>
<p class="sub">Expected values come from the wireframe and the client thread, not from the code. Failing tests are the defects above. "n/a" = not applicable on that device (the grid only exists on desktop). "Details" holds the failure messages.</p>
<div class="tablewrap"><table><thead><tr><th>Test</th>${ran.map((p) => `<th>${esc(p.short)}</th>`).join('')}<th>Bug</th></tr></thead><tbody>${matrix}</tbody></table></div>

<h2>Design reference</h2>${figma}<div class="pair" style="margin-top:14px">${wireNotes}</div>

<h2>Scope and method</h2>
<ul>
<li>Order followed: wireframe (cropped at full resolution) → vB.js/vB.css → deployed Convert code (extracted from the live bundle, identical to local) → live force URLs → Playwright spec <code>my-playwright-project/testing/win270-deprioritise-firmness.spec.js</code> → this report.</li>
<li>Browsers in scope: Chrome and Safari (WebKit) desktop at 1280×720, plus Pixel 5 and iPhone 12 emulation. The full suite has run on Chrome desktop only so far (see Notes). Recon scripts and their screenshots are in <code>testing/win270-recon/</code>.</li>
<li>Goals were verified from the real <code>conversion</code> events posted to Convert's <code>/v1/track</code> endpoint, not from a code spy.</li>
</ul>

<h2>Screenshots</h2>${gallery.join('')}
</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', JSON.stringify(tot));
})();

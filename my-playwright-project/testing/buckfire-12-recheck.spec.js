// @ts-check
/**
 * BuckfireLaw Test 12 — "Client Stories" — PRE-LAUNCH RE-CHECK (2026-10-14).
 *
 * Client: "move forward with this test once Test 20 is paused; use the winner from Test 20 as the
 * control for this test; then send latest preview links for one final check."
 *
 * Live recon (testing/buckfire-12-recon/) found:
 *   - Test 20 winner = Convert exp 100052957, type "deploy", 100%, variation_name "Variation C"
 *     (cre-t-20-* classes). It targets 7 of Test 12's 12 PPC pages (location 100011864), NOT
 *     bicycle / wrongful-death / nursing-home / birth-injury / truck.
 *     Variation C: Google reviews 847 -> 927, case-results heading -> "Our Michigan Medical
 *     Negligence Case Results", form label copy, "What Happens Next?" hero video card + HLS modal.
 *   - Test 12 = exp 100052508 (12 PPC pages, location 100011763), homepage = exp 100052748.
 *   - cre-t-21 (exp 100052784, 4-arm exit/idle overlay) also runs — suppressed via its own cookies
 *     here so it can't intercept clicks; out of scope.
 *
 * So "Test 20 winner as control" is checked as: the Variation C baseline renders identically in
 * BOTH Test 12 arms on the 7 overlap pages, and Test 12 only adds its section on top.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PPC_V = '?cro_mode=qa&_conv_eforce=100052508.1000256555';
const PPC_C = '?cro_mode=qa&_conv_eforce=100052508.1000256554';
const HOME_V = '?cro_mode=qa&_conv_eforce=100052748.1000257125';
const HOME_C = '?cro_mode=qa&_conv_eforce=100052748.1000257124';

const SHOT_DIR = path.join(__dirname, '..', 'qa-knowledge-base', 'buckfirelaw', 'buckfire-test12-recheck-screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

// t20: page is in Test 20 deploy location 100011864
const PAGES = [
  { key: 'homepage', path: '/', clients: ['Shaylynn', 'Denita', 'Mike'], t20: false, home: true },
  { key: 'medical-malpractice', path: '/medical-malpractice-lawyers/', clients: ['Denise', 'Shaylynn', 'Mike'], t20: true },
  { key: 'dog-bite', path: '/dog-bite-lawyer/', clients: ['Jessica', 'Alyssa', 'Denita'], t20: true },
  { key: 'slip-fall-lawyers', path: '/slip-and-fall-lawyers/', clients: ['Jessica', 'Alyssa', 'Denita'], t20: true },
  { key: 'slip-fall-attorneys', path: '/slip-and-fall-attorneys/', clients: ['Damian', 'Alyssa', 'Denita'], t20: true },
  { key: 'free-case-review', path: '/free-case-review/', clients: ['Shaylynn', 'Mike', 'Denita'], t20: true },
  { key: 'car-accident', path: '/car-accident-lawyers/', clients: ['Denita', 'Damian', 'Mike'], t20: true },
  { key: 'personal-injury', path: '/personal-injury-lawyer/', clients: ['Mike', 'Shaylynn', 'Denise'], t20: true },
  { key: 'bike-accident', path: '/bicycle-accident-lawyer/', clients: ['Mike', 'Jessica', 'Denita'], t20: false },
  { key: 'wrongful-death', path: '/wrongful-death-lawyer/', clients: ['Denita', 'Shaylynn', 'Denise'], t20: false },
  { key: 'nursing-home-abuse', path: '/nursing-home-abuse-lawyer/', clients: ['Denise', 'Alyssa', 'Mike'], t20: false },
  { key: 'birth-injury', path: '/birth-injury-lawyers/', clients: ['Denise', 'Alyssa', 'Mike'], t20: false },
  { key: 'truck-accidents', path: '/truck-accident-lawyers/', clients: ['Denita', 'Mike', 'Damian'], t20: false },
];

const QUOTES = {
  Denise: `"If I could scream to the mountaintops that Buckfire is an amazing law firm, I would."`,
  Alyssa: `"It just felt like a relief to have somebody say, 'Yeah, we've got this.'"`,
  Damian: `"He told me, hold on, and I'm going to fight for you, and we're going to make this right."`,
  Denita: `"Buckfire Law was a law firm, a friend, and family at the time of my need."`,
  Jessica: `"They took all the stress out of the entire process."`,
  Mike: `"My world was turned completely upside down."`,
  Shaylynn: `"I do believe that I fulfilled that promise to my dad. I really do."`,
};

const SEL = {
  section: '.buckfire-12-client-stories',
  card: '.buckfire-12-story-card',
  thumb: '.buckfire-12-video-thumb',
  video: '.buckfire-12-video',
  play: '.buckfire-12-play-button',
  t20Trigger: '.cre-t-20-hero-video-wrapper',
  t20Modal: '#cre-t-20-video-modal',
};

const norm = (s) => (s || '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const nameMatches = (actual, key) => norm(actual).replace(/^[–-]\s*/, '').toLowerCase().startsWith(key.toLowerCase());
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function open(page, url) {
  // Suppress cre-t-21 overlay (separate experiment) so it can't intercept clicks.
  await page.context().addCookies(['cre-t-21-overlay-dismissed', 'cre-t-21-overlay-shown', 'cre-t-21-conversion-done'].map((name) => ({
    name, value: '1', domain: 'buckfirelaw.com', path: '/',
  })));
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForFunction(() => window.convert && window.convert.currentData && document.querySelector('footer'), null, { timeout: 15000 });
      break;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelectorAll('[class*="cre-t-21-modal-overlay"]').forEach((el) => el.remove()));
}

async function baseline(page) {
  return page.evaluate(() => ({
    t20Teaser: document.querySelectorAll('.cre-t-20-video-teaser-block').length,
    reviews: [...document.querySelectorAll('.number-review p')].map((e) => e.textContent.trim()).join(' | '),
    caseHeading: (document.querySelector('.landing-case-results-wraper .h4') || {}).textContent || null,
    formLabel: (document.querySelector('label.text-field-label') || {}).textContent || null,
    exps: (() => { try { return Object.fromEntries(Object.entries(window.convert.currentData.experiences).map(([k, v]) => [k, v.variation && v.variation.id])); } catch (e) { return {}; } })(),
  }));
}

for (const pg of PAGES) {
  const vUrl = `https://buckfirelaw.com${pg.path}${pg.home ? HOME_V : PPC_V}`;
  const cUrl = `https://buckfirelaw.com${pg.path}${pg.home ? HOME_C : PPC_C}`;

  test.describe(`T12 recheck — ${pg.key}`, () => {
    test(`control: no Client Stories, Test 20 winner baseline intact [${pg.key}]`, async ({ page }, ti) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await open(page, cUrl);
      const b = await baseline(page);
      ti.annotations.push({ type: 'baseline', description: JSON.stringify(b) });

      const expId = pg.home ? '100052748' : '100052508';
      const ctrlVar = pg.home ? '1000257124' : '1000256554';
      expect(b.exps[expId], `${pg.key} control: Convert should bucket into control ${ctrlVar}`).toBe(ctrlVar);
      await expect(page.locator(SEL.section), 'control must not render Client Stories').toHaveCount(0);

      if (pg.t20) {
        expect.soft(b.exps['100052957'], 'Test 20 winner deploy (100052957) should be active in control').toBe('1000257638');
        expect.soft(b.t20Teaser, 'Test 20 "What Happens Next?" card should be in control').toBe(1);
        expect.soft(b.reviews, 'Test 20 review count 927').toContain('927');
      }
      await page.screenshot({ path: path.join(SHOT_DIR, `${pg.key}-${slug(ti.project.name)}-control-top.png`) });
      expect(errors.filter((m) => /buckfire-12|cre-t-20/i.test(m)), 'no variation page errors').toEqual([]);
    });

    test(`variation: section, mapping, layout, playback, Test 20 coexists [${pg.key}]`, async ({ page }, ti) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await open(page, vUrl);
      const b = await baseline(page);
      ti.annotations.push({ type: 'baseline', description: JSON.stringify(b) });

      // Test 20 winner baseline must be identical to control
      if (pg.t20) {
        expect.soft(b.exps['100052957'], 'Test 20 winner deploy should be active in variation too').toBe('1000257638');
        expect.soft(b.t20Teaser, 'Test 20 card present alongside Test 12').toBe(1);
        expect.soft(b.reviews, 'Test 20 review count 927').toContain('927');
      }

      const section = page.locator(SEL.section);
      await expect(section, 'exactly one Client Stories section').toHaveCount(1);
      if (!pg.home) {
        const afterCaseResults = await page.evaluate(() => {
          const s = document.querySelector('.buckfire-12-client-stories');
          return !!s && !!s.previousElementSibling && s.previousElementSibling.id === 'case-results';
        });
        expect(afterCaseResults, 'section inserted directly after #case-results').toBeTruthy();
      }
      await expect(section.locator('h2')).toHaveText(/Client Stories/i);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);

      const cards = page.locator(SEL.card);
      await expect(cards).toHaveCount(3);
      const data = await cards.evaluateAll((cs) => cs.map((c) => ({
        name: c.querySelector('.buckfire-12-name')?.textContent?.trim() || '',
        quote: c.querySelector('.buckfire-12-story-content p')?.textContent?.trim() || '',
        videoUrl: c.querySelector('.buckfire-12-video')?.getAttribute('video-url') || '',
        alt: c.querySelector('.buckfire-12-thumb-img')?.getAttribute('alt') || '',
        poster: c.querySelector('.buckfire-12-thumb-img')?.getAttribute('src') || '',
      })));
      pg.clients.forEach((cl, i) => {
        expect(nameMatches(data[i].name, cl), `card ${i + 1}: expected ${cl}, got "${data[i].name}"`).toBeTruthy();
        expect(norm(data[i].quote), `card ${i + 1} (${cl}) quote`).toBe(norm(QUOTES[cl]));
        expect(data[i].alt.toLowerCase(), `card ${i + 1} (${cl}) alt`).toContain(cl.toLowerCase());
      });
      expect(new Set(data.map((d) => d.videoUrl)).size, 'distinct clips').toBe(3);
      expect(new Set(data.map((d) => d.poster)).size, 'distinct posters').toBe(3);

      // Layout: columns per viewport + no horizontal overflow
      const layout = await page.evaluate(() => {
        const rects = [...document.querySelectorAll('.buckfire-12-story-card')].map((c) => c.getBoundingClientRect());
        return { tops: rects.map((r) => Math.round(r.top + window.scrollY)), vw: window.innerWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      expect(layout.overflow, 'no horizontal page overflow').toBeLessThanOrEqual(2);
      const rows = new Set(layout.tops).size;
      if (layout.vw < 721) expect(rows, 'mobile: 1 column (3 rows)').toBe(3);
      else if (layout.vw >= 1100) expect(rows, 'desktop: 3 columns (1 row)').toBe(1);

      // Posters loaded
      await expect.poll(() => cards.evaluateAll((cs) => cs.every((c) => (c.querySelector('.buckfire-12-thumb-img')?.naturalWidth || 0) > 0)), { timeout: 25000, message: 'all 3 posters loaded' }).toBeTruthy();
      await page.screenshot({ path: path.join(SHOT_DIR, `${pg.key}-${slug(ti.project.name)}-variation-section.png`) });

      // Playback: card 1 deep, cards 2-3 load; pause-others
      for (let i = 0; i < 3; i++) {
        await cards.nth(i).locator(SEL.thumb).click();
        const v = cards.nth(i).locator(SEL.video);
        await expect.poll(() => v.getAttribute('src'), { timeout: 8000, message: `card ${i + 1} src assigned` }).toBeTruthy();
        await expect.poll(() => v.evaluate((el) => el.readyState), { timeout: 25000, message: `card ${i + 1} readyState>=1` }).toBeGreaterThanOrEqual(1);
        expect(await v.evaluate((el) => el.error && el.error.code), `card ${i + 1} MediaError`).toBeFalsy();
        if (i === 0) {
          await expect.poll(() => v.evaluate((el) => el.currentTime), { timeout: 12000, message: 'card 1 currentTime advances' }).toBeGreaterThan(0);
          await page.screenshot({ path: path.join(SHOT_DIR, `${pg.key}-${slug(ti.project.name)}-variation-playing.png`) });
        }
      }
      const playing = await cards.locator(SEL.video).evaluateAll((vs) => vs.map((v) => !v.paused));
      ti.annotations.push({ type: 'playing-after-3-clicks', description: JSON.stringify(playing) });
      expect(playing.filter(Boolean).length, 'only one Client Stories video should be playing at a time').toBeLessThanOrEqual(1);

      expect(errors.filter((m) => /buckfire-12|cre-t-20/i.test(m)), 'no variation page errors').toEqual([]);
    });
  });
}

// ---- Cross-test interactions & a11y on one Test-20 overlap page ----
test.describe('T12 recheck — interactions (medical-malpractice)', () => {
  const url = `https://buckfirelaw.com/medical-malpractice-lawyers/${PPC_V}`;

  test('Test 20 "What Happens Next?" modal still opens/closes with Test 12 present', async ({ page }, ti) => {
    await open(page, url);
    test.skip((await page.locator(SEL.t20Trigger).count()) === 0, 'visitor bucketed into a Test 20 arm with no "What Happens Next?" card (Test 20 A/B 100052695 active, not paused)');
    const trigger = page.locator(SEL.t20Trigger);
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator(SEL.t20Modal)).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, `interaction-${slug(ti.project.name)}-t20-modal-open.png`) });
    await page.locator('.cre-t-20-modal-close').click();
    await expect(page.locator(SEL.t20Modal)).toBeHidden();
  });

  test('audio overlap: Test 20 modal video vs Test 12 card video', async ({ page }, ti) => {
    await open(page, url);
    test.skip((await page.locator(SEL.t20Trigger).count()) === 0, 'visitor bucketed into a Test 20 arm with no "What Happens Next?" card (Test 20 A/B 100052695 active, not paused)');
    const card1 = page.locator(SEL.card).first();
    await card1.scrollIntoViewIfNeeded();
    await card1.locator(SEL.thumb).click();
    const v12 = card1.locator(SEL.video);
    await expect.poll(() => v12.evaluate((el) => el.currentTime), { timeout: 30000, message: 'Test 12 card 1 playing before opening Test 20 modal' }).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator(SEL.t20Trigger).click();
    await page.locator('.cre-t-20-video-thumbnail-container').click();
    await page.waitForTimeout(4000);
    const st = await page.evaluate(() => ({
      t20Playing: !document.getElementById('cre-t-20-video-player').paused,
      t20Time: document.getElementById('cre-t-20-video-player').currentTime,
      t12Playing: !document.querySelector('.buckfire-12-video').paused,
    }));
    ti.annotations.push({ type: 'state', description: JSON.stringify(st) });
    await page.screenshot({ path: path.join(SHOT_DIR, `interaction-${slug(ti.project.name)}-both-videos.png`) });
    expect(st.t20Playing && st.t12Playing, 'Test 12 card video keeps playing behind Test 20 modal (two audio tracks)').toBeFalsy();
  });

  test('a11y: play control is keyboard reachable with an accessible name (prior BUG-03)', async ({ page }) => {
    await open(page, url);
    const a = await page.locator(SEL.play).first().evaluate((el) => ({ tag: el.tagName, tabIndex: el.tabIndex, role: el.getAttribute('role'), label: el.getAttribute('aria-label') }));
    expect(a.tag === 'BUTTON' || (a.tabIndex >= 0 && a.role === 'button'), `play control not keyboard-operable: ${JSON.stringify(a)}`).toBeTruthy();
  });

  test('Test 20 case-results heading copy on non-medical pages (baseline content check)', async ({ page }, ti) => {
    const out = [];
    for (const p of PAGES.filter((x) => x.t20)) {
      await open(page, `https://buckfirelaw.com${p.path}${PPC_C}`);
      out.push({ page: p.key, heading: (await baseline(page)).caseHeading });
    }
    ti.annotations.push({ type: 'headings', description: JSON.stringify(out) });
    const wrong = out.filter((o) => o.page !== 'medical-malpractice' && /Medical Negligence/i.test(o.heading || ''));
    expect(wrong, 'Test 20 winner sets "Medical Negligence" heading on non-medical PPC pages').toEqual([]);
  });
});

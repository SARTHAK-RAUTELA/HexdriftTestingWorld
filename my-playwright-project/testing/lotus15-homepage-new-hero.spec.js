// Lotus Car Rental — Test 15 — Homepage — New hero (Convert exp 100052950)
// Control 1000257620 / V1 1000257621 (static background image, lotus_test_15_B) / V2 1000257622 (video, lotus_test_15_C)
// Expected values come from the wireframes (Control.png / Variant 1 / Variant 2), not from the code.
// Run per project (memory): npx playwright test testing/lotus15-homepage-new-hero.spec.js --project="Chrome Desktop"
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EXP = '100052950';
const BASE = 'https://www.lotuscarrental.is/';
const ARMS = [
  { key: 'control', id: '1000257620', p: null },
  { key: 'v1', id: '1000257621', p: 'lotus_test_15_B', mode: 'image' },
  { key: 'v2', id: '1000257622', p: 'lotus_test_15_C', mode: 'video' },
];
const SHOT_ROOT = path.join(__dirname, '..', '..', 'local_testing', 'Local2', 'lotus15-screenshots');

const COPY = {
  h1: 'Your Iceland Adventure Starts Here',
  desc: "Whether you're driving the Ring Road, exploring the Highlands, or camping under the midnight sun, we'll help you choose the right rental car to explore all that Iceland has to offer.",
  usps: ['Locally Owned', 'Free Wifi', '24/7 Support', 'No Hidden Fees'],
  cta: 'Search Now',
  rating: 'Rated 4.7 with 3,864 reviews',
  reviewsTitle: 'Our customers love our friendly staff, easy process, and reliable cars.',
  fleetTitle: 'Locally-owned fleet, built for the Icelandic road',
  planTitle: 'Plan your trip',
  planDesc: 'Everything you need to make the most of Iceland — from route ideas and F-road know-how to the best stops along the Ring Road, straight from a team that actually lives here.',
  // the four posts drawn in the wireframe
  planPosts: [
    'How Many Days Do You Need to Visit Iceland? (2026 Guide)',
    "Campervan vs Car Rental in Iceland: A Local's 2026 Guide",
    'Renting a Car in Iceland with Kids: The Complete Family Road Trip Guide',
    'How to Rent a Car in Iceland: Everything You Need to Know Before You Book',
  ],
  controlH1: 'Start Your Journey with an Iceland Car Rental',
};

const isMobile = (ti) => /Mobile/.test(ti.project.name);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function shot(page, ti, name, opts = {}) {
  const dir = path.join(SHOT_ROOT, slug(ti.project.name));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await (opts.locator || page).screenshot({ path: file, fullPage: !!opts.fullPage });
  await ti.attach(name, { path: file, contentType: 'image/png' });
}
function note(ti, text) { ti.annotations.push({ type: 'observation', description: text }); }

function watchErrors(page) {
  const errs = [];
  // WebKit raises every blocked third-party request / iframe as a pageerror (Clarity, Prismic preview, menni.ai chatbot,
  // Next.js ?_rsc= prefetches) on all arms — browser-level noise, not variation errors
  const NOISE = /due to access control checks|Protocols, domains, and ports must match/;
  page.on('pageerror', (e) => { if (!NOISE.test(e.message)) errs.push(`pageerror: ${e.message}`); });
  page.on('console', (m) => { if (/lotus_test_15/.test(m.text())) errs.push(`console: ${m.text()}`); });
  return errs;
}

async function open(page, arm, url = BASE) {
  await page.goto(`${url}?cro_mode=qa&_conv_eforce=${EXP}.${arm.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((exp) => !!window.convert?.currentData?.experiences?.[exp], EXP, { timeout: 30000 }).catch(() => {});
  if (arm.p) await page.waitForSelector(`#${arm.p}-plan`, { timeout: 25000 }).catch(() => {});
  else await page.waitForTimeout(6000);
  await page.locator('.ch2-allow-all-btn').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(800);
}

// visible text of the hero CTA (desktop draws the new label with ::after on a font-size:0 button)
async function ctaLabel(page) {
  return page.evaluate(() => {
    const vis = (e) => e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
    const b = [...document.querySelectorAll('[data-booking-element="check-fleet-desktop"], [data-booking-element="search-now"]')].find(vis);
    if (!b) return null;
    const after = getComputedStyle(b, '::after').content;
    const fs0 = parseFloat(getComputedStyle(b).fontSize) === 0;
    return { visible: fs0 && after && after !== 'none' ? after.replace(/^"|"$/g, '') : b.innerText.trim(), aria: b.getAttribute('aria-label'), text: b.innerText.trim() };
  });
}

for (const arm of ARMS) {
  test.describe(`${arm.key}`, () => {
    test(`T01 ${arm.key}: arm loads with correct variation code and no variation errors`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await open(page, arm);
      const info = await page.evaluate((exp) => ({
        body: document.body.className,
        var: JSON.stringify(window.convert.currentData.experiences[exp] || {}).match(/"id":"?(\d{10})"?/g),
        exps: Object.keys(window.convert.currentData.experiences || {}),
      }), EXP);
      note(ti, `Body: ${info.body} | co-running Convert experiences: ${info.exps.join(', ')}`);
      if (arm.p) expect(info.body).toContain(arm.p);
      else expect(info.body).not.toMatch(/lotus_test_15_/);
      for (const other of ARMS.filter((a) => a.p && a.p !== arm.p)) expect(info.body).not.toContain(other.p);
      await shot(page, ti, `${arm.key}-T01-fold`);
      await shot(page, ti, `${arm.key}-T01-full-page`, { fullPage: true });
      expect(errs, errs.join('\n')).toEqual([]);
    });

    if (!arm.p) {
      test('T02 control: original homepage unchanged', async ({ page }, ti) => {
        await open(page, arm);
        await expect(page.locator('h1:visible').first()).toHaveText(COPY.controlH1);
        await expect(page.locator('main h2:visible', { hasText: 'Why Lotus?' })).toHaveCount(1);
        await expect(page.locator('main h2:visible', { hasText: 'Before your trip' })).toHaveCount(1);
        await expect(page.locator('[id^="lotus_test_15_"], [class*="lotus_test_15_"]')).toHaveCount(0);
        await expect(page.locator('text=4.8 with 500 000 travelers').first()).toBeVisible();
        await shot(page, ti, 'control-T02-hero', { locator: page.locator('[data-section-name=hero]') });
      });
      return;
    }

    const P = arm.p;

    test(`T02 ${arm.key}: hero heading and description match wireframe; old copy hidden`, async ({ page }, ti) => {
      await open(page, arm);
      await expect(page.locator(`#${P}-hero-heading h1`)).toBeVisible();
      expect(norm(await page.locator(`#${P}-hero-heading h1`).innerText())).toBe(COPY.h1);
      expect(norm(await page.locator(`#${P}-hero-desc p`).innerText())).toBe(COPY.desc);
      await expect(page.locator('h1:visible')).toHaveCount(1);
      await expect(page.locator(`text=${COPY.controlH1}`).locator('visible=true')).toHaveCount(0);
      await shot(page, ti, `${arm.key}-T02-hero`, { locator: page.locator('[data-section-name=hero]') });
    });

    test(`T03 ${arm.key}: 4 USPs with white icons of a consistent size`, async ({ page }, ti) => {
      await open(page, arm);
      const usps = await page.$$eval(`#${P}-hero-usps li`, (lis) => lis.map((li) => {
        const i = li.querySelector('img,svg'); const r = i.getBoundingClientRect();
        return { t: li.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), ok: i.tagName !== 'IMG' || i.naturalWidth > 0, filter: getComputedStyle(i).filter };
      }));
      note(ti, 'USP icon sizes: ' + usps.map((u) => `${u.t} ${u.w}x${u.h}`).join(', '));
      expect(usps.map((u) => u.t)).toEqual(COPY.usps);
      for (const u of usps) { expect(u.ok, `${u.t} icon failed to load`).toBe(true); expect(u.filter).toContain('invert'); }
      await shot(page, ti, `${arm.key}-T03-usps`, { locator: page.locator(`#${P}-hero-usps`) });
      // wireframe draws all four icons at the same ~16px size
      const hs = usps.map((u) => u.h); const ws = usps.map((u) => u.w);
      expect(Math.max(...hs) - Math.min(...hs), `icon heights differ: ${hs}`).toBeLessThanOrEqual(1);
      expect(Math.max(...ws), `icon widths: ${ws}`).toBeLessThanOrEqual(18);
    });

    test(`T04 ${arm.key}: hero background is new ${arm.mode} (not the control image)`, async ({ page }, ti) => {
      await open(page, arm);
      const orig = await page.$eval('[data-hero-element=background] > img, [data-hero-element=background] img:not([class*=lotus_test_15] img)', (i) => i.currentSrc).catch(() => '');
      if (arm.mode === 'image') {
        const img = page.locator(`.${P}-hero-picture img`);
        await expect(img).toHaveCount(1);
        await page.waitForFunction((s) => document.querySelector(s)?.complete, `.${P}-hero-picture img`);
        const src = await img.evaluate((i) => ({ src: i.currentSrc, nw: i.naturalWidth }));
        note(ti, `Control/original hero src: ${orig} | V1 injected src: ${src.src}`);
        await shot(page, ti, `${arm.key}-T04-hero-bg`, { locator: page.locator('[data-section-name=hero]') });
        expect(src.nw).toBeGreaterThan(0);
        expect(src.src.split('?')[0], 'V1 hero shows the same photo as control').not.toBe(orig.split('?')[0]);
      } else {
        const v = page.locator(`.${P}-hero-video`);
        await expect(v, 'video element missing (removed after load error?)').toHaveCount(1);
        const a = await v.evaluate((el) => ({ muted: el.muted, loop: el.loop, inline: el.playsInline, auto: el.autoplay, t: el.currentTime, dur: el.duration, src: el.currentSrc }));
        await page.waitForTimeout(2500);
        const t2 = await v.evaluate((el) => ({ t: el.currentTime, paused: el.paused }));
        note(ti, `Video ${a.src} dur=${a.dur}s t ${a.t.toFixed(1)}→${t2.t.toFixed(1)} paused=${t2.paused}`);
        await shot(page, ti, `${arm.key}-T04-hero-video`, { locator: page.locator('[data-section-name=hero]') });
        expect(a.muted && a.loop && a.inline && a.auto).toBe(true);
        expect(t2.paused).toBe(false);
        expect(t2.t).toBeGreaterThan(a.t);
      }
    });

    test(`T05 ${arm.key}: booking CTA reads "Search Now"`, async ({ page }, ti) => {
      await open(page, arm);
      const c = await ctaLabel(page);
      note(ti, `CTA visible="${c.visible}" DOM text="${c.text}" aria-label=${c.aria}`);
      expect(c.visible).toBe(COPY.cta);
    });

    test(`T06 ${arm.key}: CTA accessible name matches the visible label`, async ({ page }, ti) => {
      await open(page, arm);
      const c = await ctaLabel(page);
      note(ti, `visible="${c.visible}" accessible name="${c.aria || c.text}"`);
      expect(c.aria || c.text, 'screen readers announce a different label (WCAG 2.5.3 label-in-name)').toContain(COPY.cta);
    });

    test(`T07 ${arm.key}: Google rating summary replaces old trust block`, async ({ page }, ti) => {
      await open(page, arm);
      const r = page.locator(`#${P}-hero-rating`);
      await expect(r).toBeVisible();
      expect(norm(await r.innerText())).toBe(COPY.rating);
      await expect(r).toHaveAttribute('href', /maps\.app\.goo\.gl/);
      await expect(r).toHaveAttribute('target', '_blank');
      expect(await r.locator('img').evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
      await expect(page.locator('text=4.8 with 500 000 travelers').locator('visible=true')).toHaveCount(0);
      await expect(page.locator('text=No hidden fees | Free cancellation').locator('visible=true')).toHaveCount(0);
      await shot(page, ti, `${arm.key}-T07-rating`, { locator: r });
    });

    test(`T08 ${arm.key}: review section directly after hero; Why Lotus removed`, async ({ page }, ti) => {
      await open(page, arm);
      const s = page.locator(`#${P}-reviews`);
      await expect(s).toBeVisible();
      expect(norm(await s.locator('h2').innerText())).toBe(COPY.reviewsTitle);
      expect(await s.evaluate((el) => el.previousElementSibling?.getAttribute('data-section-name'))).toBe('hero');
      expect(await s.locator(`.${P}-review`).count()).toBe(14);
      const all = s.locator(`.${P}-reviews__all`);
      await expect(all).toHaveText('See all reviews');
      await expect(all).toHaveAttribute('href', /maps\.app\.goo\.gl/);
      await expect(page.locator('main h2:visible', { hasText: 'Why Lotus?' })).toHaveCount(0);
      await s.scrollIntoViewIfNeeded();
      await shot(page, ti, `${arm.key}-T08-reviews`, { locator: s });
    });

    test(`T09 ${arm.key}: review carousel navigation (arrows/dots/swipe)`, async ({ page }, ti) => {
      await open(page, arm);
      const s = page.locator(`#${P}-reviews`); await s.scrollIntoViewIfNeeded();
      const track = s.locator(`.${P}-reviews__track`);
      const state = () => page.evaluate((p) => {
        const t = document.querySelector(`.${p}-reviews__track`), r = t.getBoundingClientRect();
        const vis = [...t.querySelectorAll(`.${p}-review`)].filter((c) => { const b = c.getBoundingClientRect(); return Math.min(b.right, r.right) - Math.max(b.left, r.left) > b.width * 0.5; }).length;
        const dots = [...document.querySelectorAll(`.${p}-reviews__dot`)];
        return { left: Math.round(t.scrollLeft), vis, dots: dots.length, active: dots.findIndex((d) => d.classList.contains('is-active')),
          prevDis: document.querySelector(`.${p}-reviews__arrow--prev`).disabled };
      }, P);
      const s0 = await state();
      note(ti, `initial: ${JSON.stringify(s0)}`);
      expect(s0.active).toBe(0);
      if (!isMobile(ti)) {
        expect(s0.vis).toBe(4);
        expect(s0.dots).toBe(4);
        expect(s0.prevDis).toBe(true);
        await s.locator(`.${P}-reviews__arrow--next`).click();
        await page.waitForTimeout(1200);
        const s1 = await state(); note(ti, `after next: ${JSON.stringify(s1)}`);
        expect(s1.left).toBeGreaterThan(0); expect(s1.active).toBe(1); expect(s1.prevDis).toBe(false);
        await s.locator(`.${P}-reviews__dot`).nth(3).click();
        await page.waitForTimeout(1200);
        const s2 = await state(); expect(s2.active).toBe(3);
        await shot(page, ti, `${arm.key}-T09-last-page`, { locator: s });
        await s.locator(`.${P}-reviews__arrow--prev`).click(); await page.waitForTimeout(1200);
        expect((await state()).active).toBe(2);
      } else {
        expect(s0.vis).toBe(1);
        expect(s0.dots).toBe(14);
        const box = await track.boundingBox();
        await page.mouse.move(box.x + box.width * 0.8, box.y + 60);
        await track.evaluate((t) => t.scrollBy({ left: t.querySelector('article').offsetWidth + 16, behavior: 'instant' }));
        await page.waitForTimeout(900);
        const s1 = await state(); note(ti, `after swipe: ${JSON.stringify(s1)}`);
        expect(s1.active).toBe(1);
        await shot(page, ti, `${arm.key}-T09-swiped`, { locator: s });
      }
    });

    test(`T10 ${arm.key}: Read more expands / Show less collapses a review`, async ({ page }, ti) => {
      await open(page, arm);
      const s = page.locator(`#${P}-reviews`); await s.scrollIntoViewIfNeeded();
      const btn = s.locator(`.${P}-review__more:visible`).first();
      const card = btn.locator('xpath=..');
      const h0 = (await card.boundingBox()).height;
      await btn.click(); await page.waitForTimeout(400);
      await expect(btn).toHaveText('Show less');
      await expect(btn).toHaveAttribute('aria-expanded', 'true');
      const h1 = (await card.boundingBox()).height;
      await shot(page, ti, `${arm.key}-T10-expanded`, { locator: s });
      expect(h1).toBeGreaterThan(h0);
      await btn.click(); await page.waitForTimeout(400);
      await expect(btn).toHaveText('Read more');
      expect(Math.abs((await card.boundingBox()).height - h0)).toBeLessThanOrEqual(2);
    });

    test(`T11 ${arm.key}: fleet section retitled with grey background`, async ({ page }, ti) => {
      await open(page, arm);
      const f = page.locator('[data-section-name=fleet]');
      await expect(f.locator('h2:visible')).toHaveText([COPY.fleetTitle]);
      expect(await f.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(244, 244, 245)');
      await f.scrollIntoViewIfNeeded();
      await shot(page, ti, `${arm.key}-T11-fleet`, { locator: f });
    });

    test(`T12 ${arm.key}: Plan your trip replaces Before your trip`, async ({ page }, ti) => {
      await open(page, arm);
      const s = page.locator(`#${P}-plan`);
      await expect(s).toBeVisible();
      expect(await s.evaluate((el) => el.previousElementSibling?.getAttribute('data-section-name'))).toBe('fleet');
      expect(norm(await s.locator('h2').innerText())).toBe(COPY.planTitle);
      expect(norm(await s.locator(`.${P}-plan__desc`).innerText())).toBe(COPY.planDesc);
      const cards = await s.locator(`.${P}-plan__card`).evaluateAll((as) => as.map((a) => ({
        href: a.getAttribute('href'), img: a.querySelector('img').src, tags: a.querySelectorAll('[class*=plan__tag]').length,
        read: a.querySelector('[class*=plan__read]').textContent, title: a.querySelector('[class*=plan__title]').textContent })));
      note(ti, 'Live posts: ' + cards.map((c) => c.title).join(' | '));
      expect(cards).toHaveLength(4);
      for (const c of cards) { expect(c.href).toMatch(/^\/blog\/.+/); expect(c.tags).toBeGreaterThan(0); expect(c.read).toMatch(/min read/); }
      await expect(page.locator('main h2:visible', { hasText: 'Before your trip' })).toHaveCount(0);
      await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
      const broken = await s.locator('img').evaluateAll((is) => is.filter((i) => i.complete && i.naturalWidth === 0).length);
      expect(broken).toBe(0);
      await shot(page, ti, `${arm.key}-T12-plan`, { locator: s });
    });

    test(`T13 ${arm.key}: Plan your trip shows the posts drawn in the wireframe`, async ({ page }, ti) => {
      await open(page, arm);
      const titles = (await page.locator(`.${P}-plan__title`).allInnerTexts()).map(norm);
      note(ti, `Live: ${titles.join(' | ')} — Wireframe: ${COPY.planPosts.join(' | ')}`);
      expect(titles).toEqual(COPY.planPosts);
    });

    test(`T14 ${arm.key}: plan card link opens the blog post (SPA) and variation is cleaned up / reapplied on Back`, async ({ page }, ti) => {
      const errs = watchErrors(page);
      await open(page, arm);
      const card = page.locator(`.${P}-plan__card`).first();
      const href = await card.getAttribute('href');
      await card.scrollIntoViewIfNeeded(); await card.click();
      await page.waitForURL((u) => u.pathname === href, { timeout: 20000 });
      await page.waitForTimeout(2000);
      await expect(page.locator(`[id^="${P}-"]`)).toHaveCount(0);
      expect(await page.evaluate((p) => document.body.classList.contains(p), P)).toBe(false);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector(`#${P}-plan`, { timeout: 20000 });
      await page.waitForTimeout(1500);
      for (const id of ['hero-heading', 'hero-desc', 'hero-usps', 'hero-rating', 'reviews', 'plan']) {
        await expect(page.locator(`#${P}-${id}`), `#${P}-${id} after back`).toHaveCount(1);
      }
      await expect(page.locator(`.${P}-hero-media`)).toHaveCount(1);
      await shot(page, ti, `${arm.key}-T14-after-back`);
      expect(errs, errs.join('\n')).toEqual([]);
    });

    test(`T15 ${arm.key}: Search Now still starts the booking flow`, async ({ page }, ti) => {
      await open(page, arm);
      const btn = page.locator('[data-booking-element="check-fleet-desktop"]:visible, [data-booking-element="search-now"]:visible').first();
      await btn.click();
      await page.waitForTimeout(4000);
      note(ti, `URL after click: ${page.url()}`);
      await shot(page, ti, `${arm.key}-T15-after-cta`);
      expect(page.url()).toMatch(/rent-a-car-in-iceland|pickup|dates|cars/i);
    });

    test(`T16 ${arm.key}: FAQ and footer intact, no horizontal overflow`, async ({ page }, ti) => {
      await open(page, arm);
      await expect(page.locator('main h2:visible', { hasText: 'FAQ' }).first()).toBeVisible();
      const q = page.getByText('Do I need a 4×4 in Iceland?').first();
      await q.scrollIntoViewIfNeeded(); await q.click(); await page.waitForTimeout(600);
      await shot(page, ti, `${arm.key}-T16-faq`, { locator: page.locator('main section', { has: page.locator('h2', { hasText: 'FAQ' }) }).first() });
      await expect(page.locator('footer')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    });

    test(`T17 ${arm.key}: variation does not run on the German homepage`, async ({ page }, ti) => {
      await open(page, arm, 'https://www.lotuscarrental.is/de');
      await page.waitForTimeout(3000);
      note(ti, `lang=${await page.evaluate(() => document.documentElement.lang)}`);
      await expect(page.locator(`[id^="${P}-"]`)).toHaveCount(0);
    });

    if (arm.mode === 'video') {
      test('T18 v2: video respects prefers-reduced-motion', async ({ page }, ti) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page, arm);
        await page.waitForTimeout(2000);
        const playing = await page.evaluate((p) => { const v = document.querySelector(`.${p}-hero-video`); return v ? !v.paused : false; }, P);
        note(ti, `reduced-motion user: video playing=${playing} (V1 code skips video for reduce; V2 code has no such guard)`);
        expect(playing).toBe(false);
      });
    }
  });
}

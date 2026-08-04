/**
 * BuckfireLaw_12 (experiment 100052508) — "Client Stories" video carousel
 *
 * Variation adds a Swiper carousel of 6 video testimonial cards after #case-results on
 * /medical-malpractice-lawyers/. Source under test:
 *   local_testing/Local2/variation/v2.js  (246 lines)
 *   local_testing/Local2/variation/v2.css (119 lines)
 *
 * Screenshots -> my-playwright-project/buckfire-12-screenshots/
 *
 * Notes:
 *  - Convert.com force URLs inject reliably in headless (confirmed in recon) — no local injection needed.
 *  - H.264/mp4 playback is not available in every Playwright browser build. Tests that require real
 *    decoding are platform-gated on video.canPlayType('video/mp4') and skip with a logged reason
 *    rather than reporting a false functional failure.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://buckfirelaw.com/medical-malpractice-lawyers/';
const V_URL = `${BASE}?cro_mode=qa&_conv_eforce=100052508.1000256555`;
const C_URL = `${BASE}?cro_mode=qa&_conv_eforce=100052508.1000256554`;

const SEC = '.buckfire-12-client-stories';
const SWIPER = '.buckfire-12-swiper';
const SLIDE = `${SWIPER} .swiper-slide`;
const OUT_DIR = path.join(__dirname, '..', 'buckfire-12-screenshots');

/** Expected slide data, read off v2.js:65-117 (Cre_12_baseStorySlides). */
const EXPECTED = [
  { name: '– Denise',   video: 'Test12_video2.mp4', thumb: 'thumbnail-1.png', alt: 'Denise video thumbnail',  title: 'Buckfire has a heart for their clients' },
  { name: '– Jessica',  video: 'Test12_video3.mp4', thumb: 'thumbnail-2.png', alt: 'Jessica video thumbnail', title: 'I never felt like I was left alone' },
  { name: '– Alyssa',   video: 'Test12_video1.mp4', thumb: 'thumbnail-3.png', alt: 'Alyssa video thumbnail',  title: 'They took care of everything' },
  { name: '– Denita',   video: 'Test12_video3.mp4', thumb: 'Denita.png',      alt: 'Alyssa video thumbnail',  title: 'They took care of everything' },
  { name: '– mike',     video: 'mike.mp4',          thumb: 'mike.png',        alt: 'Alyssa video thumbnail',  title: 'They took care of everything' },
  { name: '– shaylynn', video: 'shaylynn.mp4',      thumb: 'shaylynn.png',    alt: 'Alyssa video thumbnail',  title: 'They took care of everything' },
];

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

/** Load the variation and wait for the injected carousel + Swiper init to settle. */
async function gotoVariation(page) {
  await page.goto(V_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector(SEC, { timeout: 30000 });
  await page.waitForSelector(`${SLIDE}:nth-child(6)`, { timeout: 30000 });
  // Swiper is loaded from cdnjs then initialised by waitForSwiper() — give it a real window.
  await page.waitForFunction(
    () => typeof window.Swiper !== 'undefined' && !!document.querySelector('.buckfire-12-swiper') && !!document.querySelector('.buckfire-12-swiper').swiper,
    null,
    { timeout: 30000 }
  );
  await page.waitForTimeout(400);
}

/** Can this browser build actually decode the mp4s? */
async function canPlayMp4(page) {
  return page.evaluate(() => {
    const v = document.createElement('video');
    return !!v.canPlayType && v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
  });
}

/** Effective slides-per-view = how many slides sit fully inside the swiper viewport. */
async function visibleSlideCount(page) {
  return page.evaluate((sel) => {
    const sw = document.querySelector(sel);
    const box = sw.getBoundingClientRect();
    return [...sw.querySelectorAll('.swiper-slide')].filter((s) => {
      const r = s.getBoundingClientRect();
      return r.width > 0 && r.left >= box.left - 2 && r.right <= box.right + 2;
    }).length;
  }, SWIPER);
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Control — carousel must be absent', () => {
  test('TC-01/02/03 control has no variation class, no carousel, but #case-results anchor exists', async ({ page }) => {
    await page.goto(C_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#case-results', { timeout: 30000 });
    await page.waitForTimeout(6000); // let any Convert variation that would inject, inject

    await expect.soft(page.locator('body')).not.toHaveClass(/BuckfireLaw_12/);
    await expect.soft(page.locator(SEC)).toHaveCount(0);
    await expect.soft(page.locator(SLIDE)).toHaveCount(0);
    expect(await page.locator('#case-results').count()).toBe(1);
  });
});

test.describe('Variation — structure & injection', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-04 body carries the BuckfireLaw_12 class', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(/BuckfireLaw_12/);
  });

  test('TC-05 exactly one Client Stories section (no duplicate injection)', async ({ page }) => {
    await expect(page.locator(SEC)).toHaveCount(1);
  });

  test('TC-06 section is inserted immediately after #case-results', async ({ page }) => {
    const ok = await page.evaluate(() => {
      const cr = document.querySelector('#case-results');
      return !!cr && !!cr.nextElementSibling &&
        cr.nextElementSibling.classList.contains('buckfire-12-client-stories');
    });
    expect(ok).toBe(true);
  });

  test('TC-07 heading reads "Client Stories"', async ({ page }) => {
    await expect(page.locator(`${SEC} h2`)).toHaveText('Client Stories');
  });

  test('TC-08 renders 6 slides', async ({ page }) => {
    await expect(page.locator(SLIDE)).toHaveCount(6);
  });

  test('TC-09 every slide has video + thumb img + play button', async ({ page }) => {
    await expect(page.locator(`${SLIDE} video.buckfire-12-video`)).toHaveCount(6);
    await expect(page.locator(`${SLIDE} img.buckfire-12-thumb-img`)).toHaveCount(6);
    await expect(page.locator(`${SLIDE} .buckfire-12-play-button`)).toHaveCount(6);
  });

  test('TC-10 all 6 thumbnails actually load (naturalWidth > 0)', async ({ page }) => {
    const widths = await page.$$eval('.buckfire-12-thumb-img', (imgs) => imgs.map((i) => i.naturalWidth));
    expect(widths).toHaveLength(6);
    widths.forEach((w, i) => expect(w, `thumb ${i + 1} naturalWidth`).toBeGreaterThan(0));
  });

  test('TC-11 each slide carries its own video-url and no eager src', async ({ page }) => {
    const rows = await page.$$eval('.buckfire-12-video', (vs) => vs.map((v) => ({
      attr: (v.getAttribute('video-url') || '').split('/').pop(),
      src: v.getAttribute('src'),
      playsinline: v.hasAttribute('playsinline'),
      preload: v.getAttribute('preload'),
    })));
    rows.forEach((r, i) => {
      expect.soft(r.attr, `slide ${i + 1} video-url`).toBe(EXPECTED[i].video);
      expect.soft(r.src, `slide ${i + 1} must be lazy (no src before click)`).toBeNull();
      expect.soft(r.playsinline, `slide ${i + 1} playsinline`).toBe(true);
      expect.soft(r.preload, `slide ${i + 1} preload`).toBe('none');
    });
  });

  test('TC-12 story text matches the v2.js slide data', async ({ page }) => {
    const rows = await page.$$eval('.swiper-slide .buckfire-12-story-content', (els) => els.map((e) => ({
      title: e.querySelector('h3') ? e.querySelector('h3').textContent.trim() : null,
      name: e.querySelector('.buckfire-12-name') ? e.querySelector('.buckfire-12-name').textContent.trim() : null,
    })));
    rows.forEach((r, i) => {
      expect.soft(r.title, `slide ${i + 1} title`).toBe(EXPECTED[i].title);
      expect.soft(r.name, `slide ${i + 1} name`).toBe(EXPECTED[i].name);
    });
  });
});

test.describe('Variation — Swiper carousel behaviour', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-13 Swiper instance initialises and lays the carousel out', async ({ page }) => {
    const state = await page.evaluate(() => {
      const el = document.querySelector('.buckfire-12-swiper');
      return {
        hasInstance: !!(el && el.swiper),
        overflow: el ? getComputedStyle(el).overflow : null,
        wrapperDisplay: getComputedStyle(document.querySelector('.buckfire-12-swiper .swiper-wrapper')).display,
      };
    });
    expect(state.hasInstance, 'element.swiper must exist').toBe(true);
    // v2.css:108 patches overflow because Swiper 6 CSS targets .swiper-container, not .swiper
    expect.soft(state.overflow, 'carousel must clip overflow').toBe('hidden');
    expect.soft(state.wrapperDisplay, 'swiper-wrapper must be flex for slides to lay out').toBe('flex');
  });

  test('TC-14 desktop 1280 shows 3 slides per view', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(700);
    expect(await visibleSlideCount(page)).toBe(3);
  });

  test('TC-15 tablet 800 shows 2 slides per view', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.waitForTimeout(700);
    expect(await visibleSlideCount(page)).toBe(2);
  });

  test('TC-16 mobile 390 shows 1 slide per view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.waitForTimeout(700);
    expect(await visibleSlideCount(page)).toBe(1);
  });

  test('TC-17 next button advances the carousel', async ({ page }) => {
    const before = await page.evaluate(() => document.querySelector('.buckfire-12-swiper').swiper.activeIndex);
    await page.locator('.buckfire-12-swiper-next').click();
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => document.querySelector('.buckfire-12-swiper').swiper.activeIndex);
    expect(after).toBeGreaterThan(before);
  });

  test('TC-18 prev button returns to the previous slide', async ({ page }) => {
    await page.locator('.buckfire-12-swiper-next').click();
    await page.waitForTimeout(700);
    const mid = await page.evaluate(() => document.querySelector('.buckfire-12-swiper').swiper.activeIndex);
    await page.locator('.buckfire-12-swiper-prev').click();
    await page.waitForTimeout(700);
    const back = await page.evaluate(() => document.querySelector('.buckfire-12-swiper').swiper.activeIndex);
    expect(mid).toBeGreaterThan(0);
    expect(back).toBeLessThan(mid);
  });

  test('TC-19 loop:false — prev disabled at the start, next disabled at the end', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    await expect.soft(page.locator('.buckfire-12-swiper-prev')).toHaveClass(/swiper-button-disabled/);
    await page.evaluate(() => document.querySelector('.buckfire-12-swiper').swiper.slideTo(99));
    await page.waitForTimeout(700);
    await expect.soft(page.locator('.buckfire-12-swiper-next')).toHaveClass(/swiper-button-disabled/);
  });

  test('TC-20 nav arrows are visible and sit inside the section', async ({ page }) => {
    await expect.soft(page.locator('.buckfire-12-swiper-prev')).toBeVisible();
    await expect.soft(page.locator('.buckfire-12-swiper-next')).toBeVisible();
    const inside = await page.evaluate(() => {
      const s = document.querySelector('.buckfire-12-client-stories').getBoundingClientRect();
      return ['.buckfire-12-swiper-prev', '.buckfire-12-swiper-next'].map((q) => {
        const r = document.querySelector(q).getBoundingClientRect();
        return r.top >= s.top - 1 && r.bottom <= s.bottom + 1 && r.left >= s.left - 1 && r.right <= s.right + 1;
      });
    });
    expect.soft(inside[0], 'prev arrow within section bounds').toBe(true);
    expect.soft(inside[1], 'next arrow within section bounds').toBe(true);
  });

  test('TC-21 card art box holds its 415/233 aspect ratio', async ({ page }) => {
    const box = await page.locator('.buckfire-12-video-thumb').first().boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    expect(Math.abs(box.width / box.height - 415 / 233)).toBeLessThan(0.12);
  });
});

test.describe('Variation — video load & playback', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-22 clicking play loads that card\'s own src and enables controls', async ({ page }) => {
    const thumb = page.locator('.buckfire-12-video-thumb').first();
    await thumb.locator('.buckfire-12-play-button').click();
    const v = thumb.locator('video.buckfire-12-video');
    await expect(v).toHaveJSProperty('controls', true);
    expect(await v.getAttribute('src')).toContain(EXPECTED[0].video);
  });

  test('TC-23 clicking hides the poster image and the play button', async ({ page }) => {
    const thumb = page.locator('.buckfire-12-video-thumb').first();
    await thumb.locator('.buckfire-12-play-button').click();
    await expect.soft(thumb.locator('.buckfire-12-thumb-img')).toBeHidden();
    await expect.soft(thumb.locator('.buckfire-12-play-button')).toBeHidden();
  });

  test('TC-24 clicking the poster image (not just the button) also starts the video', async ({ page }) => {
    const thumb = page.locator('.buckfire-12-video-thumb').nth(1);
    await thumb.scrollIntoViewIfNeeded();
    await thumb.locator('.buckfire-12-thumb-img').click({ force: true });
    expect(await thumb.locator('video').getAttribute('src')).toContain(EXPECTED[1].video);
  });

  test('TC-25 video actually decodes and plays (currentTime advances)', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: build cannot decode video/mp4 (H.264) — playback gated`);
    const thumb = page.locator('.buckfire-12-video-thumb').first();
    await thumb.locator('.buckfire-12-play-button').click();
    const v = thumb.locator('video');
    await expect.poll(async () => v.evaluate((el) => el.readyState), { timeout: 30000 }).toBeGreaterThanOrEqual(2);
    await expect.poll(async () => v.evaluate((el) => el.paused), { timeout: 15000 }).toBe(false);
    const t1 = await v.evaluate((el) => el.currentTime);
    await page.waitForTimeout(1800);
    const t2 = await v.evaluate((el) => el.currentTime);
    expect(t2, `currentTime advanced ${t1} -> ${t2}`).toBeGreaterThan(t1);
  });

  test('TC-26 metadata loads for every one of the 6 videos', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: build cannot decode video/mp4 (H.264) — playback gated`);
    const results = [];
    for (let i = 0; i < 6; i++) {
      const thumb = page.locator('.buckfire-12-video-thumb').nth(i);
      await thumb.scrollIntoViewIfNeeded();
      await thumb.locator('.buckfire-12-play-button').click({ force: true });
      const v = thumb.locator('video');
      await expect.poll(async () => v.evaluate((el) => el.readyState), { timeout: 30000 }).toBeGreaterThanOrEqual(1);
      results.push(await v.evaluate((el) => ({
        src: (el.currentSrc || '').split('/').pop(),
        duration: el.duration,
        w: el.videoWidth,
        err: el.error ? el.error.code : null,
      })));
    }
    results.forEach((r, i) => {
      expect.soft(r.src, `slide ${i + 1} currentSrc`).toBe(EXPECTED[i].video);
      expect.soft(r.err, `slide ${i + 1} media error code`).toBeNull();
      expect.soft(r.duration, `slide ${i + 1} duration`).toBeGreaterThan(0);
      expect.soft(r.w, `slide ${i + 1} videoWidth`).toBeGreaterThan(0);
    });
  });

  test('TC-27 starting a second video pauses the first (pauseOtherVideos)', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: build cannot decode video/mp4 (H.264) — playback gated`);
    const first = page.locator('.buckfire-12-video-thumb').nth(0);
    const second = page.locator('.buckfire-12-video-thumb').nth(1);

    await first.locator('.buckfire-12-play-button').click();
    await expect.poll(async () => first.locator('video').evaluate((el) => el.paused), { timeout: 20000 }).toBe(false);

    await second.scrollIntoViewIfNeeded();
    await second.locator('.buckfire-12-play-button').click({ force: true });
    await expect.poll(async () => second.locator('video').evaluate((el) => el.paused), { timeout: 20000 }).toBe(false);

    expect(await first.locator('video').evaluate((el) => el.paused), 'first video must be paused').toBe(true);
  });

  test('TC-28 re-clicking a paused video resumes rather than restarting', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: build cannot decode video/mp4 (H.264) — playback gated`);
    const thumb = page.locator('.buckfire-12-video-thumb').first();
    const v = thumb.locator('video');
    await thumb.locator('.buckfire-12-play-button').click();
    await expect.poll(async () => v.evaluate((el) => el.readyState), { timeout: 30000 }).toBeGreaterThanOrEqual(2);
    await page.waitForTimeout(1500);
    await v.evaluate((el) => el.pause());
    const at = await v.evaluate((el) => el.currentTime);
    expect(at).toBeGreaterThan(0);
    await v.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(600);
    expect(await v.evaluate((el) => el.currentTime), 'must not rewind to 0').toBeGreaterThanOrEqual(at - 0.2);
  });
});

test.describe('Variation — accessibility & content quality', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-29 every thumbnail has non-empty alt text', async ({ page }) => {
    const alts = await page.$$eval('.buckfire-12-thumb-img', (i) => i.map((x) => x.getAttribute('alt')));
    alts.forEach((a, i) => expect.soft(a, `slide ${i + 1} alt`).toBeTruthy());
  });

  test('TC-30 alt text names the person actually shown on the card', async ({ page }) => {
    const rows = await page.$$eval('.swiper-slide', (ss) => ss.map((s) => ({
      alt: s.querySelector('.buckfire-12-thumb-img') ? s.querySelector('.buckfire-12-thumb-img').getAttribute('alt') : '',
      name: (s.querySelector('.buckfire-12-name') ? s.querySelector('.buckfire-12-name').textContent : '').replace(/^[–-]\s*/, '').trim(),
    })));
    rows.forEach((r, i) => {
      expect.soft(String(r.alt).toLowerCase(), `slide ${i + 1} alt "${r.alt}" should reference "${r.name}"`)
        .toContain(r.name.toLowerCase());
    });
  });

  test('TC-31 play control is reachable and operable by keyboard', async ({ page }) => {
    const info = await page.evaluate(() => {
      const b = document.querySelector('.buckfire-12-play-button');
      return { tag: b.tagName, tabIndex: b.tabIndex, role: b.getAttribute('role'), label: b.getAttribute('aria-label') };
    });
    expect.soft(info.tabIndex, 'play button must be focusable').toBeGreaterThanOrEqual(0);
    expect.soft(info.role || (info.tag === 'BUTTON' ? 'button' : null), 'play button needs a button role').toBe('button');
    expect.soft(info.label, 'play button needs an accessible name').toBeTruthy();
  });

  test('TC-32 story titles are unique (no duplicated placeholder copy)', async ({ page }) => {
    const titles = await page.$$eval('.buckfire-12-story-content h3', (h) => h.map((x) => x.textContent.trim()));
    expect(new Set(titles).size, `titles: ${JSON.stringify(titles)}`).toBe(titles.length);
  });

  test('TC-33 each card plays a distinct video (no reused clips)', async ({ page }) => {
    const urls = await page.$$eval('.buckfire-12-video', (v) => v.map((x) => x.getAttribute('video-url')));
    expect(new Set(urls).size, `video-urls: ${JSON.stringify(urls.map((u) => u.split('/').pop()))}`).toBe(urls.length);
  });

  test('TC-34 client names are properly capitalised', async ({ page }) => {
    const names = await page.$$eval('.buckfire-12-name', (n) => n.map((x) => x.textContent.replace(/^[–-]\s*/, '').trim()));
    names.forEach((n) => expect.soft(/^[A-Z]/.test(n), `name "${n}" should start uppercase`).toBe(true));
  });

  test('TC-35 variation raises no page errors', async ({ page }) => {
    const bad = [];
    page.on('pageerror', (e) => bad.push(String(e)));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector(SEC, { timeout: 30000 });
    await page.waitForTimeout(3000);
    expect(bad.filter((b) => /buckfire|BuckfireLaw_12|Swiper/i.test(b))).toEqual([]);
  });
});

test.describe('Screenshots', () => {
  test('capture desktop + mobile + playing states', async ({ page }, testInfo) => {
    ensureOutDir();
    const tag = testInfo.project.name.replace(/[^\w]+/g, '-');
    await gotoVariation(page);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(700);
    await page.locator(SEC).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator(SEC).screenshot({ path: path.join(OUT_DIR, `v2-desktop-1280-${tag}.png`) });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(700);
    await page.locator(SEC).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator(SEC).screenshot({ path: path.join(OUT_DIR, `v2-mobile-390-${tag}.png`) });

    // playing state (best effort — gated builds capture the poster instead)
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    const thumb = page.locator('.buckfire-12-video-thumb').first();
    await thumb.scrollIntoViewIfNeeded();
    await thumb.locator('.buckfire-12-play-button').click({ force: true });
    await page.waitForTimeout(3000);
    await page.locator(SEC).screenshot({ path: path.join(OUT_DIR, `v2-playing-${tag}.png`) });
  });
});

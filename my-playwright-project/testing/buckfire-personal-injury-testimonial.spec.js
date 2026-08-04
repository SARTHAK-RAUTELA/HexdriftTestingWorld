/**
 * BuckfireLaw — experiment 100052509 — testimonial video card on an internal page
 * Target: https://buckfirelaw.com/case-types/personal-injury/
 *
 * Adds a single video-testimonial card into the right sidebar column, immediately above
 * the "How can we help you?" form. Source under test:
 *   local_testing/Local2/variation/v2.js   (102 lines)
 *   local_testing/Local2/variation/v2.css  (79 lines)
 *
 * Design reference: Figma screenshot supplied 2026-08-04 (desktop + mobile).
 * Screenshots -> my-playwright-project/buckfire-13-screenshots/
 *
 * NOTE: this experiment reuses the body class `BuckfireLaw_12` from experiment 100052508
 * (the Client Stories carousel) — see the KB entry.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://buckfirelaw.com/case-types/personal-injury/';
const V_URL = `${BASE}?utm_campaign=cre_qa&_conv_eforce=100052509.1000256557`;
const C_URL = `${BASE}?utm_campaign=cre_qa&_conv_eforce=100052509.1000256556`;

const CARD = '.testimonial-card';
const MEDIA = '.testimonial-card__media';
const THUMB = '.testimonial-card__thumb';
const VIDEO = '.testimonial-card__video-el';
const SIDEBAR = '.page-parent.page-child .section .blog-sidebar';
const OUT_DIR = path.join(__dirname, '..', 'buckfire-13-screenshots');

/** Values transcribed from the supplied Figma + v2.css. */
const FIGMA = {
  title: 'Buckfire has a heart for their clients',
  quote: '"If I could scream to the mountain tops that Buckfire Law is an amazing law firm, I would."',
  author: "-Denise's",
  alt: "Denise's testimonial video thumbnail",
  accent: 'rgb(211, 121, 53)',   // #D37935
  bodyText: 'rgb(54, 55, 55)',   // #363737
  titleSize: '24px',
  quoteSize: '14px',
  ratio: 428 / 240,
  maxWidth: 428,
  video: 'Test12_video2.mp4',
  thumb: 'thumbnail_4.png',
};

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function gotoVariation(page) {
  await page.goto(V_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector(CARD, { timeout: 30000 });
  await page.waitForFunction(
    (s) => { const i = document.querySelector(s); return i && i.complete && i.naturalWidth > 0; },
    THUMB, { timeout: 30000 }
  );
}

async function canPlayMp4(page) {
  return page.evaluate(() => {
    const v = document.createElement('video');
    return !!v.canPlayType && v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
  });
}

/** Click the poster to start playback (the only clickable affordance — see BUG-01). */
async function startVideo(page) {
  await page.locator(THUMB).scrollIntoViewIfNeeded();
  await page.locator(THUMB).click({ force: true });
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Control — card must be absent', () => {
  test('TC-01 control has no variation class and no testimonial card', async ({ page }) => {
    await page.goto(C_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector(SIDEBAR, { timeout: 30000 });
    await page.waitForTimeout(6000);
    await expect.soft(page.locator('body')).not.toHaveClass(/BuckfireLaw_12/);
    await expect.soft(page.locator(CARD)).toHaveCount(0);
    expect(await page.locator(SIDEBAR).count(), 'sidebar anchor must exist on control').toBe(1);
  });
});

test.describe('Variation — injection & placement', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-02 body carries the variation class', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass(/BuckfireLaw_12/);
  });

  test('TC-03 exactly one card (dedup guard holds)', async ({ page }) => {
    await expect(page.locator(CARD)).toHaveCount(1);
  });

  test('TC-04 card is the element immediately before .blog-sidebar', async ({ page }) => {
    const nextCls = await page.evaluate(() => {
      const c = document.querySelector('.testimonial-card');
      return c && c.nextElementSibling ? c.nextElementSibling.className : null;
    });
    expect(nextCls, `next sibling was "${nextCls}"`).toContain('blog-sidebar');
  });

  test('TC-05 card sits in the right sidebar column, above the form', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    const geo = await page.evaluate((sb) => {
      const c = document.querySelector('.testimonial-card').getBoundingClientRect();
      const s = document.querySelector(sb).getBoundingClientRect();
      return { cx: Math.round(c.x), cy: Math.round(c.y), cw: Math.round(c.width), sx: Math.round(s.x), sy: Math.round(s.y), sw: Math.round(s.width) };
    }, SIDEBAR);
    expect.soft(Math.abs(geo.cx - geo.sx), 'card left-aligns with sidebar column').toBeLessThan(6);
    expect.soft(Math.abs(geo.cw - geo.sw), 'card matches sidebar column width').toBeLessThan(12);
    expect(geo.cy, 'card must render above the form').toBeLessThan(geo.sy);
  });

  test('TC-06 card is in the right-hand column, not the main content column', async ({ page }) => {
    const parentCls = await page.evaluate(() => document.querySelector('.testimonial-card').parentElement.className);
    expect(parentCls, `parent was "${parentCls}"`).toMatch(/col-(md|lg)-/);
  });

  test('TC-07 card contains video element, poster image and body copy', async ({ page }) => {
    await expect.soft(page.locator(`${CARD} ${VIDEO}`)).toHaveCount(1);
    await expect.soft(page.locator(`${CARD} ${THUMB}`)).toHaveCount(1);
    await expect.soft(page.locator(`${CARD} .testimonial-card__title`)).toHaveCount(1);
    await expect.soft(page.locator(`${CARD} .testimonial-card__quote`)).toHaveCount(1);
    await expect.soft(page.locator(`${CARD} .testimonial-card__author`)).toHaveCount(1);
  });

  test('TC-08 poster image loads from the CDN', async ({ page }) => {
    const img = await page.locator(THUMB).evaluate((i) => ({ w: i.naturalWidth, src: i.src.split('/').pop() }));
    expect.soft(img.w, 'poster naturalWidth').toBeGreaterThan(0);
    expect.soft(img.src).toBe(FIGMA.thumb);
  });

  test('TC-09 video is lazy — no src before interaction, preload=none, playsinline', async ({ page }) => {
    const v = await page.locator(VIDEO).evaluate((el) => ({
      src: el.getAttribute('src'),
      preload: el.getAttribute('preload'),
      playsinline: el.hasAttribute('playsinline'),
      display: getComputedStyle(el).display,
    }));
    expect.soft(v.src, 'no src before click').toBeNull();
    expect.soft(v.preload).toBe('none');
    expect.soft(v.playsinline).toBe(true);
    expect.soft(v.display, 'video hidden until played').toBe('none');
  });
});

test.describe('Variation — content vs Figma', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-10 title matches the design', async ({ page }) => {
    await expect(page.locator('.testimonial-card__title')).toHaveText(FIGMA.title);
  });

  test('TC-11 quote matches the design', async ({ page }) => {
    const q = await page.locator('.testimonial-card__quote').evaluate((e) => e.textContent.replace(/\s+/g, ' ').trim());
    expect(q).toBe(FIGMA.quote);
  });

  test('TC-12 attribution matches the design', async ({ page }) => {
    const a = await page.locator('.testimonial-card__author').evaluate((e) => e.textContent.trim());
    expect(a).toBe(FIGMA.author);
  });

  test('TC-13 attribution is a plain name, not a possessive', async ({ page }) => {
    const a = await page.locator('.testimonial-card__author').evaluate((e) => e.textContent.trim());
    expect(a, `attribution reads "${a}" — possessive apostrophe looks like a copy slip`).not.toMatch(/'s$/);
  });

  test('TC-14 poster has descriptive alt text', async ({ page }) => {
    const alt = await page.locator(THUMB).getAttribute('alt');
    expect.soft(alt).toBeTruthy();
    expect.soft(alt).toBe(FIGMA.alt);
  });
});

test.describe('Variation — styling vs Figma', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-15 title uses the brand accent at 24px/600', async ({ page }) => {
    const t = page.locator('.testimonial-card__title');
    await expect.soft(t).toHaveCSS('color', FIGMA.accent);
    await expect.soft(t).toHaveCSS('font-size', FIGMA.titleSize);
    await expect.soft(t).toHaveCSS('font-weight', '600');
    await expect.soft(t).toHaveCSS('line-height', '36px');
  });

  test('TC-16 quote styling matches', async ({ page }) => {
    const q = page.locator('.testimonial-card__quote');
    await expect.soft(q).toHaveCSS('color', FIGMA.bodyText);
    await expect.soft(q).toHaveCSS('font-size', FIGMA.quoteSize);
    await expect.soft(q).toHaveCSS('line-height', '20px');
    await expect.soft(q).toHaveCSS('text-align', 'center');
  });

  test('TC-17 attribution is italic', async ({ page }) => {
    const a = page.locator('.testimonial-card__author');
    await expect.soft(a).toHaveCSS('font-style', 'italic');
    await expect.soft(a).toHaveCSS('font-size', FIGMA.quoteSize);
  });

  test('TC-18 body has accent borders on 3 sides and none on top', async ({ page }) => {
    const b = page.locator('.testimonial-card__body');
    await expect.soft(b).toHaveCSS('border-left-color', FIGMA.accent);
    await expect.soft(b).toHaveCSS('border-right-color', FIGMA.accent);
    await expect.soft(b).toHaveCSS('border-bottom-color', FIGMA.accent);
    await expect.soft(b).toHaveCSS('border-top-width', '0px');
  });

  test('TC-19 body content is centre-aligned', async ({ page }) => {
    const b = page.locator('.testimonial-card__body');
    await expect.soft(b).toHaveCSS('text-align', 'center');
    await expect.soft(b).toHaveCSS('align-items', 'center');
  });

  test('TC-20 media box holds the 428:240 ratio from the design', async ({ page }) => {
    const box = await page.locator(MEDIA).boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(Math.abs(box.width / box.height - FIGMA.ratio)).toBeLessThan(0.06);
  });

  test('TC-21 card never exceeds its 428px design width', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.waitForTimeout(400);
    const w = (await page.locator(CARD).boundingBox()).width;
    expect(w).toBeLessThanOrEqual(FIGMA.maxWidth + 1);
  });
});

test.describe('Variation — play affordance (Figma)', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  /**
   * The Figma's orange play button is baked into the poster artwork (thumbnail_4.png) rather than
   * rendered as an element — verified by comparing the idle and playing screenshots: the button
   * disappears once the poster is swapped out, and the DOM has no play-button element, no <svg> and
   * no author pseudo-element. That is a valid implementation, but it means the visible affordance
   * lives entirely in the image, so the poster loading is what this test really has to protect.
   */
  test('TC-22 play affordance is present — poster artwork carries the button', async ({ page }) => {
    const probe = await page.evaluate(() => {
      const media = document.querySelector('.testimonial-card__media');
      const thumb = document.querySelector('.testimonial-card__thumb');
      // Firefox reports content:"-moz-alt-content" on an <img>::before (internal alt-text
      // rendering) — not author content, so excluding it avoids a false pass here.
      const IGNORED = ['none', 'normal', '-moz-alt-content', '""', "''"];
      const pseudo = (el, p) => {
        const c = getComputedStyle(el, p).content;
        return !!c && !IGNORED.includes(c.trim());
      };
      return {
        posterLoaded: thumb.complete && thumb.naturalWidth > 0,
        posterVisible: getComputedStyle(thumb).display !== 'none',
        elements: document.querySelectorAll('.testimonial-card__play-button').length,
        svg: media.querySelectorAll('svg').length,
        authorPseudo: pseudo(media, '::before') || pseudo(media, '::after') || pseudo(thumb, '::after'),
      };
    });
    // The affordance must be visible to the user one way or another.
    expect(
      probe.posterLoaded && probe.posterVisible,
      'poster must load and be visible — it is the only thing carrying the play button'
    ).toBe(true);
    // Documents the mechanism so a future refactor to a real element is a deliberate change.
    expect.soft(probe.elements, 'button is artwork, not a .testimonial-card__play-button element').toBe(0);
    expect.soft(probe.svg, 'button is artwork, not an inline <svg>').toBe(0);
    expect.soft(probe.authorPseudo, 'button is artwork, not a CSS pseudo-element').toBe(false);
  });

  test('TC-22b .testimonial-card__play-button selector in v2.js is dead code', async ({ page }) => {
    // v2.js references this class at :55 (playBtn lookup) and :76 (click delegation). Nothing
    // renders it, so the second half of the live() selector can never match and playBtn is always
    // null. Harmless today, but misleading — either render the element or drop the references.
    const n = await page.locator('.testimonial-card__play-button').count();
    expect(n, 'no element carries this class, so both v2.js references are inert').toBe(0);
  });

  test('TC-23 poster shows a pointer cursor so it reads as clickable', async ({ page }) => {
    await expect(page.locator(MEDIA)).toHaveCSS('cursor', 'pointer');
  });
});

test.describe('Variation — video load & playback', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-24 clicking the poster assigns the src and enables controls', async ({ page }) => {
    await startVideo(page);
    const v = page.locator(VIDEO);
    await expect(v).toHaveJSProperty('controls', true);
    expect(await v.getAttribute('src')).toContain(FIGMA.video);
  });

  test('TC-25 clicking swaps poster out and video in', async ({ page }) => {
    await startVideo(page);
    await expect.soft(page.locator(THUMB)).toBeHidden();
    await expect.soft(page.locator(VIDEO)).toBeVisible();
  });

  test('TC-26 video decodes and actually plays (currentTime advances)', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: cannot decode video/mp4 (H.264) — playback gated`);
    await startVideo(page);
    const v = page.locator(VIDEO);
    await expect.poll(async () => v.evaluate((el) => el.readyState), { timeout: 40000 }).toBeGreaterThanOrEqual(2);
    await expect.poll(async () => v.evaluate((el) => el.paused), { timeout: 15000 }).toBe(false);
    const t1 = await v.evaluate((el) => el.currentTime);
    await page.waitForTimeout(2000);
    const t2 = await v.evaluate((el) => el.currentTime);
    expect(t2, `currentTime advanced ${t1} -> ${t2}`).toBeGreaterThan(t1);
  });

  test('TC-27 video metadata resolves with no media error', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: cannot decode video/mp4 (H.264) — playback gated`);
    await startVideo(page);
    const v = page.locator(VIDEO);
    await expect.poll(async () => v.evaluate((el) => el.readyState), { timeout: 40000 }).toBeGreaterThanOrEqual(1);
    const meta = await v.evaluate((el) => ({
      src: (el.currentSrc || '').split('/').pop(),
      duration: el.duration,
      w: el.videoWidth,
      err: el.error ? el.error.code : null,
    }));
    expect.soft(meta.src).toBe(FIGMA.video);
    expect.soft(meta.err, 'MediaError code').toBeNull();
    expect.soft(meta.duration, 'duration').toBeGreaterThan(0);
    expect.soft(meta.w, 'videoWidth').toBeGreaterThan(0);
  });

  test('TC-28 video fills the media box once playing', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: cannot decode video/mp4 (H.264) — playback gated`);
    await startVideo(page);
    await expect.poll(async () => page.locator(VIDEO).evaluate((el) => el.readyState), { timeout: 40000 }).toBeGreaterThanOrEqual(2);
    const mb = await page.locator(MEDIA).boundingBox();
    const vb = await page.locator(VIDEO).boundingBox();
    expect.soft(Math.abs(mb.width - vb.width), 'video width matches media box').toBeLessThan(3);
    expect.soft(Math.abs(mb.height - vb.height), 'video height matches media box').toBeLessThan(3);
  });

  test('TC-29 re-clicking the region does not reset playback to 0', async ({ page }, testInfo) => {
    test.skip(!(await canPlayMp4(page)), `${testInfo.project.name}: cannot decode video/mp4 (H.264) — playback gated`);
    await startVideo(page);
    const v = page.locator(VIDEO);
    await expect.poll(async () => v.evaluate((el) => el.readyState), { timeout: 40000 }).toBeGreaterThanOrEqual(2);
    await page.waitForTimeout(1800);
    const at = await v.evaluate((el) => el.currentTime);
    expect(at).toBeGreaterThan(0);
    await v.click({ position: { x: 4, y: 4 }, force: true });
    await page.waitForTimeout(500);
    expect(await v.evaluate((el) => el.currentTime), 'must not rewind to 0').toBeGreaterThanOrEqual(at - 0.3);
  });
});

test.describe('Variation — responsive', () => {
  test('TC-30 mobile 390 — card visible, fits viewport, ratio held', async ({ page }) => {
    await gotoVariation(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(700);
    await page.locator(CARD).scrollIntoViewIfNeeded();
    await expect.soft(page.locator(CARD)).toBeVisible();
    const box = await page.locator(CARD).boundingBox();
    const mb = await page.locator(MEDIA).boundingBox();
    expect.soft(box.width, 'card must not overflow mobile viewport').toBeLessThanOrEqual(390);
    expect.soft(Math.abs(mb.width / mb.height - FIGMA.ratio), 'ratio holds on mobile').toBeLessThan(0.06);
  });

  test('TC-31 tablet 768 — card visible and within viewport', async ({ page }) => {
    await gotoVariation(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(700);
    await page.locator(CARD).scrollIntoViewIfNeeded();
    await expect.soft(page.locator(CARD)).toBeVisible();
    expect((await page.locator(CARD).boundingBox()).width).toBeLessThanOrEqual(768);
  });

  test('TC-32 mobile — video still starts on tap', async ({ page }) => {
    await gotoVariation(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    await startVideo(page);
    expect(await page.locator(VIDEO).getAttribute('src')).toContain(FIGMA.video);
    await expect(page.locator(THUMB)).toBeHidden();
  });
});

test.describe('Variation — accessibility & stability', () => {
  test.beforeEach(async ({ page }) => { await gotoVariation(page); });

  test('TC-33 the video can be started without a mouse', async ({ page }) => {
    const probe = await page.evaluate(() => {
      const media = document.querySelector('.testimonial-card__media');
      const thumb = document.querySelector('.testimonial-card__thumb');
      const btn = document.querySelector('.testimonial-card__play-button');
      const focusable = (el) => !!el && (el.tabIndex >= 0 || ['A', 'BUTTON'].includes(el.tagName));
      return {
        anyFocusable: focusable(media) || focusable(thumb) || focusable(btn),
        mediaTabIndex: media.tabIndex,
        thumbTabIndex: thumb.tabIndex,
        mediaRole: media.getAttribute('role'),
        ariaLabel: media.getAttribute('aria-label'),
      };
    });
    expect.soft(probe.anyFocusable,
      `nothing in the card is keyboard-focusable (media tabIndex=${probe.mediaTabIndex}, thumb tabIndex=${probe.thumbTabIndex})`
    ).toBe(true);
    expect.soft(probe.mediaRole || null, 'clickable media needs a button role').toBe('button');
    expect.soft(probe.ariaLabel, 'clickable media needs an accessible name').toBeTruthy();
  });

  test('TC-34 title is a heading in the document outline', async ({ page }) => {
    const tag = await page.locator('.testimonial-card__title').evaluate((e) => e.tagName);
    expect(tag).toMatch(/^H[1-6]$/);
  });

  test('TC-35 variation raises no page errors', async ({ page }) => {
    const bad = [];
    page.on('pageerror', (e) => bad.push(String(e)));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector(CARD, { timeout: 30000 });
    await page.waitForTimeout(3000);
    expect(bad.filter((b) => /testimonial|BuckfireLaw/i.test(b))).toEqual([]);
  });
});

test.describe('Screenshots', () => {
  test('capture desktop + mobile + playing states', async ({ page }, testInfo) => {
    ensureOutDir();
    const tag = testInfo.project.name.replace(/[^\w]+/g, '-');
    await gotoVariation(page);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(700);
    await page.locator(CARD).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator(CARD).screenshot({ path: path.join(OUT_DIR, `v2-card-desktop-${tag}.png`) });

    // wider context shot showing placement above the form
    await page.screenshot({ path: path.join(OUT_DIR, `v2-context-desktop-${tag}.png`) });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(700);
    await page.locator(CARD).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator(CARD).screenshot({ path: path.join(OUT_DIR, `v2-card-mobile-390-${tag}.png`) });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    await startVideo(page);
    await page.waitForTimeout(4000);
    await page.locator(CARD).screenshot({ path: path.join(OUT_DIR, `v2-card-playing-${tag}.png`) });
  });
});

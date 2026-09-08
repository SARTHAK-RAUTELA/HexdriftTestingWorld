// @ts-check
/**
 * BuckfireLaw exp. 100052508 — "Client Stories" video-testimonial section, rolled out
 * data-per-page across the homepage + 12 PPC landing pages (QA Test 12).
 *
 * Section under test (confirmed via live DOM 2026-09-07):
 *   <section class="buckfire-12-client-stories">
 *     <h2>Client Stories</h2>
 *     <div class="buckfire-12-stories-grid">   3-up grid, 1 col <721px / 2 col 721-1099 / 3 col >=1100
 *       <div class="buckfire-12-story-card">
 *         <div class="buckfire-12-video-thumb">
 *           <video class="buckfire-12-video" video-url="...mp4" preload="none">
 *           <img class="buckfire-12-thumb-img" alt="{Name} video thumbnail">
 *           <div class="buckfire-12-play-button">
 *         <div class="buckfire-12-story-content">
 *           <h3>...</h3>              <- CSS-hidden (display:none), not the visible headline
 *           <p>"quote..."</p>         <- the visible quote
 *           <span class="buckfire-12-name">– Name</span>
 *
 * video-url is lazy: empty until the thumb is clicked, then the video plays inline with
 * native controls. Body carries both `BuckfireLaw_12` and an unrelated `cre-t-21` (a modal
 * component sharing this rollout) — cre-t-21 is out of scope for this spec.
 *
 * Force URL: same `cro_mode=qa&_conv_eforce=100052508.1000256555` param works on every PPC
 * page (confirmed live on /medical-malpractice-lawyers/); homepage uses a separate
 * experiment id, `_conv_eforce=100052748.1000257125`.
 *
 * Client → quote mapping supplied by the client/ticket (2026-09-07). Order matters per page —
 * it's hand-mapped per-page content, the highest bug risk in this rollout.
 */
const { test, expect } = require('@playwright/test');

const PPC_URL_PARAMS = '?cro_mode=qa&_conv_eforce=100052508.1000256555';
const HOME_URL_PARAMS = '?cro_mode=qa&_conv_eforce=100052748.1000257125';

const PAGES = [
  { key: 'Homepage', url: `https://buckfirelaw.com/${HOME_URL_PARAMS}`, clients: ['Shaylynn', 'Denita', 'Mike'] },
  { key: 'Medical Malpractice', url: `https://buckfirelaw.com/medical-malpractice-lawyers/${PPC_URL_PARAMS}`, clients: ['Denise', 'Shaylynn', 'Mike'] },
  { key: 'Dog Bite', url: `https://buckfirelaw.com/dog-bite-lawyer/${PPC_URL_PARAMS}`, clients: ['Jessica', 'Alyssa', 'Denita'] },
  { key: 'Slip & Fall (lawyers)', url: `https://buckfirelaw.com/slip-and-fall-lawyers/${PPC_URL_PARAMS}`, clients: ['Jessica', 'Alyssa', 'Denita'] },
  { key: 'Slip & Fall (attorneys)', url: `https://buckfirelaw.com/slip-and-fall-attorneys/${PPC_URL_PARAMS}`, clients: ['Damian', 'Alyssa', 'Denita'] },
  { key: 'Free Case Review', url: `https://buckfirelaw.com/free-case-review/${PPC_URL_PARAMS}`, clients: ['Shaylynn', 'Mike', 'Denita'] },
  { key: 'Car Accident', url: `https://buckfirelaw.com/car-accident-lawyers/${PPC_URL_PARAMS}`, clients: ['Denita', 'Damian', 'Mike'] },
  { key: 'Personal Injury', url: `https://buckfirelaw.com/personal-injury-lawyer/${PPC_URL_PARAMS}`, clients: ['Mike', 'Shaylynn', 'Denise'] },
  { key: 'Bike Accident', url: `https://buckfirelaw.com/bicycle-accident-lawyer/${PPC_URL_PARAMS}`, clients: ['Mike', 'Jessica', 'Denita'] },
  { key: 'Wrongful Death', url: `https://buckfirelaw.com/wrongful-death-lawyer/${PPC_URL_PARAMS}`, clients: ['Denita', 'Shaylynn', 'Denise'] },
  { key: 'Nursing Home Abuse', url: `https://buckfirelaw.com/nursing-home-abuse-lawyer/${PPC_URL_PARAMS}`, clients: ['Denise', 'Alyssa', 'Mike'] },
  { key: 'Birth Injury', url: `https://buckfirelaw.com/birth-injury-lawyers/${PPC_URL_PARAMS}`, clients: ['Denise', 'Alyssa', 'Mike'] },
  { key: 'Truck Accidents', url: `https://buckfirelaw.com/truck-accident-lawyers/${PPC_URL_PARAMS}`, clients: ['Denita', 'Mike', 'Damian'] },
];

// Quotes as supplied by the client (typographic quotes normalised for comparison — see normalizeText()).
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
  grid: '.buckfire-12-stories-grid',
  card: '.buckfire-12-story-card',
  thumb: '.buckfire-12-video-thumb',
  video: '.buckfire-12-video',
};

function normalizeText(s) {
  return (s || '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Card attribution is "– Name" (sometimes with a middle initial/surname letter); match on the
// bare first-name key from the ticket rather than requiring an exact string.
function nameMatches(actual, expectedKey) {
  const bare = normalizeText(actual).replace(/^[–-]\s*/, '');
  return bare.toLowerCase().startsWith(expectedKey.toLowerCase());
}

async function getCardData(page) {
  return page.locator(SEL.card).evaluateAll((cards) =>
    cards.map((c) => ({
      name: c.querySelector('.buckfire-12-name')?.textContent?.trim() || '',
      quote: c.querySelector('.buckfire-12-story-content p')?.textContent?.trim() || '',
      videoUrl: c.querySelector('.buckfire-12-video')?.getAttribute('video-url') || '',
      posterAlt: c.querySelector('.buckfire-12-thumb-img')?.getAttribute('alt') || '',
      posterSrc: c.querySelector('.buckfire-12-thumb-img')?.getAttribute('src') || '',
    }))
  );
}

for (const pg of PAGES) {
  test.describe(`Buckfire Test 12 - Client Stories - ${pg.key}`, () => {
    test(`section renders, content mapping matches ticket, videos play, no layout breakage [${pg.key}]`, async ({ page }, testInfo) => {
      const isMobile = /mobile|iphone|pixel/i.test(testInfo.project.name);
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);

      const section = page.locator(SEL.section);
      await expect(section, 'Client Stories section should be present exactly once').toHaveCount(1);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const cards = page.locator(SEL.card);
      await expect(cards, 'exactly 3 story cards expected').toHaveCount(3);

      // ---- content mapping: order, name, quote ----
      const data = await getCardData(page);
      expect(data, `card data extraction failed on ${pg.key}`).toHaveLength(3);

      pg.clients.forEach((expectedClient, i) => {
        const card = data[i];
        expect(
          nameMatches(card.name, expectedClient),
          `card ${i + 1} on ${pg.key}: expected attribution starting with "${expectedClient}", got "${card.name}"`
        ).toBeTruthy();

        const expectedQuote = QUOTES[expectedClient];
        expect(
          normalizeText(card.quote),
          `card ${i + 1} (${expectedClient}) on ${pg.key}: quote text mismatch`
        ).toBe(normalizeText(expectedQuote));

        expect(card.posterAlt.toLowerCase(), `card ${i + 1} (${expectedClient}) on ${pg.key}: poster alt text should mention the client's name`).toContain(expectedClient.toLowerCase());
      });

      // ---- data-integrity: no accidental duplicate video/poster across the 3 cards ----
      const videoUrls = data.map((d) => d.videoUrl);
      const posterSrcs = data.map((d) => d.posterSrc);
      expect(new Set(videoUrls).size, `${pg.key}: two cards share the same video-url (duplicate clip)`).toBe(3);
      expect(new Set(posterSrcs).size, `${pg.key}: two cards share the same poster image`).toBe(3);
      videoUrls.forEach((u) => expect(u, `${pg.key}: empty video-url`).toMatch(/^https:\/\/.+\.mp4$/));

      // ---- mobile: no horizontal overflow, cards stack ----
      if (isMobile) {
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth - clientWidth, `${pg.key} (mobile): page has horizontal overflow`).toBeLessThanOrEqual(2);

        const boxes = await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
        // At <721px the grid is single-column: card 2's top should be at/below card 1's bottom.
        expect(boxes[1].top, `${pg.key} (mobile): cards should stack vertically, not overlap`).toBeGreaterThanOrEqual(boxes[0].top + boxes[0].height - 5);
        expect(boxes[2].top, `${pg.key} (mobile): cards should stack vertically, not overlap`).toBeGreaterThanOrEqual(boxes[1].top + boxes[1].height - 5);
      }

      // ---- video playback: click each thumb, confirm it loads; verify real playback on card 1 ----
      for (let i = 0; i < 3; i++) {
        const thumb = cards.nth(i).locator(SEL.thumb);
        await thumb.click();
        const video = cards.nth(i).locator(SEL.video);

        await expect(async () => {
          const src = await video.getAttribute('src');
          expect(src, `card ${i + 1} (${pg.clients[i]}) on ${pg.key}: clicking the thumb never assigned a video src`).toBeTruthy();
        }).toPass({ timeout: 8000 });

        await expect(async () => {
          const readyState = await video.evaluate((v) => v.readyState);
          expect(readyState, `card ${i + 1} (${pg.clients[i]}) on ${pg.key}: video never loaded (readyState stuck at ${readyState})`).toBeGreaterThanOrEqual(1);
        }).toPass({ timeout: 12000 });

        const err = await video.evaluate((v) => v.error);
        expect(err, `card ${i + 1} (${pg.clients[i]}) on ${pg.key}: MediaError while loading`).toBeNull();

        if (i === 0) {
          // Deeper check on one card per page: confirm it actually advances, not just metadata-loaded.
          await page.waitForTimeout(2500);
          await expect(async () => {
            const currentTime = await video.evaluate((v) => v.currentTime);
            expect(currentTime, `card 1 (${pg.clients[0]}) on ${pg.key}: currentTime never advanced — video may be frozen/not really playing`).toBeGreaterThan(0);
          }).toPass({ timeout: 10000 });
        }
      }

      if (consoleErrors.length) {
        testInfo.annotations.push({ type: 'console-errors', description: consoleErrors.slice(0, 10).join(' | ') });
      }
    });
  });
}

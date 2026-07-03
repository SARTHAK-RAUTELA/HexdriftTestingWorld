// Standalone Playwright audit script for fanorate.com — not a test spec, run directly with node.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { key: 'home', name: 'Homepage', url: 'https://www.fanorate.com/' },
  { key: 'points-table', name: 'Points Table', url: 'https://www.fanorate.com/points-table/' },
  { key: 'previews-today', name: 'Match Previews (Today filter)', url: 'https://www.fanorate.com/category/soccer-2026/match-previews/?s=&when=today&mgroup=&mteam=&orderby=match_date' },
  { key: 'previews', name: 'Match Previews', url: 'https://www.fanorate.com/category/soccer-2026/match-previews/' },
  { key: 'analysis', name: 'Match Analysis', url: 'https://www.fanorate.com/category/soccer-2026/match-analysis/' },
  { key: 'blogs', name: 'Blogs', url: 'https://www.fanorate.com/blogs/' },
  { key: 'schedule', name: 'Schedule', url: 'https://www.fanorate.com/schedule/' },
];

const SCREENSHOT_DIR = path.join(__dirname, 'fanorate-screenshots');
const DATA_DIR = path.join(__dirname, 'fanorate-data');

async function checkLinkStatus(context, url) {
  try {
    const resp = await context.request.get(url, { timeout: 15000, failOnStatusCode: false });
    return resp.status();
  } catch (e) {
    return `ERROR: ${e.message.split('\n')[0]}`;
  }
}

async function auditPage(browser, context, pageInfo) {
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => failedRequests.push({ url: req.url(), failure: req.failure()?.errorText }));

  const result = { ...pageInfo, ok: true };

  try {
    const resp = await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    result.httpStatus = resp ? resp.status() : null;
    await page.waitForTimeout(2500);
    // try networkidle but don't hang forever
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    // Scroll through the page to trigger lazy-loaded images
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let total = 0;
        const distance = 600;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          total += distance;
          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 200);
      });
    });
    await page.waitForTimeout(1500);

    // Screenshot
    const shotPath = path.join(SCREENSHOT_DIR, `${pageInfo.key}-full.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    result.screenshotPath = shotPath;

    // viewport screenshot (above the fold)
    const shotFoldPath = path.join(SCREENSHOT_DIR, `${pageInfo.key}-fold.png`);
    await page.screenshot({ path: shotFoldPath, fullPage: false });
    result.screenshotFoldPath = shotFoldPath;

    // Extract page text content for data comparison
    result.bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');

    // Extract title/meta
    result.title = await page.title();

    // Extract links
    result.links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(a => ({
        text: (a.innerText || a.textContent || '').trim().slice(0, 80),
        href: a.getAttribute('href'),
        absoluteHref: a.href,
        isCTA: /btn|button|cta/i.test(a.className || ''),
        className: a.className || '',
      }));
    });

    // Extract images
    result.images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => {
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        return {
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: Math.round(rect.width),
          displayHeight: Math.round(rect.height),
          objectFit: style.objectFit,
          complete: img.complete,
          loading: img.loading,
        };
      });
    });

    // Extract buttons (non-anchor CTAs)
    result.buttons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
      return btns.map(b => ({
        text: (b.innerText || b.value || '').trim().slice(0, 80),
        disabled: b.disabled,
        className: b.className || '',
      }));
    });

  } catch (e) {
    result.ok = false;
    result.error = e.message;
  }

  result.consoleErrors = consoleErrors.slice(0, 30);
  result.failedRequests = failedRequests.slice(0, 30);

  await page.close();
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  });

  const results = [];
  for (const p of PAGES) {
    console.log(`Auditing: ${p.name} (${p.url})`);
    const r = await auditPage(browser, context, p);
    results.push(r);
    console.log(`  -> status=${r.httpStatus} links=${r.links?.length || 0} images=${r.images?.length || 0}`);
  }

  // Collect unique links across all pages for status-code checking
  const allLinksMap = new Map();
  for (const r of results) {
    for (const l of (r.links || [])) {
      if (!l.absoluteHref || l.absoluteHref.startsWith('javascript:') || l.absoluteHref.startsWith('mailto:') || l.absoluteHref.startsWith('tel:')) continue;
      if (!allLinksMap.has(l.absoluteHref)) allLinksMap.set(l.absoluteHref, { href: l.absoluteHref, foundOn: [] });
      allLinksMap.get(l.absoluteHref).foundOn.push(r.key);
    }
  }

  console.log(`Checking status codes for ${allLinksMap.size} unique links...`);
  const linkChecks = [];
  let count = 0;
  for (const [href, info] of allLinksMap.entries()) {
    count++;
    const status = await checkLinkStatus(context, href);
    linkChecks.push({ href, status, foundOn: info.foundOn });
    if (count % 10 === 0) console.log(`  checked ${count}/${allLinksMap.size}`);
  }

  fs.writeFileSync(path.join(DATA_DIR, 'link-checks.json'), JSON.stringify(linkChecks, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'page-results.json'), JSON.stringify(results, null, 2));

  await browser.close();
  console.log('DONE');
})();

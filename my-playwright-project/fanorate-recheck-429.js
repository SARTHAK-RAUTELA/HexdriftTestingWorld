const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'fanorate-data', 'link-checks.json'), 'utf-8'));
const toRecheck = data.filter(d => d.status === 429 || d.status === 400).map(d => d.href);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  });
  const results = [];
  for (const href of toRecheck) {
    await new Promise(r => setTimeout(r, 1500)); // slow down to avoid WAF rate limit
    try {
      const resp = await context.request.get(href, { timeout: 20000, failOnStatusCode: false });
      results.push({ href, status: resp.status() });
      console.log(href, '->', resp.status());
    } catch (e) {
      results.push({ href, status: `ERROR: ${e.message.split('\n')[0]}` });
      console.log(href, '-> ERROR', e.message.split('\n')[0]);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'fanorate-data', 'link-recheck.json'), JSON.stringify(results, null, 2));
  await browser.close();
  console.log('RECHECK DONE');
})();

'use strict';
const { chromium } = require('@playwright/test');

const VARIATION_URL = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100051999.1000255345';
const CONTROL_URL   = 'https://petinsurancegurus.com/?cro_mode=qa&_conv_eforce=100051999.1000255344';

async function probe(url, label) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await new Promise(r => setTimeout(r, 4000));

  const p = await page.evaluate(() => {
    const r = {};

    // body class
    r.bodyClass = document.body.className;

    // All cre-t-116 related elements
    r.cre116Els = Array.from(document.querySelectorAll('[class*="cre-t-116"]'))
      .map(el => ({
        tag: el.tagName, cls: el.className.substring(0,100),
        text: el.textContent.trim().substring(0,200),
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
      }));

    // Any element with "maximum available deductible"
    r.maxDedEls = Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent.includes('maximum available deductible') && el.children.length <= 3)
      .map(el => ({
        tag: el.tagName, cls: el.className.substring(0,80),
        text: el.textContent.trim().substring(0,300),
        display: window.getComputedStyle(el).display,
      }));

    // Any element with "Firstly"
    r.firstlyEls = Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent.toLowerCase().includes("firstly") && el.children.length <= 3)
      .map(el => ({
        tag: el.tagName, cls: el.className.substring(0,80),
        text: el.textContent.trim().substring(0,300),
        display: window.getComputedStyle(el).display,
      }));

    // Tooltip / inline tooltip on first card
    const firstCard = document.querySelector('[data-unique="outbound-partner-clicks-Lemonade-Listing-Only"]');
    if (firstCard) {
      r.cardTooltipEls = Array.from(firstCard.querySelectorAll('*'))
        .filter(el => el.textContent.trim().length > 20 && el.children.length === 0)
        .map(el => ({
          tag: el.tagName, cls: el.className.substring(0,80),
          text: el.textContent.trim().substring(0,200),
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
        }));
    }

    // Any span.ct-span in card (inline tooltip)
    r.inlineTooltipSpans = Array.from(document.querySelectorAll('.tooltip-container span.ct-span, [class*="tooltip"] span'))
      .map(el => ({
        cls: el.className.substring(0,80),
        text: el.textContent.trim().substring(0,200),
        display: window.getComputedStyle(el).display,
        parentCls: el.parentElement?.className?.substring(0,80),
      }));

    // control var span check
    r.varSpanCount = document.querySelectorAll('span.cre-t-116-price-update').length;
    r.ctSpanCount  = document.querySelectorAll('span.ct-span').length;

    return r;
  });

  console.log(`\n====== ${label} ======`);
  console.log('Body classes:', p.bodyClass.substring(0,200));
  console.log('cre-t-116 span count:', p.varSpanCount, ' | ct-span count:', p.ctSpanCount);
  console.log('\n--- cre-t-116 elements ---');
  p.cre116Els.forEach(el => console.log(JSON.stringify(el)));
  console.log('\n--- "maximum available deductible" elements ---');
  p.maxDedEls.forEach(el => console.log(JSON.stringify(el)));
  console.log('\n--- "firstly" elements ---');
  p.firstlyEls.forEach(el => console.log(JSON.stringify(el)));
  console.log('\n--- inline tooltip spans ---');
  p.inlineTooltipSpans.slice(0,10).forEach(el => console.log(JSON.stringify(el)));
  if (p.cardTooltipEls) {
    console.log('\n--- first card ALL leaf elements ---');
    p.cardTooltipEls.slice(0,20).forEach(el => console.log(JSON.stringify(el)));
  }

  await browser.close();
}

(async () => {
  await probe(VARIATION_URL, 'VARIATION');
  await probe(CONTROL_URL, 'CONTROL');
})().catch(err => { console.error(err); process.exit(1); });

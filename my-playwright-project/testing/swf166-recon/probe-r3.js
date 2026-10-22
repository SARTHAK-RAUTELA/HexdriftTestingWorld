const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1366, height: 800 } })).newPage();
  await page.route(/convertexperiments\.com\/v1\/js\/.*\.js/, async r => { const res = await r.fetch(); let t = await res.text(); t = t.split("window.convert.getUserData().geo.state == 'TX'").join('true'); await r.fulfill({ response: res, body: t }); });
  await page.goto('https://rentersinsurancegurus.com/?cro_mode=qa&_conv_eforce=100052988.1000257708', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const o = await page.evaluate(() => {
    const m = document.querySelector('.oxy-modal-backdrop');
    const t = document.querySelector('[data-unique="comparison-table"]');
    return {
      body: document.body.className,
      modalCount: document.querySelectorAll('.oxy-modal-backdrop').length,
      modalCls: m && m.className, modalDisplay: m && getComputedStyle(m).display,
      modalInner: m && m.innerHTML.replace(/\s+/g, ' ').slice(0, 2500),
      wrappers: document.querySelectorAll('.cre-t-166-image-wrapper').length, strongs: document.querySelectorAll('.cre-t-166-strong-text').length, btns: document.querySelectorAll('.cre-t-166-button-container').length,
      cards: [...t.children].map(c => ({ du: c.getAttribute('data-unique'), links: [...c.querySelectorAll('a')].map(a => [a.className, a.getAttribute('href'), a.getAttribute('target'), a.textContent.trim().slice(0, 30)]) })).slice(0, 3),
      docW: document.documentElement.scrollWidth, vw: innerWidth,
    };
  });
  console.log(JSON.stringify(o, null, 1));
  await b.close();
})();

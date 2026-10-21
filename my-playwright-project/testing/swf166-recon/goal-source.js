// Find which script pushes SWF166 goals 100038330/100038331 on /comparison/; also test /home/ with http->https location fix
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (const [p, fixHttp] of [['/comparison/', false], ['/', false], ['/home/', false], ['/home/', true]]) {
    const page = await (await b.newContext()).newPage();
    await page.route(/convertexperiments\.com\/v1\/js\/.*\.js/, async route => {
      const res = await route.fetch(); let body = await res.text();
      body = body.split("window.convert.getUserData().geo.state == 'TX'").join('true');
      if (fixHttp) body = body.split('http://rentersinsurancegurus.com/home/').join('https://rentersinsurancegurus.com/home/');
      await route.fulfill({ response: res, body });
    });
    await page.goto('https://rentersinsurancegurus.com' + p + '?cro_mode=qa&_conv_eforce=100052988.1000257708', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const r = await page.evaluate(() => {
      const hits = [];
      const orig = window._conv_q.push;
      window._conv_q.push = function (a) { if (Array.isArray(a) && /10003833/.test(a[1])) hits.push(a[1] + ' <- ' + new Error().stack.split('\n').slice(2, 5).join(' / ')); return orig.apply(this, arguments); };
      const el = document.querySelector('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .plan-button-container a');
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      const cd = window.convert.currentData.experiences['100052988'];
      return { url: location.href, bucket: cd && cd.variation.id, body166: document.body.classList.contains('cre-t-166'), hits };
    });
    console.log(p, 'fixHttp=' + fixHttp, JSON.stringify(r, null, 1));
    await page.close();
  }
  await b.close();
})();

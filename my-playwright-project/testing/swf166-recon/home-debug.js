const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  for (const variant of ['asis', 'https']) {
    const page = await (await b.newContext()).newPage();
    const logs = []; page.on('console', m => logs.push(m.text()));
    await page.route(/convertexperiments\.com\/v1\/js\/.*\.js/, async route => {
      const res = await route.fetch(); let body = await res.text();
      body = body.split("window.convert.getUserData().geo.state == 'TX'").join('true');
      if (variant !== 'asis') body = body.split(String.raw`http:\/\/rentersinsurancegurus.com\/home\/`).join(String.raw`https:\/\/rentersinsurancegurus.com\/home\/`);
      await route.fulfill({ response: res, body });
    });
    await page.goto('https://rentersinsurancegurus.com/home/?cro_mode=qa&_conv_eforce=100052988.1000257708&_conv_debug=1', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const r = await page.evaluate(() => ({ loaded: !!window.convert, exps: Object.keys(window.convert.currentData.experiences || {}), locs: window.convert.activeLocations, canon: (document.querySelector('link[rel=canonical]') || {}).href, path: location.pathname }));
    console.log(variant, JSON.stringify(r), '\n  ', logs.filter(l => /100052988|location|12039/i.test(l)).slice(0, 8).join('\n   '));
    await page.close();
  }
  await b.close();
})();

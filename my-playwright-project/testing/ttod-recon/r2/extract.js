// Capture the live Optimizely bundle on the preview URL and check it carries the round-2 va3 code
const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'https://www.thumbtack.com/pro?QA=QA-testing&optimizely_x=5442504495988736&optimizely_force_tracking=true';
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const bodies = [];
  p.on('response', async r => { if (/optimizely/.test(r.url()) && /javascript|json/.test(r.headers()['content-type'] || '')) { try { bodies.push([r.url(), await r.text()]); } catch (e) {} } });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('.bm-two-ways', { timeout: 60000 }); await p.waitForTimeout(4000);
  const all = bodies.map(x => x[1]).join('\n');
  fs.writeFileSync(__dirname + '/live-bundle.js', all);
  console.log('urls', bodies.map(x => x[0].slice(0, 90)));
  for (const k of ['bm_preset_jobs_pro_lp', 'e633b72a9df34774998491e5d4f6934d', 'f9723f4c525749e8a6a135d0537c6b6e', 'd0150460eefd4591ae1b0e80b7e1fb4e', 'bmPresetJobsProLpEvents', 'TextInput_inputStyles', 'minmax(0, 570px)', 'bm-hiw-bar__cta', '73ee393cce64432e88e8e7bdf48adb2f', 'bb2c85b9827a4cf885e048fb4d7d0406'])
    console.log(k, all.split(k).length - 1);
  console.log('page', JSON.stringify(await p.evaluate(() => ({ bm: document.body.className, img: getComputedStyle(document.querySelector('[class*="pro-signup-hero_heroImage"]')).backgroundImage, cards: [...document.querySelectorAll('.bm-two-ways__card img')].map(i => i.src), h1: document.querySelector('[class*="pro-signup-hero_heroTitle"]').innerText }))));
  await b.close();
})();

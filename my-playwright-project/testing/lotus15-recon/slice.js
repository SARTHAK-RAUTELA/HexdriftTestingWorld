const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const dir = 'C:/Users/Sarthak Rautela/Downloads/Test 15 - Homepage - New hero/';
const files = { control: 'Control.png', v1: 'Variant 1 (static background image).png', v2: 'Variant 2 (video background image).png' };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1640, height: 850 } });
  for (const [k, f] of Object.entries(files)) {
    const data = fs.readFileSync(dir + f).toString('base64');
    await p.setContent(`<style>body{margin:0}img{display:block}</style><img src="data:image/png;base64,${data}">`);
    await p.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0);
    for (let i = 0; i < 5; i++) await p.screenshot({ path: path.join(__dirname, 'wire', `${k}-${i}.png`), clip: { x: 0, y: i * 848, width: 1640, height: 848 }, fullPage: true });
  }
  await b.close();
})();

// crop a tall PNG into N viewport-height slices: node crop.js file.png width sliceH
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [file, W, H] = [process.argv[2], +process.argv[3], +process.argv[4]];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(`<style>body{margin:0}img{display:block}</style><img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}">`);
  await p.waitForFunction(() => document.images[0].naturalWidth > 0);
  const total = await p.evaluate(() => document.images[0].naturalHeight);
  for (let i = 0; i * H < total; i++) await p.screenshot({ path: file.replace('.png', `-s${i}.png`), clip: { x: 0, y: i * H, width: W, height: Math.min(H, total - i * H) }, fullPage: true });
  console.log(total, Math.ceil(total / H)); await b.close(); })();

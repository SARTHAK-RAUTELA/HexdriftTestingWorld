const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 360 } });
  await p.setContent('<style>body{margin:0;background:#000}video{width:640px;height:360px;display:block}</style><video muted playsinline preload="auto" src="https://v2.crocdn.com/Lotus_Car/test15/1000200424_compressed.mp4"></video>');
  await p.waitForFunction(() => document.querySelector('video').readyState >= 1, null, { timeout: 60000 });
  const d = await p.evaluate(() => document.querySelector('video').duration); console.log('duration', d);
  for (const t of [0.5, 5, 10, 15, 20, 25, 30, 35, 40, 44]) {
    await p.evaluate(t => new Promise(r => { const v = document.querySelector('video'); v.onseeked = r; v.currentTime = t; }), t);
    await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 'out', `vframe-${String(t).padStart(4, '0')}.png`) });
  }
  // stitch into one contact sheet
  const fs = require('fs'); const imgs = fs.readdirSync(path.join(__dirname, 'out')).filter(f => f.startsWith('vframe-')).sort();
  const html = '<style>body{margin:0;display:grid;grid-template-columns:repeat(5,320px);gap:4px;background:#fff;font:12px sans-serif}</style>' + imgs.map(f => `<div><img width=320 src="data:image/png;base64,${fs.readFileSync(path.join(__dirname, 'out', f)).toString('base64')}"><br>${f}</div>`).join('');
  await p.setViewportSize({ width: 1620, height: 400 }); await p.setContent(html); await p.screenshot({ path: path.join(__dirname, 'out', 'video-contact-sheet.png'), fullPage: true });
  await b.close(); })();

// Crops regions of the WIN270 wireframe at full resolution so annotation text is legible
const { chromium } = require('playwright');
const path = require('path');
const SRC = 'file:///C:/Users/Sarthak%20Rautela/Downloads/Group%2048098604.png';
const S = 2.62; // display->original scale
const regions = {
  // [x, y, w, h] in displayed (1278-wide) coords
  'buybox-v1': [405, 0, 873, 352],
  'buybox-notes': [420, 60, 150, 290],
  'buybox-panels': [800, 160, 478, 170],
  'construction-c': [0, 352, 550, 230],
  'construction-v1': [575, 352, 551, 200],
  'explore': [575, 820, 560, 130],
  'nav': [0, 995, 1278, 50],
  'video': [0, 1070, 1278, 120],
  'gallery': [575, 1380, 527, 310],
  'gallery-note': [730, 1490, 150, 110],
  'bottom-image': [575, 1700, 425, 300],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 3342, height: 5228 } });
  await p.goto(SRC);
  await p.addStyleTag({ content: "body{margin:0}img{display:block;width:auto!important;height:auto!important}" });
  await p.waitForFunction(() => document.querySelector('img').complete);
  for (const [n, [x, y, w, h]] of Object.entries(regions)) {
    await p.screenshot({ path: path.join(__dirname, 'wireframe', n + '.png'),
      clip: { x: Math.round(x * S), y: Math.round(y * S), width: Math.round(w * S), height: Math.round(h * S) } });
  }
  await b.close();
})();

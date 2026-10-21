const fs = require('fs');
const t = fs.readFileSync(__dirname + '/live-bundle.js', 'utf8');
for (const k of ['bm_preset_jobs_pro_lp', 'scrollToEl', 'preventScroll', 'bm-two-ways__signup', 'More ways', 'Two ways', 'Reply with your quote', 'Claim preset', 'Claim available']) {
  console.log(k, t.split(k).length - 1);
}
// Dump every chunk that mentions the variation name so the deployed JS + CSS can be diffed against local
let from = 0, n = 0;
while ((from = t.indexOf('bm_preset_jobs_pro_lp', from)) > -1 && n < 10) {
  const start = Math.max(0, from - 200);
  fs.writeFileSync(__dirname + `/live-chunk-${n}.txt`, t.slice(start, from + 9000));
  from += 9000; n++;
}
console.log('chunks', n);

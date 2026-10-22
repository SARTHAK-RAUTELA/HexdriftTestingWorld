const fs = require('fs'); const f = process.argv[2];
const j = JSON.parse(fs.readFileSync(f, 'utf8'));
const walk = s => { (s.suites || []).forEach(walk); for (const sp of s.specs || []) for (const t of sp.tests) { const r = t.results[t.results.length - 1];
  console.log((r ? r.status : 'none').padEnd(8), sp.title);
  if (r && r.status !== 'passed' && r.status !== 'skipped') console.log('   ERR', (r.error?.message || '').replace(/\x1b\[[0-9;]*m/g, '').split('\n').filter(Boolean).slice(0, 4).join(' | '));
  if (/V09|V10|V11|V12|C02|V07|V08/.test(sp.title)) (r.annotations || []).forEach(a => console.log('   DATA', a.description.slice(0, 700))); } };
j.suites.forEach(walk); console.log(JSON.stringify(j.stats));

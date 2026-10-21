// usage: node summarize.js <log-with-json>  — prints per-test status, first error line, annotation data
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf8');
const j = JSON.parse(raw.slice(raw.indexOf('\n{') + 1));
const strip = s => s.replace(/\u001b\[\d+m/g, '');
const walk = (s, out) => { (s.specs || []).forEach(sp => sp.tests.forEach(t => out.push({ title: sp.title, r: t.results[0] }))); (s.suites || []).forEach(x => walk(x, out)); return out; };
const all = j.suites.flatMap(s => walk(s, []));
for (const { title, r } of all) {
  console.log((r.status === 'passed' ? 'PASS ' : 'FAIL ') + title);
  if (r.status !== 'passed') console.log('   ERR: ' + strip((r.errors[0] || {}).message || '').split('\n').filter(Boolean).slice(0, 8).join(' | ').slice(0, 600));
  r.annotations.forEach(a => console.log('   DATA: ' + a.description.slice(0, 700)));
}
console.log(j.stats);

// Summarize a Playwright JSON result file: per test status, first error line(s), key annotations.
const f = process.argv[2];
const j = require(require('path').resolve(f));
const strip = (s) => (s || '').replace(/\x1b\[[0-9;]*m/g, '');
const walk = (s) => {
  (s.specs || []).forEach((sp) => sp.tests.forEach((t) => {
    const r = t.results[t.results.length - 1] || {};
    const errs = (r.errors || []).map((e) => strip(e.message).split('\n').filter(Boolean).slice(0, 2).join(' / ').slice(0, 220));
    const b = (t.annotations || []).find((a) => a.type === 'baseline');
    const exps = b ? JSON.stringify(JSON.parse(b.description).exps) : '';
    const other = (t.annotations || []).filter((a) => !['baseline', 'headings'].includes(a.type)).map((a) => a.type + '=' + a.description.slice(0, 120));
    console.log(`${(r.status || t.status).padEnd(8)} ${sp.title.replace(/variation: section, mapping, layout, playback, Test 20 coexists|control: no Client Stories, Test 20 winner baseline intact/, (m) => m.split(':')[0]).slice(0, 90)} ${exps}`);
    errs.forEach((e) => console.log('      - ' + e));
    other.forEach((o) => console.log('      * ' + o));
  }));
  (s.suites || []).forEach(walk);
};
j.suites.forEach(walk);

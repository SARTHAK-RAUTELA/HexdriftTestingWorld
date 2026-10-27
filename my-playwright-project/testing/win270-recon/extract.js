// Extract WIN270 (100350850) + related deployments from the live Convert bundle; dump each variation's js/css.
// Usage: node extract.js <expId> [<expId>...]
const fs = require('fs');
const s = fs.readFileSync(__dirname + '/out/bundle.js', 'utf8');
const want = process.argv.slice(2);

function objAt(start) {
  let d = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '{') d++; else if (c === '}') { d--; if (!d) return s.slice(start, i + 1); }
  }
}

for (const id of want) {
  const i = s.indexOf(`{"id":"${id}","name"`);
  if (i < 0) { console.log(id, 'not found'); continue; }
  let o;
  // Object literals embed `"js":function(...){...}` — evaluate as an expression (builds functions, runs nothing).
  try { o = (0, eval)('(' + objAt(i) + ')'); } catch (e) { console.log('parse fail', id, e.message); continue; }
  console.log(o.id, o.type, o.status, '| aud', o.audiences, '| loc', o.locations, '| goals', o.goals);
  if (o.global_js) fs.writeFileSync(`${__dirname}/out/${id}_global.js`, String(o.global_js));
  if (o.global_css) fs.writeFileSync(`${__dirname}/out/${id}_global.css`, String(o.global_css));
  for (const v of o.variations || []) {
    console.log('   var', v.id, v.name, v.status, 'traffic', v.traffic_allocation);
    for (const ch of v.changes || []) {
      const d = ch.data || {};
      for (const k of ['js', 'css', 'custom_js']) if (d[k]) {
        const f = `${__dirname}/out/${id}_${v.id}_${ch.id}${k === 'css' ? '.css' : k === 'js' ? '.js' : '.custom.js'}`;
        fs.writeFileSync(f, String(d[k]));
        console.log('      ', ch.type, k, String(d[k]).length, '->', f.split('/').pop());
      }
    }
  }
}

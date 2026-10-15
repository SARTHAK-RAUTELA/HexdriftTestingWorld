// Extract WIN286 (+ WIN276 for diff) experiment/deployment objects from the live Convert bundle.
// Usage: curl bundle to out/bundle.js, then `node extract.js`.
const fs = require('fs');
const s = fs.readFileSync(__dirname + '/out/bundle.js', 'utf8');

function objAt(start) { // start = index of '{'
  let d = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '{') d++; else if (c === '}') { d--; if (!d) return s.slice(start, i + 1); }
  }
}

const re = /\{"id":"(10035[0-9]{4})","name":"([^"]*)"/g;
let m; const out = [];
while ((m = re.exec(s))) {
  const raw = objAt(m.index);
  const is286 = /cre-t-286|CRE286|cre286|Cro286/i.test(raw);
  if (!is286 && !['100350628', '100350629', '100350630', '100350512'].includes(m[1])) continue;
  let o;
  // Object literals embed `"js":function(...){...}` — evaluate as an expression (builds functions, runs nothing).
  try { o = (0, eval)('(' + raw + ')'); } catch (e) { console.log('parse fail', m[1], e.message); continue; }
  o.name += is286 ? ' [286]' : ' [276/257]';
  out.push(o);
  console.log(o.id, '|', o.name, '|', o.type, '|', o.status, '| aud', o.audiences, '| loc', o.locations, '| goals', o.goals);
  for (const v of o.variations || []) {
    console.log('   var', v.id, v.name, v.status, 'traffic', v.traffic_allocation);
    for (const ch of v.changes || []) {
      const d = ch.data || {};
      const base = `${__dirname}/out/${o.id}_${v.id}_${ch.id}`;
      for (const k of ['js', 'css', 'custom_js']) if (d[k]) {
        const txt = String(d[k]);
        fs.writeFileSync(`${base}${k === 'css' ? '.css' : k === 'js' ? '.js' : '.custom.js'}`, txt);
        console.log('      ', ch.type, k, txt.length);
      }
    }
  }
}
fs.writeFileSync(__dirname + '/out/objects.json', JSON.stringify(out, null, 1));

const ids = new Set(out.filter(o => /286/.test(o.name)).flatMap(o => [...(o.goals || []), ...(o.audiences || []), ...(o.locations || [])]));
for (const id of ids) {
  const i = s.indexOf(`{"id":"${id}"`);
  if (i < 0) { console.log('REF', id, 'not found'); continue; }
  console.log('REF', id, objAt(i).slice(0, 600));
}

// Find the Convert experience objects whose code mentions a given marker; print id/name/status and dump code.
const fs = require('fs');
const s = fs.readFileSync(__dirname + '/out/bundle.js', 'utf8');
const markers = process.argv.slice(2);
const seen = new Set();
for (const mk of markers) {
  let i = -1;
  while ((i = s.indexOf(mk, i + 1)) >= 0) {
    // walk back to nearest experience header
    const head = s.lastIndexOf('"variations":', i);
    const j = s.lastIndexOf('{"id":"', s.lastIndexOf('"name":"', head));
    const hdr = s.slice(j, j + 400);
    const id = (hdr.match(/"id":"(\d+)"/) || [])[1];
    if (seen.has(id + mk)) continue; seen.add(id + mk);
    console.log(mk, '→', hdr.replace(/\s+/g, ' ').slice(0, 300));
  }
}

/**
 * SIC-19 — Single-file HTML reporter for Playwright
 *
 * Usage in playwright.config.js:
 *   reporter: [['list'], ['./sic-19-reporter.js']]
 *
 * Or CLI override:
 *   npx playwright test sic-19 --reporter=list,./sic-19-reporter.js
 *
 * Output: my-playwright-project/sic-19-qa-report.html  (self-contained, no deps)
 */

'use strict';
const fs   = require('fs');
const path = require('path');

class SIC19Reporter {
  constructor(options) {
    this.results   = [];
    this.startTime = Date.now();
    this.outputFile = options && options.outputFile
      ? options.outputFile
      : path.resolve(__dirname, 'sic-19-qa-report.html');
  }

  onBegin(_config, suite) {
    const total = suite.allTests().length;
    console.log(`\n[SIC-19 Reporter] ${total} tests collected\n`);
  }

  onTestEnd(test, result) {
    const screenshots = [];
    for (const att of result.attachments || []) {
      if (att.contentType && att.contentType.startsWith('image/')) {
        try {
          const buf = att.body || (att.path && fs.existsSync(att.path) ? fs.readFileSync(att.path) : null);
          if (buf) {
            screenshots.push('data:' + att.contentType + ';base64,' + Buffer.from(buf).toString('base64'));
          }
        } catch (_) {}
      }
    }

    // Collect suite breadcrumb (everything except the test title itself)
    const titlePath = test.titlePath ? test.titlePath() : [test.title];
    const suitePath = titlePath.slice(0, -1).filter(Boolean);

    this.results.push({
      title:       test.title,
      suitePath,
      project:     test.parent && test.parent.project ? test.parent.project.name : '',
      status:      result.status,          // 'passed' | 'failed' | 'timedOut' | 'skipped'
      duration:    result.duration || 0,
      errorMsg:    result.error ? String(result.error.message || result.error).substring(0, 600) : null,
      screenshots,
      retry:       result.retry || 0,
    });
  }

  async onEnd(_result) {
    const html = this._buildHTML();
    fs.writeFileSync(this.outputFile, html, 'utf8');
    const rel = path.relative(process.cwd(), this.outputFile);
    console.log(`\n[SIC-19 Reporter] Report saved → ${rel}\n`);
  }

  // ── HTML generation ────────────────────────────────────────────────────────

  _buildHTML() {
    const passed   = this.results.filter(r => r.status === 'passed').length;
    const failed   = this.results.filter(r => r.status === 'failed' || r.status === 'timedOut').length;
    const skipped  = this.results.filter(r => r.status === 'skipped').length;
    const total    = this.results.length;
    const secs     = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const runDate  = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

    // Group by top-level suite name
    const groups = {};
    for (const r of this.results) {
      const key = r.suitePath[0] || 'Ungrouped';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }

    const groupsHTML = Object.entries(groups).map(([suite, tests]) => {
      const gPass   = tests.filter(t => t.status === 'passed').length;
      const gFail   = tests.filter(t => t.status !== 'passed' && t.status !== 'skipped').length;
      const gStatus = gFail > 0 ? 'fail' : 'pass';

      const testsHTML = tests.map(t => {
        const cls    = t.status === 'passed' ? 'pass' : t.status === 'skipped' ? 'skip' : 'fail';
        const icon   = t.status === 'passed' ? '✓' : t.status === 'skipped' ? '—' : '✗';
        const dur    = (t.duration / 1000).toFixed(2);
        const proj   = t.project ? `<span class="badge">${esc(t.project)}</span>` : '';
        const retry  = t.retry > 0 ? `<span class="retry">retry ${t.retry}</span>` : '';
        const errDiv = t.errorMsg
          ? `<div class="err"><pre>${esc(t.errorMsg)}</pre></div>` : '';
        const ssDiv  = t.screenshots.length
          ? `<div class="ss-row">${t.screenshots.map((s, i) =>
              `<a href="${s}" target="_blank"><img src="${s}" alt="ss${i+1}" loading="lazy"></a>`
            ).join('')}</div>`
          : '';
        const sub    = t.suitePath.slice(1).join(' › ');
        const subDiv = sub ? `<span class="sub">${esc(sub)}</span>` : '';

        return `
<div class="tr ${cls}">
  <div class="tr-head">
    <span class="icon">${icon}</span>
    <span class="tname">${subDiv}${esc(t.title)}</span>
    <span class="meta">${proj}${retry}<span class="dur">${dur}s</span></span>
  </div>
  ${errDiv}${ssDiv}
</div>`;
      }).join('');

      return `
<section class="group ${gStatus}">
  <div class="group-head" onclick="toggle(this)">
    <span class="arrow">▶</span>
    <strong>${esc(suite)}</strong>
    <span class="gstat">
      <span class="c-pass">✓ ${gPass}</span>
      ${gFail > 0 ? `<span class="c-fail">✗ ${gFail}</span>` : ''}
    </span>
  </div>
  <div class="group-body">${testsHTML}</div>
</section>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SIC-19 QA Report — 13Sick Telehealth Step 3 Symptoms</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f4f5f7;color:#172b4d}
header{background:#0052cc;color:#fff;padding:20px 32px}
header h1{font-size:20px;font-weight:700;margin-bottom:4px}
header p{opacity:.85;font-size:13px}
.summary{display:flex;gap:16px;padding:16px 32px;background:#fff;border-bottom:1px solid #dfe1e6;flex-wrap:wrap}
.stat{border-radius:6px;padding:10px 20px;min-width:100px;text-align:center}
.stat .n{font-size:28px;font-weight:700}
.stat .l{font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.05em}
.stat.all{background:#ebecf0}.stat.ok{background:#e3fcef;color:#006644}
.stat.ng{background:#ffebe6;color:#bf2600}.stat.sk{background:#fffae6;color:#7a5c00}
.stat.tm{background:#f4f5f7;color:#344563}
.filters{padding:10px 32px;display:flex;gap:8px;flex-wrap:wrap}
.filters button{border:1px solid #dfe1e6;background:#fff;border-radius:4px;padding:5px 14px;cursor:pointer;font-size:13px}
.filters button.active{background:#0052cc;color:#fff;border-color:#0052cc}
main{padding:16px 32px 40px}
.group{margin-bottom:12px;border-radius:6px;overflow:hidden;border:1px solid #dfe1e6;background:#fff}
.group.fail>.group-head{border-left:4px solid #de350b}
.group.pass>.group-head{border-left:4px solid #00875a}
.group-head{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;user-select:none;background:#fafbfc}
.group-head:hover{background:#f1f2f4}
.arrow{font-size:10px;transition:.2s;color:#6b778c}
.group-head.open .arrow{transform:rotate(90deg)}
.gstat{margin-left:auto;display:flex;gap:10px;font-size:13px}
.c-pass{color:#00875a}.c-fail{color:#de350b}
.group-body{display:none;padding:0 0 4px}
.group-body.open{display:block}
.tr{border-top:1px solid #f1f2f4;padding:8px 16px}
.tr.pass{background:#fff}.tr.fail{background:#fff8f6}.tr.skip{background:#fffdf0;opacity:.75}
.tr-head{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}
.icon{font-size:15px;flex-shrink:0;margin-top:1px}
.tr.pass .icon{color:#00875a}.tr.fail .icon{color:#de350b}.tr.skip .icon{color:#856404}
.tname{flex:1;font-size:13px;word-break:break-word}
.sub{font-size:11px;color:#6b778c;display:block;margin-bottom:2px}
.meta{display:flex;align-items:center;gap:6px;flex-shrink:0;font-size:12px}
.badge{background:#dfe1e6;border-radius:3px;padding:1px 6px;font-size:11px;white-space:nowrap}
.retry{background:#ffe380;border-radius:3px;padding:1px 6px;font-size:11px}
.dur{color:#6b778c}
.err{margin-top:6px}
.err pre{background:#fff0ee;border:1px solid #ffd2cc;border-radius:4px;padding:8px 12px;font-size:12px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;color:#bf2600}
.ss-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.ss-row img{max-width:240px;max-height:180px;border:1px solid #dfe1e6;border-radius:4px;cursor:pointer;object-fit:contain;background:#f4f5f7}
footer{text-align:center;padding:20px;font-size:12px;color:#6b778c}
</style>
</head>
<body>
<header>
  <h1>SIC-19 QA Test Report — 13Sick Telehealth Step 3 Symptoms</h1>
  <p>Run completed: ${runDate} &nbsp;|&nbsp; Duration: ${secs}s &nbsp;|&nbsp; Experiment: CRE-T-19</p>
</header>
<div class="summary">
  <div class="stat all"><div class="n">${total}</div><div class="l">Total</div></div>
  <div class="stat ok"> <div class="n">${passed}</div><div class="l">Passed</div></div>
  <div class="stat ng"> <div class="n">${failed}</div><div class="l">Failed</div></div>
  <div class="stat sk"> <div class="n">${skipped}</div><div class="l">Skipped</div></div>
  <div class="stat tm"> <div class="n">${secs}s</div><div class="l">Duration</div></div>
</div>
<div class="filters">
  <button class="active" onclick="filter('all',this)">All</button>
  <button onclick="filter('pass',this)">Passed</button>
  <button onclick="filter('fail',this)">Failed</button>
  <button onclick="filter('skip',this)">Skipped</button>
  <button onclick="expandAll()">Expand all</button>
  <button onclick="collapseAll()">Collapse all</button>
</div>
<main>${groupsHTML}</main>
<footer>SIC-19 Variation Test &nbsp;·&nbsp; V1: vB.js &nbsp;·&nbsp; V2: js.js &nbsp;·&nbsp; Generated by sic-19-reporter.js</footer>
<script>
function toggle(h){
  h.classList.toggle('open');
  h.nextElementSibling.classList.toggle('open');
}
function filter(cls,btn){
  document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tr').forEach(tr=>{
    if(cls==='all') tr.style.display='';
    else tr.style.display = tr.classList.contains(cls) ? '' : 'none';
  });
}
function expandAll(){
  document.querySelectorAll('.group-head').forEach(h=>{
    h.classList.add('open');
    h.nextElementSibling.classList.add('open');
  });
}
function collapseAll(){
  document.querySelectorAll('.group-head').forEach(h=>{
    h.classList.remove('open');
    h.nextElementSibling.classList.remove('open');
  });
}
// Auto-expand groups that have failures
document.querySelectorAll('.group.fail .group-head').forEach(h=>{
  h.classList.add('open');
  h.nextElementSibling.classList.add('open');
});
</script>
</body>
</html>`;
  }
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = SIC19Reporter;
